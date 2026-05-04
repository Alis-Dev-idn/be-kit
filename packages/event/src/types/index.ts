export interface OnEventOptions {
  async?: boolean
  queue?: boolean
  retries?: number
  timeout?: number
}

export interface EventHistoryEntry {
  event: string
  payload: any
  emittedAt: Date
  status: "success" | "failed"
  error?: string
  handlerName?: string
}

export type EventEngineType = "memory" | "redis"

export interface EventKitConfig {
  engine: EventEngineType
  config?: {
    redis?: { host: string; port: number; password?: string }
  }
  hooks?: {
    beforeEmit?: (event: string, payload: any) => void | Promise<void>
    afterEmit?: (event: string, payload: any) => void | Promise<void>
    onError?: (event: string, error: Error, handler: string) => void | Promise<void>
  }
  history?: {
    enabled: boolean
    store: "memory" | "redis"
    maxSize?: number
  }
}
