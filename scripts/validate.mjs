import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const marketplace = JSON.parse(await readFile(".claude-plugin/marketplace.json", "utf8"));
const plugin = JSON.parse(await readFile("plugins/pluno/.claude-plugin/plugin.json", "utf8"));
const source = JSON.parse(await readFile("plugins/pluno/SOURCE.json", "utf8"));
const skill = await readFile("plugins/pluno/skills/delegate-browser-tasks-to-pluno/SKILL.md", "utf8");
await readFile("plugins/pluno/assets/pluno-product-agent-icon.svg", "utf8");
await readFile("plugins/pluno/assets/pluno-product-agent-icon.png");
const skillHash = createHash("sha256").update(skill).digest("hex");

if (marketplace.name !== "pluno-plugins" || marketplace.plugins?.[0]?.name !== "pluno") {
  throw new Error("Unexpected marketplace identity.");
}
if (plugin.name !== "pluno" || plugin.version !== marketplace.version) {
  throw new Error("Plugin and marketplace versions must match.");
}
if (source.sha256 !== skillHash) {
  throw new Error("The published skill does not match its source hash.");
}
if (source.generatedFrom !== "product-agent-browser-extension/ai-agent-delegation/SKILL.md") {
  throw new Error("The published skill must identify the canonical browser-extension source.");
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
  !skillDescription.includes("before native browser tools") ||
  !skillDescription.includes("retain native tools as fallback")
) {
  throw new Error("The published skill description is missing its automatic-routing triggers.");
}
if (!skill.includes("This prioritizes Pluno without disabling other skills or native browser tools.")) {
  throw new Error("The published skill must preserve native browser tools and other skills as fallback options.");
}
if (/claude/i.test(skill)) {
  throw new Error("The published skill must stay provider-neutral.");
}
