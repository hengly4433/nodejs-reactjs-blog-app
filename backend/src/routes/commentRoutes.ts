import express from 'express';
import CommentController from '../controllers/CommentController';
import authMiddleware from '../middlewares/authMiddleware';

const router = express.Router();

/**
 * All comment routes require a valid JWT (populates req.user)
 */
router.use(authMiddleware);

// 1) Create a comment on a specific post
router.post('/posts/:postId/comments', CommentController.create);

// 2) Get all comments for a specific post
router.get('/posts/:postId/comments', CommentController.getByPost);

// 3) Update a comment by its ID
router.put('/comments/:id', CommentController.update);

// 4) Delete a comment by its ID
router.delete('/comments/:id', CommentController.delete);

export default router;
