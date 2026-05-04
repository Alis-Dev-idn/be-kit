# Event Kit

The `event-kit` facilitates decoupled, event-driven architectures by providing robust event emission and decorator-based listeners with wildcard and asynchronous support.

## Features
- **Decorators**: Subscribe to events using the `@OnEvent` decorator.
- **Pattern Matching**: Native support for wildcards (`user.*`, `*.created`, `**`).
- **History Tracking**: Automatically records event logs, allowing you to replay past or failed events.
- **Middleware Hooks**: Attach global `beforeEmit`, `afterEmit`, and `onError` lifecycle hooks.

## API Reference

### 1. Configuration & Setup

```typescript
import { EventKit } from "@alisdev/be-kit";

EventKit.setup({
  engine: "memory", // Uses eventemitter2 under the hood
  hooks: {
    beforeEmit: (event, payload) => console.log(`Emitting ${event}...`),
    onError: (event, error, handler) => console.error(`${handler} failed:`, error)
  },
  history: {
    enabled: true,
    maxSize: 100 // Keep last 100 events in memory
  }
});
```

### 2. Defining Event Listeners

Use the `@OnEvent` decorator to register a class as a listener. The class must implement a `handle(payload, eventName?)` method.

```typescript
import { OnEvent } from "@alisdev/be-kit";

// Exact match
@OnEvent("user.created", { async: true, retries: 3 })
export class SendWelcomeEmailHandler {
  async handle(payload: { email: string, name: string }) {
    await MailerKit.send(WelcomeEmail, payload);
  }
}

// Wildcard match
@OnEvent("user.*")
export class UserAuditHandler {
  async handle(payload: any, eventName: string) {
    console.log(`[AUDIT] User event triggered: ${eventName}`, payload);
  }
}
```

### 3. Emitting and Controlling Events

Register your handlers and emit payloads globally.

```typescript
import { EventKit } from "@alisdev/be-kit";

// Register all listeners
EventKit.register(SendWelcomeEmailHandler, UserAuditHandler);

// Emit an event
await EventKit.emit("user.created", { email: "john@doe.com", name: "John" });

// Manually subscribe for a single emission
EventKit.once("system.shutdown", async () => {
  console.log("Shutting down gracefully...");
});
```

### 4. Event History

If history is enabled, you can inspect and replay events.

```typescript
const history = EventKit.history("user.created");
console.log(history);
/* Output:
[{
  event: "user.created",
  payload: { email: "..." },
  emittedAt: 2026-05-04T12:00:00Z,
  status: "success",
  handlerName: "SendWelcomeEmailHandler"
}]
*/
```
