import mongoose, { Model, Schema as MongooseSchema } from "mongoose"
import { REPOSITORY_METADATA } from "../decorators/Repository"
import { SCHEMA_METADATA, SchemaOptions } from "../decorators/Schema"
import { VIRTUAL_METADATA, VirtualGetter } from "../decorators/VirtualField"
import { MongoKit } from "../core/MongoKit"
import { BuiltQuery, IPageable, PageResult, RepositoryOptions } from "../types"

export abstract class BaseRepository<T> {
  protected model: Model<any>

  constructor() {
    const entity = Reflect.getMetadata(REPOSITORY_METADATA, this.constructor)
    if (!entity) {
      throw new Error(`Repository ${this.constructor.name} must be decorated with @Repository(Entity)`)
    }

    const schemaOptions: SchemaOptions = Reflect.getMetadata(SCHEMA_METADATA, entity)
    if (!schemaOptions) {
      throw new Error(`Entity ${entity.name} must be decorated with @Schema(options)`)
    }

    const virtuals: { name: string; getter: VirtualGetter }[] = Reflect.getMetadata(VIRTUAL_METADATA, entity) || []

    const mSchema = new MongooseSchema(
      {},
      {
        collection: schemaOptions.collection,
        timestamps: schemaOptions.timestamps ?? true,
        versionKey: schemaOptions.versionKey === true ? undefined : (schemaOptions.versionKey ?? false),
        strict: false,
        toJSON: { virtuals: true },
        toObject: { virtuals: true },
      }
    )

    virtuals.forEach((v) => {
      mSchema.virtual(v.name as string).get(function (this: any) {
        return v.getter(this)
      })
    })

    this.model = (mongoose.models as any)[entity.name] || mongoose.model(entity.name, mSchema)
  }

  protected getSession(repoOptions?: RepositoryOptions) {
    return repoOptions?.session || MongoKit.getCurrentSession()
  }

  async save(data: Partial<T>, repoOptions?: RepositoryOptions): Promise<T> {
    const session = this.getSession(repoOptions)
    const doc = new this.model(data)
    
    if (repoOptions && repoOptions.actorId) {
      const actorId = repoOptions.actorId
      const docAny = doc as any
      if (!docAny.createdBy) docAny.createdBy = actorId
      docAny.updatedBy = actorId
    }

    await doc.save({ session })
    return (doc as any).toObject()
  }

  async update(id: string, data: Partial<T>, repoOptions?: RepositoryOptions): Promise<T | null> {
    const session = this.getSession(repoOptions)
    
    const updateData: any = { ...data }
    if (repoOptions && repoOptions.actorId) {
      updateData.updatedBy = repoOptions.actorId
    }

    const doc = await this.model.findByIdAndUpdate(id, updateData, { 
      new: true, 
      session 
    })
    return doc ? (doc as any).toObject() : null
  }

  async delete(id: string, repoOptions?: RepositoryOptions): Promise<boolean> {
    const session = this.getSession(repoOptions)
    const result = await this.model.findByIdAndDelete(id, { session })
    return !!result
  }

  async find(query?: BuiltQuery<T>, repoOptions?: RepositoryOptions): Promise<T[]> {
    const session = this.getSession(repoOptions)
    const docs = await this.model.find(query?.filter || {}, null, { ...query?.options, session })
    return docs.map(d => (d as any).toObject())
  }

  async findOne(query?: BuiltQuery<T>, repoOptions?: RepositoryOptions): Promise<T | null> {
    const session = this.getSession(repoOptions)
    const doc = await this.model.findOne(query?.filter || {}, null, { ...query?.options, session })
    return doc ? (doc as any).toObject() : null
  }

  async findById(id: string, repoOptions?: RepositoryOptions): Promise<T | null> {
    const session = this.getSession(repoOptions)
    const doc = await this.model.findById(id, null, { session })
    return doc ? (doc as any).toObject() : null
  }

  async findAll(query?: BuiltQuery<T>, pageable?: IPageable, repoOptions?: RepositoryOptions): Promise<PageResult<T>> {
    const session = this.getSession(repoOptions)
    const filter = query?.filter || {}
    const page = pageable?.page || 1
    const size = pageable?.size || 10
    const skip = (page - 1) * size

    const [content, totalElements] = await Promise.all([
      this.model.find(filter, null, { 
        ...query?.options, 
        session,
        skip,
        limit: size,
        sort: pageable?.sort ? { [pageable.sort]: pageable.direction === "desc" ? -1 : 1 } : undefined
      }),
      this.model.countDocuments(filter).session(session || null)
    ])

    return {
      content: content.map(d => (d as any).toObject()),
      totalElements,
      totalPages: Math.ceil(totalElements / size),
      page,
      size
    }
  }
}
