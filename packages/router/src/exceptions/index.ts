export class HttpException extends Error {
  constructor(public message: string, public status: number) {
    super(message)
    this.name = this.constructor.name
  }
}

export class BadRequestException extends HttpException {
  constructor(message = "Bad Request") {
    super(message, 400)
  }
}

export class UnauthorizedException extends HttpException {
  constructor(message = "Unauthorized") {
    super(message, 401)
  }
}

export class ForbiddenException extends HttpException {
  constructor(message = "Forbidden") {
    super(message, 403)
  }
}

export class NotFoundException extends HttpException {
  constructor(message = "Not Found") {
    super(message, 404)
  }
}

export class ConflictException extends HttpException {
  constructor(message = "Conflict") {
    super(message, 409)
  }
}

export class ServerErrorException extends HttpException {
  constructor(message = "Internal Server Error") {
    super(message, 500)
  }
}

export enum HttpStatus {
  OK = 200,
  CREATED = 201,
  ACCEPTED = 202,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  CONFLICT = 409,
  INTERNAL_SERVER_ERROR = 500,
}
