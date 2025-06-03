import { Request, Response, NextFunction } from 'express';
import logger from '../config/logger';

const logMiddleware = (req: Request, _res: Response, next: NextFunction): void => {
  logger.info(`${req.method} ${req.originalUrl} - Body: ${JSON.stringify(req.body)}`);
  next();
};

export default logMiddleware;
