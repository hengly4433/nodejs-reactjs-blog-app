// src/routes/categoryRoutes.ts
import { Router } from 'express';
import CategoryController from '../controllers/CategoryController';
import authMiddleware from '../middlewares/authMiddleware';

const router = Router();

/**
 * @route   GET /api/categories
 * @desc    Get all categories
 * @access  Public
 */
router.get('/', CategoryController.getAll);

/**
 * @route   GET /api/categories/:id
 * @desc    Get category by ID
 * @access  Public
 */
router.get('/:id', CategoryController.getById);

/**
 * @route   POST /api/categories
 * @desc    Create new category
 * @access  Protected
 */
router.post('/', authMiddleware, CategoryController.create);

/**
 * @route   PUT /api/categories/:id
 * @desc    Update category
 * @access  Protected
 */
router.put('/:id', authMiddleware, CategoryController.update);

/**
 * @route   DELETE /api/categories/:id
 * @desc    Delete category
 * @access  Protected
 */
router.delete('/:id', authMiddleware, CategoryController.delete);

export default router;
