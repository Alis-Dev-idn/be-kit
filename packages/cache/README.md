# Cache Kit

The `cache-kit` provides elegant caching strategies via decorators, allowing you to easily cache method return values, update caches, or invalidate them.

## Features

- **Decorator-based Caching**: Use `@Cacheable`, `@CachePut`, and `@CacheEvict`.
- **Key Interpolation**: Dynamic keys using `${param}` syntax.
- **Multiple Stores**: Support for In-Memory and Redis (structure ready).
- **Manual Access**: `CacheKit.get`, `set`, `delete` for direct control.
- **Pattern Eviction**: Clear cache by glob patterns.

## Usage

### Setup

```typescript
import { CacheKit } from "@alisdev/be-kit"

CacheKit.setup({ store: "memory" })
```

### Decorators

```typescript
import { Cacheable, CacheEvict } from "@alisdev/be-kit"

class UserService {
  @Cacheable({ key: "user:${id}", ttl: 300 })
  async findById(id: string) {
    return userRepo.findById(id)
  }

  @CacheEvict({ key: "user:${id}" })
  async update(id: string, data: any) {
    return userRepo.update(id, data)
  }
}
```

### Manual Access

```typescript
await CacheKit.set("my-key", { value: 123 }, { ttl: 60 })
const val = await CacheKit.get("my-key")
```

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

### 3. `CacheKit` Programmatic API

| Method | Parameters (Input) | Return Type (Output) | Description |
| :--- | :--- | :--- | :--- |
| `get<T>` | `key: string` | `Promise<T \| null>` | Retrieves a value from the cache. |
| `set<T>` | `key: string`,<br>`value: T`,<br>`options?: { ttl?: number }` | `Promise<void>` | Sets a value in the cache with an optional TTL. |
| `has` | `key: string` | `Promise<boolean>` | Checks if a key exists. |
| `delete` | `key: string` | `Promise<void>` | Deletes a specific key. |
| `deletePattern` | `pattern: string` | `Promise<void>` | Deletes all keys matching a glob pattern (e.g., `user:*`). |
| `clear` | `none` | `Promise<void>` | Clears the entire cache store. |
