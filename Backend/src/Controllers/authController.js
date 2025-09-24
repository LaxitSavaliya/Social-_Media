import User from '../Models/User.js';
import jwt from 'jsonwebtoken';
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

export async function signup(req, res) {
    try {
        const { fullName, userName, email, password } = req.body;

        if (!fullName || !userName || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const regex = /^[A-Za-z]+(?: [A-Za-z]+)*$/;
        if (!regex.test(fullName)) {
            return res.status(400).json({ message: "FullName must contain only letters" });
        }

        const usernameRegex = /^[a-z0-9._]{3,30}$/;
        if (!usernameRegex.test(userName)) {
            return res.status(400).json({ message: "Invalid username. Use 3-30 chars: a-z, 0-9, ., _ only." });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ message: "Invalid email format" });
        }

        if (password.length < 6) {
            return res.status(400).json({ message: "Password must be at least 6 characters long" });
        }

        const existingUsername = await User.findOne({ userName });
        if (existingUsername) {
            return res.status(400).json({ message: "Username already exists" });
        }

        const existingEmail = await User.findOne({ email });
        if (existingEmail) {
            return res.status(400).json({ message: "Email already exists" });
        }

        const newUser = await User.create({
            fullName: fullName.trim(),
            userName: userName.trim(),
            email: email.trim(),
            password
        });

        const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: '7d'
        });

        res.cookie('jwt', token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        const { password: _, ...userWithoutPassword } = newUser.toObject();

        res.status(201).json({
            message: "User signed up successfully",
            user: userWithoutPassword
        });

    } catch (error) {
        console.error("Error in signup controller", error.message);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}

export async function login(req, res) {
    try {
        const { emailOrUserName, password } = req.body;

        if (!emailOrUserName || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({
            $or: [{ email: emailOrUserName }, { userName: emailOrUserName }],
        });

        if (!user) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: "Invalid username or password" });
        }

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: '7d'
        });

        res.cookie('jwt', token, {
            maxAge: 7 * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });

        const { password: _, ...userWithoutPassword } = user.toObject();

        res.status(200).json({
            message: "User logged in successfully",
            user: userWithoutPassword
        });

    } catch (error) {
        console.error("Error in login controller", error.message);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}

export async function logout(req, res) {
    try {
        res.clearCookie('jwt', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
        res.status(200).json({
            message: "User logged out successfully"
        });
    } catch (error) {
        console.error("Error in logout controller", error.message);
        res.status(500).json({
            message: "Internal server error"
        });
    }
}

export async function onboard(req, res) {
    try {
        const userId = req.user._id;
        const { userName, fullName, bio, birthDate, gender, location } = req.body;
        const files = req.files;

        let profilePic = '';

        if (files && files.image) {
            try {
                const result = await uploadBuffer(files.image[0].buffer, 'users/profile', 'image');
                profilePic = result.secure_url;
            } catch (uploadError) {
                console.error("Cloudinary upload failed:", uploadError.message);
                return res.status(400).json({ message: "File upload failed. Please try again." });
            }
        }


        if (!req.user || !req.user._id) {
            return res.status(401).json({ message: "Unauthorized" });
        }

        const missingFields = [];
        if (!userName) missingFields.push("userName");
        if (!fullName) missingFields.push("firstName");
        if (!birthDate) missingFields.push("birthDate");
        if (!gender) missingFields.push("gender");

        if (missingFields.length > 0) {
            return res.status(400).json({ message: `Missing fields: ${missingFields.join(", ")}` });
        }

        const usernameRegex = /^[a-z0-9._]{3,30}$/;
        if (!usernameRegex.test(userName)) {
            return res.status(400).json({ message: "Invalid username. Use 3-30 chars: a-z, 0-9, ., _ only." });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
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
        const dayNum = parseInt(day, 10);
        const monthNum = parseInt(month, 10);
        const yearNum = parseInt(year, 10);

        // Check if date is valid (e.g., no February 31st)
        const isValidDate = function (d, m, y) {
            const daysInMonth = [31, (isLeapYear(y) ? 29 : 28), 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
            return m >= 1 && m <= 12 && d > 0 && d <= daysInMonth[m - 1];
        };

        const isLeapYear = function (y) {
            return (y % 4 === 0 && y % 100 !== 0) || (y % 400 === 0);
        };

        if (!isValidDate(dayNum, monthNum, yearNum)) {
            return res.status(400).json({ message: "Invalid birth date. Please enter a valid date." });
        }

        const dob = new Date(yearNum, monthNum - 1, dayNum);
        if (isNaN(dob.getTime())) {
            return res.status(400).json({ message: "Invalid birth date." });
        }

        const currentDate = new Date();
        let age = currentDate.getFullYear() - dob.getFullYear();
        const monthDiff = currentDate.getMonth() - dob.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && currentDate.getDate() < dob.getDate())) {
            age--;
        }
        if (age < 18) {
            return res.status(400).json({ message: "User must be at least 18 years old" });
        }

        if (gender !== 'male' && gender !== 'female' && gender !== 'other') {
            return res.status(400).json({ message: "Invalid gender. Please choose 'male', 'female', or 'other'." });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                fullName: fullName,
                userName: userName,
                profilePic,
                bio: bio,
                birthDate,
                gender,
                location: location,
                isOnboarded: true
            },
            { new: true, runValidators: true }
        );

        const { password: _, ...userWithoutPassword } = updatedUser.toObject();

        res.status(200).json({
            message: "User onboarded successfully",
            user: userWithoutPassword
        });

    } catch (error) {
        console.error("Error in onboard controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}

export async function getUser(req, res) {
    try {
        const user = await User.findById(req.user._id)
            .select("-password")
            .populate({
                path: 'followers',
                select: 'userName fullName profilePic',
            })
            .populate({
                path: 'following',
                select: 'userName fullName profilePic',
            });

        res.status(200).json({
            message: "User found",
            user,
        });

    } catch (error) {
        console.error("Error in getUser controller", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
}