import { useParams } from "react-router";
import { getChatData } from "../Lib/api";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { io } from "socket.io-client";
import { Ellipsis, EllipsisVertical, Phone, SendHorizonal, User, Video } from "lucide-react";

const socket = io("http://localhost:3000");

const ChatBox = ({ currentUser }) => {

    const { userId } = useParams();
    const [text, setText] = useState("");
    const [messages, setMessages] = useState([]);
    const bottomRef = useRef(null);

    const { data: chatData, isLoading } = useQuery({
        queryKey: ["chat", userId],
        queryFn: () => getChatData(userId),
        enabled: !!userId,
    });

    useEffect(() => {
        if (chatData?.message.length) {
            setMessages(chatData?.message);
        } else {
            setMessages([]);
        }
    }, [chatData]);

    useEffect(() => {
        if (!currentUser?._id) return;

        socket.emit("join", currentUser._id);

        const receiveHandler = (msg) => {
            const senderId = msg.sender?._id || msg.sender;
            const recipientId = msg.recipient?._id || msg.recipient;

            if (senderId === userId || recipientId === userId) {
                setMessages((prev) => {
                    if (prev.some((m) => m._id === msg._id)) return prev;
                    return [...prev, msg];
                });
            }
        };

        socket.on("receiveMessage", receiveHandler);
        socket.on("messageSent", receiveHandler);

        return () => {
            socket.off("receiveMessage", receiveHandler);
            socket.off("messageSent", receiveHandler);
        };
    }, [currentUser._id, userId]);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = (e) => {
        e.preventDefault();
        if (!text.trim()) return;

        socket.emit("sendMessage", {
            sender: currentUser._id,
            recipient: userId,
            text,
        });

        setText("");
    };

    const formatDate = (dateStr) => {
        const date = new Date(dateStr);
        const now = new Date();
        if (
            date.getFullYear() === now.getFullYear() &&
            date.getMonth() === now.getMonth() &&
            date.getDate() === now.getDate()
        ) {
            return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        } else {
            return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
        }
    };


    return (
        <>
            {/* Chat Header */}
            <header className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
                <div className="flex items-center gap-4">
                    <div
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-12 w-12"
                        style={{ backgroundImage: `url(${chatData?.user.profilePic || ""})` }}
                    />
                    <div>
                        <h2 className="text-gray-800 text-lg font-bold">
                            {chatData?.user.fullName || "User"}
                        </h2>
                        <p className="text-green-500 text-sm">Online</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="bg-gray-200 p-2 rounded-full cursor-pointer hover:bg-green-200">
                        <Phone />
                    </button>
                    <button className="bg-gray-200 p-2 rounded-full cursor-pointer hover:bg-blue-200">
                        <Video />
                    </button>
                    <button className="bg-gray-200 p-2 rounded-full cursor-pointer hover:bg-gray-300">
                        <EllipsisVertical />
                    </button>
                </div>
            </header>

            {/* Chat Messages */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-gray-50 scrollbar-hide">
                {messages.map((msg) => {
                    const isSentByUser = (msg.sender?._id || msg.sender) === currentUser._id;
                    return (
                        <div
                            key={msg._id}
                            className={`flex gap-3 ${isSentByUser ? "justify-end items-end" : "justify-start items-start"}`}
                        >
                            {!isSentByUser && (
                                <div
                                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-10 w-10"
                                    style={{ backgroundImage: `url(${chatData?.user.profilePic || ""})` }}
                                />
                            )}
                            <div
                                className={`flex p-2 gap-3 rounded-2xl max-w-xs sm:max-w-md ${isSentByUser
                                    ? "bg-blue-500 rounded-br-none text-white"
                                    : "bg-gray-200 rounded-tl-none"
                                    }`}
                            >
                                <span className="text-[15px] p-0.5">{msg.text}</span>
                                <span className={`text-[11px] self-end ${isSentByUser ? "text-gray-300" : "text-gray-500"}`}>{formatDate(msg.createdAt).toLocaleUpperCase()}</span>
                            </div>
                            {isSentByUser && (
                                <div
                                    className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-10 w-10"
                                    style={{ backgroundImage: `url(${currentUser?.profilePic || ""})` }}
                                />
                            )}
                        </div>
                    );
                })}
                <div ref={bottomRef}></div>
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
                <form onSubmit={handleSend} className="flex items-center gap-3">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="flex-1 px-4 py-2 rounded-full bg-gray-100 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 text-white rounded-full h-10 w-10 flex items-center justify-center hover:bg-blue-600 transition-colors"
                    >
                        <span className="material-symbols-outlined"><SendHorizonal className="size-5" /></span>
                    </button>
                </form>
            </div>
        </>
    )
}

export default ChatBox;