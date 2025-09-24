import express from 'express';
import { protectRoute } from '../Middleware/authMiddleware.js';
import { acceptFollowRequest, followRequest, removeFollower, removeOrCancelFollow } from '../Controllers/followController.js';

const router = express.Router();

router.use(protectRoute);

router.post('/follow-request/:userId', followRequest);

router.put('/follow-request/:requestId/accept', acceptFollowRequest);
router.delete('/follow-request/:userId/removeOrCancelFollow', removeOrCancelFollow);

router.post('/remove-follower/:userId', removeFollower);

export default router;