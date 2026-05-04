import { Attachment } from "../types"

export abstract class BaseProvider {
  abstract send(options: {
    from: string
    to: string | string[]
    subject: string
    html: string
    cc?: string | string[]
    bcc?: string | string[]
    replyTo?: string
    attachments?: Attachment[]
  }): Promise<void>
}
