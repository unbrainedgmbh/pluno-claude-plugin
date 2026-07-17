# Changelog

## 1.0.145

- Support both Claude and ChatGPT/Codex from one provider-neutral plugin repository.
- Publish native Claude and Codex marketplace and plugin manifests from the canonical skill.
- Rename the marketplace to pluno-ai-agent-plugin and document both installation paths.
- Execute the Pluno bridge in the page's MAIN world and fail closed instead of probing it through isolated Playwright evaluation.
- Use Pluno-reported elapsed time for task durations and avoid overlapping polling waits.
- Scope automatic routing to outcomes that require live browser-page state without displacing sufficient connectors, APIs, CLIs, databases, local services, or repository files.
- Delegate outcomes and explicit user constraints without inventing restrictions that prevent Pluno from navigating or using read-only product APIs.

## 1.0.2

- Start delegated browser tasks without a separate Pluno approval step.

## 1.0.1

- Add the official Pluno Chrome Web Store installation link.
- Add the Product Agent icon to the marketplace repository and plugin documentation.
- Publish the canonical Pluno Browser Tasks skill with source provenance.

## 1.0.0

- Initial Pluno plugin marketplace release with the Pluno Browser Tasks skill.
