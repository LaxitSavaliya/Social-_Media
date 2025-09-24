import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPost } from "../Lib/api";

const useCreatePost = () => {
    const queryClient = useQueryClient();
    const { isPending, mutate, error } = useMutation({
        mutationFn: createPost,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["posts"] });
        },
    });
    return { isPending, createPostMutation: mutate, error };
}

export default useCreatePost;