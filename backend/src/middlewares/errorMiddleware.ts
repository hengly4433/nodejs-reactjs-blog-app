// src/middlewares/errorMiddleware.ts
import { ErrorRequestHandler } from 'express';
import ApiError from '../utils/ApiError';
import logger from '../config/logger';

/**
 * An ErrorRequestHandler must return void or Promise<void>.
 * We therefore send the response (res.status(...).json(...))
 * and then return without passing back the `Response` object.
 */
const errorMiddleware: ErrorRequestHandler = (
  err,
  _req,
  res,
  _next
) => {
  // If the error is an instance of ApiError (operational error)
  if (err instanceof ApiError) {
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Something went wrong';
    logger.error(`Operational Error: ${message}`);
    
    // Send the JSON response, then return void:
    res.status(statusCode).json({
      success: false,
      message,
    });
    return; // NO return res.status(...).json(...)
  }

  // Otherwise, it’s an unhandled/programming error
  logger.error(`Unhandled Error: ${err.stack || err.message}`);

  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  });
  return;
};

export default errorMiddleware;
