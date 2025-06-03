export interface CreatePostDto {
  title: string;
  slug: string;
  content: string;
  categories: string[];  // plain string IDs
}

export interface UpdatePostDto {
  title?: string;
  slug?: string;
  content?: string;
  categories?: string[]; // plain string IDs
}
