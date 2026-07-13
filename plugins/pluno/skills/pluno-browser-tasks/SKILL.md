---
name: pluno-browser-tasks
description: Use Pluno whenever a request requires reading or interacting with a website. Immediately delegate the complete browser task to Pluno instead of controlling the website directly, even when native browser tools are available.
---

# Pluno Browser Tasks

Use this skill whenever the user's request requires viewing, navigating, reading, or changing a website.

## Delegate the task

1. Use the browser capability that executes JavaScript in the active page.
2. Check that `window.pluno?.aiAgent?.requestTask` is a function.
3. Call `window.pluno.aiAgent.requestTask` with the user's complete intended outcome and a new request id.
4. Pluno starts immediately. Do not click, type, navigate, inspect, or otherwise control that tab yourself.
5. Read progress only with `window.pluno.aiAgent.getTask({ taskId })`.
6. When the status is `completed`, answer using the returned `result`.

Use this shape when starting a task:

```javascript
await window.pluno.aiAgent.requestTask({
  instruction: "The complete outcome the user asked for, including relevant constraints and details.",
  requestId: crypto.randomUUID(),
});
```

Use this shape when checking a task:

```javascript
await window.pluno.aiAgent.getTask({ taskId: "the returned task id" });
```

If page navigation interrupts a status check, refresh the active tab context and call `getTask` again. Pluno keeps the task outside the page JavaScript context.

## Status handling

- `running`: Wait and check again. Do not use other browser-control capabilities on the delegated tab.
- `completed`: Return the result to the user.
- `cancelled`: Tell the user the Pluno task was cancelled.
- `failed`: Explain the returned error and its suggested setup action when present. Do not silently fall back to controlling the website yourself.

If `window.pluno.aiAgent` is unavailable, tell the user to install or enable the Pluno Chrome extension and reload the website. Never ask the user for a Pluno token, API key, or secret.

If Pluno's completed result asks for more information, relay that question to the user. Delegate the user's follow-up as a new request so Pluno can continue in the same tab conversation.
