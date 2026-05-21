export class AppError extends Error {
  public statusCode: number;
  public code: string;
  public isOperational: boolean;

  constructor(statusCode: number, code: string, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const createError = {
  BadRequest: (message: string, code = 'BAD_REQUEST') => new AppError(400, code, message),
  Unauthorized: (message: string = 'Unauthorized', code = 'UNAUTHORIZED') => new AppError(401, code, message),
  Forbidden: (message: string = 'Forbidden', code = 'FORBIDDEN') => new AppError(403, code, message),
  NotFound: (message: string, code = 'NOT_FOUND') => new AppError(404, code, message),
  Conflict: (message: string, code = 'CONFLICT') => new AppError(409, code, message),
  Internal: (message: string = 'Internal Server Error', code = 'INTERNAL_ERROR') => new AppError(500, code, message, false),
};
