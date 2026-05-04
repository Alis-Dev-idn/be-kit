import "reflect-metadata"
import { SocketControllerOptions } from "../types"

export const SOCKET_CONTROLLER_METADATA = "socket:controller"
export const SOCKET_MESSAGE_METADATA = "socket:messages"
export const SOCKET_CONNECT_METADATA = "socket:connect"
export const SOCKET_DISCONNECT_METADATA = "socket:disconnect"
export const SOCKET_JOIN_ROOM_METADATA = "socket:join_room"
export const SOCKET_PARAM_METADATA = "socket:params"

export enum SocketParamType {
  PAYLOAD = "payload",
  CLIENT = "client"
}

export function SocketController(namespace: string, options?: SocketControllerOptions): ClassDecorator {
  return (target: any) => {
    Reflect.defineMetadata(SOCKET_CONTROLLER_METADATA, { namespace, ...options }, target)
  }
}

export function OnMessage(event: string, options?: any): MethodDecorator {
  return (target: any, propertyKey: string | symbol) => {
    const messages = Reflect.getMetadata(SOCKET_MESSAGE_METADATA, target.constructor) || []
    messages.push({ event, propertyKey, ...options })
    Reflect.defineMetadata(SOCKET_MESSAGE_METADATA, messages, target.constructor)
  }
}

export function OnConnect(): MethodDecorator {
  return (target: any, propertyKey: string | symbol) => {
    Reflect.defineMetadata(SOCKET_CONNECT_METADATA, propertyKey, target.constructor)
  }
}

export function OnDisconnect(): MethodDecorator {
  return (target: any, propertyKey: string | symbol) => {
    Reflect.defineMetadata(SOCKET_DISCONNECT_METADATA, propertyKey, target.constructor)
  }
}

export function JoinRoom(resolver: (payload: any) => string | string[]): MethodDecorator {
  return (target: any, propertyKey: string | symbol) => {
    Reflect.defineMetadata(SOCKET_JOIN_ROOM_METADATA, resolver, target.constructor, propertyKey)
  }
}

export function MessagePayload(schema?: any): ParameterDecorator {
  return (target: any, propertyKey: string | symbol | undefined, index: number) => {
    if (!propertyKey) return
    const params = Reflect.getMetadata(SOCKET_PARAM_METADATA, target.constructor, propertyKey) || []
    params.push({ type: SocketParamType.PAYLOAD, index, schema })
    Reflect.defineMetadata(SOCKET_PARAM_METADATA, params, target.constructor, propertyKey)
  }
}

export function SocketClient(): ParameterDecorator {
  return (target: any, propertyKey: string | symbol | undefined, index: number) => {
    if (!propertyKey) return
    const params = Reflect.getMetadata(SOCKET_PARAM_METADATA, target.constructor, propertyKey) || []
    params.push({ type: SocketParamType.CLIENT, index })
    Reflect.defineMetadata(SOCKET_PARAM_METADATA, params, target.constructor, propertyKey)
  }
}
