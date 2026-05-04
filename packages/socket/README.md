# Socket Kit

The `socket-kit` integrates Socket.io with a robust Object-Oriented decorator pattern, allowing for clean, namespace-separated WebSocket controllers with automatic parameter injection and payload validation.

## API Reference & Variables

### 1. `SocketKit.setup(config)` Options

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `engine` | `"socketio" \| "ws"` | Yes | The WebSocket engine to use. |
| `server` | `http.Server` | Yes | The Node.js HTTP server to bind to. |
| `config.cors` | `{ origin: string \| string[], methods: string[] }` | No | CORS configuration. |
| `config.pingTimeout` | `number` | No | Ping timeout in ms. |
| `config.pingInterval` | `number` | No | Ping interval in ms. |
| `authMiddleware` | `(socket, next) => void` | No | Global middleware function applied to protected namespaces. |

### 2. Controller & Method Decorators

| Decorator | Options (Input) | Description |
| :--- | :--- | :--- |
| `@SocketController(nsp, opts)` | `namespace: string`,<br>`options?: { authentication?: boolean }` | Defines a WebSocket Namespace class. If `authentication` is true, the `authMiddleware` is triggered. |
| `@OnMessage(event)` | `event: string` | Binds a class method to an incoming socket event. |
| `@OnConnect()` | `none` | Lifecycle hook executed when a new client connects to the namespace. |
| `@OnDisconnect()` | `none` | Lifecycle hook executed when a client disconnects. |
| `@JoinRoom(resolver)` | `resolver: (payload: any) => string \| string[]` | Automatically joins the client to the room(s) returned by the resolver based on the incoming message payload. |

### 3. Parameter Decorators (Input Injection)

Similar to Router-Kit, inject data directly into your method signatures.

| Decorator | Parameter / Usage | Description |
| :--- | :--- | :--- |
| `@MessagePayload(schema?)` | `schema?: ZodSchema` | Extracts the raw event payload. If a Zod schema is provided, it automatically validates the data before executing the method. |
| `@SocketClient()` | `none` | Extracts the raw `Socket` client instance (useful for extracting `client.id`). |

```typescript
import { z } from "zod";
import { SocketController, OnMessage, MessagePayload, SocketClient, SocketKit } from "@alisdev/be-kit";

const ChatMessageSchema = z.object({
  roomId: z.string(),
  text: z.string()
});

@SocketController("/chat")
export class ChatGateway {
  
  @OnMessage("message.send")
  async sendMessage(
    @MessagePayload(ChatMessageSchema) payload: z.infer<typeof ChatMessageSchema>,
    @SocketClient() client: any
  ) {
    SocketKit.toRoom("/chat", payload.roomId, "message.received", { senderId: client.id, ...payload });
  }
}
```

### 4. `SocketKit` Broadcaster Methods

Use these static methods anywhere in your application to send data outwards.

| Method | Parameters (Input) | Description |
| :--- | :--- | :--- |
| `broadcast` | `namespace: string`,<br>`event: string`,<br>`payload: any` | Sends an event to all clients in a specific namespace. |
| `toRoom` | `namespace: string`,<br>`room: string`,<br>`event: string`,<br>`payload: any` | Sends an event to all clients within a specific room in a namespace. |
| `toClient` | `namespace: string`,<br>`clientId: string`,<br>`event: string`,<br>`payload: any` | Sends a direct message to a specific client ID. |
