import { Link, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { Heart, MessageCircle, Send, Bookmark, User, Ellipsis } from "lucide-react";
import { useCallback, useState } from "react";

import { getPostData } from "../Lib/api";
import timeAgo from "../Lib/timeAgo";
import useAuthUser from "../Hooks/useAuthUser";
import usePostLike from "../Hooks/usePostLike";
import usePostComment from "../Hooks/usePostComment";
import PopupBox from "../Components/PopupBox";
import toast from "react-hot-toast";

const PostPage = () => {

    const [openLikeBox, setOpenLikeBox] = useState(false);
    const [selectedLikes, setSelectedLikes] = useState([]);

    const { postId } = useParams();
    const { authUser } = useAuthUser();

    const { likePending, toggleLikeToPost } = usePostLike();
    const { addComment } = usePostComment();

    const { data: postData = {} } = useQuery({
        queryKey: ["posts", postId],
        queryFn: () => getPostData(postId),
        enabled: !!postId,
    });

    const { post, userPosts } = postData;

    // Unique list of friends
    const friends = [...(authUser?.followers || []), ...(authUser?.following || [])];
    const allFriends = friends.filter(
        (friend, index, self) => index === self.findIndex((f) => f._id === friend._id)
    );

    // Get relevant likes (friends + post likes, without duplicates)
    const getRelevantLikes = useCallback(
        (post) => {
            if (!post?.likes) return [];
            const allUsers = [...allFriends, ...post.likes];
            return allUsers.filter(
                (friend, index, self) => index !== self.findIndex((f) => f._id === friend._id)
            );
        },
        [allFriends]
    );

    const relevantLikes = getRelevantLikes(post);

    const hasLiked = post?.likes?.some(
        (like) => like?._id?.toString() === authUser?._id
    );

    return (
        <div className="max-w-5xl mx-auto p-4 sm:p-6 bg-gray-50">
            {/* Main Post Section */}
            <div className="flex flex-col md:flex-row h-auto md:h-[85vh] border border-gray-200 rounded-xl bg-white shadow-sm overflow-hidden">
                {/* Left: Post Image/Video */}
                <div className="md:flex-1 bg-black flex items-center justify-center min-h-[300px] md:min-h-0">
                    {post?.image ? (
                        <img
                            src={post.image}
                            alt="Post"
                            className="w-full h-full object-contain bg-black"
                        />
                    ) : (
                        <p className="text-gray-500">No media available</p>
                    )}
                </div>

                {/* Right: Post Info */}
                <div className="md:flex-1 flex flex-col border-t md:border-t-0 md:border-l border-gray-200">
                    {/* Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
                        <div className="flex items-center gap-3">
                            {post?.postedBy?.profilePic ? (
                                <img
                                    src={post.postedBy.profilePic}
                                    alt="User"
                                    className="w-10 h-10 rounded-full object-cover border border-gray-300"
                                />
                            ) : (
                                <User className="w-10 h-10 p-1.5 bg-gray-200 rounded-full" />
                            )}
                            <Link to={`/profile/${post?.postedBy?.userName}`} className="font-semibold">{post?.postedBy?.userName}</Link>
                        </div>
                        <Ellipsis className="cursor-pointer hover:text-gray-600 transition" />
                    </div>

                    {/* Comments */}
                    <div className="flex-1 px-4 py-3 overflow-y-auto space-y-5 scrollbar-thin scrollbar-thumb-gray-300">
                        {post?.comments?.length > 0 ? (
                            post.comments.map((comment) => (
                                <div key={comment._id} className="flex gap-3">
                                    {comment?.author?.profilePic ? (
                                        <img
                                            src={comment.author.profilePic}
                                            alt="User"
                                            className="h-9 w-9 rounded-full object-cover border bg-gray-200"
                                        />
                                    ) : (
                                        <User className="h-9 w-9 p-1 rounded-full border bg-gray-200" />
                                    )}
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2.5">
                                            <Link to={`/profile/${comment?.author?.userName}`} className="text-sm font-semibold">{comment?.author?.userName}</Link>
                                            <span className="text-xs text-gray-500">{timeAgo(comment?.createdAt)}</span>
                                        </div>
                                        <div className="flex items-center justify-between mt-0.5">
                                            <p className="text-sm text-gray-700">{comment?.content}</p>
                                            <Heart className="h-4 w-4 text-gray-500 hover:text-red-500 cursor-pointer transition" />
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-center text-gray-500">No comments yet</p>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="px-4 py-3 border-t border-gray-200">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex space-x-4">
                                <Heart aria-disabled={likePending} onClick={() => toggleLikeToPost(post?._id)} className={`w-6 h-6 cursor-pointer transition active:scale-90 ${hasLiked ? "text-red-500" : "hover:text-gray-500"}`} fill={hasLiked ? "red" : "none"} />
                                <label htmlFor="comment">
                                    <MessageCircle className="w-6 h-6 cursor-pointer hover:text-gray-600 transition" />
                                </label>
                                <Send className="w-6 h-6 cursor-pointer hover:text-gray-600 transition" />
                            </div>
                            <Bookmark className="w-6 h-6 cursor-pointer hover:text-gray-600 transition" />
                        </div>

                        {/* Likes */}
                        <div className="flex items-center gap-2 flex-wrap">
                            {relevantLikes.length > 0 && (
                                <div className="flex -space-x-3">
                                    {relevantLikes.slice(0, 3).map((like) =>
                                        like?.profilePic ? (
                                            <img
                                                key={like._id}
                                                src={like.profilePic}
                                                alt="Like user"
                                                className="w-7 h-7 rounded-full bg-gray-200 border-2 border-white object-cover"
                                            />
                                        ) : (
                                            <User
                                                key={like._id}
                                                className="w-7 h-7 p-1 rounded-full border-2 border-white bg-gray-200"
                                            />
                                        )
                                    )}
                                </div>
                            )}
                            <p
                                onClick={() => {
                                    setSelectedLikes(post?.likes || []);
                                    setOpenLikeBox(true);
                                }}
                                className="text-sm font-semibold cursor-pointer">
                                {post?.likes?.length || 0} likes
                            </p>
                        </div>

                        {/* Add Comment */}
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                const input = e.target.comment;
                                if (!input.value.trim()) return;
                                addComment({
                                    postId: post._id,
                                    commentData: { content: input.value },
                                }, {
                                    onSuccess: () => {
                                        toast.success("Comment added successfully");
                                    },
                                    onError: (error) => {
                                        toast.error(error.response?.data?.message || error.message);
                                    }
                                });
                                input.value = "";
                            }}
                            className="flex items-center gap-3 mt-4 border-t border-gray-200 p-2 pt-3">
                            <input
                                type="text"
                                id="comment"
                                placeholder="Add a comment..."
                                className="flex-1 text-sm bg-transparent focus:outline-none"
                            />
                            <button
                                type="submit"
                                className="text-blue-500 font-semibold text-sm hover:opacity-80"
                            >
                                Post
                            </button>
                        </form>
                    </div>
                </div>
            </div>

            {/* More Posts Grid */}
            {userPosts?.length > 0 && (
                <div className="mt-10 border-t pt-6 pb-20">
                    <h1 className="mb-5 text-gray-600">
                        More posts from{" "}
                        <span className="font-semibold text-black">{post?.postedBy?.userName}</span>
                    </h1>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                        {userPosts.map((userPost) => (
                            <Link
                                to={`/post/${userPost._id}`}
                                key={userPost._id}
                                className="relative group aspect-square overflow-hidden rounded-md"
                            >
                                <img
                                    src={userPost.image || userPost.video}
                                    alt="Post"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                />
                            </Link>
                        ))}
                    </div>
                </div>
            )}
            <PopupBox
                isOpen={openLikeBox}
                onClose={() => setOpenLikeBox(false)}
                Data={selectedLikes}
                label="Likes"
            />
        </div>
    );
};

export default PostPage;