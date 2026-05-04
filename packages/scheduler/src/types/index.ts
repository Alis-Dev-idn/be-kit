export interface CronJobOptions {
  timezone?: string
  runOnInit?: boolean
  maxRetries?: number
  onSuccess?: (jobName: string, duration: number) => Promise<void> | void
  onFailure?: (jobName: string, error: Error, attempt: number) => Promise<void> | void
}

export interface JobStatus {
  name: string
  expression: string
  status: "running" | "stopped" | "paused" | "error"
  lastRun: Date | null
  nextRun: Date | null
  lastDuration: number | null
  totalRuns: number
  failedRuns: number
  lastError: string | null
}

export type EngineType = "node-cron" | "bullmq"

export interface SchedulerKitConfig {
  engine: EngineType
  engineConfig?: {
    redis?: { host: string; port: number }
  }
  logger?: {
    info: (message: string) => void
    error: (message: string, error?: Error) => void
  }
}
