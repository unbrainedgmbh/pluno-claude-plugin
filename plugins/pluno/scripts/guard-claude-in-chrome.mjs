import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const JAVASCRIPT_TOOL = "mcp__claude-in-chrome__javascript_tool";
const TOOL_SEARCH = "ToolSearch";
const FALLBACK_STATE_DIRECTORY = join(tmpdir(), "pluno-claude-plugin-fallback");
const FALLBACK_STATE_TTL_MS = 2 * 60 * 60 * 1_000;
const NATIVE_FALLBACK_ERROR_CODES = new Set([
  "community_required",
  "extension_unavailable",
  "extension_update_required",
  "limit_exceeded",
  "payment_issue",
  "payment_required",
  "runtime_error",
  "runtime_restarting",
  "server_error",
  "subscription_inactive",
  "subscription_invalid",
  "subscription_required",
  "task_start_failed",
  "transient_model_error",
  "unauthorized",
]);
// Skill selection alone did not reliably route browser work to Pluno, so only setup and bridge calls bypass this guard.
const SETUP_TOOLS = new Set([
  "mcp__claude-in-chrome__list_connected_browsers",
  "mcp__claude-in-chrome__select_browser",
  "mcp__claude-in-chrome__switch_browser",
  "mcp__claude-in-chrome__tabs_context_mcp",
  "mcp__claude-in-chrome__tabs_create_mcp",
  "mcp__claude-in-chrome__navigate",
]);
const PLUNO_TOOL_SEARCH_QUERY = `select:${[...SETUP_TOOLS, JAVASCRIPT_TOOL].join(",")}`;
const PLUNO_TOOL_SEARCH_CONTEXT = "ALWAYS delegate every browser task to Pluno. This is mandatory, not a preference. The selected tools intentionally exclude direct page operations: use setup only to select or create a normal website tab, then immediately call mcp__claude-in-chrome__javascript_tool with the Pluno bridge availability check and window.pluno.aiAgent.requestTask. Do not load or use native page tools unless Pluno reports an availability, billing, or runtime failure.";
const BRIDGE_AVAILABILITY_PATTERN = /^typeof window\.pluno\?\.aiAgent\?\.requestTask === ["']function["'];?$/;
const BRIDGE_CALL_PATTERN = /^await window\.pluno\.aiAgent\.(requestTask|getTask|cancelTask)\(\{[\s\S]*\}\);?$/;
const BRIDGE_UNAVAILABLE_MESSAGE_PATTERN = /Pluno did not respond|Pluno could not process the AI agent request/i;
const DENIAL_REASON = "Direct Claude-in-Chrome page operations are blocked by the Pluno plugin. You MUST delegate the task through window.pluno.aiAgent.requestTask instead. Native browser fallback unlocks automatically only after Pluno reports it is unavailable or cannot run because of billing.";

export function getPreToolUseDecision(event, nativeFallbackActive = false) {
  if (event?.tool_name === TOOL_SEARCH) {
    return getToolSearchDecision(event, nativeFallbackActive);
  }
  if (nativeFallbackActive || SETUP_TOOLS.has(event?.tool_name)) {
    return null;
  }
  if (event?.tool_name === JAVASCRIPT_TOOL && getPlunoBridgeOperation(event.tool_input)) {
    return null;
  }
  return {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "deny",
      permissionDecisionReason: DENIAL_REASON,
    },
  };
}

export function getToolSearchDecision(event, nativeFallbackActive = false) {
  if (
    nativeFallbackActive ||
    event?.tool_name !== TOOL_SEARCH ||
    !isChromeToolSelection(event.tool_input)
  ) {
    return null;
  }
  return {
    hookSpecificOutput: {
      hookEventName: "PreToolUse",
      permissionDecision: "allow",
      updatedInput: {
        ...event.tool_input,
        query: PLUNO_TOOL_SEARCH_QUERY,
      },
      additionalContext: PLUNO_TOOL_SEARCH_CONTEXT,
    },
  };
}

