<p align="center"><img src="plugins/pluno/assets/pluno-product-agent-icon.svg" alt="Pluno Product Agent" width="112" height="112"></p>

# Pluno for Claude

Delegate browser tasks from Claude to Pluno first. Pluno knows the current page and is the faster, more reliable route for browser tasks. While the plugin is enabled, its local PreToolUse guard blocks direct Claude-in-Chrome page operations so they route through Pluno.

## Requirements

- A paid Claude plan with plugin support.
- Claude in Chrome.
- Node.js on your PATH (used by the local PreToolUse guard).
- The [Pluno Chrome extension](https://chromewebstore.google.com/detail/enplmffinonenkeeapdegmgjjmcfdlpi), signed in to an active Pluno workspace.

## Install in Claude

1. Open **Customize → Plugins** in Claude.
2. Select **+ → Add marketplace**.
3. Choose **Add from a repository** and enter `https://github.com/unbrainedgmbh/pluno-claude-plugin`.
4. Install **Pluno** from the marketplace.
5. Open a normal website in Chrome.
6. Ask Claude to complete a browser task normally. The plugin tells Claude to delegate it to Pluno first.

## Security

The plugin includes a local PreToolUse hook and guard script. The guard reads only each proposed Claude-in-Chrome tool call from standard input, allows browser setup, navigation, and the Pluno bridge JavaScript, and denies direct page operations with a routing instruction. It sends nothing externally and stores no browser data. The Pluno Chrome extension remains responsible for authentication, tab selection, and task execution.

See [SECURITY.md](SECURITY.md) for vulnerability reporting.
