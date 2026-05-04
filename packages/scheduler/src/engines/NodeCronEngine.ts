import { BaseEngine } from "./BaseEngine"
import { CronJobOptions } from "../types"

export class NodeCronEngine extends BaseEngine {
  private jobs = new Map<string, any>()
  private nodeCron: any

  constructor() {
    super()
    this.nodeCron = require("node-cron")
  }

  schedule(name: string, expression: string, fn: () => Promise<void>, options?: CronJobOptions): void {
    const job = this.nodeCron.schedule(expression, fn, {
      scheduled: false,
      timezone: options?.timezone
    })
    this.jobs.set(name, job)
  }

  scheduleOnce(name: string, runAt: Date, fn: () => Promise<void>): void {
    // node-cron doesn't have native scheduleOnce, 
    // so we use a cron expression that only fires once if possible, 
    // or just a timeout if the date is close.
    // For simplicity, we'll use a one-time cron: "ss mm hh dd MM"
    const cronExpr = `${runAt.getSeconds()} ${runAt.getMinutes()} ${runAt.getHours()} ${runAt.getDate()} ${runAt.getMonth() + 1} *`
    const job = this.nodeCron.schedule(cronExpr, async () => {
      await fn()
      this.unregister(name)
    }, { scheduled: true })
    this.jobs.set(name, job)
  }

  start(name: string): void {
    this.jobs.get(name)?.start()
  }

  stop(name: string): void {
    this.jobs.get(name)?.stop()
  }

  pause(name: string): void {
    this.jobs.get(name)?.stop() // node-cron doesn't have pause, stop is same as pause
  }

  resume(name: string): void {
    this.jobs.get(name)?.start()
  }

  unregister(name: string): void {
    this.jobs.get(name)?.stop()
    this.jobs.delete(name)
  }

  nextRunDate(expression: string): Date | null {
    // require external lib or complex logic for this in node-cron
    return null 
  }
}
