// src/services/postService.ts
import api from './api';
import { Category, CategoryResponse, RawCategoryListResponse, RawCategoryResponse } from '@/types';

const categoryService = {

   /**
   * Fetch all categories.
   */
    getCategories: async (): Promise<Category[]> => {
        const res = await api.get<RawCategoryListResponse>('/categories');
        return res.data.data.map((raw) => ({
        id: raw._id,
        name: raw.name,
        slug: raw.slug,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        }));
    },

    /**
     * Fetch a single category by ID.
     */
    getCategoryById: async (id: string): Promise<Category> => {
        const res = await api.get<RawCategoryResponse>(`/categories/${id}`);
        const raw = res.data.data;
        return {
        id: raw._id,
        name: raw.name,
        slug: raw.slug,
        createdAt: raw.createdAt,
        updatedAt: raw.updatedAt,
        };
    },

    /**
     * Create a new category. Accepts a FormData.
     * The FormData should contain:
     *   - name: string
     *   - slug: string
     */
    createCategory: async (formData: FormData) => {
        const res = await api.post<CategoryResponse>('/categories', formData);
        return res.data.data;
    },

    /**
     * Update a post. If you pass a FormData; 
     * otherwise it sends JSON.
     */
    updateCategory: async (
        id: string,
        updates:
        | { name?: string; slug?: string; }
        | FormData
    ) => {
        if (updates instanceof FormData) {
        const res = await api.put<CategoryResponse>(`/categories/${id}`);
        return res.data.data;
        } else {
        const res = await api.put<CategoryResponse>(`/categories/${id}`, updates);
        return res.data.data;
        }
    },

     /**
      * delete category.
    */
    deleteCategory: async (id: string) => {
        await api.delete(`/categories/${id}`);
    },
};

export default categoryService;
