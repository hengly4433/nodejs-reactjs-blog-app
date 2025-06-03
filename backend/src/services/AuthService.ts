import * as jwt from 'jsonwebtoken';
import User, { IUser } from '../models/User';
import ApiError from '../utils/ApiError';
import jwtConfig from '../config/jwt';
import { SignOptions } from 'jsonwebtoken';
import { StringValue } from 'ms';

class AuthService {
  /**
   * Registers a new user. Throws ApiError if email or username already exists.
   */
  public async register(
    username: string,
    email: string,
    password: string
  ): Promise<IUser> {
    // Check if email or username already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      throw new ApiError(409, 'Username or email already in use');
    }

    const user = new User({ username, email, password });
    await user.save();
    return user;
  }

  /**
   * Logs in a user: verifies email/password, returns JWT token if valid.
   */
  public async login(email: string, password: string): Promise<{ token: string }> {
    // 1. Find the user
    const user: IUser | null = await User.findOne({ email });
    if (!user) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // 2. Check password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      throw new ApiError(401, 'Invalid credentials');
    }

    // 3. Prepare payload
    const payload = { id: user._id };

    // 4. Define options explicitly
    const options: SignOptions = {
      expiresIn: jwtConfig.expiresIn as StringValue, // e.g. '1h'
      // optionally: issuer: 'myapp.com', audience: 'myapp_users', etc.
    };

    // 5. Call jwt.sign with (payload, secret, options)
    //    This matches the overload: (payload, Secret, SignOptions?) => string
    const token: string = jwt.sign(payload, jwtConfig.secret, options);

    return { token };
    }
}

export default new AuthService();
