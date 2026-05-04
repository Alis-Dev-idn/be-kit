# Mailer Kit

The `mailer-kit` simplifies email delivery by abstracting providers (like Nodemailer) and integrating a powerful string-interpolation template engine.

## Features
- **Decorators**: Define templates directly on classes with `@EmailTemplate`.
- **Template Engine**: Dynamic variable interpolation using `${variable}` or `${nested.variable}` syntax inside HTML templates.
- **Provider Agnostic**: Easily switch between Nodemailer, Resend, or custom providers.
- **Asynchronous Queues**: Send emails synchronously or push them to a memory/BullMQ queue.

## API Reference

### 1. Configuration & Setup

Initialize `MailerKit` with your desired provider and queue settings before sending any emails.

```typescript
import { MailerKit } from "@alisdev/be-kit";

MailerKit.setup({
  provider: "nodemailer",
  config: {
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: { user: "username", pass: "password" }
  },
  from: "noreply@myapp.com",
  queue: { engine: "memory" }
});
```

### 2. Defining a Template

Create an HTML file (`./templates/welcome.html`):
```html
<h1>Welcome ${name}!</h1>
<p>Thank you for joining ${company.name}.</p>
```

Bind the template to a TypeScript class using `@EmailTemplate`. The class properties represent the data required by the template.

```typescript
import { EmailTemplate } from "@alisdev/be-kit";

@EmailTemplate("welcome_email", { 
  template: "./templates/welcome.html", 
  subject: "Welcome to our platform!" 
})
export class WelcomeEmail {
  to: string;       // Required: recipient email
  name: string;     // Template variable
  company: {        // Nested template variable
    name: string;
  };
}
```

### 3. Sending Emails

```typescript
import { MailerKit } from "@alisdev/be-kit";

// Send immediately
await MailerKit.send(WelcomeEmail, {
  to: "user@example.com",
  name: "John Doe",
  company: { name: "AlisDev" }
});

// Or add to background queue
await MailerKit.queue(WelcomeEmail, {
  to: "user@example.com",
  name: "Jane Doe",
  company: { name: "AlisDev" }
}, { priority: 1 });
```
