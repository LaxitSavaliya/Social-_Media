import FollowRequest from "../Models/FollowRequest.js";
import Post from "../Models/Post.js";
import User from "../Models/User.js";
import mongoose from "mongoose";

export async function getProfileByUsername(req, res) {
    try {
        const { userName } = req.params;

        const user = await User.findOne({ userName, isOnboarded: true })
            .select('-password')
            .populate({
                path: 'followers',
                select: 'userName fullName profilePic',
            })
            .populate({
                path: 'following',
                select: 'userName fullName profilePic',
            });;
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const userPosts = await Post.find({ postedBy: user._id });

        res.json({ user, userPosts });

    } catch (error) {
        console.error('Error fetching user profile:', error.message);
        res.status(500).json({ message: 'Server error' });
    }
}

export async function getRecommendedUsers(req, res) {
    try {
        const currentUserId = req.user._id;

        const sendedFollowReqs = await FollowRequest.find({
            sender: currentUserId,
            status: "pending"
        }).select("recipient");

        const recipientIds = sendedFollowReqs.map(req => new mongoose.Types.ObjectId(req.recipient));

        const excludeIds = [
            new mongoose.Types.ObjectId(currentUserId),
            ...req.user.followers.map(id => new mongoose.Types.ObjectId(id)),
            ...req.user.following.map(id => new mongoose.Types.ObjectId(id)),
            ...recipientIds,
        ];

        const recommendedUsers = await User.aggregate([
            { $match: { _id: { $nin: excludeIds }, isOnboarded: true } },
            { $sample: { size: 4 } },
            { $project: { fullName: 1, userName: 1, profilePic: 1 } }
        ]);

        res.status(200).json(recommendedUsers);

    } catch (error) {
        console.error("Error in getRecommendedUser controller:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}

export async function getNotifications(req, res) {
    try {
        const userId = req.user._id;

        const receivedRequests = await FollowRequest.find({
            recipient: userId
        }).populate("sender", "userName profilePic").sort({ createdAt: -1 });

        const sendedRequests = await FollowRequest.find({
            sender: userId
        }).populate("recipient", "userName profilePic").sort({ createdAt: -1 });

        res.status(200).json({ receivedRequests, sendedRequests });

    } catch (error) {
        console.error("Error in getNotifications controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function fetchUsers(req, res) {
    try {
        const { name } = req.params;

        const users = await User.find({
            $or: [
                { userName: { $regex: name, $options: "i" } },
                { fullName: { $regex: name, $options: "i" } }
            ]
        }).select("userName fullName profilePic");

        res.status(200).json({ users });

    } catch (error) {
        console.error("Error in fetchUsers controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};