import FollowRequest from '../Models/FollowRequest.js';
import Post from '../Models/Post.js';
import User from '../Models/User.js';
import mongoose from 'mongoose';
import cloudinary from '../Config/Cloudinary.js';
import streamifier from 'streamifier';

async function uploadBuffer(buffer, folder, resource_type) {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream({ folder, resource_type }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
        });
        streamifier.createReadStream(buffer).pipe(stream);
    });
}

export async function getProfileByUsername(req, res) {
    try {
        const { userName } = req.params;
        const user = await User.findOne({ userName, isOnboarded: true })
            .select('-password')
            .populate('followers', 'userName fullName profilePic')
            .populate('following', 'userName fullName profilePic');

        if (!user) return res.status(404).json({ message: 'User not found' });

        const userPosts = await Post.find({ postedBy: user._id });
        res.status(200).json({ user, userPosts });
    } catch (error) {
        console.error('Error in getProfileByUsername:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function getRecommendedUsers(req, res) {
    try {
        const currentUserId = req.user._id;
        const sendedFollowReqs = await FollowRequest.find({ sender: currentUserId, status: 'pending' }).select('recipient');
        const excludeIds = [
            new mongoose.Types.ObjectId(currentUserId),
            ...req.user.followers.map(id => new mongoose.Types.ObjectId(id)),
            ...req.user.following.map(id => new mongoose.Types.ObjectId(id)),
            ...sendedFollowReqs.map(req => new mongoose.Types.ObjectId(req.recipient))
        ];

        const recommendedUsers = await User.aggregate([
            { $match: { _id: { $nin: excludeIds }, isOnboarded: true } },
            { $sample: { size: 4 } },
            { $project: { fullName: 1, userName: 1, profilePic: 1 } }
        ]);

        res.status(200).json(recommendedUsers);
    } catch (error) {
        console.error('Error in getRecommendedUsers:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function getNotifications(req, res) {
    try {
        const userId = req.user._id;
        const [receivedRequests, sendedRequests] = await Promise.all([
            FollowRequest.find({ recipient: userId }).populate('sender', 'userName profilePic').sort({ createdAt: -1 }),
            FollowRequest.find({ sender: userId }).populate('recipient', 'userName profilePic').sort({ createdAt: -1 })
        ]);

        res.status(200).json({ receivedRequests, sendedRequests });
    } catch (error) {
        console.error('Error in getNotifications:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function fetchUsers(req, res) {
    try {
        const { name } = req.params;
        const users = await User.find({
            $or: [
                { userName: { $regex: name, $options: 'i' } },
                { fullName: { $regex: name, $options: 'i' } }
            ]
        }).select('userName fullName profilePic');

        res.status(200).json({ users });
    } catch (error) {
        console.error('Error in fetchUsers:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function updateProfile(req, res) {
    try {
        const { userId } = req.params;
        const currentUserId = req.user._id;
        const { userName, fullName, bio, birthDate, gender, location, removeProfilePic } = req.body;
        const files = req.files;

        if (!req.user || userId.toString() !== currentUserId.toString()) return res.status(403).json({ message: 'Unauthorized' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (!userName || !fullName || !birthDate || !gender) return res.status(400).json({ message: 'Missing required fields' });

        if (!/^[a-z0-9._]{3,30}$/.test(userName)) return res.status(400).json({ message: 'Invalid username format' });
        if (!/^[A-Za-z ]+$/.test(fullName)) return res.status(400).json({ message: 'FullName must contain only letters' });
        if (!['male', 'female', 'other'].includes(gender)) return res.status(400).json({ message: 'Invalid gender' });

        if (user.userName !== userName && await User.findOne({ userName })) return res.status(400).json({ message: 'Username already exists' });

        const [day, month, year] = birthDate.split('-').map(Number);
        const dob = new Date(year, month - 1, day);
        let age = new Date().getFullYear() - dob.getFullYear() - ((new Date().getMonth() < dob.getMonth() || (new Date().getMonth() === dob.getMonth() && new Date().getDate() < dob.getDate())) ? 1 : 0);
        if (age < 18) return res.status(400).json({ message: 'User must be at least 18 years old' });

        let profilePic = user.profilePic;

        if (removeProfilePic === 'true' && profilePic) {
            try { const publicId = profilePic.split('/').slice(-1)[0].split('.')[0]; await cloudinary.uploader.destroy(`users/profile/${publicId}`); profilePic = ''; } catch (err) { console.error('Cloudinary delete failed:', err.message); }
        }

        if (files?.image?.[0]?.buffer) {
            try {
                if (profilePic) {
                    const publicId = profilePic.split('/').slice(-1)[0].split('.')[0];
                    await cloudinary.uploader.destroy(`users/profile/${publicId}`);
                }
                profilePic = (await uploadBuffer(files.image[0].buffer, 'users/profile', 'image')).secure_url;
            } catch (err) {
                console.error('Cloudinary upload failed:', err.message);
                return res.status(400).json({ message: 'File upload failed' });
            }
        }

        const updatedUser = await User.findByIdAndUpdate(userId, { fullName, userName, profilePic, bio, birthDate, gender, location, isOnboarded: true }, { new: true, runValidators: true });
        const { password, ...userWithoutPassword } = updatedUser.toObject();

        res.status(200).json({ message: 'Profile updated successfully', user: userWithoutPassword });
    } catch (error) {
        console.error('Error in updateProfile:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}