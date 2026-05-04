import { CacheKit } from "../core/CacheKit"
import { CacheEvictOptions } from "../types"

export function CacheEvict(options: CacheEvictOptions): MethodDecorator {
  if (options.key && options.pattern) {
    throw new Error("@CacheEvict: key and pattern are mutually exclusive")
  }

  return function (target: any, propertyKey: string | symbol, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value
    const paramNames = CacheKit.getParamNames(originalMethod)

    descriptor.value = async function (...args: any[]) {
      const evict = async () => {
        if (options.key) {
          const key = CacheKit.interpolateKey(options.key, args, paramNames)
          await CacheKit.delete(key)
        } else if (options.pattern) {
          await CacheKit.deletePattern(options.pattern)
        }
      }

      if (options.beforeInvoke) await evict()
      
      const result = await originalMethod.apply(this, args)
      
      if (!options.beforeInvoke) await evict()

      return result
    }

    return descriptor
  }
}
