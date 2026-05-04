export interface CacheableOptions {
  key: string
  ttl?: number
  condition?: (result: any) => boolean
}

export interface CacheEvictOptions {
  key?: string
  pattern?: string
  beforeInvoke?: boolean
}

export interface CachePutOptions {
  key: string
  ttl?: number
}

export type StoreType = "redis" | "memory"

export interface CacheKitConfig {
  store: StoreType
  config?: {
    redis?: { host: string; port: number; password?: string; db?: number }
  }
  serializer?: {
    serialize: (data: unknown) => string
    deserialize: (data: string) => unknown
  }
}
