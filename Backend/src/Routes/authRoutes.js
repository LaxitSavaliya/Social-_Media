import express from 'express';
import upload from '../Config/multer.js';
import { protectRoute } from '../Middleware/authMiddleware.js';
import { getUser, login, logout, onboard, signup } from '../Controllers/authController.js';

const router = express.Router();

router.post('/signup', signup);

router.post('/login', login);

router.post('/logout', logout);

router.post('/onboard', protectRoute, upload.fields([{ name: 'image' }, { name: 'video' }]), onboard);

router.get('/user', protectRoute, getUser);

export default router;