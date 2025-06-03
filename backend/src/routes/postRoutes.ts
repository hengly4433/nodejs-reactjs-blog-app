// src/routes/postRoutes.ts
import { Router } from 'express';
import PostController from '../controllers/PostController';
import authMiddleware from '../middlewares/authMiddleware';

const router = Router();

/**
 * @route   GET /api/posts
 * @desc    Get all posts (paginated)
 * @access  Public
 */
router.get('/', PostController.getAll);

/**
 * @route   GET /api/posts/:id
 * @desc    Get single post
 * @access  Public
 */
router.get('/:id', PostController.getById);

/**
 * @route   POST /api/posts
 * @desc    Create a post
 * @access  Protected
 */
router.post('/', authMiddleware, PostController.create);

/**
 * @route   PUT /api/posts/:id
 * @desc    Update a post
 * @access  Protected
 */
router.put('/:id', authMiddleware, PostController.update);

/**
 * @route   DELETE /api/posts/:id
 * @desc    Delete a post
 * @access  Protected
 */
router.delete('/:id', authMiddleware, PostController.delete);

export default router;
