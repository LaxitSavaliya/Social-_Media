import { useState, useCallback, useMemo } from "react";
import { Link } from "react-router";
import { Heart, MessageCircle, SendHorizontal, Bookmark, User, EllipsisVertical } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import timeAgo from "../Lib/timeAgo";
import { getPosts } from "../Lib/api";
import useAuthUser from "../Hooks/useAuthUser";
import usePostLike from "../Hooks/usePostLike";
import usePostComment from "../Hooks/usePostComment";
import PopupBox from "./PopupBox";

const PostCard = () => {
    const [openLikeBox, setOpenLikeBox] = useState(false);
    const [selectedLikes, setSelectedLikes] = useState([]);
    const { authUser } = useAuthUser();

    // Fetch posts
    const { data: postsData } = useQuery({ queryKey: ["posts"], queryFn: getPosts });
    const allPosts = useMemo(() => [...(postsData?.posts || []), ...(postsData?.otherPosts || [])], [postsData]);

    const { likePending, toggleLikeToPost } = usePostLike();
    const { addComment } = usePostComment();

    const friends = [...(authUser?.followers || []), ...(authUser?.following || [])];
    const allFriends = friends.filter((friend, index, self) => index === self.findIndex((f) => f._id === friend._id));

    const getRelevantLikes = useCallback(
        (post) => {
            if (!post?.likes) return [];
            const allUser = [...allFriends, ...post.likes];
            return allUser.filter((friend, index, self) => index !== self.findIndex((f) => f._id === friend._id));
        },
        [allFriends]
    );

    return (
        <div className="space-y-4 sm:space-y-6 pb-6">
            {allPosts.map((post, idx) => {
                const currentUserId = authUser?._id?.toString();
                const hasLiked = post.likes?.some((like) => like?._id?.toString() === currentUserId);
                const relevantLikes = getRelevantLikes(post);

                return (
                    <motion.div
                        key={post._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4, delay: idx * 0.1 }}
                        className="bg-white rounded-2xl shadow-sm border border-gray-200"
                    >
                        {/* Post Header */}
                        <div className="flex items-center justify-between p-3 sm:p-4">
                            <div className="flex items-center">
                                {post.postedBy?.profilePic ? (
                                    <img src={post.postedBy.profilePic} alt={post.postedBy.userName} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full" />
                                ) : (
                                    <User className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gray-200 p-1.5" />
                                )}
                                <div className="ml-2 sm:ml-3">
                                    <Link to={`/profile/${post.postedBy?.userName}`} className="font-semibold text-gray-900 text-sm sm:text-base">
                                        {post.postedBy?.userName}
                                    </Link>
                                    <p className="text-xs sm:text-sm text-gray-500">{timeAgo(post?.createdAt)}</p>
                                </div>
                            </div>
                            <EllipsisVertical className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 hover:text-gray-600 cursor-pointer" />
                        </div>

                        {/* Post Content */}
                        {post?.content && <div className="px-3 sm:px-4 pb-2 sm:pb-3"><p className="text-gray-800 text-sm sm:text-base">{post.content}</p></div>}

                        {/* Post Image */}
                        {post?.image && (
                            <motion.div
                                whileTap={{ scale: 0.97 }}
                                className="relative"
                            >
                                <img
                                    onDoubleClick={() => !hasLiked && toggleLikeToPost(post._id)}
                                    src={post.image || post.video}
                                    alt="Post"
                                    className="w-full max-h-[400px] sm:max-h-[500px] object-cover"
                                />
                            </motion.div>
                        )}

                        {/* Actions */}
                        <div className="p-3 sm:p-4">
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center space-x-3 sm:space-x-4">
                                    <motion.button
                                        whileTap={{ scale: 0.85 }}
                                        onClick={() => toggleLikeToPost(post._id)}
                                        disabled={likePending}
                                        className={`flex items-center cursor-pointer ${hasLiked ? "text-red-500" : "hover:text-gray-600"}`}
                                    >
                                        <Heart className="w-6 h-6 sm:w-7 sm:h-7" fill={hasLiked ? "red" : "none"} />
                                    </motion.button>
                                    <Link to={`/post/${post._id}`}>
                                        <motion.div whileTap={{ scale: 0.85 }} className="hover:text-gray-600 cursor-pointer">
                                            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
                                        </motion.div>
                                    </Link>
                                    <motion.button whileTap={{ scale: 0.85 }} className="hover:text-gray-600 cursor-pointer">
                                        <SendHorizontal className="w-5 h-5 sm:w-6 sm:h-6" />
                                    </motion.button>
                                </div>
                                <motion.button whileTap={{ scale: 0.85 }} className="hover:text-gray-600 cursor-pointer">
                                    <Bookmark className="w-5 h-5 sm:w-6 sm:h-6" />
                                </motion.button>
                            </div>

                            {/* Likes */}
                            <div className="flex items-center gap-2 mb-2 sm:mb-3">
                                {relevantLikes.length > 0 && (
                                    <div className="flex">
                                        {relevantLikes.slice(0, 3).map((like, idx) => (
                                            like?.profilePic ? (
                                                <img key={like._id} src={like.profilePic} alt="Like user" className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 bg-gray-200 border-white object-cover ${idx > 0 ? "-ml-3" : ""}`} />
                                            ) : (
                                                <User key={like._id} className={`w-6 h-6 sm:w-7 sm:h-7 rounded-full border-2 border-white bg-gray-200 p-0.5 object-cover ${idx > 0 ? "-ml-3" : ""}`} />
                                            )
                                        ))}
                                    </div>
                                )}
                                <p
                                    className="text-xs sm:text-sm font-semibold cursor-pointer"
                                    onClick={() => { setSelectedLikes(post?.likes || []); setOpenLikeBox(true); }}
                                >
                                    {post?.likes?.length || 0} likes
                                </p>
                            </div>

                            {/* Comments */}
                            {post?.comments?.length > 0 && (
                                <div className="flex items-center gap-2 sm:gap-3">
                                    {post.comments[0]?.author?.profilePic ? (
                                        <img src={post.comments[0].author.profilePic} alt="Commenter" className="w-7 h-7 sm:w-8 sm:h-8 rounded-full" />
                                    ) : (
                                        <User className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gray-200 p-1.5" />
                                    )}
                                    <div className="flex-1 space-x-2 sm:space-x-3 text-xs sm:text-sm">
                                        <span className="font-semibold">{post.comments[0]?.author?.userName}</span>
                                        <span>{post.comments[0]?.content}</span>
                                        <Link to={`/post/${post._id}`} className="text-gray-500 cursor-pointer">more...</Link>
                                    </div>
                                </div>
                            )}

                            {/* Add Comment */}
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    const input = e.target.comment;
                                    if (!input.value.trim()) return;
                                    addComment({ postId: post._id, commentData: { content: input.value } }, {
                                        onSuccess: () => toast.success("Comment added successfully"),
                                        onError: (error) => toast.error(error.response?.data?.message || error.message)
                                    });
                                    input.value = "";
                                }}
                                className="mt-2 sm:mt-3 flex items-center space-x-2 sm:space-x-3"
                            >
                                <input
                                    name="comment"
                                    type="text"
                                    placeholder="Add a comment..."
                                    className="flex-1 bg-gray-100 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <motion.button whileTap={{ scale: 0.85 }} type="submit" className="hover:text-gray-600 cursor-pointer">
                                    <SendHorizontal className="w-5 h-5 sm:w-6 sm:h-6" />
                                </motion.button>
                            </form>
                        </div>
                    </motion.div>
                );
            })}

            <PopupBox isOpen={openLikeBox} onClose={() => setOpenLikeBox(false)} Data={selectedLikes} label="Likes" />
        </div>
    );
};

export default PostCard;