import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import ApiError from '../utils/ApiError';
import ResponseHandler from '../utils/ResponseHandler';
import LikeService from '../services/LikeService';
import { IUser } from '../models/User';

class LikeController {
  public async likePost(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { postId } = req.params;
      if (!Types.ObjectId.isValid(postId)) throw new ApiError(400, 'Invalid post ID');
      if (!req.user) throw new ApiError(401, 'Authentication required');
      const currentUser = req.user as IUser;
      const like = await LikeService.likePost(postId, currentUser._id.toString());
      ResponseHandler.success(res, { like }, 'Post liked', 201);
    } catch (err) {
      next(err);
    }
  }

  public async unlikePost(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { postId } = req.params;
      if (!Types.ObjectId.isValid(postId)) throw new ApiError(400, 'Invalid post ID');
      if (!req.user) throw new ApiError(401, 'Authentication required');
      const currentUser = req.user as IUser;
      await LikeService.unlikePost(postId, currentUser._id.toString());
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  public async getLikes(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const { postId } = req.params;
      if (!Types.ObjectId.isValid(postId)) throw new ApiError(400, 'Invalid post ID');
      const total = await LikeService.getLikesCount(postId);
      ResponseHandler.success(res, { total }, 'Like count fetched');
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/posts/:postId/liked
   * Return { liked: true/false } if the current user liked the post.
   */
  public async hasUserLiked(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { postId } = req.params;
      if (!Types.ObjectId.isValid(postId)) {
        throw new ApiError(400, 'Invalid post ID');
      }
      if (!req.user) {
        throw new ApiError(401, 'Authentication required');
      }
      const userId = (req.user as IUser)._id.toString();
      const liked = await LikeService.hasUserLiked(postId, userId);
      ResponseHandler.success(res, { liked }, 'User like status fetched');
    } catch (err) {
      next(err);
    }
  }

}

export default new LikeController();
