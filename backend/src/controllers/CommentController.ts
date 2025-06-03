import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import { Types } from 'mongoose';
import ApiError from '../utils/ApiError';
import ResponseHandler from '../utils/ResponseHandler';
import CommentService from '../services/CommentService';
import { CreateCommentDto, UpdateCommentDto } from '../dtos/CommentDto';
import { IUser } from '../models/User';

// 1) Joi schema for CreateCommentDto
const createCommentSchema = Joi.object<CreateCommentDto>({
  content: Joi.string().min(1).max(500).required(),
});

// 2) Joi schema for UpdateCommentDto
const updateCommentSchema = Joi.object<UpdateCommentDto>({
  content: Joi.string().min(1).max(500).required(),
});

class CommentController {
  /**
   * POST /api/posts/:postId/comments
   */
  public async create(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { postId } = req.params;
      if (!Types.ObjectId.isValid(postId)) {
        throw new ApiError(400, 'Invalid post ID');
      }

      const { error, value } = createCommentSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      if (error) {
        throw new ApiError(
          400,
          error.details.map((d) => d.message).join(', ')
        );
      }

      if (!req.user) {
        throw new ApiError(401, 'Authentication required');
      }
      const currentUser = req.user as IUser;

      const comment = await CommentService.createComment(
        postId,
        currentUser._id.toString(),
        value.content
      );
      ResponseHandler.success(res, comment, 'Comment created', 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/posts/:postId/comments
   */
  public async getByPost(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { postId } = req.params;
      if (!Types.ObjectId.isValid(postId)) {
        throw new ApiError(400, 'Invalid post ID');
      }

      if (!req.user) {
        throw new ApiError(401, 'Authentication required');
      }

      const comments = await CommentService.getCommentsByPost(postId);
      ResponseHandler.success(res, comments, 'Comments fetched');
    } catch (err) {
      next(err);
    }
  }

  /**
   * PUT /api/comments/:id
   */
  public async update(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      if (!Types.ObjectId.isValid(id)) {
        throw new ApiError(400, 'Invalid comment ID');
      }

      const { error, value } = updateCommentSchema.validate(req.body, {
        abortEarly: false,
        stripUnknown: true,
      });
      if (error) {
        throw new ApiError(
          400,
          error.details.map((d) => d.message).join(', ')
        );
      }

      if (!req.user) {
        throw new ApiError(401, 'Authentication required');
      }
      const currentUser = req.user as IUser;

      const updatedComment = await CommentService.updateComment(
        id,
        currentUser._id.toString(),
        value.content
      );
      ResponseHandler.success(res, updatedComment, 'Comment updated');
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/comments/:id
   */
  public async delete(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { id } = req.params;
      if (!Types.ObjectId.isValid(id)) {
        throw new ApiError(400, 'Invalid comment ID');
      }

      if (!req.user) {
        throw new ApiError(401, 'Authentication required');
      }
      const currentUser = req.user as IUser;

      await CommentService.deleteComment(id, currentUser._id.toString());
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }
}

export default new CommentController();
