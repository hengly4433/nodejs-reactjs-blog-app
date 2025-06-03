import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import AuthService from '../services/AuthService';
import ResponseHandler from '../utils/ResponseHandler';
import ApiError from '../utils/ApiError';
import { RegisterDto, LoginDto } from '../dtos/AuthDto';
import User from '../models/User';

// Joi schemas
const registerSchema = Joi.object<RegisterDto>({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const loginSchema = Joi.object<LoginDto>({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

class AuthController {
  public async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Validate request body
      const { error, value } = registerSchema.validate(req.body, { abortEarly: false });
      if (error) {
        throw new ApiError(400, error.details.map((d) => d.message).join(', '));
      }

      const { username, email, password } = value;
      const user = await AuthService.register(username, email, password);

      // We do not send password back
      ResponseHandler.success(
        res,
        {
          id: user._id,
          username: user.username,
          email: user.email,
          createdAt: user.createdAt,
        },
        'User registered successfully',
        201
      );
    } catch (err) {
      next(err);
    }
  }

  public async login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
    if (error) {
      throw new ApiError(400, error.details.map((d) => d.message).join(', '));
    }

    const { email, password } = value;

    // If AuthService.login truly only returns { token }, then:
    const { token } = await AuthService.login(email, password);

    // But now: how do you populate the user info?
    // You could either:
    // 1) Fetch the user again here by email
    // 2) Or modify AuthService.login to return the user as well.
    // For illustration, let’s fetch the user again:
    const user = await User.findOne({ email }).select('-password');
    if (!user) {
      throw new ApiError(500, 'User unexpectedly not found after login');
    }

    ResponseHandler.success(
      res,
      {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
        },
      },
      'Login successful'
    );
  } catch (err) {
    next(err);
  }
}
}

export default new AuthController();
