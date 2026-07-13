# Security

Please report suspected vulnerabilities through GitHub's private vulnerability reporting for this repository. Do not include credentials, customer data, or sensitive browser content in a public issue.

The plugin includes local PreToolUse and PostToolUse hooks with a guard script. It reads only Claude-in-Chrome tool events, allows browser setup, navigation, and the Pluno bridge JavaScript, and returns allow or deny decisions locally. After an explicit bridge availability or billing failure, it stores a short-lived, session-keyed fallback flag; it never stores browser data or sends data externally. Authentication and browser execution remain inside the Pluno Chrome extension.
