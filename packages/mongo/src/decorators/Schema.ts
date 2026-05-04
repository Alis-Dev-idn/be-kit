import "reflect-metadata"

export const SCHEMA_METADATA = "mongo-kit:schema"

export interface SchemaOptions {
  collection: string
  timestamps?: boolean
  versionKey?: boolean | string
}

/**
 * Decorator to define a Mongoose schema for a class.
 */
export function Schema(options: SchemaOptions): ClassDecorator {
  return function (target: any) {
    Reflect.defineMetadata(SCHEMA_METADATA, options, target)
  }
}
