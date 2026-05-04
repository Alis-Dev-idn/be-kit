import { ClientSession } from "mongoose"

export interface TransactionalOptions {
  /**
   * Transaction timeout in milliseconds.
   * @default 10000
   */
  timeout?: number
  /**
   * Read preference for the transaction.
   */
  readPreference?: "primary" | "secondary"
}

export interface RepositoryOptions {
  /**
   * The actor ID performing the operation (for auditing).
   */
  actorId?: string
  /**
   * Manual MongoDB session.
   */
  session?: ClientSession
}

export interface BuiltQuery<T> {
  filter: any
  options?: any
}

export interface IPageable {
  page: number
  size: number
  sort?: string
  direction?: "asc" | "desc"
}

export interface PageResult<T> {
  content: T[]
  totalElements: number
  totalPages: number
  page: number
  size: number
}
