// src/controllers/PostController.ts
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { Types } from 'mongoose';
import path from 'path';
import fs from 'fs';

import PostService from '../services/PostService';
import ResponseHandler from '../utils/ResponseHandler';
import ApiError from '../utils/ApiError';
import { upload } from '../config/multer';
import { IUser } from '../models/User';

// -----------------------------
// CreatePost: allow array OR single string
// -----------------------------
const createPostSchema = Joi.object({
  title: Joi.string().min(3).max(100).required(),
  slug: Joi.string().min(3).max(100).required(),
  content: Joi.string().min(10).required(),

  categories: Joi.alternatives()
    .try(
      // Case A: array of strings
      Joi.array()
        .items(
          Joi.string().custom((value, helpers) => {
            if (!Types.ObjectId.isValid(value)) {
              return helpers.error('any.invalid', {
                message: `Invalid category ID: ${value}`,
              });
            }
            return value;
          })
        )
        .min(1),

      // Case B: single string
      Joi.string().custom((value, helpers) => {
        if (!Types.ObjectId.isValid(value)) {
          return helpers.error('any.invalid', {
            message: `Invalid category ID: ${value}`,
          });
        }
        return value;
      })
    )
    .required(),
});

// -----------------------------
// UpdatePost: allow array OR single string (and require at least one field)
// -----------------------------
const updatePostSchema = Joi.object({
  title: Joi.string().min(3).max(100),
  slug: Joi.string().min(3).max(100),
  content: Joi.string().min(10),

  categories: Joi.alternatives().try(
    Joi.array().items(
      Joi.string().custom((value, helpers) => {
        if (!Types.ObjectId.isValid(value)) {
          return helpers.error('any.invalid', {
            message: `Invalid category ID: ${value}`,
          });
        }
        return value;
      })
    ),

    Joi.string().custom((value, helpers) => {
      if (!Types.ObjectId.isValid(value)) {
        return helpers.error('any.invalid', {
          message: `Invalid category ID: ${value}`,
        });
      }
      return value;
    })
  ),
})
  .min(1) // at least one field must be present
  .messages({
    'object.min': 'At least one field (title, slug, content, or categories) must be provided for update',
  });

class PostController {
  /**
   * POST /api/posts
   * Create a new post (fields + optional image).
   */
  public create = [
    upload.single('image'),

    async (req: Request, res: Response, next: NextFunction) => {
      try {
        // 1) Validate JSON body (may contain categories as string OR array)
        const { error, value } = createPostSchema.validate(req.body, {
          abortEarly: false,
          stripUnknown: true,
        });

        if (error) {
          // If an image was already uploaded, delete it to avoid orphan files
          if (req.file && req.file.path) {
            fs.unlink(req.file.path, () => {});
          }
          throw new ApiError(400, error.details.map((d) => d.message).join(', '));
        }

        // 2) Ensure user is authenticated
        if (!req.user) {
          if (req.file && req.file.path) {
            fs.unlink(req.file.path, () => {});
          }
          throw new ApiError(401, 'Authentication required');
        }
        const currentUser = req.user as IUser;
        const authorId = currentUser._id.toString();

        // 3) Normalize categories into an array of strings
        let categoryIds: string[];
        if (typeof value.categories === 'string') {
          categoryIds = [value.categories];
        } else {
          categoryIds = value.categories; // already an array
        }

        // 4) Build imageFilePath if a file was uploaded
        let imageFilePath: string | undefined;
        if (req.file) {
          const relativePath = path.relative(
            path.resolve(__dirname, '../'),
            req.file.path
          );
          imageFilePath = `/${relativePath.replace(/\\/g, '/')}`;
        }

        // 5) Call the service, passing categoryIds and optional imageFilePath
        const post = await PostService.createPost(
          value.title,
          value.slug,
          value.content,
          authorId,
          categoryIds,       // guaranteed to be string[]
          imageFilePath      // may be undefined
        );

        // 6) Success response
        ResponseHandler.success(res, post, 'Post created', 201);
      } catch (err) {
        next(err);
      }
    },
  ];

  /**
   * PUT /api/posts/:id
   * Update a post (fields + optional new image).
   */
  public update = [
    upload.single('image'),

    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { id } = req.params;
        if (!Types.ObjectId.isValid(id)) {
          if (req.file && req.file.path) {
            fs.unlink(req.file.path, () => {});
          }
          throw new ApiError(400, 'Invalid Post ID');
        }

        // 1) Validate JSON body
        const { error, value } = updatePostSchema.validate(req.body, {
          abortEarly: false,
          stripUnknown: true,
        });
        if (error) {
          if (req.file && req.file.path) {
            fs.unlink(req.file.path, () => {});
          }
          throw new ApiError(400, error.details.map((d) => d.message).join(', '));
        }

        // 2) Ensure user is authenticated
        if (!req.user) {
          if (req.file && req.file.path) {
            fs.unlink(req.file.path, () => {});
          }
          throw new ApiError(401, 'Authentication required');
        }

        // 3) Normalize categories into an array if provided
        let categoryIdsToUpdate: string[] | undefined = undefined;
        if (value.categories !== undefined) {
          if (typeof value.categories === 'string') {
            categoryIdsToUpdate = [value.categories];
          } else {
            categoryIdsToUpdate = value.categories;
          }
        }

        // 4) Build imageFilePath if a new file was uploaded
        let imageFilePath: string | undefined;
        if (req.file) {
          const relativePath = path.relative(
            path.resolve(__dirname, '../'),
            req.file.path
          );
          imageFilePath = `/${relativePath.replace(/\\/g, '/')}`;
        }

        // 5) Call the service, passing normalized categories and optional imageFilePath
        const updatedPost = await PostService.updatePost(
          id,
          {
            ...value,
            categories: categoryIdsToUpdate,
          },
          imageFilePath
        );

        // 6) Success response
        ResponseHandler.success(res, updatedPost, 'Post updated');
      } catch (err) {
        next(err);
      }
    },
  ];

  /**
   * GET /api/posts
   * Retrieves paginated posts.
   */
  public async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
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

  /**
   * GET /api/posts/:id
   * Retrieves a single post by ID.
   */
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

  /**
   * DELETE /api/posts/:id
   * Delete a post.
   */
  public async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      if (!Types.ObjectId.isValid(id)) {
        throw new ApiError(400, 'Invalid Post ID');
      }

      if (!req.user) {
        throw new ApiError(401, 'Authentication required');
      }

      await PostService.deletePost(id);
      ResponseHandler.success(res, null, 'Post deleted', 204);
    } catch (err) {
      next(err);
    }
  }
}

export default new PostController();
