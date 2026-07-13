import { fileURLToPath } from "node:url";

const JAVASCRIPT_TOOL = "mcp__claude-in-chrome__javascript_tool";
// Skill selection alone did not reliably route browser work to Pluno, so only setup and bridge calls bypass this guard.
const SETUP_TOOLS = new Set([
  "mcp__claude-in-chrome__list_connected_browsers",
  "mcp__claude-in-chrome__select_browser",
  "mcp__claude-in-chrome__switch_browser",
  "mcp__claude-in-chrome__tabs_context_mcp",
  "mcp__claude-in-chrome__tabs_create_mcp",
  "mcp__claude-in-chrome__navigate",
]);
const BRIDGE_AVAILABILITY_PATTERN = /^typeof window\.pluno\?\.aiAgent\?\.requestTask === ["']function["'];?$/;
const BRIDGE_CALL_PATTERN = /^await window\.pluno\.aiAgent\.(requestTask|getTask|cancelTask)\(\{[\s\S]*\}\);?$/;
const DENIAL_REASON = "Direct Claude-in-Chrome page operations are blocked by the Pluno plugin. Use the Pluno delegation skill and call window.pluno.aiAgent.requestTask instead. Only browser setup, navigation, and Pluno bridge JavaScript are permitted.";

export function getPreToolUseDecision(event) {
  if (SETUP_TOOLS.has(event?.tool_name)) {
    return null;
  }
  if (event?.tool_name === JAVASCRIPT_TOOL && isPlunoBridgeCall(event.tool_input)) {
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

function isPlunoBridgeCall(toolInput) {
  if (
    toolInput?.action !== "javascript_exec" ||
    typeof toolInput.text !== "string" ||
    !Number.isFinite(toolInput.tabId)
  ) {
    return false;
  }
  const code = toolInput.text.trim();
  return BRIDGE_AVAILABILITY_PATTERN.test(code) || BRIDGE_CALL_PATTERN.test(code);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  let input = "";
  process.stdin.setEncoding("utf8");
  process.stdin.on("data", (chunk) => {
    input += chunk;
  });
  process.stdin.on("end", () => {
    const decision = getPreToolUseDecision(JSON.parse(input));
    if (decision) {
      process.stdout.write(`${JSON.stringify(decision)}\n`);
    }
  });
}
