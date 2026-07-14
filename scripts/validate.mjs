import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";

const claudeMarketplace = JSON.parse(await readFile(".claude-plugin/marketplace.json", "utf8"));
const codexMarketplace = JSON.parse(await readFile(".agents/plugins/marketplace.json", "utf8"));
const claudePlugin = JSON.parse(await readFile("plugins/pluno/.claude-plugin/plugin.json", "utf8"));
const codexPlugin = JSON.parse(await readFile("plugins/pluno/.codex-plugin/plugin.json", "utf8"));
const source = JSON.parse(await readFile("plugins/pluno/SOURCE.json", "utf8"));
const skill = await readFile("plugins/pluno/skills/handle-website-tasks/SKILL.md", "utf8");
const releaseWorkflow = await readFile(".github/workflows/release.yml", "utf8");
await readFile("plugins/pluno/assets/pluno-product-agent-icon.svg", "utf8");
await readFile("plugins/pluno/assets/pluno-product-agent-icon.png");
const skillHash = createHash("sha256").update(skill).digest("hex");
const expectedDescription = "Delegates every live website and browser-tab task to Pluno.";
const expectedTags = ["ai-assistant","ai-agent","plugin","browser","website","automation","research","claude","chatgpt","codex"];
const expectedRepository = "https://github.com/unbrainedgmbh/pluno-ai-agent-plugin";

if (
  claudeMarketplace.name !== "pluno-ai-agent-plugin" ||
  codexMarketplace.name !== "pluno-ai-agent-plugin" ||
  claudeMarketplace.plugins?.[0]?.name !== "pluno" ||
  codexMarketplace.plugins?.[0]?.name !== "pluno"
) {
  throw new Error("Unexpected marketplace identity.");
}
if (
  claudeMarketplace.description !== expectedDescription ||
  claudeMarketplace.plugins[0].description !== expectedDescription ||
  claudePlugin.description !== expectedDescription ||
  codexPlugin.description !== expectedDescription
) {
  throw new Error("Marketplace descriptions must match the universal website-task skill.");
}
if (
  JSON.stringify(claudeMarketplace.plugins[0].tags) !== JSON.stringify(expectedTags) ||
  JSON.stringify(claudePlugin.keywords) !== JSON.stringify(expectedTags) ||
  JSON.stringify(codexPlugin.keywords) !== JSON.stringify(expectedTags)
) {
  throw new Error("Marketplace discovery terms must include both supported AI assistant ecosystems.");
}
if (
  claudePlugin.name !== "pluno" ||
  codexPlugin.name !== "pluno" ||
  claudePlugin.version !== claudeMarketplace.version ||
  codexPlugin.version !== claudeMarketplace.version
) {
  throw new Error("Plugin and marketplace versions must match.");
}
if (claudePlugin.repository !== expectedRepository || codexPlugin.repository !== expectedRepository) {
  throw new Error("Plugin repository URLs must use the provider-neutral repository name.");
}
if (
  !releaseWorkflow.includes('git tag -a "v$VERSION" -m "Pluno AI Agent Plugin v$VERSION"') ||
  !releaseWorkflow.includes('gh release create "v$VERSION" --title "Pluno AI Agent Plugin v$VERSION"') ||
  /Pluno Claude plugin/i.test(releaseWorkflow)
) {
  throw new Error("Release workflow metadata must use the provider-neutral plugin name.");
}
if (
  codexMarketplace.interface?.displayName !== "AI Agent Plugin" ||
  codexMarketplace.plugins[0].source?.path !== "./plugins/pluno" ||
  codexMarketplace.plugins[0].policy?.installation !== "AVAILABLE" ||
  codexMarketplace.plugins[0].policy?.authentication !== "ON_INSTALL" ||
  codexMarketplace.plugins[0].category !== "Productivity"
) {
  throw new Error("Codex marketplace metadata is invalid.");
}
if (
  codexPlugin.skills !== "./skills/" ||
  codexPlugin.interface?.displayName !== "Pluno" ||
  codexPlugin.interface?.category !== "Productivity" ||
  codexPlugin.interface?.composerIcon !== "./assets/pluno-product-agent-icon.png" ||
  codexPlugin.interface?.logo !== "./assets/pluno-product-agent-icon.png"
) {
  throw new Error("Codex plugin metadata is invalid.");
}
if (
  existsSync("plugins/pluno/hooks") ||
  existsSync("plugins/pluno/scripts") ||
  JSON.stringify(Object.keys(source)) !== JSON.stringify(["skill"])
) {
  throw new Error("The published plugin must not contain hook configuration, a hook guard, or hook provenance.");
}
if (source.skill?.sha256 !== skillHash || source.skill.generatedFrom !== "product-agent-browser-extension/ai-agent-plugin/SKILL.md") {
  throw new Error("The published skill does not match its canonical browser-extension source.");
}
const skillDescription = skill.match(/^description: (.+)$/m)?.[1];
if (!skill.includes("name: handle-website-tasks") || !skill.includes("window.pluno.aiAgent")) {
  throw new Error("The published skill is missing its required contract.");
}
if (!skillDescription) {
  throw new Error("The published skill description must be present.");
}
if (
  !skillDescription.includes("Always use this skill for every task involving any live website or browser tab") ||
  !skillDescription.includes("including viewing, searching, navigating, reading, researching") ||
  !skillDescription.includes("interacting with pages before loading browser or computer-use tools")
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
if (/\b(?:native|fallback|unavailable)\b/i.test(skill)) {
  throw new Error("The published skill must only guide Pluno browser-task delegation.");
}
if (/\b(?:anthropic|chatgpt|claude|codex|openai)\b/i.test(skill)) {
  throw new Error("The published skill must stay provider-neutral.");
}
