import mongoose from "mongoose"
import { MongoKit } from "../core/MongoKit"
import { TransactionalOptions } from "../types"

/**
 * Decorator to wrap a method in a MongoDB transaction.
 * Supports nested calls by joining existing sessions.
 */
export function Transactional(options?: TransactionalOptions): MethodDecorator {
  return function (
    target: any,
    propertyKey: string | symbol,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value

    descriptor.value = async function (...args: any[]) {
      const existingSession = MongoKit.getCurrentSession()

      if (existingSession) {
        // Join existing transaction
        return originalMethod.apply(this, args)
      }

      // Start new transaction
      const session = await mongoose.startSession()
      session.startTransaction({
        readPreference: options?.readPreference
      })

      try {
        const result = await MongoKit.runInContext(session, async () => {
          return Promise.race([
            originalMethod.apply(this, args),
            new Promise<never>((_, reject) => 
              setTimeout(() => reject(new Error("Transaction timeout")), options?.timeout || 10000)
            )
          ])
        })
        await session.commitTransaction()
        return result
      } catch (error) {
        if (session.inTransaction()) {
          await session.abortTransaction()
        }
        throw error
      } finally {
        await session.endSession()
      }
    }

    return descriptor
  }
}
