import jwt from 'jsonwebtoken';
import User from '../Models/User.js';

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies?.jwt || req.header("Authorization")?.replace("Bearer ", "");

        if (!token) {
            return res.status(401).json({ message: "Not authorized, No token provided" })
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

        req.user = await User.findById(decoded.userId).select("-password");

        if (!req.user) {
            return res.status(401).json({ message: "Not authorized, User not found" });
        }

        next();

    } catch (error) {
        console.error("Error in protectRoute middleware", error.message);

        if (error instanceof jwt.TokenExpiredError) {
            return res.status(401).json({ message: "Unauthorized: Token has expired." });
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ message: "Unauthorized: Invalid token." });
        }

        res.status(500).json({ message: "Internal Server Error" });
    }
}