import { Types } from 'mongoose';
import Like, { ILike } from '../models/Like';
import Post from '../models/Post';
import ApiError from '../utils/ApiError';

class LikeService {
  public async likePost(postId: string, userId: string): Promise<ILike> {
    if (!Types.ObjectId.isValid(postId)) {
      throw new ApiError(400, 'Invalid post ID');
    }
    const postExists = await Post.exists({ _id: postId });
    if (!postExists) {
      throw new ApiError(404, 'Post not found');
    }
    const existing = await Like.findOne({ post: postId, user: userId });
    if (existing) {
      throw new ApiError(409, 'Already liked');
    }
    const like = new Like({ post: postId, user: userId });
    await like.save();
    return like;
  }

  public async unlikePost(postId: string, userId: string): Promise<void> {
    if (!Types.ObjectId.isValid(postId)) {
      throw new ApiError(400, 'Invalid post ID');
    }
    const result = await Like.findOneAndDelete({ post: postId, user: userId });
    if (!result) {
      throw new ApiError(404, 'Like not found');
    }
  }

  public async getLikesCount(postId: string): Promise<number> {
    if (!Types.ObjectId.isValid(postId)) {
      throw new ApiError(400, 'Invalid post ID');
    }
    return Like.countDocuments({ post: postId });
  }

  /**
   * Return whether the given user liked the post
   */
  public async hasUserLiked(postId: string, userId: string): Promise<boolean> {
    if (!Types.ObjectId.isValid(postId)) {
      throw new ApiError(400, 'Invalid post ID');
    }
    const like = await Like.findOne({ post: postId, user: userId });
    return !!like;
  }


  // Optionally list all users who liked a post (with pagination)
  public async getLikesByPost(
    postId: string,
    page = 1,
    limit = 10
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
