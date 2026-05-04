# Mailer Kit

The `mailer-kit` simplifies email delivery by abstracting providers (like Nodemailer) and integrating a powerful string-interpolation template engine.

## Features
- **Decorators**: Define templates directly on classes with `@EmailTemplate`.
- **Template Engine**: Dynamic variable interpolation using `${variable}` or `${nested.variable}` syntax inside HTML templates.
- **Provider Agnostic**: Easily switch between Nodemailer, Resend, or custom providers.
- **Asynchronous Queues**: Send emails synchronously or push them to a memory/BullMQ queue.

## Usage

### Setup

```typescript
import { MailerKit } from "@alisdev/be-kit"

MailerKit.setup({
  provider: "nodemailer",
  config: {
    host: "smtp.gmail.com",
    port: 587,
    auth: { user: "...", pass: "..." }
  },
  from: "noreply@example.com",
  queue: { engine: "memory" }
})
```

### Define Template

```typescript
import { EmailTemplate } from "@alisdev/be-kit"

// Properties here become template variables!
@EmailTemplate("welcome", { 
  template: "./templates/welcome.html", 
  subject: "Welcome!" 
})
export class WelcomeEmail {
  to: string
  name: string
}
```

### Send Email

```typescript
import { MailerKit } from "@alisdev/be-kit"

await MailerKit.send(WelcomeEmail, {
  to: "user@example.com",
  name: "John"
})
```

## API Reference & Variables

### 1. `MailerKit.setup(config)` Options

Initialize the kit before usage.

| Property | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `provider` | `"nodemailer"` | Yes | The email delivery service provider to use. |
| `config` | `object` | Yes | Provider-specific configuration. |
| `config.host` | `string` | No | SMTP host (for nodemailer). |
| `config.port` | `number` | No | SMTP port (for nodemailer). |
| `config.auth` | `{ user: string, pass: string }` | No | SMTP credentials (for nodemailer). |
| `from` | `string` | Yes | Default sender email address. |
| `queue.engine`| `"memory"` | No | Queueing system for background processing. |

### 2. `@EmailTemplate(name, options)`

Decorate a class to link it to an HTML template file.

| Option | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | `string` | Yes | Unique identifier for the template. |
| `options.template`| `string` | Yes | Relative or absolute path to the HTML template file. |
| `options.subject` | `string` | Yes | The subject line of the email. |

### 3. Template Variables (Input)

The properties defined in your `@EmailTemplate` decorated class act as the input variables injected into the HTML template.

**Template (`welcome.html`):**
```html
<h1>Welcome ${name}!</h1>
```

### 4. `MailerKit` Methods

| Method | Parameters (Input) | Return Type (Output) | Description |
| :--- | :--- | :--- | :--- |
| `send` | `TemplateClass: Class`,<br>`data: object` | `Promise<void>` | Sends an email immediately synchronously. |
| `queue` | `TemplateClass: Class`,<br>`data: object`,<br>`options?: QueueOptions` | `Promise<void>` | Pushes the email to a background queue for async delivery. |
