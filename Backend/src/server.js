// Social_Media/Backend/src/server.js
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

// ===== MIDDLEWARE =====
app.use(helmet()); // Security headers
app.use(
    cors({
        origin: CORS_ORIGIN,
        credentials: true,
    })
);

app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies
app.use(cookieParser()); // Parse cookies

// ===== LOGGER =====
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
} else {
    app.use(morgan('combined'));
}

// ===== ROUTES =====
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/follows', followRoutes);

// ===== 404 HANDLER =====
app.use((req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// ===== ERROR HANDLER =====
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
    });
});

// ===== START SERVER =====
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();