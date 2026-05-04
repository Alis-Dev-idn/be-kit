import mongoose, { ClientSession } from "mongoose"
import { AsyncLocalStorage } from "async_hooks"
import { TransactionalOptions } from "../types"

export class MongoKit {
  private static readonly sessionContext = new AsyncLocalStorage<ClientSession>()

  /**
   * Get the current active session from context.
   */
  static getCurrentSession(): ClientSession | undefined {
    return this.sessionContext.getStore()
  }

  /**
   * Run a function within a transaction context.
   */
  static runInContext<T>(session: ClientSession, fn: () => Promise<T>): Promise<T> {
    return this.sessionContext.run(session, fn)
  }

  /**
   * Manual transaction helper.
   */
  static async withTransaction<T>(
    fn: (session: ClientSession) => Promise<T>,
    options?: TransactionalOptions
  ): Promise<T> {
    const session = await mongoose.startSession()
    session.startTransaction({
      readPreference: options?.readPreference
    })

    try {
      const result = await Promise.race([
        fn(session),
        new Promise<never>((_, reject) => 
          setTimeout(() => reject(new Error("Transaction timeout")), options?.timeout || 10000)
        )
      ])
      await session.commitTransaction()
      return result
    } catch (error) {
      await session.abortTransaction()
      throw error
    } finally {
      await session.endSession()
    }
  }
}
