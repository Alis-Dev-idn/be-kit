import { z } from "zod"

export abstract class BaseEntity {
  _id!: string
  createdAt!: Date
  updatedAt!: Date
  createdBy!: string | null
  updatedBy!: string | null
}

export const BaseEntitySchema = z.object({
  _id: z.string(),
  createdAt: z.date(),
  updatedAt: z.date(),
  createdBy: z.string().nullable(),
  updatedBy: z.string().nullable(),
})
