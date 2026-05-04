export interface SocketControllerOptions {
  authentication?: boolean
}

export interface OnMessageOptions {
  authentication?: boolean
}

export type SocketEngineType = "socketio" | "ws"

export interface SocketKitConfig {
  engine: SocketEngineType
  server: any
  config?: {
    cors?: { origin: string | string[]; methods: string[] }
    pingTimeout?: number
    pingInterval?: number
  }
  authMiddleware?: (socket: any, next: (err?: Error) => void) => void
}
