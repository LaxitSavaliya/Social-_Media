import express from 'express';
import { protectRoute } from '../Middleware/authMiddleware.js';
import { getMessages } from '../Controllers/messageController.js';

const router = express.Router();

// ===== PROTECTED ROUTES =====
router.use(protectRoute);

router.get('/get-messages/:userId', getMessages);

export default router;