import express from 'express';
import upload from '../Config/multer.js';
import { protectRoute } from '../Middleware/authMiddleware.js';
import { signup, login, logout, onboard, getUser } from '../Controllers/authController.js';

const router = express.Router();

// ===== PUBLIC ROUTES =====
router.post('/signup', signup);
router.post('/login', login);
router.post('/logout', logout);

// ===== PROTECTED ROUTES =====
router.post('/onboard', protectRoute, upload.fields([{ name: 'image' }, { name: 'video' }]), onboard);
router.get('/user', protectRoute, getUser);

export default router;