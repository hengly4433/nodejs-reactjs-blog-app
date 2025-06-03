import { Types } from 'mongoose';
import Comment, { IComment } from '../models/Comment';
import Post from '../models/Post';
import ApiError from '../utils/ApiError';

class CommentService {
  /**
   * Create a new comment on a post.
   * @param postId - ID of the post
   * @param authorId - ID of the user creating the comment
   * @param content - comment text
   */
  public async createComment(
    postId: string,
    authorId: string,
    content: string
  ): Promise<IComment> {
    // 1) Ensure the post exists
    if (!Types.ObjectId.isValid(postId)) {
      throw new ApiError(400, 'Invalid post ID');
    }
    const post = await Post.findById(postId);
    if (!post) {
      throw new ApiError(404, 'Post not found');
    }

    // 2) Create the comment
    const comment = new Comment({
      content,
      author: new Types.ObjectId(authorId),
      post: new Types.ObjectId(postId),
    });
    await comment.save();

    // 3) Populate author field (username + email)
    await comment.populate('author', 'username email');

    return comment;
  }

  /**
   * List all comments for a given post, sorted by creation date ascending.
   * @param postId - ID of the post
   */
  public async getCommentsByPost(postId: string): Promise<IComment[]> {
    if (!Types.ObjectId.isValid(postId)) {
      throw new ApiError(400, 'Invalid post ID');
    }

    // 1) Verify the post exists (optional but recommended)
    const postExists = await Post.exists({ _id: postId });
    if (!postExists) {
      throw new ApiError(404, 'Post not found');
    }

    // 2) Find all comments for that post
    const comments = await Comment.find({ post: postId })
      .sort({ createdAt: 1 })
      .populate('author', 'username email');

    return comments;
  }

  /**
   * Update a comment's content. Only the owner can update.
   * @param commentId - ID of the comment
   * @param userId - ID of the user attempting the update
   * @param content - new content
   */
  public async updateComment(
    commentId: string,
    userId: string,
    content: string
  ): Promise<IComment> {
    if (!Types.ObjectId.isValid(commentId)) {
      throw new ApiError(400, 'Invalid comment ID');
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new ApiError(404, 'Comment not found');
    }

    // 3) Only the author of the comment can update
    if (comment.author.toString() !== userId) {
      throw new ApiError(403, 'Forbidden: Not the comment owner');
    }

    comment.content = content;
    await comment.save();

    // Re‐populate author
    await comment.populate('author', 'username email');
    return comment;
  }

  /**
   * Delete a comment. Only the owner can delete.
   * @param commentId - ID of the comment
   * @param userId - ID of the user attempting to delete
   */
  public async deleteComment(commentId: string, userId: string): Promise<void> {
    if (!Types.ObjectId.isValid(commentId)) {
      throw new ApiError(400, 'Invalid comment ID');
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      throw new ApiError(404, 'Comment not found');
    }

    // Only the owner or the post author could be authorized to delete (optionally). 
    // Here we restrict deletion to the commenter only:
    if (comment.author.toString() !== userId) {
      throw new ApiError(403, 'Forbidden: Not the comment owner');
    }

    await comment.deleteOne();
  }
}

export default new CommentService();
