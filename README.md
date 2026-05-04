# @alisdev/be-kit

**be-kit** is a comprehensive, decorator-driven backend utility toolkit for Node.js and TypeScript applications. It consolidates multiple modular toolkits into a single, cohesive framework, accelerating backend development with elegant, highly readable code.

## 📦 Included Toolkits

`@alisdev/be-kit` provides a suite of highly-integrated modules:
- **`mongo`**: Decorator-based MongoDB ODM with robust repository patterns, transactions, and a fluent query builder.
- **`router`**: Express routing engine using decorators, middleware injection, and automatic parameter resolution.
- **`mailer`**: Email rendering and delivery service with template interpolation and queueing support.
- **`scheduler`**: Cron job manager with decorators, dynamic registration, and real-time status monitoring.
- **`cache`**: Caching abstraction layer supporting in-memory and Redis stores with elegant `@Cacheable` decorators.
- **`event`**: Event-driven architecture with wildcard support, async handlers, and event history tracking.
- **`socket`**: WebSocket (Socket.io) namespace controllers with decorators for rooms, connections, and message validation.

## 🚀 Installation

Install the core package and its required peer dependencies:

```bash
# Using npm
npm install @alisdev/be-kit mongoose reflect-metadata zod

# Using pnpm
pnpm add @alisdev/be-kit mongoose reflect-metadata zod
```

Depending on the kits you intend to use, you may need to install additional optional peer dependencies:
```bash
pnpm add express        # for router-kit
pnpm add socket.io      # for socket-kit
pnpm add nodemailer     # for mailer-kit
pnpm add node-cron      # for scheduler-kit
pnpm add eventemitter2  # for event-kit
```

### Enable Decorators
Ensure your `tsconfig.json` has decorators enabled:
```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

## 📖 Quick Start

Here is a full example combining `mongo-kit` and `router-kit` to create a complete REST endpoint in minutes:

```typescript
import "reflect-metadata";
import express from "express";
import mongoose from "mongoose";
import { 
  Schema, BaseEntity, Repository, BaseRepository, 
  ReqController, GetMapping, PostMapping, Body, RouterKit 
} from "@alisdev/be-kit";
import { z } from "zod";

// 1. Define your Database Entity
@Schema({ collection: "users", timestamps: true })
class User extends BaseEntity {
  name: string;
  email: string;
}

// 2. Define your Data Repository
@Repository(User)
class UserRepository extends BaseRepository<User> {}

// 3. Define your REST Controller
const CreateUserSchema = z.object({
  name: z.string(),
  email: z.string().email()
});

@ReqController("/api/users")
class UserController {
  private userRepo = new UserRepository();

  @GetMapping("/")
  async getAllUsers() {
    // Automatically uses BaseRepository's find() method
    return await this.userRepo.find(); 
  }

  @PostMapping("/")
  async createUser(@Body() data: any) {
    const validated = CreateUserSchema.parse(data);
    return await this.userRepo.save(validated);
  }
}

// 4. Bootstrap your Application
async function bootstrap() {
  await mongoose.connect("mongodb://localhost:27017/my_database");

  const app = express();
  app.use(express.json());

  // Register controllers with Express
  RouterKit.register(app, [UserController]);

  app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
  });
}

bootstrap();
```

## 📚 Detailed Documentation

Dive deeper into each module's capabilities:

- [Mongo Kit](./packages/mongo/README.md) - Advanced queries, transactions, and Zod integration.
- [Router Kit](./packages/router/README.md) - Parameter decorators, middleware, and exception handling.
- [Mailer Kit](./packages/mailer/README.md) - Template engines and provider adapters.
- [Scheduler Kit](./packages/scheduler/README.md) - Decorator-based cron jobs and runtime control.
- [Cache Kit](./packages/cache/README.md) - Key interpolation and caching strategies.
- [Event Kit](./packages/event/README.md) - Wildcard listeners and historical replays.
- [Socket Kit](./packages/socket/README.md) - Namespace routing and room management.

## 🔄 Migration from v1

If you are migrating from standalone `@alisdev` packages (e.g., `@alisdev/mongo-kit`, `@alisdev/router-api-kit`), update your imports to point to the unified `@alisdev/be-kit` package.

**v1 (Old):**
```typescript
import { Repository } from "@alisdev/mongo-kit";
import { ReqController } from "@alisdev/router-api-kit";
```

**v2 (New):**
```typescript
import { Repository, ReqController } from "@alisdev/be-kit";
```

## License

MIT License.
