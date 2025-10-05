// Social_Media/Backend/src/server.js
import express from 'express';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import http from 'http';
import { Server, Socket } from 'socket.io';

import authRoutes from './Routes/authRoutes.js';
import userRoutes from './Routes/userRoutes.js';
import postRoutes from './Routes/postRoutes.js';
import commentRoutes from './Routes/commentRoutes.js';
import followRoutes from './Routes/followRoutes.js';
import messageRoutes from './Routes/messageRoutes.js';

import { connectDB } from './Lib/db.js';
import Message from './Models/Message.js';

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
app.use('/api/messages', messageRoutes);

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

const onlineUsers = new Map(); // key: userId, value: socketId(s)

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: CORS_ORIGIN,
        credentials: true,
    }
});

io.on('connection', (socket) => {
    console.log('🔌 User connected:', socket.id);

    socket.on('join', (userId) => {
        socket.join(userId);

        // Track online users
        if (onlineUsers.has(userId)) {
            onlineUsers.get(userId).add(socket.id);
        } else {
            onlineUsers.set(userId, new Set([socket.id]));
        }

        console.log(`✅ User ${userId} joined. Online users:`, Array.from(onlineUsers.keys()));

        // Send online users list to all clients
        io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    });

    socket.on('sendMessage', async ({ sender, recipient, text }) => {
        try {
            const message = await Message.create({ sender, recipient, text });

            io.to(recipient).emit('receiveMessage', message);
            io.to(sender).emit('messageSent', message);

        } catch (error) {
            console.error('❌ Error saving message:', error.message);
        }
    });

    socket.on('disconnect', () => {
        console.log('❌ User disconnected:', socket.id);

        // Remove socket from online users
        for (const [userId, sockets] of onlineUsers.entries()) {
            if (sockets.has(socket.id)) {
                sockets.delete(socket.id);
                if (sockets.size === 0) {
                    onlineUsers.delete(userId);
                }
            }
        }

        // Update all clients
        io.emit('onlineUsers', Array.from(onlineUsers.keys()));
    });
});

// ===== START SERVER =====
const startServer = async () => {
    try {
        await connectDB();
        server.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();