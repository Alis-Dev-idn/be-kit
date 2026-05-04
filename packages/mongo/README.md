# Mongo Kit

The `mongo-kit` provides an elegant, decorator-based abstraction over Mongoose, featuring a generic repository pattern, fluent query building, and native transaction propagation via `AsyncLocalStorage`.

## Features
- **Entities**: `@Schema` and `@VirtualField` for clean class-based model definitions.
- **Repositories**: `@Repository` and `BaseRepository<T>` with built-in CRUD operations.
- **Transactions**: Thread-local session tracking using `@Transactional` or `MongoKit.withTransaction`.
- **Query Builder**: Relational and custom query generation with `CustomBuilder`.

## API Reference & Variables

### 1. `BaseEntity` Properties
All entities extending `BaseEntity` automatically inherit these fields:

| Field | Type | Description |
| :--- | :--- | :--- |
| `_id` | `string` | MongoDB document ID |
| `createdAt` | `Date` | Creation timestamp |
| `updatedAt` | `Date` | Last update timestamp |
| `createdBy` | `string \| null` | ID of the user who created the record |
| `updatedBy` | `string \| null` | ID of the user who last updated the record |

### 2. `@Schema(options)` Decorator

| Option | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `collection` | `string` | **Required** | The name of the MongoDB collection. |
| `timestamps` | `boolean` | `true` | Automatically manage `createdAt` and `updatedAt`. |
| `versionKey` | `boolean \| string` | `false` | Mongoose version key (`__v`). |

### 3. `BaseRepository<T>` Methods

| Method | Parameters (Input) | Return Type (Output) | Description |
| :--- | :--- | :--- | :--- |
| `save` | `data: Partial<T>`,<br>`options?: RepositoryOptions` | `Promise<T>` | Creates a new document. |
| `update` | `id: string`,<br>`data: Partial<T>`,<br>`options?: RepositoryOptions` | `Promise<T \| null>` | Updates an existing document by ID. |
| `delete` | `id: string`,<br>`options?: RepositoryOptions` | `Promise<boolean>` | Deletes a document by ID. |
| `find` | `query?: BuiltQuery<T>`,<br>`options?: RepositoryOptions` | `Promise<T[]>` | Finds multiple documents based on a query. |
| `findOne` | `query?: BuiltQuery<T>`,<br>`options?: RepositoryOptions` | `Promise<T \| null>` | Finds a single document based on a query. |
| `findById` | `id: string`,<br>`options?: RepositoryOptions` | `Promise<T \| null>` | Finds a document by its ID. |
| `findAll` | `query?: BuiltQuery<T>`,<br>`pageable?: IPageable`,<br>`options?: RepositoryOptions` | `Promise<PageResult<T>>` | Returns paginated results. |

#### `RepositoryOptions`
| Property | Type | Description |
| :--- | :--- | :--- |
| `actorId` | `string` | Used to populate `createdBy` and `updatedBy` fields automatically. |
| `session` | `ClientSession` | Manual Mongoose session (usually handled automatically by `@Transactional`). |

#### `IPageable`
| Property | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `page` | `number` | `1` | Page number (1-indexed). |
| `size` | `number` | `10` | Number of items per page. |
| `sort` | `string` | `undefined` | Field name to sort by. |
| `direction`| `"asc" \| "desc"` | `undefined` | Sort direction. |

#### `PageResult<T>`
| Property | Type | Description |
| :--- | :--- | :--- |
| `content` | `T[]` | The array of documents for the current page. |
| `totalElements` | `number` | Total number of documents matching the filter. |
| `totalPages` | `number` | Total number of pages available. |
| `page` | `number` | Current page number. |
| `size` | `number` | Number of items per page. |

### 4. Custom Builder

```typescript
const builder = new CustomBuilder<Product>();
builder.with(SearchCustom.of("price", CustomOperation.GREATER_THAN, 1000));
const query = builder.build(); // Returns BuiltQuery<T>
```

| Operation (`CustomOperation`) | MongoDB Equivalent | Example Usage |
| :--- | :--- | :--- |
| `EQUAL` | `{ field: value }` | `SearchCustom.of("status", CustomOperation.EQUAL, "active")` |
| `NOT_EQUAL` | `{ field: { $ne: value } }` | `SearchCustom.of("role", CustomOperation.NOT_EQUAL, "admin")` |
| `LIKE` | `{ field: /value/i }` | `SearchCustom.of("name", CustomOperation.LIKE, "john")` |
| `GREATER_THAN` | `{ field: { $gt: value } }` | `SearchCustom.of("age", CustomOperation.GREATER_THAN, 18)` |
| `LESS_THAN` | `{ field: { $lt: value } }` | `SearchCustom.of("price", CustomOperation.LESS_THAN, 100)` |
| `IN` | `{ field: { $in: value } }` | `SearchCustom.of("id", CustomOperation.IN, [1, 2, 3])` |
