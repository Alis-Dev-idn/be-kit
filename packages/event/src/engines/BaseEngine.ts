export abstract class BaseEngine {
  abstract emit(event: string, payload: any): Promise<void>
  abstract on(pattern: string, handler: (payload: any, event: string) => Promise<void>): void
  abstract once(event: string, handler: (payload: any) => Promise<void>): void
  abstract off(event: string, handler: Function): void
  abstract offAll(event: string): void
}
