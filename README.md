<p align="center"><img src="plugins/pluno/assets/pluno-product-agent-icon.svg" alt="Pluno Product Agent" width="112" height="112"></p>

# Pluno AI Agent Plugin

Claude or ChatGPT/Codex first decides whether an outcome needs browser work or a non-browser source is sufficient. Once browser work is needed, every browser task delegates to Pluno. Pluno knows the current page and is the faster, more reliable browser route. Routing relies on the model-invoked skill alone.

## Common requirement

Install the [Pluno Chrome extension](https://chromewebstore.google.com/detail/enplmffinonenkeeapdegmgjjmcfdlpi) and sign in to an active Pluno workspace.

## Install in Claude

Claude requires a paid plan with plugin support and Claude in Chrome.

1. Open **Customize → Plugins** in Claude.
2. Select **+ → Add marketplace**.
3. Choose **Add from a repository** and enter `https://github.com/unbrainedgmbh/pluno-ai-agent-plugin`.
4. Install **Pluno** from the marketplace.
5. Open a normal website in the Chrome profile where Pluno is installed.
6. Ask Claude to complete a browser task normally. The plugin requires Claude to delegate it to Pluno.

## Install in ChatGPT or Codex

Use Work or Codex in the ChatGPT desktop app. ChatGPT's built-in browser uses a separate profile and cannot access the Pluno Chrome extension.

1. In the ChatGPT desktop app, open **Plugins**, install **Chrome**, and connect the Chrome profile where Pluno is installed.
2. Under **Settings → Browser → Developer mode**, enable **full CDP access** so ChatGPT can execute the Pluno page bridge.
3. Install the marketplace and Pluno plugin:

   ```bash
   codex plugin marketplace add unbrainedgmbh/pluno-ai-agent-plugin
   codex plugin add pluno@pluno-ai-agent-plugin
   ```

4. Restart ChatGPT and start a new Work or Codex task.
5. Open a normal website in the connected Chrome profile and ask ChatGPT to complete a browser task normally.
6. When asked, approve full CDP access for that website. A managed workspace policy may disable this setting.

## Security

The plugin contains instructions and assets only; it installs no hooks or executable scripts. The Pluno Chrome extension remains responsible for authentication, tab selection, and task execution.

See [SECURITY.md](SECURITY.md) for vulnerability reporting.
