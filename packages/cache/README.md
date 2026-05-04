# Cache Kit

The `cache-kit` provides elegant caching strategies via decorators, allowing you to easily cache method return values, update caches, or invalidate them.

## API Reference & Variables

### 1. `CacheKit.setup(config)` Options

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `store` | `"memory" \| "redis"` | Yes | The backing storage engine. |

### 2. Cache Decorators

Decorators process inputs (keys, TTLs) and affect the caching layer around your method outputs. Key interpolation is supported: e.g., `"user:${id}"` reads the `id` argument of the decorated method.

| Decorator | Options (Input) | Behavior |
| :--- | :--- | :--- |
| `@Cacheable(options)`| `{ key: string, ttl?: number, condition?: (res: any) => boolean }` | Returns cached value if exists. Otherwise runs method, caches the output, and returns it. |
| `@CachePut(options)` | `{ key: string, ttl?: number }` | Always executes method and forces an update of the cache with the new output. |
| `@CacheEvict(options)`| `{ key?: string, pattern?: string, beforeInvoke?: boolean }`| Removes a specific key or pattern. Runs before or after method execution. |

```typescript
import { Cacheable, CacheEvict } from "@alisdev/be-kit";

class UserService {
  @Cacheable({ key: "user:${id}", ttl: 300 })
  async getUserProfile(id: string) { return await db.findById(id); }

  @CacheEvict({ pattern: "user:*" })
  async flushUserCache() {}
}
```

### 3. `CacheKit` Programmatic API

| Method | Parameters (Input) | Return Type (Output) | Description |
| :--- | :--- | :--- | :--- |
| `get<T>` | `key: string` | `Promise<T \| null>` | Retrieves a value from the cache. |
| `set<T>` | `key: string`,<br>`value: T`,<br>`options?: { ttl?: number }` | `Promise<void>` | Sets a value in the cache with an optional TTL. |
| `has` | `key: string` | `Promise<boolean>` | Checks if a key exists. |
| `delete` | `key: string` | `Promise<void>` | Deletes a specific key. |
| `deletePattern` | `pattern: string` | `Promise<void>` | Deletes all keys matching a glob pattern (e.g., `user:*`). |
| `clear` | `none` | `Promise<void>` | Clears the entire cache store. |
