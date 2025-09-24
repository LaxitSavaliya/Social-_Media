import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAuthUser from "./useAuthUser";
import { toggleLike } from "../Lib/api";

const usePostLike = () => {
    const queryClient = useQueryClient();
    const { authUser } = useAuthUser();

    const { isPending: likePending, mutate: toggleLikeToPost } = useMutation({
        mutationFn: toggleLike,
        onMutate: async (postId) => {
            await queryClient.cancelQueries({ queryKey: ["posts"] });
            const previousData = queryClient.getQueryData(["posts"]);

            queryClient.setQueryData(["posts"], (oldData) => {
                if (!oldData) return oldData;

                return {
                    ...oldData,
                    posts: oldData.posts.map((p) => {
                        if (p._id !== postId) return p;

                        const currentUserId = authUser?._id?.toString();
                        const hasLiked = p.likes?.some(
                            (like) => (like?._id || like)?.toString() === currentUserId
                        );

                        return {
                            ...p,
                            likes: hasLiked
                                ? p.likes.filter(
                                    (l) =>
                                        (typeof l === "object" ? l._id : l)?.toString() !== currentUserId
                                )
                                : [...p.likes, { _id: authUser._id, profilePic: authUser.profilePic }],
                        };
                    }),
                };
            });

            return { previousData };
        },
        onError: (_, __, context) => {
            queryClient.setQueryData(["posts"], context.previousData);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
    });

    return { likePending, toggleLikeToPost };
}

export default usePostLike;