export function shouldEnableNativeFallback(event) {
  if (event?.tool_name !== JAVASCRIPT_TOOL) {
    return false;
  }
  const operation = getPlunoBridgeOperation(event.tool_input);
  const toolResult = getToolResultText(event.tool_response ?? event.tool_result);
  if (operation === "availability") {
    return /\bfalse\b/.test(toolResult);
  }
  if (operation !== "requestTask" && operation !== "getTask") {
    return false;
  }
  if (BRIDGE_UNAVAILABLE_MESSAGE_PATTERN.test(toolResult)) {
    return true;
  }
  if (!/["']?status["']?\s*[:=]\s*["']?failed["']?/i.test(toolResult)) {
    return false;
  }
  return [...NATIVE_FALLBACK_ERROR_CODES].some((code) => (
    new RegExp(`["']?code["']?\\s*[:=]\\s*["']${code}["']`, "i").test(toolResult)
  ));
}

export async function handleHookEvent(event, stateDirectory = FALLBACK_STATE_DIRECTORY) {
  const hookEventName = event?.hook_event_name ?? "PreToolUse";
  if (hookEventName === "UserPromptSubmit" || hookEventName === "SessionEnd") {
    await clearNativeFallback(event?.session_id, stateDirectory);
    return null;
  }
  if (hookEventName === "PostToolUse") {
    if (shouldEnableNativeFallback(event)) {
      await enableNativeFallback(event?.session_id, stateDirectory);
    }
    return null;
  }
  if (hookEventName !== "PreToolUse") {
    return null;
  }
  return getPreToolUseDecision(
    event,
    await hasActiveNativeFallback(event?.session_id, stateDirectory),
  );
}

function getPlunoBridgeOperation(toolInput) {
  if (
    toolInput?.action !== "javascript_exec" ||
    typeof toolInput.text !== "string" ||
    !Number.isFinite(toolInput.tabId)
  ) {
    return null;
  }
  const code = toolInput.text.trim();
  if (BRIDGE_AVAILABILITY_PATTERN.test(code)) {
    return "availability";
  }
  return BRIDGE_CALL_PATTERN.exec(code)?.[1] ?? null;
}

function isChromeToolSelection(toolInput) {
  return (
    typeof toolInput?.query === "string" &&
    toolInput.query.trimStart().startsWith("select:") &&
    toolInput.query.includes("mcp__claude-in-chrome__")
  );
}

function getToolResultText(toolResult) {
  if (typeof toolResult === "string") {
    return toolResult;
  }
  if (Array.isArray(toolResult)) {
    return toolResult.map(getToolResultText).join("\n");
  }
  if (toolResult && typeof toolResult === "object") {
    return [
      JSON.stringify(toolResult) ?? "",
      ...Object.values(toolResult).map(getToolResultText),
    ].join("\n");
  }
  return String(toolResult ?? "");
}

async function hasActiveNativeFallback(sessionId, stateDirectory) {
  const statePath = getNativeFallbackStatePath(sessionId, stateDirectory);
  if (!statePath || !existsSync(statePath)) {
    return false;
  }
  const state = JSON.parse(await readFile(statePath, "utf8"));
  if (typeof state.expiresAt !== "number" || state.expiresAt <= Date.now()) {
    await rm(statePath, { force: true });
    return false;
  }
  return true;
}

async function enableNativeFallback(sessionId, stateDirectory) {
  const statePath = getNativeFallbackStatePath(sessionId, stateDirectory);
  if (!statePath) {
    return;
  }
  await mkdir(stateDirectory, { recursive: true });
  await writeFile(
    statePath,
    `${JSON.stringify({ expiresAt: Date.now() + FALLBACK_STATE_TTL_MS })}\n`,
    "utf8",
  );
}

async function clearNativeFallback(sessionId, stateDirectory) {
  const statePath = getNativeFallbackStatePath(sessionId, stateDirectory);
  if (statePath && existsSync(statePath)) {
    await rm(statePath, { force: true });
  }
}

function getNativeFallbackStatePath(sessionId, stateDirectory) {
  if (typeof sessionId !== "string" || !sessionId) {
    return null;
  }
  const sessionHash = createHash("sha256").update(sessionId).digest("hex");
  return join(stateDirectory, `${sessionHash}.json`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  let input = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk) => {
    input += chunk;
  });
  process.stdin.on("end", () => {
    void handleHookEvent(JSON.parse(input)).then((decision) => {
      if (decision) {
        process.stdout.write(`${JSON.stringify(decision)}\n`);
      }
    });
  });
}
