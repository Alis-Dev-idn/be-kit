export type ProviderType = "nodemailer" | "resend" | "sendgrid"

export interface EmailTemplateOptions {
  /**
   * Path to the HTML template file.
   */
  template: string
  /**
   * Default subject for the email.
   */
  subject?: string
}

export type AllowedAttachmentExt = "pdf" | "doc" | "docx" | "xls" | "xlsx" | "jpg" | "jpeg" | "png" | "zip"

export interface Attachment {
  filename: string
  path: string
}

export type SendData<T> = Omit<T, never> & {
  to: string | string[]
  subject?: string
  cc?: string | string[]
  bcc?: string | string[]
  replyTo?: string
  attachments?: Attachment[]
}

export interface QueueOptions {
  delay?: string
  priority?: number
}

export interface MailerKitConfig {
  provider: ProviderType
  config: any
  from: string
  queue?: {
    engine: "bullmq" | "memory"
    engineConfig?: {
      redis?: { host: string; port: number }
    }
    rateLimit?: {
      max: number
      per: "second" | "minute" | "hour"
    }
    retry?: {
      attempts: number
      backoff: "exponential" | "fixed"
    }
  }
}
