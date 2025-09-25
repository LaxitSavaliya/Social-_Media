import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import { User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import useNotifications from "../Hooks/useNotifications";
import useCancelFollowReqs from "../Hooks/useCancleFollowReqs";
import { acceptFollowRequest } from "../Lib/api";
import timeAgo from "../Lib/timeAgo";

const Notification = () => {
    const queryClient = useQueryClient();
    const { data: notifications } = useNotifications();
    const notificationList = notifications?.receivedRequests || [];

    const { mutate: acceptFollowReqsMutation } = useMutation({
        mutationFn: acceptFollowRequest,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    });

    const { removeOrCancelFollowMutation } = useCancelFollowReqs();

    return (
        <div className="max-w-xl mx-auto mt-6 p-4 bg-white rounded-2xl shadow-md">
            <h2 className="text-xl font-semibold mb-4">Notifications</h2>

            {notificationList.length === 0 ? (
                <p className="text-gray-500 text-sm">No notifications yet</p>
            ) : (
                <ul className="flex flex-col gap-4">
                    <AnimatePresence>
                        {notificationList.map((notif) => (
                            <motion.li
                                key={notif._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.3 }}
                                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 transition"
                            >
                                {notif?.sender?.profilePic ? (
                                    <img src={notif.sender.profilePic} alt={notif.sender.userName} className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                                ) : (
                                    <User className="w-12 h-12 p-2 rounded-full object-cover border border-gray-200 text-gray-400" />
                                )}

                                <div className="flex-1 text-sm">
                                    <Link to={`/profile/${notif?.sender?.userName}`} className="font-semibold mr-1">
                                        {notif.sender.userName}
                                    </Link>
                                    {notif.status === "pending" ? "sent you a follow request" : "started following you"}
                                    <div className="text-gray-400 text-xs mt-1">{timeAgo(notif.updatedAt)}</div>
                                </div>

                                {notif.status === "pending" && (
                                    <div className="flex gap-2 ml-auto flex-shrink-0">
                                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => acceptFollowReqsMutation(notif._id)} className="px-3 py-1 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-sm transition">
                                            Confirm
                                        </motion.button>
                                        <motion.button whileTap={{ scale: 0.95 }} onClick={() => removeOrCancelFollowMutation(notif.sender._id)} className="px-3 py-1 rounded-lg bg-gray-200 hover:bg-gray-300 text-sm transition">
                                            Cancel
                                        </motion.button>
                                    </div>
                                )}
                            </motion.li>
                        ))}
                    </AnimatePresence>
                </ul>
            )}
        </div>
    );
};

export default Notification;