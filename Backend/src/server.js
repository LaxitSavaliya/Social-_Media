import express from 'express';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './Routes/authRoutes.js';
import userRoutes from './Routes/userRoutes.js';
import postRoutes from './Routes/postRoutes.js';
import commentRoutes from './Routes/commentRoutes.js';
import followRoutes from './Routes/followRoutes.js';

import { connectDB } from './Lib/db.js';

const app = express();
const PORT = process.env.PORT || 3000;
const CORS_ORIGIN = process.env.CORS_ORIGIN || 'http://localhost:5173';

// ===== SECURITY MIDDLEWARE =====
app.use(helmet()); // Security headers
app.use(
    cors({
        origin: CORS_ORIGIN,
        credentials: true,
    })
);

app.use(express.json());
app.use(cookieParser());

// ===== LOGGER =====
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev')); // Dev-friendly logging
} else {
    app.use(morgan('combined')); // Production-friendly logging
}

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/follows', followRoutes);

// ===== 404 HANDLER =====
app.use((req, res, next) => {
    res.status(404).json({
        message: "Route not found"
    });
});

// ===== ERROR HANDLER =====
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        message: "Internal server error"
    });
});

// ===== START SERVER =====
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server is running on port http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Error starting the server:', error.message);
        process.exit(1);
    }
}

startServer();