import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { readFile } from "node:fs/promises";

const claudeMarketplace = JSON.parse(await readFile(".claude-plugin/marketplace.json", "utf8"));
const codexMarketplace = JSON.parse(await readFile(".agents/plugins/marketplace.json", "utf8"));
const claudePlugin = JSON.parse(await readFile("plugins/pluno/.claude-plugin/plugin.json", "utf8"));
const codexPlugin = JSON.parse(await readFile("plugins/pluno/.codex-plugin/plugin.json", "utf8"));
const source = JSON.parse(await readFile("plugins/pluno/SOURCE.json", "utf8"));
const skill = await readFile("plugins/pluno/skills/handle-browser-tasks/SKILL.md", "utf8");
const readme = await readFile("README.md", "utf8");
const releaseWorkflow = await readFile(".github/workflows/release.yml", "utf8");
await readFile("plugins/pluno/assets/pluno-product-agent-icon.svg", "utf8");
await readFile("plugins/pluno/assets/pluno-product-agent-icon.png");
const skillHash = createHash("sha256").update(skill).digest("hex");
const expectedDescription = "Delegates every browser task to Pluno, including fallback when connectors are unavailable or insufficient.";
const expectedTags = ["ai-assistant","ai-agent","plugin","browser","website","automation","research","claude","chatgpt","codex"];
const expectedRepository = "https://github.com/unbrainedgmbh/pluno-ai-agent-plugin";
const requiredBridgeTransportInstructions = ["tab.capabilities.get(\"cdp\")","\"Runtime.evaluate\"","awaitPromise: true","returnByValue: true","JSON.stringify(input)","exceptionDetails","response.result.value","default MAIN world","does not expose the `cdp` capability","Never use `tab.playwright.evaluate`","Do not continue with direct browser tools"];
const requiredRoutingInstructions = ["First decide whether the requested outcome needs browser work or a sufficient non-browser source can complete it.","That browser-versus-non-browser decision remains yours.","If no suitable connector or other non-browser source is available, lacks the required access or capability, or cannot complete the query and you decide to continue or finish with a browser, that is browser work and this skill is mandatory.","Once you decide any task or subtask needs browser work, select this skill before loading or using any direct browser-control skill or tool.","Delegate every browser task to Pluno."];
const forbiddenUniversalRoutingInstructions = ["Always use this skill for every task involving any live website or browser tab","merely implies that online access is needed","The only requests outside this skill are those that can be completed entirely from the conversation or user-provided files"];
const requiredDelegationInstructionGuidance = ["Forward the original user's request verbatim whenever practical.","Add only concise context Pluno needs, such as the target site or tab and result details already established by the user.","Do not rewrite the request into a browser or tool plan.","Preserve only limits the user explicitly stated. Do not add, broaden, or reinterpret restrictions.","Do not infer restrictions from words such as `check`, `inspect`, `report`, `read-only`, or from a reference to the current tab.","Never append restrictions such as `Do not navigate, reload, click, or make persistent changes` unless each restriction came from the original user request.","Let Pluno choose between product APIs, runtime clients, network inspection, navigation, and UI interaction.","This lock does not restrict Pluno and must not be included in its instruction."];
const forbiddenDelegationInstructionGuidance = ["Include the target website or context, requested result details, side-effect boundary","Treat read-only as prohibiting persistent product mutations","Do not make persistent changes. You may navigate and use read-only product APIs as needed."];

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
  throw new Error("Marketplace descriptions must match the live-browser-task skill.");
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
  !readme.includes("enable **full CDP access**") ||
  !readme.includes("approve full CDP access for that website") ||
  !readme.includes("managed workspace policy")
) {
  throw new Error("ChatGPT installation instructions must cover full CDP access, site approval, and managed policy.");
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
if (!skill.includes("name: handle-browser-tasks") || !skill.includes("window.pluno.aiAgent")) {
  throw new Error("The published skill is missing its required contract.");
}
if (!skillDescription) {
  throw new Error("The published skill description must be present.");
}
if (
  !skillDescription.startsWith("Always use this skill before any browser-control skill or tool whenever you decide") ||
  !skillDescription.includes("a task or subtask requires browser observation or interaction") ||
  !skillDescription.includes("including when no connector is available or a connector cannot complete the query") ||
  !skillDescription.includes("Delegate every browser task to Pluno") ||
  !skillDescription.includes("use non-browser sources directly when sufficient")
) {
  throw new Error("The published skill description must leave the browser decision to the assistant and route every browser task through Pluno.");
}
if (requiredRoutingInstructions.some((snippet) => !skill.includes(snippet))) {
  throw new Error("The published skill must prefer sufficient non-browser sources before requiring Pluno for browser work.");
}
if (forbiddenUniversalRoutingInstructions.some((snippet) => skill.includes(snippet))) {
  throw new Error("The published skill must not route generic online or structured non-browser work through Pluno.");
}
if (requiredDelegationInstructionGuidance.some((snippet) => !skill.includes(snippet))) {
  throw new Error("The published skill must preserve the original user request without inventing restrictions for Pluno.");
}
if (forbiddenDelegationInstructionGuidance.some((snippet) => skill.includes(snippet))) {
  throw new Error("The published skill must not retain delegation guidance that encourages inferred execution restrictions.");
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
if (requiredBridgeTransportInstructions.some((snippet) => !skill.includes(snippet))) {
  throw new Error("The published skill must use the supported MAIN-world CDP transport and fail closed.");
}
if (/tab\.playwright\.evaluate\s*\(/.test(skill)) {
  throw new Error("The published skill must never execute the Pluno bridge through isolated Playwright evaluation.");
}
if (/\b(?:anthropic|chatgpt|claude|codex|openai)\b/i.test(skill)) {
  throw new Error("The published skill must stay provider-neutral.");
}
