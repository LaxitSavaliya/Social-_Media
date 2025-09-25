import User from '../Models/User.js';
import jwt from 'jsonwebtoken';
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

function generateToken(userId) {
    return jwt.sign({ userId }, process.env.JWT_SECRET_KEY, { expiresIn: '7d' });
}

function sendTokenCookie(res, token) {
    res.cookie('jwt', token, {
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
    });
}

export async function signup(req, res) {
    try {
        const { fullName, userName, email, password } = req.body;

        if (!fullName || !userName || !email || !password)
            return res.status(400).json({ message: 'All fields are required' });

        if (!/^[A-Za-z ]+$/.test(fullName)) return res.status(400).json({ message: 'FullName must contain only letters' });
        if (!/^[a-z0-9._]{3,30}$/.test(userName)) return res.status(400).json({ message: 'Invalid username' });
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ message: 'Invalid email format' });
        if (password.length < 6) return res.status(400).json({ message: 'Password must be at least 6 characters' });

        const [existingUsername, existingEmail] = await Promise.all([
            User.findOne({ userName }),
            User.findOne({ email }),
        ]);

        if (existingUsername) return res.status(400).json({ message: 'Username already exists' });
        if (existingEmail) return res.status(400).json({ message: 'Email already exists' });

        const newUser = await User.create({ fullName: fullName.trim(), userName: userName.trim(), email: email.trim(), password });
        const token = generateToken(newUser._id);
        sendTokenCookie(res, token);

        const { password: _, ...userWithoutPassword } = newUser.toObject();

        res.status(201).json({ message: 'User signed up successfully', user: userWithoutPassword });
    } catch (error) {
        console.error('Error in signup:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function login(req, res) {
    try {
        const { emailOrUserName, password } = req.body;
        if (!emailOrUserName || !password) return res.status(400).json({ message: 'All fields are required' });

        const user = await User.findOne({ $or: [{ email: emailOrUserName }, { userName: emailOrUserName }] });
        if (!user || !(await user.comparePassword(password))) return res.status(400).json({ message: 'Invalid username or password' });

        const token = generateToken(user._id);
        sendTokenCookie(res, token);

        const { password: _, ...userWithoutPassword } = user.toObject();
        res.status(200).json({ message: 'User logged in successfully', user: userWithoutPassword });
    } catch (error) {
        console.error('Error in login:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function logout(req, res) {
    try {
        res.clearCookie('jwt', { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict' });
        res.status(200).json({ message: 'User logged out successfully' });
    } catch (error) {
        console.error('Error in logout:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function onboard(req, res) {
    try {
        const userId = req.user._id;
        const { userName, fullName, bio, birthDate, gender, location } = req.body;
        const files = req.files;

        if (!userName || !fullName || !birthDate || !gender) return res.status(400).json({ message: 'Missing required fields' });

        let profilePic = '';
        if (files?.image?.[0]?.buffer) profilePic = (await uploadBuffer(files.image[0].buffer, 'users/profile', 'image')).secure_url;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ message: 'User not found' });
        if (user.userName !== userName && await User.findOne({ userName })) return res.status(400).json({ message: 'Username already exists' });

        if (!/^[A-Za-z ]+$/.test(fullName)) return res.status(400).json({ message: 'FullName must contain only letters' });
        if (!/^[a-z0-9._]{3,30}$/.test(userName)) return res.status(400).json({ message: 'Invalid username format' });

        const [day, month, year] = birthDate.split('-').map(Number);
        const dob = new Date(year, month - 1, day);
        const age = new Date().getFullYear() - dob.getFullYear() - ((new Date().getMonth() < dob.getMonth() || (new Date().getMonth() === dob.getMonth() && new Date().getDate() < dob.getDate())) ? 1 : 0);
        if (age < 18) return res.status(400).json({ message: 'User must be at least 18 years old' });

        if (!['male', 'female', 'other'].includes(gender)) return res.status(400).json({ message: 'Invalid gender' });

        const updatedUser = await User.findByIdAndUpdate(userId, { fullName, userName, profilePic, bio, birthDate, gender, location, isOnboarded: true }, { new: true, runValidators: true });
        const { password: _, ...userWithoutPassword } = updatedUser.toObject();

        res.status(200).json({ message: 'User onboarded successfully', user: userWithoutPassword });
    } catch (error) {
        console.error('Error in onboard:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}

export async function getUser(req, res) {
    try {
        const user = await User.findById(req.user._id).select('-password').populate('followers', 'userName fullName profilePic').populate('following', 'userName fullName profilePic');
        res.status(200).json({ message: 'User found', user });
    } catch (error) {
        console.error('Error in getUser:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}