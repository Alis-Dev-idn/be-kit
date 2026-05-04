import { CacheKit } from "../core/CacheKit"
import { CachePutOptions } from "../types"

export function CachePut(options: CachePutOptions): MethodDecorator {
  return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const paramNames = CacheKit.getParamNames(originalMethod)

    descriptor.value = async function (...args: any[]) {
      const key = CacheKit.interpolateKey(options.key, args, paramNames)
      const result = await originalMethod.apply(this, args)
      await CacheKit.set(key, result, { ttl: options.ttl })
      return result
    }

    return descriptor
  }
}
