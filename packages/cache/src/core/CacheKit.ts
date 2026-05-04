import { CacheKitConfig, StoreType } from "../types"
import { BaseStore } from "../stores/BaseStore"
import { MemoryStore } from "../stores/MemoryStore"

export class CacheKit {
  private static config: CacheKitConfig
  private static store: BaseStore

  static setup(config: CacheKitConfig) {
    this.config = config
    switch (config.store) {
      case "memory":
        this.store = new MemoryStore()
        break
      // RedisStore would be added here
      default:
        throw new Error(`Unsupported cache store: ${config.store}`)
    }
  }

  private static ensureInitialized() {
    if (!this.store) throw new Error("CacheKit not initialized. Call setup() first.")
  }

  static async get<T>(key: string): Promise<T | null> {
    this.ensureInitialized()
    return this.store.get<T>(key)
  }

  static async set<T>(key: string, value: T, options?: { ttl?: number }): Promise<void> {
    this.ensureInitialized()
    await this.store.set(key, value, options?.ttl)
  }

  static async delete(key: string): Promise<void> {
    this.ensureInitialized()
    await this.store.delete(key)
  }

  static async has(key: string): Promise<boolean> {
    this.ensureInitialized()
    return this.store.has(key)
  }

  static async clear(): Promise<void> {
    this.ensureInitialized()
    await this.store.clear()
  }

  static async deletePattern(pattern: string): Promise<void> {
    this.ensureInitialized()
    await this.store.deletePattern(pattern)
  }

  /**
   * Internal helper for key interpolation.
   */
  static interpolateKey(key: string, args: any[], paramNames: string[]): string {
    return key.replace(/\$\{([^}]+)\}/g, (_, name) => {
      const index = paramNames.indexOf(name.trim())
      return index !== -1 ? String(args[index]) : "undefined"
    })
  }

  /**
   * Internal helper to get parameter names of a function.
   */
  static getParamNames(fn: Function): string[] {
    const fnStr = fn.toString()
    const result = fnStr.slice(fnStr.indexOf('(') + 1, fnStr.indexOf(')')).match(/([^\s,]+)/g)
    return result === null ? [] : result
  }
}
