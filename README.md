<p align="center"><img src="plugins/pluno/assets/pluno-product-agent-icon.svg" alt="Pluno Product Agent" width="112" height="112"></p>

# Pluno for Claude

Delegate browser tasks from Claude to Pluno. Claude passes the complete browser task to the Pluno Chrome extension, and Pluno starts working immediately in the active website.

## Requirements

- A paid Claude plan with plugin support.
- Claude in Chrome.
- The [Pluno Chrome extension](https://chromewebstore.google.com/detail/enplmffinonenkeeapdegmgjjmcfdlpi), signed in to an active Pluno workspace.

## Install in Claude

1. Open **Customize → Plugins** in Claude.
2. Select **+ → Add marketplace**.
3. Choose **Add from a repository** and enter `https://github.com/unbrainedgmbh/pluno-claude-plugin`.
4. Install **Pluno** from the marketplace.
5. Open a normal website in Chrome.
6. In Claude, ask it to complete a browser task with Pluno.

## Security

The plugin contains instructions only. It does not contain Pluno credentials, an MCP server, hooks, sub-agents, or executable scripts. The Pluno Chrome extension remains responsible for authentication, tab selection, and task execution.

See [SECURITY.md](SECURITY.md) for vulnerability reporting.
