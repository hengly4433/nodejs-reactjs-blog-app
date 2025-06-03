// src/controllers/PostController.ts
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import PostService from '../services/PostService';
import ResponseHandler from '../utils/ResponseHandler';
import ApiError from '../utils/ApiError';
import { CreatePostDto, UpdatePostDto } from '../dtos/PostDto';
import { Types } from 'mongoose';
import { IUser } from '../models/User';

// Joi schema for creating a post
const createPostSchema = Joi.object<CreatePostDto>({
  title:   Joi.string().min(3).max(100).required(),
  slug:    Joi.string().min(3).max(100).required(),
  content: Joi.string().min(10).required(),
  categories: Joi.array().items(
    Joi.string().custom((value, helpers) => {
      if (!Types.ObjectId.isValid(value)) {
        // Use helpers.error instead of helpers.message
        return helpers.error('any.invalid', {
          message: `Invalid category ID: ${value}`,
        });
      }
      return value;
    })
  ).required(),
});

// Joi schema for updating a post
const updatePostSchema = Joi.object<UpdatePostDto>({
  title:   Joi.string().min(3).max(100),
  slug:    Joi.string().min(3).max(100),
  content: Joi.string().min(10),
  categories: Joi.array().items(
    Joi.string().custom((value, helpers) => {
      if (!Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid', {
          message: `Invalid category ID: ${value}`,
        });
      }
      return value;
    })
  ),
}).min(1); // require at least one field to update

class PostController {
  public async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      // 1) Validate request body
      const { error, value } = createPostSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      if (error) {
        throw new ApiError(
          400,
          error.details.map((d) => d.message).join(', ')
        );
      }

      // 2) Ensure user is authenticated
      if (!req.user) {
        throw new ApiError(401, 'Authentication required');
      }
      // Cast req.user → IUser
      const currentUser = req.user as IUser;

      // 3) Call service, passing strings for categories
      const post = await PostService.createPost(
        value.title,
        value.slug,
        value.content,
        currentUser._id.toString(),
        value.categories // string[]
      );

      // 4) Send response
      ResponseHandler.success(res, post, 'Post created', 201);
    } catch (err) {
      next(err);
    }
  }

  public async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      // Parse pagination from query string
      const page = parseInt((req.query.page as string) || '1', 10);
      const limit = parseInt((req.query.limit as string) || '10', 10);

      const { posts, total } = await PostService.getPosts(page, limit);
      ResponseHandler.paginated(
        res,
        {
          data: posts,
          page,
          limit,
          total,
        },
        'Posts fetched'
      );
    } catch (err) {
      next(err);
    }
  }

  public async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!Types.ObjectId.isValid(id)) {
        throw new ApiError(400, 'Invalid Post ID');
      }
      const post = await PostService.getPostById(id);
      ResponseHandler.success(res, post, 'Post fetched');
    } catch (err) {
      next(err);
    }
  }

  public async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      if (!Types.ObjectId.isValid(id)) {
        throw new ApiError(400, 'Invalid Post ID');
      }

      // 1) Validate request body
      const { error, value } = updatePostSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      if (error) {
        throw new ApiError(
          400,
          error.details.map((d) => d.message).join(', ')
        );
      }

      // 2) Ensure user is authenticated
      if (!req.user) {
        throw new ApiError(401, 'Authentication required');
      }

      // 3) Call service
      const updated = await PostService.updatePost(id, value);

      // 4) Respond
      ResponseHandler.success(res, updated, 'Post updated');
    } catch (err) {
      next(err);
    }
  }

  public async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!Types.ObjectId.isValid(id)) {
        throw new ApiError(400, 'Invalid Post ID');
      }

      if (!req.user) {
        throw new ApiError(401, 'Authentication required');
      }

      // (Optional) Check if req.user is the author before deletion

      await PostService.deletePost(id);
      ResponseHandler.success(res, null, 'Post deleted', 204);
    } catch (err) {
      next(err);
    }
  }
}

export default new PostController();
