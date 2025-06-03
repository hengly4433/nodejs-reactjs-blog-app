// src/controllers/CategoryController.ts
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';
import CategoryService from '../services/CategoryService';
import ResponseHandler from '../utils/ResponseHandler';
import ApiError from '../utils/ApiError';
import { CreateCategoryDto, UpdateCategoryDto } from '../dtos/CategoryDto';

// Joi schemas
const createCategorySchema = Joi.object<CreateCategoryDto>({
  name: Joi.string().min(2).max(50).required(),
  slug: Joi.string().min(2).max(50).required(),
});

const updateCategorySchema = Joi.object<UpdateCategoryDto>({
  name: Joi.string().min(2).max(50),
  slug: Joi.string().min(2).max(50),
});

class CategoryController {
  public async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { error, value } = createCategorySchema.validate(req.body, { abortEarly: false });
      if (error) {
        throw new ApiError(400, error.details.map((d) => d.message).join(', '));
      }
      const category = await CategoryService.createCategory(value.name, value.slug);
      ResponseHandler.success(res, category, 'Category created', 201);
    } catch (err) {
      next(err);
    }
  }

  public async getAll(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await CategoryService.getAllCategories();
      ResponseHandler.success(res, categories, 'Categories fetched');
    } catch (err) {
      next(err);
    }
  }

  public async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const category = await CategoryService.getCategoryById(id);
      ResponseHandler.success(res, category, 'Category fetched');
    } catch (err) {
      next(err);
    }
  }

  public async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { error, value } = updateCategorySchema.validate(req.body, { abortEarly: false });
      if (error) {
        throw new ApiError(400, error.details.map((d) => d.message).join(', '));
      }
      const category = await CategoryService.updateCategory(id, value);
      ResponseHandler.success(res, category, 'Category updated');
    } catch (err) {
      next(err);
    }
  }

  public async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      await CategoryService.deleteCategory(id);
      ResponseHandler.success(res, null, 'Category deleted', 204);
    } catch (err) {
      next(err);
    }
  }
}

export default new CategoryController();
