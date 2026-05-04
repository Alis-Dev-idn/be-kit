# Scheduler Kit

The `scheduler-kit` provides a robust, decorator-based abstraction for defining, registering, and managing cron jobs in Node.js applications.

## Features

- **Decorator-based Jobs**: Define recurring tasks with `@CronJob`.
- **Job Management**: Start, stop, pause, and resume jobs at runtime.
- **Dynamic Registration**: Register jobs dynamically from database or config.
- **Status Monitoring**: Get detailed status of all registered jobs.
- **Retry Logic**: Automatic retry on failure with configurable attempts.

## Usage

### Setup

```typescript
import { SchedulerKit } from "@alisdev/be-kit"

SchedulerKit.setup({ engine: "node-cron" })
```

### Define Job

```typescript
import { CronJob } from "@alisdev/be-kit"

@CronJob("0 * * * *", { 
  runOnInit: true,
  onSuccess: (name, duration) => console.log(`${name} finished in ${duration}ms`)
})
export class HourlyReportJob {
  async execute() {
    // report logic
  }
}
```

### Register and Control

```typescript
SchedulerKit.register(HourlyReportJob)
SchedulerKit.startAll()

// Get status
const status = SchedulerKit.status()
```

## API Reference & Variables

### 1. `SchedulerKit.setup(config)` Options

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `engine` | `"node-cron"` | Yes | The underlying execution engine. |

### 2. `@CronJob(expression, options)`

Decorate a class that implements an `execute()` method.

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `expression` | `string` | Yes | Standard cron expression (e.g., `"0 0 * * *"`). |
| `options.runOnInit` | `boolean` | No | Execute immediately when the app starts. |
| `options.retries` | `number` | No | Number of times to retry a failed execution. |
| `options.onSuccess` | `(name: string, durationMs: number) => void` | No | Callback when the job succeeds. |
| `options.onError` | `(name: string, error: Error) => void` | No | Callback when the job throws an error. |

### 3. `SchedulerKit` Methods (Inputs/Outputs)

| Method | Parameters (Input) | Return Type (Output) | Description |
| :--- | :--- | :--- | :--- |
| `register` | `...jobs: Class[]` | `void` | Registers class-based decorated jobs. |
| `registerDynamic`| `name: string`,<br>`expression: string`,<br>`fn: () => Promise<void>`,<br>`options?: CronOptions` | `void` | Registers a programmatic job without a class. |
| `startAll` | `none` | `void` | Starts all registered jobs. |
| `stopAll` | `none` | `void` | Stops all registered jobs. |
| `start` | `jobName: string` | `void` | Starts a specific job by name. |
| `stop` | `jobName: string` | `void` | Stops a specific job by name. |
| `status` | `none` | `Record<string, JobStatus>` | Returns current status of all jobs. |

### 4. `JobStatus` Output Type

When calling `SchedulerKit.status()`, you receive a map of objects with these properties:

| Property | Type | Description |
| :--- | :--- | :--- |
| `status` | `"running" \| "stopped" \| "failed"` | Current operational state. |
| `lastRun` | `number` | Unix timestamp (ms) of the last execution. |
| `nextRun` | `number` | Unix timestamp (ms) of the next scheduled execution. |
| `errorCount` | `number` | Total number of accumulated failures. |
