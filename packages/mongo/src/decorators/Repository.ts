import "reflect-metadata"

export const REPOSITORY_METADATA = "mongo-kit:repository_entity"

/**
 * Decorator to link a repository to an entity.
 */
export function Repository(entity: any): ClassDecorator {
  return function (target: any) {
    Reflect.defineMetadata(REPOSITORY_METADATA, entity, target)
  }
}
