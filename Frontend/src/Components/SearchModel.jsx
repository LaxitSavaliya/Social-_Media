import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { fetchUsers } from "../Lib/api";
import { motion, AnimatePresence } from "framer-motion";
import { User, X } from "lucide-react";
import { Link } from "react-router";

const SearchModel = ({ onClose }) => {
    const [name, setName] = useState("");
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        const timeout = setTimeout(() => {
            setSearchTerm(name);
        }, 300);
        return () => clearTimeout(timeout);
    }, [name]);

    const { data: usersData = [], isLoading: loadingUsers } = useQuery({
        queryKey: ["users", searchTerm],
        queryFn: () => fetchUsers(searchTerm),
        enabled: !!searchTerm,
    });

    return (
        <AnimatePresence>
            {true && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <X
                        className="absolute top-5 right-5 text-white h-8 w-8 cursor-pointer hover:text-gray-300"
                        onClick={onClose}
                    />
                    <motion.div
                        className="bg-white rounded-xl shadow-lg w-11/12 md:w-2/3 lg:w-1/2 h-3/4 max-w-full flex flex-col overflow-hidden"
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -50, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        onClick={(e) => e.stopPropagation()}
                    >

                        <div className="flex flex-col h-full">
                            {/* Search Input */}
                            <div className="px-6 py-4 border-b">
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Search users..."
                                    className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                                />
                            </div>

                            {/* Results List */}
                            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-2 scrollbar-thin scrollbar-thumb-gray-300">
                                {loadingUsers ? (
                                    <p className="text-center text-gray-500">Loading...</p>
                                ) : usersData.length === 0 ? (
                                    <p className="text-center text-gray-500">No users found</p>
                                ) : (
                                    usersData.map((user) => (
                                        <Link
                                            key={user._id}
                                            to={`/profile/${user.userName}`}
                                            onClick={onClose}
                                            className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-100 transition"
                                        >
                                            {user.profilePic ? (
                                                <img src={user.profilePic} alt={user.userName} className="w-10 h-10 rounded-full object-cover border border-gray-200" />
                                            ) : (
                                                <User className="w-10 h-10 p-2 rounded-full bg-gray-200 text-gray-500" />
                                            )}
                                            <div className="flex flex-col">
                                                <span className="font-medium text-gray-900">{user.userName}</span>
                                                <span className="text-sm text-gray-500">{user.fullName}</span>
                                            </div>
                                        </Link>
                                    ))
                                )}
                            </div>
                        </div>

                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default SearchModel;