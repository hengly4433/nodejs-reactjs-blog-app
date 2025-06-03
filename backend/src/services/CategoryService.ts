import Category, { ICategory } from '../models/Category';
import ApiError from '../utils/ApiError';

class CategoryService {
  /**
   * Creates a new category.
   */
  public async createCategory(name: string, slug: string): Promise<ICategory> {
    // Check if slug or name exists
    const existing = await Category.findOne({ $or: [{ slug }, { name }] });
    if (existing) {
      throw new ApiError(409, 'Category with this name or slug already exists');
    }

    const category = new Category({ name, slug });
    await category.save();
    return category;
  }

  /**
   * Retrieves all categories.
   */
  public async getAllCategories(): Promise<ICategory[]> {
    return Category.find().sort({ createdAt: -1 });
  }

  /**
   * Retrieves a single category by ID.
   */
  public async getCategoryById(id: string): Promise<ICategory> {
    const category = await Category.findById(id);
    if (!category) {
      throw new ApiError(404, 'Category not found');
    }
    return category;
  }

  /**
   * Updates a category.
   */
  public async updateCategory(
    id: string,
    data: Partial<{ name: string; slug: string }>
  ): Promise<ICategory> {
    const category = await Category.findById(id);
    if (!category) {
      throw new ApiError(404, 'Category not found');
    }

    // If updating name/slug, ensure uniqueness
    if (data.name && data.name !== category.name) {
      const exists = await Category.findOne({ name: data.name });
      if (exists) {
        throw new ApiError(409, 'Category name already in use');
      }
    }
    if (data.slug && data.slug !== category.slug) {
      const exists = await Category.findOne({ slug: data.slug });
      if (exists) {
        throw new ApiError(409, 'Category slug already in use');
      }
    }

    category.set(data);
    await category.save();
    return category;
  }

  /**
   * Deletes a category.
   */
  public async deleteCategory(id: string): Promise<void> {
    const category = await Category.findById(id);
    if (!category) {
      throw new ApiError(404, 'Category not found');
    }
    await category.deleteOne();
  }
}

export default new CategoryService();
