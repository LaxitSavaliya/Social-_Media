import express from 'express';
import upload from '../Config/multer.js';
import { protectRoute } from '../Middleware/authMiddleware.js';
import { fetchUsers, getNotifications, getProfileByUsername, getRecommendedUsers, updateProfile } from '../Controllers/userController.js';

const router = express.Router();

// ===== PROTECTED ROUTES =====
router.use(protectRoute);

router.get('/notifications', getNotifications);
router.get('/recommended-users', getRecommendedUsers);
router.get('/:userName', getProfileByUsername);
router.get('/fetch-users/:name', fetchUsers);
router.patch('/update-profile/:userId', upload.fields([{ name: 'image' }, { name: 'video' }]), updateProfile);

export default router;