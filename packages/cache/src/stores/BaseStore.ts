export abstract class BaseStore {
  abstract get<T>(key: string): Promise<T | null>
  abstract set<T>(key: string, value: T, ttl?: number): Promise<void>
  abstract delete(key: string): Promise<void>
  abstract has(key: string): Promise<boolean>
  abstract clear(): Promise<void>
  abstract deletePattern(pattern: string): Promise<void>
  abstract disconnect(): Promise<void>
}
