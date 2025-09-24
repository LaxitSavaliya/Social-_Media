import express from 'express';
import upload from '../Config/multer.js';
import { protectRoute } from '../Middleware/authMiddleware.js';
import { createPost, getPosts, getUserPosts, toggleLike } from '../Controllers/postController.js';

const router = express.Router();

router.use(protectRoute);

router.post('/create-post', upload.fields([{ name: 'image' }, { name: 'video' }]), createPost);
router.get('/get-posts', getPosts);
router.get('/get-user-posts/:postId', getUserPosts);

router.post('/:postId/like', toggleLike);

export default router;