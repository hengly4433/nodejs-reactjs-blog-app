import { Types } from 'mongoose';
import Post, { IPost } from '../models/Post';
import ApiError from '../utils/ApiError';

class PostService {
  /**
   * Creates a new post.
   */
  public async createPost(
    title: string,
    slug: string,
    content: string,
    authorId: string,
    categoryIds: string[]   // string IDs
  ): Promise<IPost> {
    // 1) Check slug uniqueness
    const existing = await Post.findOne({ slug });
    if (existing) {
      throw new ApiError(409, 'Post with this slug already exists');
    }

    // 2) Convert categoryIds to ObjectId[]
    const invalidCategory = categoryIds.find((catId) => !Types.ObjectId.isValid(catId));
    if (invalidCategory) {
      throw new ApiError(400, `Invalid category ID: ${invalidCategory}`);
    }
    const categoryObjectIds = categoryIds.map((catId) => new Types.ObjectId(catId));

    // 3) Convert authorId to ObjectId
    if (!Types.ObjectId.isValid(authorId)) {
      throw new ApiError(400, `Invalid author ID: ${authorId}`);
    }
    const authorObjectId = new Types.ObjectId(authorId);

    // 4) Create and save
    const post = new Post({
      title,
      slug,
      content,
      author: authorObjectId,
      categories: categoryObjectIds,
    });
    await post.save();

    // 5) Populate and return
    await post.populate('author', 'username email');
    await post.populate('categories', 'name slug');
    return post;
  }

  

  /**
   * Retrieves a paginated list of posts.
   */
  public async getPosts(
    page = 1,
    limit = 10
  ): Promise<{ posts: IPost[]; total: number }> {
    const skip = (page - 1) * limit;
    const [posts, total] = await Promise.all([
      Post.find()
        .populate('author', 'username email')
        .populate('categories', 'name slug')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Post.countDocuments(),
    ]);
    return { posts, total };
  }

  /**
   * Retrieves a single post by ID.
   */
  public async getPostById(id: string): Promise<IPost> {
    const post = await Post.findById(id)
      .populate('author', 'username email')
      .populate('categories', 'name slug');
    if (!post) {
      throw new ApiError(404, 'Post not found');
    }
    return post;
  }

  /**
   * Updates a post.
   */
  public async updatePost(
    id: string,
    data: Partial<{
      title: string;
      slug: string;
      content: string;
      categories: string[];   // still string[]
    }>
  ): Promise<IPost> {
    // 1) Find the post
    const post = await Post.findById(id);
    if (!post) {
      throw new ApiError(404, 'Post not found');
    }

    // 2) If slug changing, check uniqueness
    if (data.slug && data.slug !== post.slug) {
      const exists = await Post.findOne({ slug: data.slug });
      if (exists) {
        throw new ApiError(409, 'Slug already in use');
      }
    }

    // 3) If categories provided, convert to ObjectId[]
    if (data.categories) {
      const invalidCategory = data.categories.find((catId) => !Types.ObjectId.isValid(catId));
      if (invalidCategory) {
        throw new ApiError(400, `Invalid category ID: ${invalidCategory}`);
      }
      const categoryObjectIds = data.categories.map((catId) => new Types.ObjectId(catId));
      (data as any).categories = categoryObjectIds; // cast so Mongoose accepts it
    }

    // 4) Merge updates & save
    post.set(data as any);
    await post.save();

    // 5) Populate and return
    await post.populate('author', 'username email');
    await post.populate('categories', 'name slug');
    return post;
  }

  /**
   * Deletes a post.
   */
  public async deletePost(id: string): Promise<void> {
    const post = await Post.findById(id);
    if (!post) {
      throw new ApiError(404, 'Post not found');
    }
    await post.deleteOne();
  }
}

export default new PostService();
