import express from 'express';
import { protectRoute } from '../Middleware/authMiddleware.js';
import { createComment, deleteComment } from '../Controllers/commentController.js';

const router = express.Router();

// ===== PROTECTED ROUTES =====
router.use(protectRoute);

router.post('/create-comment/:postId', createComment);
router.delete('/delete-comment/:commentId', deleteComment);

export default router;