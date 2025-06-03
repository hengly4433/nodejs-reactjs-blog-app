import { Types } from 'mongoose';
import Like, { ILike } from '../models/Like';
import Post from '../models/Post';
import ApiError from '../utils/ApiError';

class LikeService {
  /**
   * Let a user like a post. If the user already liked it, throw 409.
   * @param postId - ID of the post
   * @param userId - ID of the user liking
   */
  public async likePost(postId: string, userId: string): Promise<ILike> {
    if (!Types.ObjectId.isValid(postId)) {
      throw new ApiError(400, 'Invalid post ID');
    }
    const postExists = await Post.exists({ _id: postId });
    if (!postExists) {
      throw new ApiError(404, 'Post not found');
    }

    // 1) Prevent duplicates (unique index will also enforce, but catch early)
    const existing = await Like.findOne({
      post: postId,
      user: userId,
    });
    if (existing) {
      throw new ApiError(409, 'Already liked');
    }

    // 2) Create the like
    const like = new Like({
      post: new Types.ObjectId(postId),
      user: new Types.ObjectId(userId),
    });
    await like.save();

    return like;
  }

  /**
   * Let a user remove their like from a post. If none exists, throw 404.
   * @param postId - ID of the post
   * @param userId - ID of the user unliking
   */
  public async unlikePost(postId: string, userId: string): Promise<void> {
    if (!Types.ObjectId.isValid(postId)) {
      throw new ApiError(400, 'Invalid post ID');
    }

    const result = await Like.findOneAndDelete({
      post: postId,
      user: userId,
    });
    if (!result) {
      throw new ApiError(404, 'Like not found');
    }
  }

  /**
   * Return the total number of likes for a post, optionally listing users.
   * @param postId - ID of the post
   */
  public async getLikesCount(postId: string): Promise<number> {
    if (!Types.ObjectId.isValid(postId)) {
      throw new ApiError(400, 'Invalid post ID');
    }
    const count = await Like.countDocuments({ post: postId });
    return count;
  }

  /**
   * Optionally: list all users who liked a post, with pagination.
   * @param postId - ID of the post
   */
  public async getLikesByPost(
    postId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ total: number; likes: ILike[] }> {
    if (!Types.ObjectId.isValid(postId)) {
      throw new ApiError(400, 'Invalid post ID');
    }
    const filter = { post: postId };
    const total = await Like.countDocuments(filter);

    const likes = await Like.find(filter)
      .skip((page - 1) * limit)
      .limit(limit)
      .populate('user', 'username email');

    return { total, likes };
  }
}

export default new LikeService();
