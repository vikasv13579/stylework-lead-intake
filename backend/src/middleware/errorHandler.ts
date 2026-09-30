import { Request, Response, NextFunction } from 'express';
import { AppError } from '../types/errors';
import logger from '../config/logger';
import { config } from '../config/env';
import { ZodError } from 'zod';

interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Handle Zod validation errors
  if (err instanceof ZodError) {
    const response: ErrorResponse = {
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: err.flatten().fieldErrors,
      },
    };
    res.status(400).json(response);
    return;
  }

  // Handle known operational errors
  if (err instanceof AppError) {
    logger.warn('Operational error', {
      code: err.code,
      statusCode: err.statusCode,
      message: err.message,
    });

    const response: ErrorResponse = {
      error: {
        code: err.code,
        message: err.message,
      },
    };
    res.status(err.statusCode).json(response);
    return;
  }

  // Unknown/programming errors
  logger.error('Unexpected error', {
    message: err.message,
    stack: config.NODE_ENV !== 'production' ? err.stack : undefined,
  });

  const response: ErrorResponse = {
    error: {
      code: 'INTERNAL_ERROR',
      message: config.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
    },
  };
  res.status(500).json(response);
}

export function notFoundHandler(_req: Request, res: Response): void {
  res.status(404).json({
    error: {
      code: 'NOT_FOUND',
      message: 'The requested resource does not exist',
    },
  });
}
