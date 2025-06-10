// ─── 1) Auth/User types ─────────────────────────────────────────────────────

export interface UserResponse {
  id: string;
  username: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  user: UserResponse;
}

export interface AuthApiEnvelope {
  success: boolean;
  message: string;
  data: AuthResponse;
}

// ─── 2) Category types ──────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}
//
// Raw shapes coming back from the server
//
export interface RawCategory {
  _id: string;
  name: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface RawCategoryListResponse {
  success: boolean;
  data: RawCategory[];
}

export interface RawCategoryResponse {
  success: boolean;
  data: RawCategory;
}

// ─── 3) Post types ──────────────────────────────────────────────────────────

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;            // HTML
  author: UserResponse;
  categories: Category[];
  imageUrl?: string;          // URL or relative path to uploaded image
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedPosts {
  success: boolean;
  page: number;
  limit: number;
  total: number;
  data: Post[];
}

export interface PostResponse {
  success: boolean;
  data: Post;
}

export interface CategoryResponse {
  success: boolean;
  data: Post;
}

// ─── 4) Comment types ───────────────────────────────────────────────────────

export interface Comment {
  id: string;
  content: string;
  author: UserResponse;
  post: string;
  createdAt: string;
  updatedAt: string;
}

// ─── 5) Like types ──────────────────────────────────────────────────────────

export interface Like {
  id: string;
  user: UserResponse;
  post: string;
  createdAt: string;
}
