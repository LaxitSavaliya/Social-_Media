import { useParams } from "react-router";
import { getChatData } from "../Lib/api";
import { useQuery } from "@tanstack/react-query";
import React, { useEffect, useRef, useState } from "react";

import { io } from "socket.io-client";
import { EllipsisVertical, Phone, SendHorizonal, User, Video } from "lucide-react";

const socket = io("http://localhost:3000");

const ChatBox = ({ currentUser, onlineUsers }) => {

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

    const formatTime = (dateStr) => {
        const date = new Date(dateStr);
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }).toLocaleUpperCase();
    };

    const getDayLabel = (dateStr) => {
        const date = new Date(dateStr);
        const today = new Date();

        const isToday =
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();

        const yesterday = new Date();
        yesterday.setDate(today.getDate() - 1);
        const isYesterday =
            date.getDate() === yesterday.getDate() &&
            date.getMonth() === yesterday.getMonth() &&
            date.getFullYear() === yesterday.getFullYear();

        if (isToday) return "Today";
        if (isYesterday) return "Yesterday";

        const diffInDays = Math.floor(
            (today - date) / (1000 * 60 * 60 * 24)
        );

        // If within last 7 days → show weekday (e.g. Monday)
        if (diffInDays < 7) {
            return date.toLocaleDateString([], { weekday: "long" });
        }

        // Else → show "October 02, 2025"
        return date.toLocaleDateString([], {
            month: "long",
            day: "2-digit",
            year: "numeric",
        });
    };

    const isUserOnline = (userId) => onlineUsers.includes(userId);


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
                        {isUserOnline(chatData?.user?._id) ? (
                            <p className="text-green-500 text-sm">Online</p>
                        ) : (
                            <p className="text-gray-500 text-sm">Offline</p>
                        )}
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="bg-gray-100 hover:text-green-600 transition-colors p-2 rounded-full hover:bg-gray-200 cursor-pointer">
                        <Phone size={20} />
                    </button>
                    <button className="bg-gray-100 hover:text-blue-600 transition-colors p-2 rounded-full hover:bg-gray-200 cursor-pointer">
                        <Video size={20} />
                    </button>
                    <button className="bg-gray-100 hover:text-gray-800 transition-colors p-2 rounded-full hover:bg-gray-200 cursor-pointer">
                        <EllipsisVertical size={20} />
                    </button>
                </div>
            </header>

            {/* Chat Messages */}
            <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-4 bg-gray-50 scrollbar-hide">
                {messages.map((msg, index) => {
                    const isSentByUser = (msg.sender?._id || msg.sender) === currentUser._id;
                    const currentDay = getDayLabel(msg.createdAt);
                    const prevDay = index > 0 ? getDayLabel(messages[index - 1].createdAt) : null;
                    const showDayLabel = currentDay !== prevDay;

                    return (
                        <React.Fragment key={msg._id}>
                            {showDayLabel && (
                                <div className="text-center text-gray-600 text-xs my-2 font-medium">
                                    {currentDay}
                                </div>
                            )}

                            <div
                                className={`flex gap-3 w-full ${isSentByUser ? "justify-end" : "justify-start"}`}
                            >
                                {!isSentByUser && (
                                    <div
                                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-6 w-6"
                                        style={{ backgroundImage: `url(${chatData?.user.profilePic || ""})` }}
                                    />
                                )}

                                <div
                                    className={`relative max-w-[80%] sm:max-w-[65%] px-3 py-2 rounded-2xl text-[15px] leading-tight break-words whitespace-pre-wrap ${isSentByUser
                                        ? "rounded-br-none bg-blue-500 text-white"
                                        : "rounded-tl-none bg-gray-200"
                                        }`}
                                >
                                    <span>{msg.text}</span>
                                    <span
                                        className={`block text-[11px] mt-1 text-right whitespace-nowrap ${isSentByUser ? "text-gray-300" : "text-gray-400"
                                            }`}
                                    >
                                        {formatTime(msg.createdAt)}
                                    </span>
                                </div>

                                {isSentByUser && (
                                    <div
                                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-6 w-6 mt-auto"
                                        style={{ backgroundImage: `url(${currentUser?.profilePic || ""})` }}
                                    />
                                )}
                            </div>
                        </React.Fragment>
                    );
                })}
                <div ref={bottomRef}></div>
            </div>


            {/* Message Input */}
            <div className="px-4 py-3 bg-white border-t border-gray-300">
                <form onSubmit={handleSend} className="flex items-center gap-3">
                    <input
                        type="text"
                        placeholder="Type a message"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="flex-1 px-4 py-2 bg-gray-100 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 text-white rounded-full h-10 w-10 flex items-center justify-center hover:bg-blue-600 transition-colors cursor-pointer"
                    >
                        <SendHorizonal className="size-5" />
                    </button>
                </form>
            </div>
        </>
    )
}

export default ChatBox;