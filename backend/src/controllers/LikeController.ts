import { Request, Response, NextFunction } from 'express';
import { Types } from 'mongoose';
import ApiError from '../utils/ApiError';
import ResponseHandler from '../utils/ResponseHandler';
import LikeService from '../services/LikeService';
import { IUser } from '../models/User';

class LikeController {
  /**
   * POST /api/posts/:postId/like
   */
  public async likePost(
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
      const currentUser = req.user as IUser;

      const like = await LikeService.likePost(
        postId,
        currentUser._id.toString()
      );
      ResponseHandler.success(res, { like }, 'Post liked', 201);
    } catch (err) {
      next(err);
    }
  }

  /**
   * DELETE /api/posts/:postId/unlike
   */
  public async unlikePost(
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
      const currentUser = req.user as IUser;

      await LikeService.unlikePost(postId, currentUser._id.toString());
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  }

  /**
   * GET /api/posts/:postId/likes
   * Return the count of likes (and optionally the “likes” themselves).
   */
  public async getLikes(
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

      // If you only need a count:
      const total = await LikeService.getLikesCount(postId);
      // Alternatively, to retrieve paginated user info who liked:
      // const { total, likes } = await LikeService.getLikesByPost(postId, page, limit);

      ResponseHandler.success(res, { total }, 'Like count fetched');
    } catch (err) {
      next(err);
    }
  }
}

export default new LikeController();
