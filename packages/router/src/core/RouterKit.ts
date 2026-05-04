import { MetadataKey, RouteDefinition, ParamDefinition, ParamType } from "../decorators"
import { HttpException } from "../exceptions"

export class RouterKit {
  /**
   * Register controllers to an Express application.
   */
  static register(app: any, controllers: any[]) {
    controllers.forEach((Controller) => {
      const instance = new Controller()
      const basePath: string = Reflect.getMetadata(MetadataKey.CONTROLLER, Controller) || ""
      const routes: RouteDefinition[] = Reflect.getMetadata(MetadataKey.ROUTES, Controller) || []
      const classMiddleware: any[] = Reflect.getMetadata(MetadataKey.MIDDLEWARE, Controller) || []

      routes.forEach((route) => {
        const methodMiddleware: any[] = Reflect.getMetadata(MetadataKey.MIDDLEWARE, Controller, route.propertyKey) || []
        const fullPath = (basePath + route.path).replace(/\/+/g, "/")
        
        const handler = async (req: any, res: any, next: any) => {
          try {
            const args = this.buildArgs(req, res, Controller, route.propertyKey)
            const result = await instance[route.propertyKey](...args)
            
            if (res.headersSent) return
            
            if (result === undefined) {
              res.status(204).send()
            } else {
              res.json(result)
            }
          } catch (error) {
            this.handleError(error, res, next)
          }
        }

        app[route.method](fullPath, ...classMiddleware, ...methodMiddleware, handler)
      })
    })
  }

  private static buildArgs(req: any, res: any, controller: any, propertyKey: string | symbol): any[] {
    const params: ParamDefinition[] = Reflect.getMetadata(MetadataKey.PARAMS, controller, propertyKey) || []
    const args: any[] = []

    params.sort((a, b) => a.index - b.index).forEach((param) => {
      switch (param.type) {
        case ParamType.BODY:
          args[param.index] = param.key ? req.body[param.key] : req.body
          break
        case ParamType.QUERY:
          args[param.index] = param.key ? req.query[param.key] : req.query
          break
        case ParamType.PARAM:
          args[param.index] = param.key ? req.params[param.key] : req.params
          break
        case ParamType.REQ:
          args[param.index] = req
          break
        case ParamType.RES:
          args[param.index] = res
          break
        case ParamType.COOKIE:
          args[param.index] = param.key ? req.cookies?.[param.key] : req.cookies
          break
      }
    })

    return args
  }

  private static handleError(error: any, res: any, next: any) {
    if (error instanceof HttpException) {
      res.status(error.status).json({
        message: error.message,
        status: error.status,
        timestamp: new Date().toISOString()
      })
    } else {
      console.error(error)
      res.status(500).json({
        message: "Internal Server Error",
        status: 500,
        timestamp: new Date().toISOString()
      })
    }
  }
}
