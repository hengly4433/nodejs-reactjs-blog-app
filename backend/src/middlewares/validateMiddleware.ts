// src/middlewares/validateMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import { Schema } from 'joi';
import ApiError from '../utils/ApiError';

const validateMiddleware = (schema: Schema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const validationOptions = {
      abortEarly: false, // return all errors
      allowUnknown: true, // allow extra keys
      stripUnknown: true, // remove unknown keys
    };

    const dataToValidate = { ...req.body, ...req.params, ...req.query };
    const { error, value } = schema.validate(dataToValidate, validationOptions);

    if (error) {
      const message = error.details.map((detail) => detail.message).join(', ');
      next(new ApiError(400, message));
      return;
    }

    // overwrite req.body / req.params / req.query with validated values
    req.body = value;
    next();
  };
};

export default validateMiddleware;
