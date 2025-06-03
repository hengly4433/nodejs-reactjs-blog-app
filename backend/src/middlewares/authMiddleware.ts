// src/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import ApiError from '../utils/ApiError';
import jwtConfig from '../config/jwt';
import User, { IUser } from '../models/User';

interface JwtPayload {
  id: string;
  iat: number;
  exp: number;
}

declare global {
  namespace Express {
    interface Request {
      user?: IUser; // we will attach the authenticated user
    }
  }
}

const authMiddleware = async (req: Request, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new ApiError(401, 'Authorization header missing or invalid');
    }

    const token = authHeader.split(' ')[1];
    let payload: JwtPayload;

    try {
      payload = jwt.verify(token, jwtConfig.secret) as JwtPayload;
    } catch (err) {
      throw new ApiError(401, 'Invalid or expired token');
    }

    // Retrieve user from DB (optional: exclude password)
    const user = await User.findById(payload.id).select('-password');
    if (!user) {
      throw new ApiError(401, 'User not found');
    }

    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
};

export default authMiddleware;
