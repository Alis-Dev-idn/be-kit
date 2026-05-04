import "reflect-metadata"
import { OnEventOptions } from "../types"

export const ON_EVENT_METADATA = "event:handler"

/**
 * Decorator to define an event handler.
 */
export function OnEvent(pattern: string, options?: OnEventOptions): ClassDecorator {
  return (target: any) => {
    Reflect.defineMetadata(ON_EVENT_METADATA, { pattern, ...options }, target)
  }
}
