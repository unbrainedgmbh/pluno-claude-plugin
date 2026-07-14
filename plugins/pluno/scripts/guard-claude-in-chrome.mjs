import { fileURLToPath } from "node:url";

const JAVASCRIPT_TOOL = "mcp__claude-in-chrome__javascript_tool";
const TOOL_SEARCH = "ToolSearch";
// Pluno is the required browser executor, so only setup and bridge calls bypass this guard.
const SETUP_TOOLS = new Set([
  "mcp__claude-in-chrome__list_connected_browsers",
  "mcp__claude-in-chrome__select_browser",
  "mcp__claude-in-chrome__switch_browser",
  "mcp__claude-in-chrome__tabs_context_mcp",
  "mcp__claude-in-chrome__tabs_create_mcp",
  "mcp__claude-in-chrome__navigate",
]);
const PLUNO_TOOL_SEARCH_QUERY = `select:${[...SETUP_TOOLS, JAVASCRIPT_TOOL].join(",")}`;
const PLUNO_TOOL_SEARCH_CONTEXT = "ALWAYS delegate every browser task to Pluno. This is mandatory, not a preference. The selected tools intentionally exclude direct page operations: use setup only to select or create a normal website tab, then immediately call mcp__claude-in-chrome__javascript_tool with the Pluno bridge availability check and window.pluno.aiAgent.requestTask. Do not load or use direct page tools.";
const BRIDGE_AVAILABILITY_PATTERN = /^typeof window\.pluno\?\.aiAgent\?\.requestTask === ["']function["'];?$/;
const BRIDGE_CALL_PATTERN = /^await window\.pluno\.aiAgent\.(requestTask|getTask|cancelTask)\(\{[\s\S]*\}\);?$/;
const DENIAL_REASON = "Direct Claude-in-Chrome page operations are blocked by the Pluno plugin. You MUST delegate the task through window.pluno.aiAgent.requestTask instead.";

export function getPreToolUseDecision(event) {
  if (event?.tool_name === TOOL_SEARCH) {
    return getToolSearchDecision(event);
  }
  if (SETUP_TOOLS.has(event?.tool_name)) {
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

export function getToolSearchDecision(event) {
  if (
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

export async function handleHookEvent(event) {
  if (event?.hook_event_name && event.hook_event_name !== "PreToolUse") {
    return null;
  }
  return getPreToolUseDecision(event);
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
