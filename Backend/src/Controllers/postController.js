import Post from '../Models/Post.js';
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

export async function createPost(req, res) {
    try {
        const { content } = req.body;
        const files = req.files;

        if (!files?.image && !files?.video) return res.status(400).json({ message: 'Post cannot be empty. Add image or video.' });

        const imageUrl = files?.image ? (await uploadBuffer(files.image[0].buffer, 'posts/images', 'image')).secure_url : '';
        const videoUrl = files?.video ? (await uploadBuffer(files.video[0].buffer, 'posts/videos', 'video')).secure_url : '';

        const newPost = await Post.create({ postedBy: req.user._id, content, image: imageUrl, video: videoUrl });

        res.status(201).json({ message: 'Post created successfully', post: newPost });
    } catch (error) {
        console.error('Error in createPost:', error.message);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

export async function getPosts(req, res) {
    try {
        const friendsIds = [...req.user.followers, ...req.user.following].map(f => f._id.toString());

        const posts = await Post.find({ postedBy: { $in: friendsIds } })
            .populate({
                path: 'comments',
                select: 'content createdAt author',
                populate: {
                    path: 'author',
                    select: 'userName profilePic',
                },
            })
            .populate({
                path: 'likes',
                select: 'userName profilePic fullName',
            })
            .populate('postedBy', 'userName profilePic')
            .sort({ createdAt: -1 });

        const otherPosts = await Post.find({ postedBy: { $nin: friendsIds } })
            .populate({
                path: 'comments',
                select: 'content createdAt author',
                populate: {
                    path: 'author',
                    select: 'userName profilePic',
                },
            })
            .populate({
                path: 'likes',
                select: 'userName profilePic fullName',
            })
            .populate('postedBy', 'userName profilePic')
            .sort({ createdAt: -1 });

        res.status(200).json({ message: 'Posts fetched successfully', posts, otherPosts });
    } catch (error) {
        console.error('Error in getPosts:', error.message);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

export async function getUserPosts(req, res) {
    try {
        const { postId } = req.params;
        const post = await Post.findById(postId)
            .populate({
                path: 'comments',
                select: 'content createdAt author',
                populate: {
                    path: 'author',
                    select: 'userName profilePic',
                },
            })
            .populate({
                path: 'likes',
                select: 'userName profilePic fullName',
            })
            .populate('postedBy', 'userName profilePic');

        if (!post) return res.status(404).json({ message: 'Post not found' });

        const userPosts = await Post.find({ postedBy: post.postedBy, _id: { $ne: post._id } }).sort({ createdAt: -1 }).limit(6);

        res.status(200).json({ message: 'Posts fetched successfully', post, userPosts });
    } catch (error) {
        console.error('Error in getUserPosts:', error.message);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

export async function toggleLike(req, res) {
    try {
        const { postId } = req.params;
        const userId = req.user._id;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        if (post.likes.includes(userId)) post.likes.pull(userId);
        else post.likes.addToSet(userId);

        await post.save();
        res.status(200).json({ message: post.likes.includes(userId) ? 'Post liked' : 'Post unliked', likes: post.likes });
    } catch (error) {
        console.error('Error in toggleLike:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}