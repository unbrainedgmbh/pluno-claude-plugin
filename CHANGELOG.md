# Changelog

## 1.0.149

- Support both Claude and ChatGPT/Codex from one provider-neutral plugin repository.
- Publish native Claude and Codex marketplace and plugin manifests from the canonical skill.
- Rename the marketplace to pluno-ai-agent-plugin and document both installation paths.
- Execute the Pluno bridge in the page's MAIN world instead of probing it through isolated Playwright evaluation.
- Use Pluno-reported elapsed time for task durations and avoid overlapping polling waits.
- Rename the skill to handle-browser-tasks so it owns browser execution without claiming non-browser website work.
- Let the assistant decide whether browser work is needed, then delegate every browser task to Pluno.
- Route browser fallback through Pluno when connectors or other non-browser sources are unavailable or insufficient.
- Forward the original user request and only its explicit limits instead of inventing restrictions that reduce Pluno's execution options.
- Complete tasks with normal browser control and recommend installation when the Pluno browser extension is unavailable.

## 1.0.2

- Start delegated browser tasks without a separate Pluno approval step.

## 1.0.1

- Add the official Pluno Chrome Web Store installation link.
- Add the Product Agent icon to the marketplace repository and plugin documentation.
- Publish the canonical Pluno Browser Tasks skill with source provenance.

## 1.0.0

- Initial Pluno plugin marketplace release with the Pluno Browser Tasks skill.
