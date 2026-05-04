# Router Kit

The `router-kit` bridges Object-Oriented Programming with Express.js by allowing you to define routes, middleware, and request parsers using elegant TypeScript decorators.

## Features
- **Class-level Routing**: `@ReqController` for defining base routes.
- **Method-level Routing**: `@GetMapping`, `@PostMapping`, etc.
- **Parameter Injection**: Safely extract payloads with `@Body`, `@Query`, `@Param`, `@Req`, `@Res`, and `@Cookie`.
- **Middleware**: Attach Express middleware at the class or method level with `@UseMiddleware`.
- **Exception Handling**: Standardized HTTP Exceptions (`BadRequestException`, `NotFoundException`, etc.) that are automatically caught and sent to the client.

## API Reference

### 1. Defining a Controller

```typescript
import { 
  ReqController, GetMapping, PostMapping, PutMapping, DeleteMapping, 
  Body, Param, Query, UseMiddleware 
} from "@alisdev/be-kit";

// Class-level middleware applies to all routes in the controller
@ReqController("/api/products")
@UseMiddleware(AuthMiddleware) 
export class ProductController {

  @GetMapping("/")
  async listProducts(@Query("page") page: string = "1") {
    // Return objects/arrays directly; RouterKit handles res.json()
    return { data: [], page }; 
  }

  @GetMapping("/:id")
  async getProduct(@Param("id") id: string) {
    return { id, name: "Sample Product" };
  }

  @PostMapping("/")
  @UseMiddleware(ValidateProductMiddleware) // Method-level middleware
  async createProduct(@Body() payload: any) {
    return { success: true, payload };
  }
}
```

### 2. Registering Controllers

Use `RouterKit.register` to bind your decorated classes to an Express application instance.

```typescript
import express from "express";
import { RouterKit } from "@alisdev/be-kit";

const app = express();
app.use(express.json());

// Pass the app and an array of Controller classes
RouterKit.register(app, [ProductController]);

app.listen(3000);
```

### 3. Built-in Exceptions

Throw these exceptions anywhere within your controller methods. RouterKit automatically catches them and formats a standardized JSON error response.

```typescript
import { NotFoundException, BadRequestException } from "@alisdev/be-kit";

@GetMapping("/:id")
async getProduct(@Param("id") id: string) {
  if (!id) throw new BadRequestException("Product ID is required");
  
  const product = await repo.findById(id);
  if (!product) throw new NotFoundException(`Product ${id} not found`);
  
  return product;
}
```

Available Exceptions:
- `BadRequestException` (400)
- `UnauthorizedException` (401)
- `ForbiddenException` (403)
- `NotFoundException` (404)
- `ConflictException` (409)
- `ServerErrorException` (500)
