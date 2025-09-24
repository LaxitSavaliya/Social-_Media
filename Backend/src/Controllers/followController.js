import FollowRequest from "../Models/FollowRequest.js";
import User from "../Models/User.js";

export async function followRequest(req, res) {
    try {
        const senderId = req.user._id;
        const { userId: recipientId } = req.params;

        if (senderId.equals(recipientId)) {
            return res.status(400).json({ message: "You cannot follow yourself" });
        }

        const recipient = await User.findOne({ _id: recipientId, isOnboarded: true });
        if (!recipient) {
            return res.status(404).json({ message: "Recipient not found" });
        }

        const existingFollowRequest = await FollowRequest.findOne({
            sender: senderId,
            recipient: recipientId,
        });
        if (existingFollowRequest) {
            if (existingFollowRequest.status === "pending") {
                return res.status(409).json({ message: "Follow request already sent" });
            }
            if (existingFollowRequest.status === "accepted") {
                return res.status(409).json({ message: "You are already following this user" });
            }
            if (existingFollowRequest.status === "rejected" || existingFollowRequest.status === "removed") {
                existingFollowRequest.status = "pending";
                await existingFollowRequest.save();
                return res.status(200).json({ message: "Follow request re-sent" });
            }
        }

        const followRequest = await FollowRequest.create({
            sender: senderId,
            recipient: recipientId,
        });

        return res.status(200).json({ message: "Follow request sent", followRequest });

    } catch (error) {
        console.error("Error in followRequest controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function acceptFollowRequest(req, res) {
    try {
        const { requestId } = req.params;

        const followRequest = await FollowRequest.findById(requestId);
        if (!followRequest) {
            return res.status(404).json({ message: "Follow request not found" });
        }

        if (followRequest.recipient.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: "You are not authorized to accept this request" });
        }

        if (followRequest.status === "accepted") {
            return res.status(409).json({ message: "Follow request already accepted" });
        }

        followRequest.status = "accepted";
        await followRequest.save();

        await User.findByIdAndUpdate(followRequest.sender, {
            $addToSet: { following: followRequest.recipient },
        });

        await User.findByIdAndUpdate(followRequest.recipient, {
            $addToSet: { followers: followRequest.sender },
        });

        res.status(200).json({ message: "Follow request accepted", followRequest });

    } catch (error) {
        console.error("Error in acceptFollowRequest controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function removeFollower(req, res) {
    try {
        const { userId } = req.params;
        const currentUser = await User.findById(req.user._id);

        const user = await User.findOne({ _id: userId, isOnboarded: true });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!currentUser.followers.includes(userId)) {
            return res.status(409).json({ message: "This user is not following you" });
        }

        currentUser.followers = currentUser.followers.filter(id => id.toString() !== userId.toString());
        await currentUser.save();

        user.following = user.following.filter(id => id.toString() !== currentUser._id.toString());
        await user.save();

        await FollowRequest.deleteMany({
            sender: userId,
            recipient: currentUser._id,
        });

        res.status(200).json({ message: "User removed from your followers successfully" });

    } catch (error) {
        console.error("Error in removeFollower controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function removeOrCancelFollow(req, res) {
    try {
        const { userId } = req.params;
        const currentUser = await User.findById(req.user._id);

        if (currentUser._id.equals(userId)) {
            return res.status(400).json({ message: "You cannot perform this action on yourself" });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Case 1: Already following -> Unfollow
        if (currentUser.following.includes(userId)) {
            currentUser.following = currentUser.following.filter(id => id.toString() !== userId);
            user.followers = user.followers.filter(id => id.toString() !== currentUser._id.toString());
            await currentUser.save();
            await user.save();
            await FollowRequest.deleteMany({ sender: currentUser._id, recipient: userId });

            return res.status(200).json({ message: "User unfollowed successfully" });
        }

        // Case 2: Pending request -> Cancel
        const deletedFollowRequest = await FollowRequest.findOneAndDelete({
            sender: currentUser._id,
            recipient: userId,
        });

        if (deletedFollowRequest) {
            return res.status(200).json({ message: "Follow request canceled" });
        }

        // Neither case applies
        return res.status(409).json({ message: "No follow or request found" });

    } catch (error) {
        console.error("Error in removeOrCancelFollow", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}