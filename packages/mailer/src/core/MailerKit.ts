import "reflect-metadata"
import { MailerKitConfig, SendData, QueueOptions } from "../types"
import { EMAIL_TEMPLATE_METADATA } from "../decorators/EmailTemplate"
import { TemplateEngine } from "../template/TemplateEngine"
import { BaseProvider } from "../providers/BaseProvider"
import { NodemailerProvider } from "../providers/NodemailerProvider"

export class MailerKit {
  private static config: MailerKitConfig
  private static provider: BaseProvider

  /**
   * Setup MailerKit with configuration.
   */
  static setup(config: MailerKitConfig) {
    this.config = config
    
    switch (config.provider) {
      case "nodemailer":
        this.provider = new NodemailerProvider(config.config)
        break
      // Add other providers here as needed
      default:
        throw new Error(`Unsupported mail provider: ${config.provider}`)
    }
  }

  /**
   * Send an email using a template class.
   */
  static async send<T>(TemplateClass: new () => T, data: SendData<T>): Promise<void> {
    if (!this.provider) {
      throw new Error("MailerKit not initialized. Call setup() first.")
    }

    const metadata = Reflect.getMetadata(EMAIL_TEMPLATE_METADATA, TemplateClass)
    if (!metadata) {
      throw new Error(`Class ${TemplateClass.name} is not a valid @EmailTemplate`)
    }

    const html = await TemplateEngine.render(metadata.template, data as any)
    const subject = data.subject || metadata.subject || "No Subject"

    // Validate attachments
    if (data.attachments) {
      const allowedExts = ["pdf", "doc", "docx", "xls", "xlsx", "jpg", "jpeg", "png", "zip"]
      for (const att of data.attachments) {
        const ext = att.path.split(".").pop()?.toLowerCase()
        if (!ext || !allowedExts.includes(ext)) {
          throw new Error(`Unsupported attachment type: .${ext}`)
        }
      }
    }

    await this.provider.send({
      from: this.config.from,
      to: data.to,
      subject,
      html,
      cc: data.cc,
      bcc: data.bcc,
      replyTo: data.replyTo,
      attachments: data.attachments
    })
  }

  /**
   * Queue an email (stub for now, implements simple memory queue if engine is memory).
   */
  static async queue<T>(TemplateClass: new () => T, data: SendData<T>, options?: QueueOptions): Promise<void> {
    if (!this.config.queue) {
      throw new Error("Queue not configured")
    }

    if (this.config.queue.engine === "memory") {
      // Basic memory queue implementation
      const delayMs = this.parseDelay(options?.delay || "0s")
      setTimeout(() => {
        this.send(TemplateClass, data).catch(console.error)
      }, delayMs)
    } else if (this.config.queue.engine === "bullmq") {
      // BullMQ implementation would go here
      // For now, we throw error if not implemented or bullmq not installed
      throw new Error("BullMQ integration not implemented in this version")
    }
  }

  private static parseDelay(delay: string): number {
    const unit = delay.slice(-1)
    const value = parseInt(delay.slice(0, -1))
    switch (unit) {
      case "s": return value * 1000
      case "m": return value * 60 * 1000
      case "h": return value * 60 * 60 * 1000
      case "d": return value * 24 * 60 * 60 * 1000
      default: return value
    }
  }
}
