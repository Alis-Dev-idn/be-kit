import "reflect-metadata"
import { EmailTemplateOptions } from "../types"

export const EMAIL_TEMPLATE_METADATA = "mailer:template"

/**
 * Decorator to define an email template.
 */
export function EmailTemplate(name: string, options: EmailTemplateOptions): ClassDecorator {
  return (target: any) => {
    Reflect.defineMetadata(EMAIL_TEMPLATE_METADATA, { name, ...options }, target)
  }
}
