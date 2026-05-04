import "reflect-metadata"

export const VIRTUAL_METADATA = "mongo-kit:virtuals"

export type VirtualGetter = (doc: any) => any

/**
 * Decorator to define a virtual field on a Mongoose schema.
 */
export function VirtualField(getter: VirtualGetter): PropertyDecorator {
  return function (target: any, propertyKey: string | symbol) {
    const existingVirtuals = Reflect.getMetadata(VIRTUAL_METADATA, target.constructor) || []
    existingVirtuals.push({ name: propertyKey, getter })
    Reflect.defineMetadata(VIRTUAL_METADATA, existingVirtuals, target.constructor)
  }
}
