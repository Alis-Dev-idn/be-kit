import { CronJobOptions } from "../types"

export abstract class BaseEngine {
  abstract schedule(name: string, expression: string, fn: () => Promise<void>, options?: CronJobOptions): void
  abstract scheduleOnce(name: string, runAt: Date, fn: () => Promise<void>): void
  abstract start(name: string): void
  abstract stop(name: string): void
  abstract pause(name: string): void
  abstract resume(name: string): void
  abstract unregister(name: string): void
  abstract nextRunDate(expression: string): Date | null
}
