import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";

const marketplace = JSON.parse(await readFile(".claude-plugin/marketplace.json", "utf8"));
const plugin = JSON.parse(await readFile("plugins/pluno/.claude-plugin/plugin.json", "utf8"));
const source = JSON.parse(await readFile("plugins/pluno/SOURCE.json", "utf8"));
const skill = await readFile("plugins/pluno/skills/pluno-browser-tasks/SKILL.md", "utf8");
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
if (!skill.includes("name: Pluno Browser Tasks") || !skill.includes("window.pluno.aiAgent")) {
  throw new Error("The published skill is missing its required contract.");
}
if (/claude/i.test(skill)) {
  throw new Error("The published skill must stay provider-neutral.");
}
