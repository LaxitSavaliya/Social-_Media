import { useQuery } from "@tanstack/react-query";
import { User } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import { getRecommendedUsers } from "../Lib/api";
import useAuthUser from "../Hooks/useAuthUser";
import useFollowRequest from "../Hooks/useFollowRequest";
import useNotifications from "../Hooks/useNotifications";
import useCancelFollowReqs from "../Hooks/useCancleFollowReqs";

const RightSidebar = () => {
    const { authUser } = useAuthUser();
    const { cancelFollowPendig, removeOrCancelFollowMutation } = useCancelFollowReqs();
    const { followReqsPending, followReqsMutation } = useFollowRequest();
    const { data: recommendedUsers = [] } = useQuery({ queryKey: ["users"], queryFn: getRecommendedUsers });
    const { data: notifications } = useNotifications();

    const onlineFriends = [...(authUser?.followers || []), ...(authUser?.following || [])];
    const allOnlineFriends = onlineFriends.filter((friend, index, self) => index === self.findIndex((f) => f._id === friend._id)).slice(0, 4);

    const allRequests = notifications?.sendedRequests || [];
    const pendingRecipientIds = allRequests.filter(req => req.status === "pending").map(req => req.recipient._id);

    const handleFollowClick = (userId) => {
        if (pendingRecipientIds.includes(userId)) {
            removeOrCancelFollowMutation(userId, {
                onSuccess: () => toast.success("Request Canceled"),
                onError: (err) => toast.error(err.response?.data?.message || err.message),
            });
        } else {
            followReqsMutation(userId, {
                onSuccess: () => toast.success("Follow Request Sent"),
                onError: (err) => toast.error(err.response?.data?.message || err.message),
            });
        }
    };

    return (
        <aside className="hidden lg:block lg:w-90 xl:w-96 p-4 xl:p-6 space-y-6 h-screen overflow-y-auto scrollbar-hide bg-gray-50">

            {/* Suggested Users */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 xl:p-6"
            >
                <h3 className="font-semibold text-gray-900 mb-4">Suggested for you</h3>
                <div className="flex flex-col space-y-4 max-h-60 overflow-y-auto scrollbar-hide">
                    {recommendedUsers.length > 0 ? recommendedUsers.map((user) => {
                        const isRequested = pendingRecipientIds.includes(user._id);
                        return (
                            <motion.div
                                key={user._id}
                                className="flex items-center justify-between"
                                whileHover={{ scale: 1.02 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <div className="flex items-center">
                                    {user.profilePic ? (
                                        <img src={user.profilePic} alt={user.userName} className="w-10 h-10 rounded-full object-cover" />
                                    ) : (
                                        <User className="w-10 h-10 rounded-full p-1.5 bg-gray-200" />
                                    )}
                                    <div className="ml-3">
                                        <h4 className="font-medium text-gray-900">{user.userName}</h4>
                                        <p className="text-sm text-gray-500">{user.fullName}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleFollowClick(user._id)}
                                    disabled={cancelFollowPendig || followReqsPending}
                                    className={`py-1.5 px-4 rounded-full font-medium text-sm text-white ${isRequested ? "bg-gray-400 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"}`}
                                >
                                    {isRequested ? "Requested" : "Follow"}
                                </button>
                            </motion.div>
                        );
                    }) : <p className="text-gray-500 text-sm">No suggestions right now</p>}
                </div>
            </motion.div>

            {/* Online Friends */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 xl:p-6"
            >
                <h3 className="font-semibold text-gray-900 mb-4">Online Friends</h3>
                <div className="flex flex-col space-y-4 max-h-60 overflow-y-auto scrollbar-hide">
                    {allOnlineFriends.length > 0 ? allOnlineFriends.map((user) => (
                        <motion.div
                            key={user._id}
                            className="flex items-center justify-between"
                            whileHover={{ scale: 1.02 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <div className="flex items-center">
                                {user.profilePic ? (
                                    <img src={user.profilePic} alt={user.userName} className="w-10 h-10 rounded-full object-cover" />
                                ) : (
                                    <User className="w-10 h-10 rounded-full p-1.5 bg-gray-200" />
                                )}
                                <div className="ml-3">
                                    <h4 className="font-medium text-gray-900">{user.userName}</h4>
                                    <p className="text-sm text-gray-500">{user.fullName}</p>
                                </div>
                            </div>
                            <button className="py-1.5 px-4 rounded-full border font-medium text-sm hover:bg-blue-500 hover:text-white transition-all">
                                Message
                            </button>
                        </motion.div>
                    )) : <p className="text-gray-500 text-sm">No friends online</p>}
                </div>
            </motion.div>

        </aside>
    );
};

export default RightSidebar;