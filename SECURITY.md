# Security

Please report suspected vulnerabilities through GitHub's private vulnerability reporting for this repository. Do not include credentials, customer data, or sensitive browser content in a public issue.

The plugin includes a local PreToolUse hook and guard script. It reads only each proposed Claude-in-Chrome tool call, allows browser setup, navigation, and the Pluno bridge JavaScript, and returns an allow or deny decision locally. It does not send data externally or store browser data. Authentication and browser execution remain inside the Pluno Chrome extension.
