# Security

Please report suspected vulnerabilities through GitHub's private vulnerability reporting for this repository. Do not include credentials, customer data, or sensitive browser content in a public issue.

The plugin includes a local PreToolUse hook with a guard script. It redirects Chrome tool selections to browser setup and the Pluno bridge JavaScript, then returns allow or deny decisions locally. It never stores browser data or sends data externally. Authentication and browser execution remain inside the Pluno Chrome extension.
