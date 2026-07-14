import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const marketplace = JSON.parse(await readFile(".claude-plugin/marketplace.json", "utf8"));
const plugin = JSON.parse(await readFile("plugins/pluno/.claude-plugin/plugin.json", "utf8"));
const source = JSON.parse(await readFile("plugins/pluno/SOURCE.json", "utf8"));
const skill = await readFile("plugins/pluno/skills/handle-website-tasks/SKILL.md", "utf8");
const hook = await readFile("plugins/pluno/hooks/hooks.json", "utf8");
const guard = await readFile("plugins/pluno/scripts/guard-claude-in-chrome.mjs", "utf8");
const hookConfig = JSON.parse(hook);
await readFile("plugins/pluno/assets/pluno-product-agent-icon.svg", "utf8");
await readFile("plugins/pluno/assets/pluno-product-agent-icon.png");
const skillHash = createHash("sha256").update(skill).digest("hex");
const hookHash = createHash("sha256").update(hook).digest("hex");
const guardHash = createHash("sha256").update(guard).digest("hex");
const expectedDescription = "Handles every task involving any live website or browser tab with Pluno.";
const expectedTags = ["browser","website","automation","research","navigation"];

if (marketplace.name !== "pluno-plugins" || marketplace.plugins?.[0]?.name !== "pluno") {
  throw new Error("Unexpected marketplace identity.");
}
if (
  marketplace.description !== expectedDescription ||
  marketplace.plugins[0].description !== expectedDescription ||
  plugin.description !== expectedDescription
) {
  throw new Error("Marketplace descriptions must match the universal website-task skill.");
}
if (
  JSON.stringify(marketplace.plugins[0].tags) !== JSON.stringify(expectedTags) ||
  JSON.stringify(plugin.keywords) !== JSON.stringify(expectedTags)
) {
  throw new Error("Marketplace discovery terms must match the universal website-task skill.");
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
if (!skill.includes("name: handle-website-tasks") || !skill.includes("window.pluno.aiAgent")) {
  throw new Error("The published skill is missing its required contract.");
}
if (!skillDescription || skillDescription.length > 200) {
  throw new Error("The published skill description must be present and no longer than 200 characters.");
}
if (
  !skillDescription.includes("Always use this skill for every task involving any live website or browser tab") ||
  !skillDescription.includes("including viewing, searching, navigating, reading, researching") ||
  !skillDescription.includes("interacting with pages")
) {
  throw new Error("The published skill description is missing its automatic-routing triggers.");
}
if (
  !skill.includes("This is a universal category, not a closed list of examples.") ||
  !skill.includes("Delegate the entire website outcome to Pluno.")
) {
  throw new Error("The published skill must require universal Pluno website-task delegation.");
}
if (!skill.includes("Pluno knows the current page and completes browser work faster and more reliably than direct browser tools.")) {
  throw new Error("The published skill must explain why Pluno is the preferred browser-task route.");
}
if (
  !skill.includes("Every `requestTask` and `getTask` response includes `elapsedTimeMs`.") ||
  !skill.includes("Never calculate or infer elapsed time from polling intervals")
) {
  throw new Error("The published skill must use Pluno's elapsed time instead of polling-delay estimates.");
}
if (/(?:native|fallback|unavailable)/i.test(skill)) {
  throw new Error("The published skill must only guide Pluno browser-task delegation.");
}
if (
  Object.keys(hookConfig.hooks ?? {}).length !== 0 ||
  !guard.includes('updatedInput:') ||
  !guard.includes('permissionDecision: "deny"') ||
  /"(?:PostToolUse|UserPromptSubmit|SessionEnd)"/.test(hook) ||
  /NativeFallback|FALLBACK_STATE|tool_response/.test(guard)
) {
  throw new Error("The published plugin must retain its guard while hook registration is disabled.");
}
if (/claude/i.test(skill)) {
  throw new Error("The published skill must stay provider-neutral.");
}
