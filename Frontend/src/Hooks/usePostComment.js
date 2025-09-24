import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createComment } from "../Lib/api";

const usePostComment = () => {
    const queryClient = useQueryClient();
    const { mutate: addComment } = useMutation({
        mutationFn: ({ postId, commentData }) => createComment(postId, commentData),
        onMutate: async ({ postId, commentData }) => {
            await queryClient.cancelQueries({ queryKey: ["posts"] });
            const previousData = queryClient.getQueryData(["posts"]);

            queryClient.setQueryData(["posts"], (oldData) => {
                if (!oldData) return oldData;

                return {
                    ...oldData,
                    posts: oldData.posts.map((p) =>
                        p._id === postId
                            ? { ...p, comments: [...p.comments, commentData] }
                            : p
                    ),
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

    return { addComment }
}

export default usePostComment;