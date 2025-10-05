import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

const OnlineUsersContext = createContext();

export const OnlineUsersProvider = ({ children, currentUser }) => {
    const [onlineUsers, setOnlineUsers] = useState([]);
    const [socket, setSocket] = useState(null);

    useEffect(() => {
        if (!currentUser?._id) return;

        const newSocket = io("http://localhost:3000");
        setSocket(newSocket);

        // Join the socket room
        newSocket.emit("join", currentUser._id);

        // Listen for online users updates
        const onlineHandler = (users) => setOnlineUsers(users);
        newSocket.on("onlineUsers", onlineHandler);

        return () => {
            newSocket.off("onlineUsers", onlineHandler);
            newSocket.disconnect();
        };
    }, [currentUser?._id]);

    return (
        <OnlineUsersContext.Provider value={{ currentUser, onlineUsers, socket }}>
            {children}
        </OnlineUsersContext.Provider>
    );
};

// Custom hook for easier usage
export const useOnlineUsers = () => useContext(OnlineUsersContext);