import { useState, useCallback, useMemo } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, SendHorizontal, Bookmark, User, EllipsisVertical, Share2, MoreHorizontal } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
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
    const [expandedPosts, setExpandedPosts] = useState(new Set());
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

    const togglePostExpansion = (postId) => {
        const newExpanded = new Set(expandedPosts);
        if (newExpanded.has(postId)) {
            newExpanded.delete(postId);
        } else {
            newExpanded.add(postId);
        }
        setExpandedPosts(newExpanded);
    };

    return (
        <div className="space-y-6 pb-6">
            <AnimatePresence mode="popLayout">
                {allPosts.map((post, idx) => {
                    const currentUserId = authUser?._id?.toString();
                    const hasLiked = post.likes?.some((like) => like?._id?.toString() === currentUserId);
                    const relevantLikes = getRelevantLikes(post);
                    const isExpanded = expandedPosts.has(post._id);
                    const shouldTruncate = post.content && post.content.length > 200;

                    return (
                        <motion.article
                            key={post._id}
                            layout
                            initial={{ opacity: 0, y: 50, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -50, scale: 0.95 }}
                            transition={{
                                duration: 0.5,
                                delay: idx * 0.1,
                                type: "spring",
                                stiffness: 100,
                                damping: 15
                            }}
                            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-lg border border-white/50 overflow-hidden hover:shadow-xl transition-all duration-300 group"
                        >
                            {/* Post Header */}
                            <motion.div
                                className="flex items-center justify-between p-4 sm:p-6"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: idx * 0.1 + 0.2 }}
                            >
                                <div className="flex items-center space-x-3">
                                    <motion.div
                                        className="relative"
                                        whileHover={{ scale: 1.05 }}
                                    >
                                        {post.postedBy?.profilePic ? (
                                            <img
                                                src={post.postedBy.profilePic}
                                                alt={post.postedBy.userName}
                                                className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-100 group-hover:ring-indigo-200 transition-all duration-300"
                                            />
                                        ) : (
                                            <User className="w-12 h-12 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 p-2 ring-2 ring-gray-100" />
                                        )}
                                        <motion.div
                                            className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"
                                            animate={{ scale: [1, 1.2, 1] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                        />
                                    </motion.div>
                                    <div>
                                        <Link
                                            to={`/profile/${post.postedBy?.userName}`}
                                            className="font-semibold text-gray-900 hover:text-indigo-600 transition-colors duration-200"
                                        >
                                            {post.postedBy?.userName}
                                        </Link>
                                        <p className="text-sm text-gray-500 flex items-center gap-2">
                                            {timeAgo(post?.createdAt)}
                                        </p>
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="cursor-pointer"
                                >
                                    <MoreHorizontal className="w-5 h-5 hover:text-gray-500" />
                                </motion.button>
                            </motion.div>

                            {/* Post Content */}
                            {post?.content && (
                                <motion.div
                                    className="px-4 sm:px-6 pb-4"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: idx * 0.1 + 0.3 }}
                                >
                                    <p className="text-gray-800 leading-relaxed">
                                        {shouldTruncate && !isExpanded
                                            ? post.content.substring(0, 200) + "..."
                                            : post.content
                                        }
                                        {shouldTruncate && (
                                            <motion.button
                                                onClick={() => togglePostExpansion(post._id)}
                                                className="text-indigo-600 hover:text-indigo-700 ml-2 font-medium"
                                                whileHover={{ scale: 1.05 }}
                                            >
                                                {isExpanded ? "Show less" : "Read more"}
                                            </motion.button>
                                        )}
                                    </p>
                                </motion.div>
                            )}

                            {/* Post Image */}
                            {post?.image && (
                                <motion.div
                                    className="relative overflow-hidden group/image"
                                    initial={{ opacity: 0, scale: 1.1 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.1 + 0.4, duration: 0.6 }}
                                    whileHover={{ scale: 1.02 }}
                                >
                                    <img
                                        onDoubleClick={() => !hasLiked && toggleLikeToPost(post._id)}
                                        src={post.image || post.video}
                                        alt="Post"
                                        className="w-full max-h-[500px] object-contain bg-gray-200 cursor-pointer transition-transform duration-300"
                                    />
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-300"
                                        initial={{ opacity: 0 }}
                                        whileHover={{ opacity: 1 }}
                                    />

                                    {/* Double tap heart */}
                                    <AnimatePresence>
                                        {hasLiked && (
                                            <motion.div
                                                initial={{ scale: 0, opacity: 0 }}
                                                animate={{ scale: [0, 1.2, 1], opacity: [0, 1, 0] }}
                                                exit={{ scale: 0, opacity: 0 }}
                                                transition={{ duration: 1 }}
                                                className="absolute inset-0 flex items-center justify-center pointer-events-none"
                                            >
                                                <Heart className="w-20 h-20 text-red-500 fill-current drop-shadow-lg" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </motion.div>
                            )}

                            {/* Actions */}
                            <motion.div
                                className="p-4 sm:p-6"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: idx * 0.1 + 0.5 }}
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center space-x-6">
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={() => toggleLikeToPost(post._id)}
                                            disabled={likePending}
                                            className={`flex items-center space-x-1 cursor-pointer transition-colors duration-200 ${hasLiked ? "text-red-500" : "text-gray-600 hover:text-red-500"}`}
                                        >
                                            <Heart className="w-6 h-6" fill={hasLiked ? "currentColor" : "none"} />
                                            <span className="font-medium">{post?.likes?.length || 0}</span>
                                        </motion.button>

                                        <Link to={`/post/${post._id}`}>
                                            <motion.button
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.9 }}
                                                className="flex items-center space-x-1 text-gray-600 hover:text-indigo-600 transition-colors duration-200"
                                            >
                                                <MessageCircle className="w-6 h-6 cursor-pointer" />
                                                <span className="font-medium">{post?.comments?.length || 0}</span>
                                            </motion.button>
                                        </Link>

                                        <motion.button
                                            whileHover={{ scale: 1.1, rotate: 15 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="text-gray-600 hover:text-green-600 transition-colors duration-200"
                                        >
                                            <Share2 className="w-6 h-6 cursor-pointer" />
                                        </motion.button>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        className="text-gray-600 hover:text-yellow-600 transition-colors duration-200"
                                    >
                                        <Bookmark className="w-6 h-6 cursor-pointer" />
                                    </motion.button>
                                </div>

                                {/* Likes Display */}
                                {(relevantLikes.length > 0 || post?.likes?.length > 0) && (
                                    <motion.div
                                        className="flex items-center gap-3 mb-3"
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 + 0.6 }}
                                    >
                                        {relevantLikes.length > 0 && (
                                            <div className="flex -space-x-4">
                                                {relevantLikes.slice(0, 3).map((like, likeIdx) => (
                                                    <motion.div
                                                        key={like._id}
                                                        initial={{ scale: 0, opacity: 0 }}
                                                        animate={{ scale: 1, opacity: 1 }}
                                                        transition={{ delay: idx * 0.1 + 0.7 + likeIdx * 0.1 }}
                                                        className="relative"
                                                    >
                                                        {like?.profilePic ? (
                                                            <img
                                                                src={like.profilePic}
                                                                alt="Liked by"
                                                                className="w-8 h-8 rounded-full border-1 bg-gray-200 border-white object-cover shadow-sm hover:scale-110 transition-transform duration-200"
                                                            />
                                                        ) : (
                                                            <User className="w-8 h-8 rounded-full border-2 border-white bg-gray-200 p-1 shadow-sm" />
                                                        )}
                                                    </motion.div>
                                                ))}
                                            </div>
                                        )}
                                        <motion.button
                                            onClick={() => { setSelectedLikes(post?.likes || []); setOpenLikeBox(true); }}
                                            className="font-medium text-gray-700 hover:text-indigo-600 transition-colors duration-200"
                                            whileHover={{ scale: 1.05 }}
                                        >
                                            <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                                                {post?.likes?.length || 0} likes
                                            </span>
                                        </motion.button>
                                    </motion.div>
                                )}

                                {/* First Comment */}
                                {post?.comments?.length > 0 && (
                                    <motion.div
                                        className="flex items-center gap-3 mb-3"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 + 0.7 }}
                                    >
                                        {post.comments[0]?.author?.profilePic ? (
                                            <img
                                                src={post.comments[0].author.profilePic}
                                                alt="Commenter"
                                                className="w-8 h-8 rounded-full bg-gray-200 object-cover"
                                            />
                                        ) : (
                                            <User className="w-8 h-8 rounded-full bg-gray-200 p-1.5" />
                                        )}
                                        <div className="flex-1 flex justify-between bg-gray-100 rounded-2xl px-4 py-2">
                                            <div className="flex items-center gap-3 text-sm">
                                                <span className="font-semibold text-gray-900">{post.comments[0]?.author?.userName}</span>
                                                <span className="text-gray-700">{post.comments[0]?.content}</span>
                                            </div>
                                            <Link
                                                to={`/post/${post._id}`}
                                                className="text-xs text-gray-500 hover:text-indigo-600 transition-colors mt-1 inline-block"
                                            >
                                                View all comments
                                            </Link>
                                        </div>
                                    </motion.div>
                                )}

                                {/* Add Comment */}
                                <motion.form
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
                                    className="flex items-center space-x-3"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 + 0.8 }}
                                >
                                    <div className="flex-1 relative">
                                        <input
                                            name="comment"
                                            type="text"
                                            placeholder="Write a comment..."
                                            className="w-full bg-gray-100 hover:bg-gray-200 focus:bg-white rounded-full px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200"
                                        />
                                        <motion.button
                                            type="submit"
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-indigo-500 hover:text-indigo-600 transition-colors duration-200"
                                        >
                                            <SendHorizontal className="w-5 h-5" />
                                        </motion.button>
                                    </div>
                                </motion.form>
                            </motion.div>
                        </motion.article>
                    );
                })}
            </AnimatePresence>

            <PopupBox isOpen={openLikeBox} onClose={() => setOpenLikeBox(false)} Data={selectedLikes} label="Likes" />
        </div>
    );
};

export default PostCard;