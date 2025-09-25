import FollowRequest from '../Models/FollowRequest.js';
import User from '../Models/User.js';

export async function followRequest(req, res) {
    try {
        const senderId = req.user._id;
        const { userId: recipientId } = req.params;

        if (senderId.equals(recipientId)) return res.status(400).json({ message: 'You cannot follow yourself' });

        const recipient = await User.findOne({ _id: recipientId, isOnboarded: true });
        if (!recipient) return res.status(404).json({ message: 'Recipient not found' });

        const existing = await FollowRequest.findOne({ sender: senderId, recipient: recipientId });
        if (existing) {
            if (existing.status === 'pending') return res.status(409).json({ message: 'Follow request already sent' });
            if (existing.status === 'accepted') return res.status(409).json({ message: 'You are already following this user' });
            existing.status = 'pending';
            await existing.save();
            return res.status(200).json({ message: 'Follow request re-sent' });
        }

        const followReq = await FollowRequest.create({ sender: senderId, recipient: recipientId });
        return res.status(200).json({ message: 'Follow request sent', followRequest: followReq });
    } catch (error) {
        console.error('Error in followRequest:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function acceptFollowRequest(req, res) {
    try {
        const { requestId } = req.params;
        const followReq = await FollowRequest.findById(requestId);
        if (!followReq) return res.status(404).json({ message: 'Follow request not found' });
        if (followReq.recipient.toString() !== req.user._id.toString()) return res.status(403).json({ message: 'Not authorized' });
        if (followReq.status === 'accepted') return res.status(409).json({ message: 'Already accepted' });

        followReq.status = 'accepted';
        await followReq.save();

        await User.findByIdAndUpdate(followReq.sender, { $addToSet: { following: followReq.recipient } });
        await User.findByIdAndUpdate(followReq.recipient, { $addToSet: { followers: followReq.sender } });

        res.status(200).json({ message: 'Follow request accepted', followRequest: followReq });
    } catch (error) {
        console.error('Error in acceptFollowRequest:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function removeFollower(req, res) {
    try {
        const { userId } = req.params;
        const currentUser = await User.findById(req.user._id);
        const user = await User.findOne({ _id: userId, isOnboarded: true });
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!currentUser.followers.includes(userId)) return res.status(409).json({ message: 'This user is not following you' });

        currentUser.followers = currentUser.followers.filter(id => id.toString() !== userId.toString());
        user.following = user.following.filter(id => id.toString() !== currentUser._id.toString());
        await currentUser.save();
        await user.save();

        await FollowRequest.deleteMany({ sender: userId, recipient: currentUser._id });
        res.status(200).json({ message: 'User removed from your followers successfully' });
    } catch (error) {
        console.error('Error in removeFollower:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function removeOrCancelFollow(req, res) {
    try {
        const { userId } = req.params;
        const currentUser = await User.findById(req.user._id);
        if (currentUser._id.equals(userId)) return res.status(400).json({ message: 'Cannot perform this action on yourself' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (currentUser.following.includes(userId)) {
            currentUser.following = currentUser.following.filter(id => id.toString() !== userId);
            user.followers = user.followers.filter(id => id.toString() !== currentUser._id.toString());
            await currentUser.save();
            await user.save();
            await FollowRequest.deleteMany({ sender: currentUser._id, recipient: userId });
            return res.status(200).json({ message: 'User unfollowed successfully' });
        }

        const deletedReq = await FollowRequest.findOneAndDelete({ sender: currentUser._id, recipient: userId });
        if (deletedReq) return res.status(200).json({ message: 'Follow request canceled' });

        res.status(409).json({ message: 'No follow or request found' });
    } catch (error) {
        console.error('Error in removeOrCancelFollow:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}