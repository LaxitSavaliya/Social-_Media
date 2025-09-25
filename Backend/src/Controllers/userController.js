import FollowRequest from "../Models/FollowRequest.js";
import Post from "../Models/Post.js";
import User from "../Models/User.js";
import mongoose from "mongoose";
import cloudinary from "../Config/Cloudinary.js";
import streamifier from 'streamifier';

async function uploadBuffer(buffer, folder, resource_type) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder, resource_type },
            (error, result) => {
                if (error) reject(error);
                else resolve(result);
            }
        );
        streamifier.createReadStream(buffer).pipe(stream);
    });
}

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

export async function updateProfile(req, res) {
    try {
        const { userId } = req.params;
        const currentUserId = req.user._id;
        const { userName, fullName, bio, birthDate, gender, location, removeProfilePic } = req.body;
        const files = req.files;

        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        if (userId.toString() !== currentUserId.toString()) {
            return res.status(403).json({ message: "You are not authorized to update this profile" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Validation checks (same as before)
        const missingFields = [];
        if (!userName) missingFields.push("userName");
        if (!fullName) missingFields.push("fullName");
        if (!birthDate) missingFields.push("birthDate");
        if (!gender) missingFields.push("gender");

        if (missingFields.length > 0) {
            return res.status(400).json({ message: `Missing fields: ${missingFields.join(", ")}` });
        }

        const usernameRegex = /^[a-z0-9._]{3,30}$/;
        if (!usernameRegex.test(userName)) {
            return res.status(400).json({ message: "Invalid username. Use 3-30 chars: a-z, 0-9, ., _ only." });
        }

        if (user.userName !== userName) {
            const existingUsername = await User.findOne({ userName });
            if (existingUsername) {
                return res.status(400).json({ message: "Username already exists" });
            }
        }

        const regexName = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
        if (!regexName.test(fullName)) {
            return res.status(400).json({ message: "FullName must contain only letters" });
        }

        const regex = /^([0-2][0-9]|(3)[0-1])-([0][1-9]|1[0-2])-\d{4}$/;
        if (!regex.test(birthDate)) {
            return res.status(400).json({ message: "Invalid birth date format. Please use DD-MM-YYYY." });
        }

        const [day, month, year] = birthDate.split("-");
        const dob = new Date(+year, +month - 1, +day);
        const currentDate = new Date();
        let age = currentDate.getFullYear() - dob.getFullYear();
        const monthDiff = currentDate.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < dob.getDate())) age--;
        if (age < 18) return res.status(400).json({ message: "User must be at least 18 years old" });

        if (!['male', 'female', 'other'].includes(gender)) {
            return res.status(400).json({ message: "Invalid gender. Please choose 'male', 'female', or 'other'." });
        }

        let profilePic = user.profilePic;

        // Remove profile pic if requested
        if (removeProfilePic === 'true' && user.profilePic) {
            try {
                const publicId = user.profilePic.split("/").slice(-1)[0].split(".")[0];
                await cloudinary.uploader.destroy(`users/profile/${publicId}`);
                profilePic = "";
            } catch (deleteError) {
                console.error("Cloudinary delete failed:", deleteError.message);
            }
        }

        // Upload new profile pic if provided
        if (files && files.image) {
            try {
                if (user.profilePic && user.profilePic !== "") {
                    const publicId = user.profilePic.split("/").slice(-1)[0].split(".")[0];
                    await cloudinary.uploader.destroy(`users/profile/${publicId}`);
                }
                const result = await uploadBuffer(files.image[0].buffer, 'users/profile', 'image');
                profilePic = result.secure_url;
            } catch (uploadError) {
                console.error("Cloudinary upload failed:", uploadError.message);
                return res.status(400).json({ message: "File upload failed. Please try again." });
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { fullName, userName, profilePic, bio, birthDate, gender, location, isOnboarded: true },
            { new: true, runValidators: true }
        );

        const { password: _, ...userWithoutPassword } = updatedUser.toObject();
        res.status(200).json({ message: "Profile updated successfully", user: userWithoutPassword });

    } catch (error) {
        console.error("Error in updateProfile controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}