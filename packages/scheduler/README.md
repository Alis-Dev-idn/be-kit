# Scheduler Kit

The `scheduler-kit` provides a robust, decorator-based abstraction for defining, registering, and managing cron jobs in Node.js applications.

## Features
- **Decorators**: Define background jobs cleanly with `@CronJob`.
- **Runtime Management**: Start, stop, and monitor job statuses dynamically.
- **Dynamic Registration**: Create and register cron jobs programmatically without classes.
- **Resilience**: Built-in retry logic and structured error handling.

## API Reference

### 1. Configuration & Setup

```typescript
import { SchedulerKit } from "@alisdev/be-kit";

SchedulerKit.setup({ 
  engine: "node-cron" 
});
```

### 2. Defining Jobs

Decorate a class with `@CronJob` and implement the `execute` method.

```typescript
import { CronJob } from "@alisdev/be-kit";

@CronJob("0 0 * * *", { // Run every day at midnight
  runOnInit: true,
  retries: 3,
  onSuccess: (name, duration) => console.log(`[${name}] Completed in ${duration}ms`),
  onError: (name, error) => console.error(`[${name}] Failed:`, error)
})
export class DailyBackupJob {
  async execute() {
    console.log("Running database backup...");
    // backup logic here
  }
}
```

### 3. Registering and Controlling Jobs

Jobs do not start automatically upon definition; they must be registered and started via `SchedulerKit`.

```typescript
// Register static classes
SchedulerKit.register(DailyBackupJob);

// Register dynamic closures at runtime
SchedulerKit.registerDynamic(
  "dynamic_cleanup", 
  "*/15 * * * *", 
  async () => { console.log("Cleaning up temp files..."); }
);

// Start all registered jobs
SchedulerKit.startAll();

// Pause or stop specific jobs
SchedulerKit.stop("DailyBackupJob");
SchedulerKit.start("DailyBackupJob");
```

### 4. Status Monitoring

Retrieve the real-time status and execution history of all active jobs.

```typescript
const statuses = SchedulerKit.status();
console.log(statuses);
/* Output:
{
  "DailyBackupJob": { 
    status: "running", 
    lastRun: 1678886400000, 
    nextRun: 1678972800000, 
    errorCount: 0 
  }
}
*/
```
