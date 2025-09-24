import { useMutation, useQueryClient } from "@tanstack/react-query"
import { sendFollowRequest } from "../Lib/api";

const useFollowRequest = () => {
    const queryClient = useQueryClient();
    const { isPending, mutate, error } = useMutation({
        mutationFn: sendFollowRequest,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    });
    return { followReqsPending: isPending, followReqsMutation: mutate, followReqsError: error }
}

export default useFollowRequest;