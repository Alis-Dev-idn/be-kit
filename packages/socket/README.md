# Socket Kit

The `socket-kit` integrates Socket.io with a robust Object-Oriented decorator pattern, allowing for clean, namespace-separated WebSocket controllers with automatic parameter injection and payload validation.

## Features
- **Namespace Controllers**: Define distinct, isolated communication channels using `@SocketController`.
- **Event Listeners**: Bind methods to incoming socket events using `@OnMessage`.
- **Lifecycle Hooks**: Detect client connections and disconnections via `@OnConnect` and `@OnDisconnect`.
- **Validation**: Automatically parse and validate incoming payloads using Zod schemas with `@MessagePayload`.
- **Room Management**: Automatically subscribe clients to specific rooms upon receiving events using `@JoinRoom`.

## API Reference

### 1. Defining a Controller

```typescript
import { z } from "zod";
import { 
  SocketController, OnMessage, OnConnect, OnDisconnect,
  MessagePayload, SocketClient, JoinRoom, SocketKit 
} from "@alisdev/be-kit";

// Zod Schema for validation
const ChatMessageSchema = z.object({
  roomId: z.string(),
  text: z.string().min(1)
});

@SocketController("/chat", { authentication: true })
export class ChatGateway {
  
  @OnConnect()
  async onConnect(@SocketClient() client: any) {
    console.log(`Client ${client.id} connected to /chat`);
  }

  @OnDisconnect()
  async onDisconnect(@SocketClient() client: any) {
    console.log(`Client ${client.id} disconnected`);
  }

  @OnMessage("room.join")
  @JoinRoom((payload: { roomId: string }) => payload.roomId)
  async joinRoom(@MessagePayload() payload: { roomId: string }) {
    // Client is automatically joined to the room returned by the @JoinRoom resolver
    return { success: true, joined: payload.roomId };
  }

  @OnMessage("message.send")
  async sendMessage(
    @MessagePayload(ChatMessageSchema) payload: z.infer<typeof ChatMessageSchema>,
    @SocketClient() client: any
  ) {
    // Broadcast the message to the specific room
    SocketKit.toRoom("/chat", payload.roomId, "message.received", {
      senderId: client.id,
      text: payload.text
    });
  }
}
```

### 2. Configuration & Setup

Attach `SocketKit` to an existing HTTP server and register your controllers.

```typescript
import http from "http";
import express from "express";
import { SocketKit } from "@alisdev/be-kit";

const app = express();
const server = http.createServer(app);

// Initialize SocketKit
SocketKit.setup({ 
  engine: "socketio", 
  server: server,
  config: {
    cors: { origin: "*" }
  },
  authMiddleware: (socket, next) => {
    // Add custom authentication logic here
    const token = socket.handshake.auth.token;
    if (token === "secret") next();
    else next(new Error("Unauthorized"));
  }
});

// Register controllers
SocketKit.register(ChatGateway);

server.listen(3000, () => console.log("WebSocket Server running..."));
```
