import { EventEmitter2 } from "eventemitter2"
import { BaseEngine } from "./BaseEngine"

export class MemoryEngine extends BaseEngine {
  private emitter: EventEmitter2

  constructor() {
    super()
    this.emitter = new EventEmitter2({
      wildcard: true,
      delimiter: ".",
      maxListeners: 100,
      verboseMemoryLeak: true
    })
  }

  async emit(event: string, payload: any): Promise<void> {
    await this.emitter.emitAsync(event, payload)
  }

  on(pattern: string, handler: (payload: any, event: string) => Promise<void>): void {
    this.emitter.on(pattern, function(this: any, payload: any) {
      // EventEmitter2 passes the event name as 'this.event' when wildcards are used
      return handler(payload, this.event)
    })
  }

  once(event: string, handler: (payload: any) => Promise<void>): void {
    this.emitter.once(event, handler)
  }

  off(event: string, handler: any): void {
    this.emitter.off(event, handler)
  }

  offAll(event: string): void {
    this.emitter.removeAllListeners(event)
  }
}
