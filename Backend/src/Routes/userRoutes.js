import express from 'express';
import { protectRoute } from '../Middleware/authMiddleware.js';
import { fetchUsers, getNotifications, getProfileByUsername, getRecommendedUsers } from '../Controllers/userController.js';

const router = express.Router();

router.use(protectRoute);

router.get('/notifications', getNotifications);

router.get('/recommended-users', getRecommendedUsers);

router.get('/:userName', getProfileByUsername);

router.get('/fetch-users/:name', fetchUsers);

export default router;