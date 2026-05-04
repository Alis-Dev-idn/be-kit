import "reflect-metadata"

export enum MetadataKey {
  CONTROLLER = "router:controller",
  ROUTES = "router:routes",
  MIDDLEWARE = "router:middleware",
  PARAMS = "router:params",
}

export enum RouteMethod {
  GET = "get",
  POST = "post",
  PUT = "put",
  PATCH = "patch",
  DELETE = "delete",
}

export interface RouteDefinition {
  path: string
  method: RouteMethod
  propertyKey: string | symbol
}

export enum ParamType {
  BODY = "body",
  QUERY = "query",
  PARAM = "param",
  REQ = "req",
  RES = "res",
  COOKIE = "cookie",
}

export interface ParamDefinition {
  type: ParamType
  index: number
  key?: string
}

/**
 * @ReqController decorator
 */
export function ReqController(path = ""): ClassDecorator {
  return (target: any) => {
    Reflect.defineMetadata(MetadataKey.CONTROLLER, path, target)
  }
}

/**
 * Route decorators
 */
function createRouteDecorator(method: RouteMethod) {
  return (path = ""): MethodDecorator => {
    return (target: any, propertyKey: string | symbol) => {
      const routes: RouteDefinition[] = Reflect.getMetadata(MetadataKey.ROUTES, target.constructor) || []
      routes.push({ path, method, propertyKey })
      Reflect.defineMetadata(MetadataKey.ROUTES, routes, target.constructor)
    }
  }
}

export const GetMapping = createRouteDecorator(RouteMethod.GET)
export const PostMapping = createRouteDecorator(RouteMethod.POST)
export const PutMapping = createRouteDecorator(RouteMethod.PUT)
export const PatchMapping = createRouteDecorator(RouteMethod.PATCH)
export const DeleteMapping = createRouteDecorator(RouteMethod.DELETE)

/**
 * Parameter decorators
 */
function createParamDecorator(type: ParamType) {
  return (key?: string): ParameterDecorator => {
    return (target: any, propertyKey: string | symbol | undefined, index: number) => {
      if (!propertyKey) return
      const params: ParamDefinition[] = Reflect.getMetadata(MetadataKey.PARAMS, target.constructor, propertyKey) || []
      params.push({ type, index, key })
      Reflect.defineMetadata(MetadataKey.PARAMS, params, target.constructor, propertyKey)
    }
  }
}

export const Body = createParamDecorator(ParamType.BODY)
export const Query = createParamDecorator(ParamType.QUERY)
export const Param = createParamDecorator(ParamType.PARAM)
export const Req = createParamDecorator(ParamType.REQ)
export const Res = createParamDecorator(ParamType.RES)
export const Cookie = createParamDecorator(ParamType.COOKIE)

/**
 * @UseMiddleware decorator
 */
export function UseMiddleware(...middlewares: any[]): MethodDecorator & ClassDecorator {
  return (target: any, propertyKey?: string | symbol) => {
    if (propertyKey) {
      // Method decorator
      const existing = Reflect.getMetadata(MetadataKey.MIDDLEWARE, target.constructor, propertyKey) || []
      Reflect.defineMetadata(MetadataKey.MIDDLEWARE, [...existing, ...middlewares], target.constructor, propertyKey)
    } else {
      // Class decorator
      const existing = Reflect.getMetadata(MetadataKey.MIDDLEWARE, target) || []
      Reflect.defineMetadata(MetadataKey.MIDDLEWARE, [...existing, ...middlewares], target)
    }
  }
}
