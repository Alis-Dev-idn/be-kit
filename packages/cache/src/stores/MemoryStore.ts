import { BaseStore } from "./BaseStore"

export class MemoryStore extends BaseStore {
  private cache = new Map<string, { value: any; expiresAt: number | null }>()

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key)
    if (!entry) return null
    if (entry.expiresAt && entry.expiresAt < Date.now()) {
      this.cache.delete(key)
      return null
    }
    return entry.value
  }

  async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    const expiresAt = ttl ? Date.now() + ttl * 1000 : null
    this.cache.set(key, { value, expiresAt })
  }

  async delete(key: string): Promise<void> {
    this.cache.delete(key)
  }

  async has(key: string): Promise<boolean> {
    return (await this.get(key)) !== null
  }

  async clear(): Promise<void> {
    this.cache.clear()
  }

  async deletePattern(pattern: string): Promise<void> {
    const regex = new RegExp(`^${pattern.replace(/\*/g, ".*")}$`)
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        this.cache.delete(key)
      }
    }
  }

  async disconnect(): Promise<void> {}
}
