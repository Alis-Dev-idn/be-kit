import { CacheKit } from "../core/CacheKit"
import { CacheableOptions } from "../types"

export function Cacheable(options: CacheableOptions): MethodDecorator {
  return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const paramNames = CacheKit.getParamNames(originalMethod)

    descriptor.value = async function (...args: any[]) {
      const key = CacheKit.interpolateKey(options.key, args, paramNames)
      const cached = await CacheKit.get(key)
      
      if (cached !== null) return cached

      const result = await originalMethod.apply(this, args)
      
      const shouldCache = options.condition ? options.condition(result) : true
      if (shouldCache) {
        await CacheKit.set(key, result, { ttl: options.ttl })
      }

      return result
    }

    return descriptor
  }
}
