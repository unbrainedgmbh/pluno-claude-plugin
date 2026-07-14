# Security

Please report suspected vulnerabilities through GitHub's private vulnerability reporting for this repository. Do not include credentials, customer data, or sensitive browser content in a public issue.

The plugin retains its local PreToolUse guard script, but hook registration is currently disabled and the guard does not execute. When restored, its diagnostics exclude user instructions, page content, JavaScript bodies, URLs, and browser data and are not sent externally. Authentication and browser execution remain inside the Pluno Chrome extension.
