# Router Kit

The `router-kit` bridges Object-Oriented Programming with Express.js by allowing you to define routes, middleware, and request parsers using elegant TypeScript decorators.

## Features
- **Class-level Routing**: `@ReqController` for defining base routes.
- **Method-level Routing**: `@GetMapping`, `@PostMapping`, etc.
- **Parameter Injection**: Safely extract payloads with `@Body`, `@Query`, `@Param`, etc.
- **Middleware**: Attach Express middleware at the class or method level.
- **Exception Handling**: Standardized HTTP Exceptions.

## API Reference & Variables

### 1. Class & Method Decorators

| Decorator | Argument (Input) | Description |
| :--- | :--- | :--- |
| `@ReqController(path)` | `path: string` | Defines the base route for the entire controller class (e.g., `"/api/users"`). |
| `@GetMapping(path)` | `path: string` | Maps HTTP GET requests to the method. |
| `@PostMapping(path)` | `path: string` | Maps HTTP POST requests to the method. |
| `@PutMapping(path)` | `path: string` | Maps HTTP PUT requests to the method. |
| `@PatchMapping(path)` | `path: string` | Maps HTTP PATCH requests to the method. |
| `@DeleteMapping(path)`| `path: string` | Maps HTTP DELETE requests to the method. |
| `@UseMiddleware(...m)`| `...middlewares: RequestHandler[]` | Applies Express middleware to a class or a specific method. |

### 2. Parameter Decorators (Input Variables)

Inject specific parts of the HTTP request directly into your method parameters.

| Decorator | Argument | Injected Value | Example |
| :--- | :--- | :--- | :--- |
| `@Body(key?)` | `string?` | `req.body` or `req.body[key]` | `@Body("email") email: string` |
| `@Query(key?)` | `string?` | `req.query` or `req.query[key]`| `@Query("page") page: string` |
| `@Param(key?)` | `string?` | `req.params` or `req.params[key]`| `@Param("id") id: string` |
| `@Req()` | `none` | Raw Express `Request` object | `@Req() req: Request` |
| `@Res()` | `none` | Raw Express `Response` object| `@Res() res: Response` |
| `@Cookie(key?)`| `string?` | `req.cookies` or `req.cookies[key]`| `@Cookie("session_id") sessionId: string` |

### 3. Controller Method Returns (Outputs)

When a controller method returns a value, `router-kit` automatically sends it as a JSON response using `res.json()`. 

| Return Type | Express Behavior | Example |
| :--- | :--- | :--- |
| `object` / `array` | Sent as `res.json(data)` | `return { success: true }` |
| `Promise<object>` | Awaited, then sent as `res.json(data)` | `return await db.find()` |
| `void` / `undefined`| Request is left hanging (useful if using `@Res()` manually) | `res.send("Done")` |

### 4. Built-in Exceptions

Throwing these exceptions anywhere in the controller will automatically return a structured JSON error to the client: `{ "message": string, "status": number }`

| Exception Class | HTTP Status Code | Default Message |
| :--- | :--- | :--- |
| `BadRequestException` | 400 | "Bad Request" |
| `UnauthorizedException`| 401 | "Unauthorized" |
| `ForbiddenException` | 403 | "Forbidden" |
| `NotFoundException` | 404 | "Not Found" |
| `ConflictException` | 409 | "Conflict" |
| `ServerErrorException` | 500 | "Internal Server Error" |

```typescript
import { NotFoundException } from "@alisdev/be-kit";

@GetMapping("/:id")
async getProduct(@Param("id") id: string) {
  const product = await repo.findById(id);
  if (!product) throw new NotFoundException(`Product ${id} not found`);
  return product;
}
```
