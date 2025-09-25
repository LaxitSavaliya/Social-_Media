import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useParams } from "react-router";
import { Ellipsis, Settings, User } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import { getUserData } from "../Lib/api";
import useAuthUser from "../Hooks/useAuthUser";
import useFollowRequest from "../Hooks/useFollowRequest";
import useNotifications from "../Hooks/useNotifications";
import useCancelFollowReqs from "../Hooks/useCancleFollowReqs";
import PopupBox from "../Components/PopupBox";
import PageLoader from "../Components/PageLoader";

const ProfilePage = () => {
    const queryClient = useQueryClient();
    const { userName } = useParams();
    const { authUser } = useAuthUser();

    const [openFollowersBox, setOpenFollowersBox] = useState(false);
    const [openFollowingBox, setOpenFollowingBox] = useState(false);
    const [label, setLabel] = useState("");

    const { data: userData = [], isLoading: loadingUsers } = useQuery({
        queryKey: ["users", userName],
        queryFn: () => getUserData(userName),
        enabled: !!userName,
    });

    const { user, userPosts } = userData;

    const { followReqsMutation } = useFollowRequest();
    const { removeOrCancelFollowMutation } = useCancelFollowReqs();
    const { data: notifications } = useNotifications();

    const allRequests = notifications?.sendedRequests || [];
    const pendingRecipientIds = allRequests.filter(req => req.status === "pending").map(req => req.recipient._id);

    const isRequested = pendingRecipientIds.includes(user?._id);
    const myFollowing = authUser?.following.map(req => req._id) || [];
    const isMyFollowing = myFollowing.includes(user?._id);

    const handleFollowClick = () => {
        if (isRequested || isMyFollowing) {
            removeOrCancelFollowMutation(user._id, {
                onSuccess: () => toast.success("Follow request canceled"),
            });
        } else {
            followReqsMutation(user._id, {
                onSuccess: () => toast.success("Follow request sent"),
            });
        }
    };

    if (loadingUsers) return <PageLoader />;

    if (!user) return <span className="flex items-center justify-center text-5xl h-full w-full">User NOT Found</span>;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-5xl mx-auto p-4 md:p-6 bg-gray-50 min-h-screen"
        >
            {/* PROFILE HEADER */}
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-14">
                {/* Profile Picture */}
                {user?.profilePic ? (
                    <img
                        src={user.profilePic}
                        alt="Profile"
                        className="w-32 h-32 md:w-44 md:h-44 rounded-full border-2 border-gray-200 object-cover"
                    />
                ) : (
                    <User className="w-32 h-32 md:w-44 md:h-44 p-5 rounded-full border-2 border-gray-200 text-gray-400" />
                )}

                {/* Profile Info */}
                <div className="flex-1 flex flex-col gap-4 md:gap-6 w-full">
                    {/* Username + Actions */}
                    <div className="flex flex-wrap items-center gap-3">
                        <h1 className="text-2xl font-semibold">{user.userName}</h1>

                        {user._id !== authUser?._id ? (
                            <div className="flex flex-wrap gap-2 md:gap-3 ml-0 md:ml-10">
                                <button
                                    onClick={handleFollowClick}
                                    className={`px-5 py-1.5 rounded-lg text-sm font-medium transition-colors ${isRequested || isMyFollowing ? "bg-gray-200 hover:bg-gray-300" : "bg-blue-500 hover:bg-blue-600 text-white"
                                        }`}
                                >
                                    {isRequested ? "Requested" : isMyFollowing ? "Following" : "Follow"}
                                </button>
                                <button className="px-5 py-1.5 rounded-lg text-sm bg-gray-200 hover:bg-gray-300">Message</button>
                                <Ellipsis className="w-5 h-5 text-gray-600 cursor-pointer" />
                            </div>
                        ) : (
                            <div className="flex flex-wrap gap-2 md:gap-3 ml-0 md:ml-10">
                                <Link to={`/profile/${userName}/update-profile`} className="px-5 py-1.5 rounded-lg text-sm bg-gray-200 hover:bg-gray-300">Edit Profile</Link>
                                <button className="px-5 py-1.5 rounded-lg text-sm bg-gray-200 hover:bg-gray-300">View Archive</button>
                                <Settings className="w-5 h-5 text-gray-600 cursor-pointer" />
                            </div>
                        )}
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-6 text-sm md:text-base">
                        <div className="flex items-center gap-1">
                            <span className="font-semibold">{userPosts?.length || 0}</span>
                            <span className="text-gray-600">Posts</span>
                        </div>
                        <button
                            onClick={() => {
                                setOpenFollowersBox(true);
                                setLabel("Followers");
                            }}
                            className="flex items-center gap-1 cursor-pointer"
                        >
                            <span className="font-semibold">{user?.followers?.length || 0}</span>
                            <span className="text-gray-600">Followers</span>
                        </button>
                        <button
                            onClick={() => {
                                setOpenFollowingBox(true);
                                setLabel("Following");
                            }}
                            className="flex items-center gap-1 cursor-pointer"
                        >
                            <span className="font-semibold">{user?.following?.length || 0}</span>
                            <span className="text-gray-600">Following</span>
                        </button>
                    </div>

                    {/* Full Name + Bio */}
                    <div className="text-sm md:text-base">
                        <h2 className="font-medium">{user.fullName}</h2>
                        <p className="text-gray-600">{user.bio}</p>
                    </div>
                </div>
            </div>

            {/* POSTS GRID */}
            <div className="mt-8 md:mt-10 border-t pt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 md:gap-3">
                {userPosts?.length > 0 ? (
                    userPosts.map((post) => (
                        <motion.div
                            key={post._id}
                            whileHover={{ scale: 1.05 }}
                            transition={{ type: "spring", stiffness: 300 }}
                            className="relative overflow-hidden rounded-lg group"
                        >
                            <Link to={`/post/${post._id}`}>
                                <img
                                    src={post.image || post.video}
                                    alt="Post"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300 border border-gray-200"
                                />
                            </Link>
                        </motion.div>
                    ))
                ) : (
                    <p className="text-gray-500 text-center col-span-full py-10">No posts yet</p>
                )}
            </div>

            <PopupBox
                isOpen={openFollowersBox}
                onClose={() => setOpenFollowersBox(false)}
                Data={user?.followers || []}
                label={label}
                onUpdate={async () => {
                    await queryClient.invalidateQueries({ queryKey: ["users", userName] });
                }}
            />
            <PopupBox
                isOpen={openFollowingBox}
                onClose={() => setOpenFollowingBox(false)}
                Data={user?.following || []}
                label={label}
                onUpdate={async () => {
                    await queryClient.invalidateQueries({ queryKey: ["users", userName] });
                }}
            />

        </motion.div>
    );
};

export default ProfilePage;