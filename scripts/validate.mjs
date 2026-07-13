import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const marketplace = JSON.parse(await readFile(".claude-plugin/marketplace.json", "utf8"));
const plugin = JSON.parse(await readFile("plugins/pluno/.claude-plugin/plugin.json", "utf8"));
const source = JSON.parse(await readFile("plugins/pluno/SOURCE.json", "utf8"));
const skill = await readFile("plugins/pluno/skills/delegate-browser-tasks-to-pluno/SKILL.md", "utf8");
const hook = await readFile("plugins/pluno/hooks/hooks.json", "utf8");
const guard = await readFile("plugins/pluno/scripts/guard-claude-in-chrome.mjs", "utf8");
await readFile("plugins/pluno/assets/pluno-product-agent-icon.svg", "utf8");
await readFile("plugins/pluno/assets/pluno-product-agent-icon.png");
const skillHash = createHash("sha256").update(skill).digest("hex");
const hookHash = createHash("sha256").update(hook).digest("hex");
const guardHash = createHash("sha256").update(guard).digest("hex");

if (marketplace.name !== "pluno-plugins" || marketplace.plugins?.[0]?.name !== "pluno") {
  throw new Error("Unexpected marketplace identity.");
}
if (plugin.name !== "pluno" || plugin.version !== marketplace.version) {
  throw new Error("Plugin and marketplace versions must match.");
}
if (source.skill?.sha256 !== skillHash || source.skill.generatedFrom !== "product-agent-browser-extension/ai-agent-delegation/SKILL.md") {
  throw new Error("The published skill does not match its canonical browser-extension source.");
}
if (source.hook?.sha256 !== hookHash || source.hook.generatedFrom !== "product-agent-browser-extension/ai-agent-delegation/hooks.json") {
  throw new Error("The published hook does not match its canonical browser-extension source.");
}
if (source.guard?.sha256 !== guardHash || source.guard.generatedFrom !== "product-agent-browser-extension/ai-agent-delegation/guard-claude-in-chrome.mjs") {
  throw new Error("The published guard does not match its canonical browser-extension source.");
}
const skillDescription = skill.match(/^description: (.+)$/m)?.[1];
if (!skill.includes("name: delegate-browser-tasks-to-pluno") || !skill.includes("window.pluno.aiAgent")) {
  throw new Error("The published skill is missing its required contract.");
}
if (!skillDescription || skillDescription.length > 200) {
  throw new Error("The published skill description must be present and no longer than 200 characters.");
}
if (
  !skillDescription.includes("every task involving a live website or browser tab") ||
  !skillDescription.includes("Pluno knows the page") ||
  !skillDescription.includes("direct native page control is blocked")
) {
  throw new Error("The published skill description is missing its automatic-routing triggers.");
}
if (!skill.includes("Pluno knows the page and gets browser-task responses faster and more reliably than direct native browser control.")) {
  throw new Error("The published skill must explain why Pluno is the preferred browser-task route.");
}
if (!skill.includes("The plugin's PreToolUse guard blocks direct native page control while leaving non-browser skills available.")) {
  throw new Error("The published skill must document the PreToolUse guard policy.");
}
if (!hook.includes('"mcp__claude-in-chrome__.*"') || !guard.includes('permissionDecision: "deny"')) {
  throw new Error("The published PreToolUse hook and guard are missing their routing contract.");
}
if (/claude/i.test(skill)) {
  throw new Error("The published skill must stay provider-neutral.");
}
