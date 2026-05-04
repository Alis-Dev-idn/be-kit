import "reflect-metadata"
import { EventKitConfig, OnEventOptions, EventHistoryEntry } from "../types"
import { ON_EVENT_METADATA } from "../decorators/OnEvent"
import { BaseEngine } from "../engines/BaseEngine"
import { MemoryEngine } from "../engines/MemoryEngine"

export class EventKit {
  private static config: EventKitConfig
  private static engine: BaseEngine
  private static historyEntries: Map<string, EventHistoryEntry[]> = new Map()

  static setup(config: EventKitConfig) {
    this.config = config
    switch (config.engine) {
      case "memory":
        this.engine = new MemoryEngine()
        break
      default:
        throw new Error(`Unsupported event engine: ${config.engine}`)
    }
  }

  static register(...handlers: any[]) {
    if (!this.engine) throw new Error("EventKit not initialized")

    handlers.forEach((HandlerClass) => {
      const metadata = Reflect.getMetadata(ON_EVENT_METADATA, HandlerClass)
      if (!metadata) throw new Error(`Class ${HandlerClass.name} is not a valid @OnEvent`)

      const instance = new HandlerClass()
      if (typeof instance.handle !== "function") {
        throw new Error(`Handler class ${HandlerClass.name} must have a handle() method`)
      }

      this.engine.on(metadata.pattern, async (payload, event) => {
        const entry: EventHistoryEntry = {
          event,
          payload,
          emittedAt: new Date(),
          status: "success",
          handlerName: HandlerClass.name
        }

        try {
          if (metadata.async !== false) {
            // Run async but track status
            instance.handle(payload, event).catch((err: any) => {
              this.handleHandlerError(event, err, HandlerClass.name, entry)
            })
          } else {
            await instance.handle(payload, event)
          }
          this.recordHistory(event, entry)
        } catch (error: any) {
          this.handleHandlerError(event, error, HandlerClass.name, entry)
        }
      })
    })
  }

  private static handleHandlerError(event: string, error: Error, handlerName: string, entry: EventHistoryEntry) {
    entry.status = "failed"
    entry.error = error.message
    this.recordHistory(event, entry)
    if (this.config.hooks?.onError) {
      this.config.hooks.onError(event, error, handlerName)
    }
  }

  private static recordHistory(event: string, entry: EventHistoryEntry) {
    if (!this.config.history?.enabled) return

    let entries = this.historyEntries.get(event) || []
    entries.push(Object.freeze({ ...entry }))
    
    const maxSize = this.config.history.maxSize || 100
    if (entries.length > maxSize) {
      entries = entries.slice(-maxSize)
    }
    this.historyEntries.set(event, entries)
  }

  static async emit<T>(event: string, payload: T): Promise<void> {
    if (!this.engine) throw new Error("EventKit not initialized")

    if (this.config.hooks?.beforeEmit) {
      await this.config.hooks.beforeEmit(event, payload)
    }

    await this.engine.emit(event, payload)

    if (this.config.hooks?.afterEmit) {
      await this.config.hooks.afterEmit(event, payload)
    }
  }

  static once<T>(event: string, handler: (payload: T) => Promise<void>): void {
    if (!this.engine) throw new Error("EventKit not initialized")
    this.engine.once(event, handler)
  }

  static off(event: string, handler: any): void {
    if (!this.engine) throw new Error("EventKit not initialized")
    this.engine.off(event, handler)
  }

  static offAll(event: string): void {
    if (!this.engine) throw new Error("EventKit not initialized")
    this.engine.offAll(event)
  }

  static history(event: string): EventHistoryEntry[] {
    if (!this.config.history?.enabled) return []
    return this.historyEntries.get(event) || []
  }
}
