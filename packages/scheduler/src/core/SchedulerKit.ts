import "reflect-metadata"
import { SchedulerKitConfig, CronJobOptions, JobStatus } from "../types"
import { CRON_JOB_METADATA } from "../decorators/CronJob"
import { BaseEngine } from "../engines/BaseEngine"
import { NodeCronEngine } from "../engines/NodeCronEngine"

export class SchedulerKit {
  private static config: SchedulerKitConfig
  private static engine: BaseEngine
  private static registry = new Map<string, JobStatus>()
  private static jobsMap = new Map<string, any>()

  static setup(config: SchedulerKitConfig) {
    this.config = config
    switch (config.engine) {
      case "node-cron":
        this.engine = new NodeCronEngine()
        break
      default:
        throw new Error(`Unsupported scheduler engine: ${config.engine}`)
    }
  }

  static register(...jobs: any[]) {
    if (!this.engine) throw new Error("SchedulerKit not initialized")

    jobs.forEach((JobClass) => {
      const metadata = Reflect.getMetadata(CRON_JOB_METADATA, JobClass)
      if (!metadata) throw new Error(`Class ${JobClass.name} is not a valid @CronJob`)

      const instance = new JobClass()
      if (typeof instance.execute !== "function") {
        throw new Error(`Job class ${JobClass.name} must have an execute() method`)
      }

      this.scheduleInternal(JobClass.name, metadata.expression, instance.execute.bind(instance), metadata.options)
      
      if (metadata.options?.runOnInit) {
        instance.execute().catch((err: any) => this.logError(`Init run failed for ${JobClass.name}`, err))
      }
    })
  }

  static registerDynamic(name: string, expression: string, fn: () => Promise<void>, options?: CronJobOptions) {
    if (this.registry.has(name)) throw new Error(`Job already registered: ${name}`)
    this.scheduleInternal(name, expression, fn, options)
  }

  static registerOnce(name: string, runAt: Date | string, fn: () => Promise<void>) {
    const date = typeof runAt === "string" ? new Date(runAt) : runAt
    if (date.getTime() <= Date.now()) throw new Error("runAt must be in the future")
    
    this.engine.scheduleOnce(name, date, fn)
    this.registry.set(name, {
      name,
      expression: "ONCE",
      status: "running",
      lastRun: null,
      nextRun: date,
      lastDuration: null,
      totalRuns: 0,
      failedRuns: 0,
      lastError: null
    })
  }

  private static scheduleInternal(name: string, expression: string, fn: () => Promise<void>, options?: CronJobOptions) {
    const wrappedFn = async () => {
      const status = this.registry.get(name)!
      const start = Date.now()
      status.lastRun = new Date()
      
      try {
        let attempts = 0
        const maxRetries = options?.maxRetries || 0
        
        const run = async (): Promise<void> => {
          try {
            await fn()
          } catch (error: any) {
            attempts++
            if (attempts <= maxRetries) {
              this.logInfo(`Retrying ${name} (${attempts}/${maxRetries})...`)
              return run()
            }
            throw error
          }
        }

        await run()
        
        const duration = Date.now() - start
        status.lastDuration = duration
        status.totalRuns++
        status.status = "running"
        if (options?.onSuccess) options.onSuccess(name, duration)
        this.logInfo(`${name} completed in ${duration}ms`)
      } catch (error: any) {
        status.failedRuns++
        status.lastError = error.message
        status.status = "error"
        if (options?.onFailure) options.onFailure(name, error, 1) // simple attempt 1 for now
        this.logError(`${name} failed: ${error.message}`, error)
      }
    }

    this.engine.schedule(name, expression, wrappedFn, options)
    this.registry.set(name, {
      name,
      expression,
      status: "stopped",
      lastRun: null,
      nextRun: this.engine.nextRunDate(expression),
      lastDuration: null,
      totalRuns: 0,
      failedRuns: 0,
      lastError: null
    })
  }

  static startAll() {
    this.registry.forEach((_, name) => this.startByName(name))
  }

  static start(job: any) {
    this.startByName(job.name)
  }

  private static startByName(name: string) {
    this.engine.start(name)
    const status = this.registry.get(name)
    if (status) status.status = "running"
  }

  static stopAll() {
    this.registry.forEach((_, name) => this.stopByName(name))
  }

  static stop(job: any) {
    this.stopByName(job.name)
  }

  private static stopByName(name: string) {
    this.engine.stop(name)
    const status = this.registry.get(name)
    if (status) status.status = "stopped"
  }

  static status() {
    return Object.fromEntries(this.registry)
  }

  static unregister(name: string) {
    this.engine.unregister(name)
    this.registry.delete(name)
  }

  private static logInfo(msg: string) {
    if (this.config.logger) this.config.logger.info(msg)
    else console.log(`[SchedulerKit] ${msg}`)
  }

  private static logError(msg: string, err?: Error) {
    if (this.config.logger) this.config.logger.error(msg, err)
    else console.error(`[SchedulerKit] ${msg}`, err)
  }
}
