import "reflect-metadata"
import { CronJobOptions } from "../types"

export const CRON_JOB_METADATA = "scheduler:job"

/**
 * Decorator to define a cron job.
 */
export function CronJob(expression: string, options?: CronJobOptions): ClassDecorator {
  return (target: any) => {
    Reflect.defineMetadata(CRON_JOB_METADATA, { expression, options }, target)
  }
}
