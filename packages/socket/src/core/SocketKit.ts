import "reflect-metadata"
import { SocketKitConfig } from "../types"
import { 
  SOCKET_CONTROLLER_METADATA, 
  SOCKET_MESSAGE_METADATA, 
  SOCKET_CONNECT_METADATA, 
  SOCKET_DISCONNECT_METADATA,
  SOCKET_JOIN_ROOM_METADATA,
  SOCKET_PARAM_METADATA,
  SocketParamType
} from "../decorators"

export class SocketKit {
  private static config: SocketKitConfig
  private static io: any
  private static controllers = new Map<string, any>()

  static setup(config: SocketKitConfig) {
    this.config = config
    if (config.engine === "socketio") {
      const { Server } = require("socket.io")
      this.io = new Server(config.server, config.config)
    } else {
      throw new Error(`Engine ${config.engine} not fully implemented in this version`)
    }
  }

  static register(...controllers: any[]) {
    if (!this.io) throw new Error("SocketKit not initialized")

    controllers.forEach((Controller) => {
      const metadata = Reflect.getMetadata(SOCKET_CONTROLLER_METADATA, Controller)
      if (!metadata) throw new Error(`Class ${Controller.name} is not a @SocketController`)

      const nsp = this.io.of(metadata.namespace)
      const instance = new Controller()

      if (metadata.authentication && this.config.authMiddleware) {
        nsp.use(this.config.authMiddleware)
      }

      nsp.on("connection", (socket: any) => {
        // Handle OnConnect
        const connectMethod = Reflect.getMetadata(SOCKET_CONNECT_METADATA, Controller)
        if (connectMethod) {
          const args = this.buildArgs(socket, null, Controller, connectMethod)
          instance[connectMethod](...args).catch(console.error)
        }

        // Register OnMessage handlers
        const messages = Reflect.getMetadata(SOCKET_MESSAGE_METADATA, Controller) || []
        messages.forEach((msg: any) => {
          socket.on(msg.event, async (payload: any) => {
            try {
              // Join Room logic
              const joinRoomResolver = Reflect.getMetadata(SOCKET_JOIN_ROOM_METADATA, Controller, msg.propertyKey)
              if (joinRoomResolver) {
                const rooms = joinRoomResolver(payload)
                if (Array.isArray(rooms)) rooms.forEach(r => socket.join(r))
                else socket.join(rooms)
              }

              const args = this.buildArgs(socket, payload, Controller, msg.propertyKey)
              const result = await instance[msg.propertyKey](...args)
              
              if (result !== undefined) {
                socket.emit(`${msg.event}.response`, result)
              }
            } catch (error: any) {
              socket.emit("error", { message: error.message, status: error.status || 500 })
            }
          })
        })

        // Handle OnDisconnect
        socket.on("disconnect", () => {
          const disconnectMethod = Reflect.getMetadata(SOCKET_DISCONNECT_METADATA, Controller)
          if (disconnectMethod) {
            const args = this.buildArgs(socket, null, Controller, disconnectMethod)
            instance[disconnectMethod](...args).catch(console.error)
          }
        })
      })
    })
  }

  private static buildArgs(socket: any, payload: any, controller: any, propertyKey: string | symbol): any[] {
    const params = Reflect.getMetadata(SOCKET_PARAM_METADATA, controller, propertyKey) || []
    const args: any[] = []

    params.sort((a: any, b: any) => a.index - b.index).forEach((param: any) => {
      if (param.type === SocketParamType.CLIENT) {
        args[param.index] = socket
      } else if (param.type === SocketParamType.PAYLOAD) {
        let data = payload
        if (param.schema) {
          const result = param.schema.safeParse(payload)
          if (!result.success) {
            throw new Error(`Validation failed: ${result.error.message}`)
          }
          data = result.data
        }
        args[param.index] = data
      }
    })

    return args
  }

  static broadcast(namespace: string, event: string, payload: any) {
    this.io.of(namespace).emit(event, payload)
  }

  static toRoom(namespace: string, room: string, event: string, payload: any) {
    this.io.of(namespace).to(room).emit(event, payload)
  }

  static toClient(namespace: string, clientId: string, event: string, payload: any) {
    this.io.of(namespace).to(clientId).emit(event, payload)
  }
}
