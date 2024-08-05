// Error codes as enums
export enum ErrorCode {
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_FAILED = 'VALIDATION_FAILED',
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
}

// Interface for error details
interface ErrorDetails {
  [key: string]: any;
}

// Extend the built-in Error class to create a ServiceError class
export class ServiceError extends Error {
  code: ErrorCode;
  details: ErrorDetails;

  constructor(code: ErrorCode, message: string, details: ErrorDetails = {}) {
    super(message);
    this.code = code;
    this.details = details;
    this.name = 'ServiceError';
  }

  static notFound(message: string, details: ErrorDetails = {}): ServiceError {
    return new ServiceError(ErrorCode.NOT_FOUND, message, details);
  }

  static validationFailed(message: string, details: ErrorDetails = {}): ServiceError {
    return new ServiceError(ErrorCode.VALIDATION_FAILED, message, details);
  }

  static unauthorized(message: string, details: ErrorDetails = {}): ServiceError {
    return new ServiceError(ErrorCode.UNAUTHORIZED, message, details);
  }

  static forbidden(message: string, details: ErrorDetails = {}): ServiceError {
    return new ServiceError(ErrorCode.FORBIDDEN, message, details);
  }

  get isNotFound(): boolean {
    return this.code === ErrorCode.NOT_FOUND;
  }

  get isValidationFailed(): boolean {
    return this.code === ErrorCode.VALIDATION_FAILED;
  }

  get isUnauthorized(): boolean {
    return this.code === ErrorCode.UNAUTHORIZED;
  }

  get isForbidden(): boolean {
    return this.code === ErrorCode.FORBIDDEN;
  }
}