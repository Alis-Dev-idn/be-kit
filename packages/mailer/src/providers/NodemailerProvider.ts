import { BaseProvider } from "./BaseProvider"
import { Attachment } from "../types"

export class NodemailerProvider extends BaseProvider {
  private transporter: any

  constructor(config: any) {
    super()
    // Dynamic import to avoid hard dependency
    const nodemailer = require("nodemailer")
    this.transporter = nodemailer.createTransport(config)
  }

  async send(options: any): Promise<void> {
    await this.transporter.sendMail({
      from: options.from,
      to: options.to,
      subject: options.subject,
      html: options.html,
      cc: options.cc,
      bcc: options.bcc,
      replyTo: options.replyTo,
      attachments: options.attachments?.map((a: Attachment) => ({
        filename: a.filename,
        path: a.path
      }))
    })
  }
}
