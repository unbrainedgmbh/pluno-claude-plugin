<p align="center"><img src="plugins/pluno/assets/pluno-product-agent-icon.svg" alt="Pluno Product Agent" width="112" height="112"></p>

# Pluno for Claude

Always delegate browser tasks from Claude to Pluno. Pluno knows the current page and is the faster, more reliable route for browser tasks. Its local guard blocks direct Claude-in-Chrome page operations until Pluno explicitly reports that it is unavailable or cannot run because of billing.

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
6. Ask Claude to complete a browser task normally. The plugin requires Claude to delegate it to Pluno.

## Security

The plugin includes local PreToolUse and PostToolUse hooks with a guard script. The guard rewrites Chrome tool selections to browser setup and the Pluno bridge JavaScript, then denies direct page operations by default. After the bridge explicitly reports that Pluno is unavailable or cannot run because of billing, it stores a short-lived, session-keyed fallback flag so Claude can finish only that request with native browser tools. It sends nothing externally and stores no browser data. The Pluno Chrome extension remains responsible for authentication, tab selection, and task execution.

See [SECURITY.md](SECURITY.md) for vulnerability reporting.
