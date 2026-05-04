import * as fs from "fs/promises"
import * as path from "path"

export class TemplateEngine {
  /**
   * Render a template file with variables.
   */
  static async render(templatePath: string, variables: Record<string, any>): Promise<string> {
    let content: string
    try {
      const fullPath = path.isAbsolute(templatePath) 
        ? templatePath 
        : path.join(process.cwd(), templatePath)
      content = await fs.readFile(fullPath, "utf-8")
    } catch (error) {
      throw new Error(`Template file not found at: ${templatePath}`)
    }

    return content.replace(/\$\{([^}]+)\}/g, (_, key) => {
      const value = this.getNestedValue(variables, key.trim())
      if (value === undefined || value === null) return ""
      if (Array.isArray(value)) return JSON.stringify(value)
      if (typeof value === "object") return JSON.stringify(value)
      return String(value)
    })
  }

  private static getNestedValue(obj: any, path: string): any {
    return path.split(".").reduce((acc, part) => acc && acc[part], obj)
  }
}
