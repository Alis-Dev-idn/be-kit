# Mongo Kit

The `mongo-kit` provides an elegant, decorator-based abstraction over Mongoose, featuring a generic repository pattern, fluent query building, and native transaction propagation via `AsyncLocalStorage`.

## Features
- **Entities**: `@Schema` and `@VirtualField` for clean class-based model definitions.
- **Repositories**: `@Repository` and `BaseRepository<T>` with built-in CRUD operations.
- **Transactions**: Thread-local session tracking using `@Transactional` or `MongoKit.withTransaction`.
- **Query Builder**: Relational and custom query generation with `CustomBuilder`.

## API Reference

### 1. `BaseEntity` & `@Schema`
All entities should extend `BaseEntity` (which provides `_id`, `createdAt`, `updatedAt`, `createdBy`, `updatedBy`).

```typescript
import { Schema, BaseEntity, VirtualField } from "@alisdev/be-kit";

interface SchemaOptions {
  collection: string;
  timestamps?: boolean;
  versionKey?: boolean | string;
}

@Schema({ collection: "products" })
export class Product extends BaseEntity {
  name: string;
  price: number;

  @VirtualField((doc: any) => `$${doc.price.toFixed(2)}`)
  formattedPrice: string;
}
```

### 2. `BaseRepository<T>` & `@Repository`
The generic repository provides: `save`, `update`, `delete`, `find`, `findOne`, `findById`, and `findAll` (paginated).

```typescript
import { Repository, BaseRepository } from "@alisdev/be-kit";

@Repository(Product)
export class ProductRepository extends BaseRepository<Product> {
  // Add custom data access methods here
  async findByPriceRange(min: number, max: number): Promise<Product[]> {
    return this.find({ filter: { price: { $gte: min, $lte: max } } });
  }
}
```

**Method Signatures:**
- `save(data: Partial<T>, options?: RepositoryOptions): Promise<T>`
- `update(id: string, data: Partial<T>, options?: RepositoryOptions): Promise<T | null>`
- `delete(id: string, options?: RepositoryOptions): Promise<boolean>`
- `find(query?: BuiltQuery<T>, options?: RepositoryOptions): Promise<T[]>`
- `findAll(query?: BuiltQuery<T>, pageable?: IPageable, options?: RepositoryOptions): Promise<PageResult<T>>`

*Note: `RepositoryOptions` allows passing an `actorId` for audit fields (`createdBy`, `updatedBy`).*

### 3. Transactions
Transactions automatically inject the active session into repository operations.

```typescript
import { Transactional, MongoKit } from "@alisdev/be-kit";

class ProductService {
  private repo = new ProductRepository();

  // Approach 1: Decorator
  @Transactional()
  async processOrder(orderData: any) {
    const product = await this.repo.save(orderData.product); // Auto-uses session
    // ... other DB operations
  }

  // Approach 2: Manual wrapper
  async manualProcess() {
    await MongoKit.withTransaction(async () => {
      await this.repo.delete("123");
    });
  }
}
```

### 4. Custom Builder
A fluent API for building Mongoose queries.

```typescript
import { CustomBuilder, SearchCustom, CustomOperation } from "@alisdev/be-kit";

const builder = new CustomBuilder<Product>();
builder.with(SearchCustom.of("name", CustomOperation.LIKE, "Laptop"));
builder.with(SearchCustom.of("price", CustomOperation.GREATER_THAN, 1000));

const query = builder.build(); // { filter: { name: /Laptop/i, price: { $gt: 1000 } } }
const results = await repo.find(query);
```
