# Cache Kit

The `cache-kit` provides elegant caching strategies via decorators, allowing you to easily cache method return values, update caches, or invalidate them.

## Features
- **Declarative**: Use `@Cacheable`, `@CachePut`, and `@CacheEvict` to manage cache state.
- **Dynamic Keys**: Interpolate method arguments into cache keys using `${argumentName}`.
- **Multiple Engines**: Supports `memory` and `redis` stores (Redis requires manual adapter implementation for now).
- **Programmatic API**: Direct access to the cache store via `CacheKit`.

## API Reference

### 1. Configuration & Setup

```typescript
import { CacheKit } from "@alisdev/be-kit";

CacheKit.setup({ 
  store: "memory" 
});
```

### 2. Caching Method Results

Use `@Cacheable` to bypass execution and return cached data if it exists.

```typescript
import { Cacheable, CacheEvict } from "@alisdev/be-kit";

class UserService {
  
  // The key resolves to "user:123" if the id parameter is "123".
  // The result is cached for 300 seconds (5 minutes).
  @Cacheable({ key: "user:${id}", ttl: 300 })
  async getUserProfile(id: string) {
    console.log("Fetching from database...");
    return await db.users.findById(id);
  }

  // Invalidates the specific cache entry when the user is updated.
  @CacheEvict({ key: "user:${id}" })
  async updateUser(id: string, data: any) {
    await db.users.update(id, data);
  }
  
  // Clears all cache keys matching the pattern.
  @CacheEvict({ pattern: "user:*" })
  async flushUserCache() {
    console.log("All user caches invalidated.");
  }
}
```

### 3. Programmatic Cache Access

You can also interact with the cache directly using the `CacheKit` static methods.

```typescript
import { CacheKit } from "@alisdev/be-kit";

// Set a value
await CacheKit.set("session:token_abc", { userId: "123" }, { ttl: 3600 });

// Get a value
const session = await CacheKit.get<{ userId: string }>("session:token_abc");

// Check existence
const exists = await CacheKit.has("session:token_abc");

// Delete specific key
await CacheKit.delete("session:token_abc");

// Delete by pattern
await CacheKit.deletePattern("session:*");
```
