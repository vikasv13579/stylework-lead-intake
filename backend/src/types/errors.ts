/**
 * Centralized application error class.
 * Allows controllers/middleware to distinguish operational from programming errors.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;
  public readonly isOperational: boolean;

  constructor(message: string, statusCode: number, code: string, isOperational = true) {
    super(message);
    Object.setPrototypeOf(this, new.target.prototype);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = isOperational;
    Error.captureStackTrace(this);
  }
}

export const Errors = {
  LeadNotFound: (id: string) =>
    new AppError(`Lead not found: ${id}`, 404, 'LEAD_NOT_FOUND'),

  DuplicateLead: (externalLeadId: string) =>
    new AppError(
      `Lead with externalLeadId '${externalLeadId}' already exists`,
      409,
      'DUPLICATE_LEAD'
    ),

  InvalidStatus: (status: string) =>
    new AppError(`Invalid status value: '${status}'`, 422, 'INVALID_STATUS'),

  InvalidStatusTransition: (from: string, to: string) =>
    new AppError(
      `Cannot transition lead status from '${from}' to '${to}'`,
      422,
      'INVALID_STATUS_TRANSITION'
    ),

  ValidationError: (message: string) =>
    new AppError(message, 400, 'VALIDATION_ERROR'),

  InternalError: () =>
    new AppError('An unexpected error occurred', 500, 'INTERNAL_ERROR', false),
};
