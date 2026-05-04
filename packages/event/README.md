# Event Kit

The `event-kit` facilitates decoupled, event-driven architectures by providing robust event emission and decorator-based listeners with wildcard and asynchronous support.

## API Reference & Variables

### 1. `EventKit.setup(config)` Options

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `engine` | `"memory" \| "redis"` | Yes | The underlying event bus implementation. |
| `hooks.beforeEmit` | `(event, payload) => void`| No | Hook called immediately before an event fires. |
| `hooks.afterEmit` | `(event, payload) => void`| No | Hook called after an event fires. |
| `hooks.onError` | `(event, error, handlerName) => void` | No | Hook called when an event handler throws an error. |
| `history.enabled` | `boolean` | No | Whether to record event history. |
| `history.maxSize` | `number` | No | Maximum number of events to keep in memory per topic. |

### 2. `@OnEvent(pattern, options)`

Decorate a class containing a `handle(payload, eventName?)` method.

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `pattern` | `string` | **Required** | The event topic (e.g., `"user.created"`) or wildcard (`"user.*"`). |
| `options.async` | `boolean` | `true` | If true, the event loop does not wait for the handler to finish. |
| `options.queue` | `boolean` | `false` | If true, dispatches to a BullMQ queue instead of executing locally. |
| `options.retries` | `number` | `0` | Auto-retry handler on failure. |

```typescript
import { OnEvent } from "@alisdev/be-kit";

@OnEvent("user.*", { async: true, retries: 3 })
export class UserAuditHandler {
  async handle(payload: any, eventName: string) {
    console.log(`[AUDIT] Event ${eventName}`, payload);
  }
}
```

### 3. `EventKit` Methods

| Method | Parameters (Input) | Return Type (Output) | Description |
| :--- | :--- | :--- | :--- |
| `setup` | `config: EventKitConfig` | `void` | Initializes the event engine. |
| `register` | `...handlers: Class[]` | `void` | Registers class-based listeners. |
| `emit<T>` | `event: string`,<br>`payload: T` | `Promise<void>` | Emits an event with strongly typed payload. |
| `once<T>` | `event: string`,<br>`handler: (p: T) => void`| `void` | Manually attaches a one-time listener function. |
| `off` | `event: string`,<br>`handler: Class` | `void` | Unsubscribes a specific handler. |
| `offAll` | `event: string` | `void` | Removes all listeners for a specific event topic. |
| `history` | `event: string` | `EventHistoryEntry[]`| Returns execution history if enabled. |

### 4. `EventHistoryEntry` Output

| Property | Type | Description |
| :--- | :--- | :--- |
| `event` | `string` | The actual event topic string that was emitted. |
| `payload` | `any` | The data sent with the event. |
| `emittedAt` | `Date` | Timestamp of emission. |
| `status` | `"success" \| "failed"` | Execution outcome of the handler. |
| `error` | `string` | Error message (if status is "failed"). |
| `handlerName`| `string` | The class name of the executed listener. |
