# Socket Kit

The `socket-kit` integrates Socket.io with a robust Object-Oriented decorator pattern, allowing for clean, namespace-separated WebSocket controllers with automatic parameter injection and payload validation.

## Features

- **Class-based Namespaces**: Use `@SocketController` for logical separation.
- **Event Listeners**: Bind methods with `@OnMessage`.
- **Validation**: Validate incoming payloads with Zod via `@MessagePayload`.
- **Lifecycle Hooks**: Trigger logic on connect/disconnect (`@OnConnect`, `@OnDisconnect`).
- **Room Management**: Dynamic room joining with `@JoinRoom`.

## Usage

### Define Gateway

```typescript
import { z } from "zod"
import { SocketController, OnMessage, MessagePayload, SocketClient } from "@alisdev/be-kit"

const JoinRoomSchema = z.object({ roomId: z.string() })

@SocketController("/chat")
export class ChatGateway {
  
  @OnMessage("join")
  async handleJoin(
    @MessagePayload(JoinRoomSchema) payload: any,
    @SocketClient() client: any
  ) {
    client.join(payload.roomId)
    return { success: true, joined: payload.roomId }
  }
}
```

### Setup & Register

```typescript
import http from "http"
import express from "express"
import { SocketKit } from "@alisdev/be-kit"

const app = express()
const server = http.createServer(app)

SocketKit.setup({ engine: "socketio", server })
SocketKit.register(ChatGateway)

server.listen(3000)
```

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

### 4. `SocketKit` Broadcaster Methods

Use these static methods anywhere in your application to send data outwards.

| Method | Parameters (Input) | Description |
| :--- | :--- | :--- |
| `broadcast` | `namespace: string`,<br>`event: string`,<br>`payload: any` | Sends an event to all clients in a specific namespace. |
| `toRoom` | `namespace: string`,<br>`room: string`,<br>`event: string`,<br>`payload: any` | Sends an event to all clients within a specific room in a namespace. |
| `toClient` | `namespace: string`,<br>`clientId: string`,<br>`event: string`,<br>`payload: any` | Sends a direct message to a specific client ID. |
