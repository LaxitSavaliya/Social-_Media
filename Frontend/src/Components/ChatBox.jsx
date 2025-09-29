import { useParams } from "react-router";
import { getChatData } from "../Lib/api";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { io } from "socket.io-client";
import { Ellipsis, SendHorizonal, User } from "lucide-react";

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
        if (chatData?.message.length) setMessages(chatData?.message);
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


    return (
        <div className="md:border h-full w-full md:w-3/4 flex flex-col">
            <div className="flex items-center p-4 bg-white border-b shadow-sm">
                {chatData?.user.profilePic ? (
                    <img
                        src={chatData?.user.profilePic}
                        alt="profile"
                        className="h-10 w-10 rounded-full bg-gray-100 object-cover"
                    />
                ) : (
                    <User className="h-10 w-10 rounded-full bg-gray-100 p-1" />
                )}
                <h1 className="ml-4 font-semibold text-gray-800 text-sm sm:text-base">
                    {chatData?.user.fullName}
                </h1>
                <Ellipsis className="ml-auto text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>

            <div className="flex-1 flex flex-col gap-2 p-4 sm:p-5 overflow-y-auto scrollbar-hide bg-gray-50">
                <AnimatePresence initial={false}>
                    {messages.map((message) => {
                        const senderId = message.sender?._id || message.sender;
                        const isSentByCurrentUser = senderId === currentUser._id;

                        return (
                            <motion.div
                                key={message._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                transition={{ duration: 0.25 }}
                                className={`flex ${isSentByCurrentUser ? "justify-end" : "justify-start"}`}
                            >
                                <span
                                    className={`px-4 py-2 rounded-2xl max-w-[70%] break-words whitespace-pre-wrap text-sm sm:text-base ${isSentByCurrentUser ? "bg-blue-500 text-white" : "bg-gray-700 text-white"
                                        }`}
                                >
                                    {message.text}
                                </span>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
                <div ref={bottomRef}></div>
            </div>

            <div className="p-4 bg-white border-t flex-shrink-0">
                <form onSubmit={handleSend} className="flex items-center gap-3">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm sm:text-base"
                    />
                    <button
                        type="submit"
                        className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded-full flex items-center justify-center"
                    >
                        <SendHorizonal className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                </form>
            </div>

        </div>
    )
}

export default ChatBox;