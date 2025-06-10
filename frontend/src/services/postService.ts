// src/services/postService.ts
import api from './api';
import { PostResponse, PaginatedPosts, Post } from '@/types';

//
// 1) Raw shapes as returned by your backend
//
interface RawAuthor {
  _id: string;
  username: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

interface RawCategory {
  _id: string;
  name: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}

interface RawPost {
  _id: string;
  title: string;
  slug: string;
  content: string;
  author: RawAuthor;
  categories: RawCategory[];
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface RawPaginatedPostsResponse {
  success: boolean;
  page: number;
  limit: number;
  total: number;
  data: RawPost[];
}

interface RawPostResponse {
  success: boolean;
  data: RawPost;
}

const postService = {
  /**
   * Fetch a page of posts, normalizing `_id` → `id`.
   */
  getPosts: async (
    page: number,
    limit: number
  ): Promise<PaginatedPosts> => {
    const res = await api.get<RawPaginatedPostsResponse>(
      `/posts?page=${page}&limit=${limit}`
    );

    const posts: Post[] = res.data.data.map((raw) => ({
      id: raw._id,
      title: raw.title,
      slug: raw.slug,
      content: raw.content,
      author: {
        id: raw.author._id,
        username: raw.author.username,
        email: raw.author.email,
        createdAt: raw.author.createdAt,
        updatedAt: raw.author.updatedAt,
      },
      categories: raw.categories.map((c) => ({
        id: c._id,
        name: c.name,
        slug: c.slug,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
      imageUrl: raw.imageUrl,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    }));

    return {
      success: res.data.success,
      page: res.data.page,
      limit: res.data.limit,
      total: res.data.total,
      data: posts,
    };
  },

  /**
   * Fetch a single post by ID, normalizing `_id` → `id`.
   */
  getPostById: async (id: string): Promise<Post> => {
    const res = await api.get<RawPostResponse>(`/posts/${id}`);
    const raw = res.data.data;

    return {
      id: raw._id,
      title: raw.title,
      slug: raw.slug,
      content: raw.content,
      author: {
        id: raw.author._id,
        username: raw.author.username,
        email: raw.author.email,
        createdAt: raw.author.createdAt,
        updatedAt: raw.author.updatedAt,
      },
      categories: raw.categories.map((c) => ({
        id: c._id,
        name: c.name,
        slug: c.slug,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
      imageUrl: raw.imageUrl,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  },

  /**
   * Create a new post (multipart/form-data).
   */
  createPost: async (formData: FormData): Promise<Post> => {
    const res = await api.post<PostResponse>('/posts', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data.data;
  },

  /**
   * Update a post.  
   * - If `updates` is FormData → sends multipart/form-data.  
   * - Otherwise sends JSON.
   */
  updatePost: async (
    id: string,
    updates:
      | { title?: string; slug?: string; content?: string; categories?: string[] }
      | FormData
  ): Promise<Post> => {
    if (updates instanceof FormData) {
      const res = await api.put<PostResponse>(`/posts/${id}`, updates, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return res.data.data;
    } else {
      const res = await api.put<PostResponse>(`/posts/${id}`, updates);
      return res.data.data;
    }
  },

  /**
   * Delete a post by ID.
   */
  deletePost: async (id: string): Promise<void> => {
    await api.delete(`/posts/${id}`);
  },

  /**
   * Fetch paginated posts for a given category slug.
   */
  getPostsByCategory: async (
    slug: string,
    page: number,
    limit: number
  ): Promise<PaginatedPosts> => {
    const res = await api.get<RawPaginatedPostsResponse>(
      `/posts?category=${slug}&page=${page}&limit=${limit}`
    );

    const posts: Post[] = res.data.data.map((raw) => ({
      id: raw._id,
      title: raw.title,
      slug: raw.slug,
      content: raw.content,
      author: {
        id: raw.author._id,
        username: raw.author.username,
        email: raw.author.email,
        createdAt: raw.author.createdAt,
        updatedAt: raw.author.updatedAt,
      },
      categories: raw.categories.map((c) => ({
        id: c._id,
        name: c.name,
        slug: c.slug,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
      imageUrl: raw.imageUrl,
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    }));

    return {
      success: res.data.success,
      page: res.data.page,
      limit: res.data.limit,
      total: res.data.total,
      data: posts,
    };
  },
};

export default postService;
