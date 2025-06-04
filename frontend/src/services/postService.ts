import api from './api';
import { PostResponse, PaginatedPosts } from '@/types';

const postService = {
  /**
   * Fetch a paginated list of posts.
   * Returns: { success, page, limit, total, data: Post[] }
   */
  getPosts: async (page: number, limit: number): Promise<PaginatedPosts> => {
    const res = await api.get<PaginatedPosts>(`/posts?page=${page}&limit=${limit}`);
    return res.data;
  },

  /**
   * Fetch a single post by ID.
   */
  getPostById: async (id: string) => {
    const res = await api.get<PostResponse>(`/posts/${id}`);
    return res.data.data;
  },

  /**
   * Create a new post by sending a FormData object.
   * The FormData must include:
   *   - title       : string
   *   - slug        : string
   *   - content     : string (HTML)
   *   - authorId    : string
   *   - categories  : one or more category IDs (append each with formData.append('categories', id))
   *   - image       : File (optional)
   *
   * IMPORTANT:
   * We explicitly set `Content-Type: multipart/form-data` here so that Axios
   * drops any default JSON header and computes the correct boundary.
   */
  createPost: async (formData: FormData) => {
    const res = await api.post<PostResponse>('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data.data;
  },

  /**
   * Update an existing post.
   *   - If you pass a plain JS object, it sends JSON.
   *   - If you pass a FormData, it sends multipart/form-data.
   */
  updatePost: async (
    id: string,
    updates: { title?: string; slug?: string; content?: string; categories?: string[] } | FormData
  ) => {
    if (updates instanceof FormData) {
      // Let Axios set boundary automatically
      const res = await api.put<PostResponse>(`/posts/${id}`, updates, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return res.data.data;
    } else {
      // JSON body
      const res = await api.put<PostResponse>(`/posts/${id}`, updates);
      return res.data.data;
    }
  },

  /**
   * Delete a post by ID.
   */
  deletePost: async (id: string) => {
    await api.delete(`/posts/${id}`);
  },

  /**
   * Fetch posts filtered by category slug, with pagination.
   * Returns: { success, page, limit, total, data: Post[] }
   */
  getPostsByCategory: async (slug: string, page: number, limit: number): Promise<PaginatedPosts> => {
    const res = await api.get<PaginatedPosts>(`/posts?category=${slug}&page=${page}&limit=${limit}`);
    return res.data;
  },
};

export default postService;
