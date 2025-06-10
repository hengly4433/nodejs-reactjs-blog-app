import express from 'express';
import LikeController from '../controllers/LikeController';
import authMiddleware from '../middlewares/authMiddleware';

const router = express.Router();

/**
 * All like routes require JWT
 */
router.use(authMiddleware);

// 1) Like a post
router.post('/posts/:postId/like', LikeController.likePost);

// 2) Unlike a post
router.delete('/posts/:postId/unlike', LikeController.unlikePost);

// 3) Get like count (and optionally paginated list)
router.get('/posts/:postId/likes', LikeController.getLikes);

// 4): Check if current user liked this post
router.get('/posts/:postId/liked', LikeController.hasUserLiked);


export default router;
