import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeOrCancelFollow } from "../Lib/api";

const useCancelFollowReqs = () => {
    const queryClient = useQueryClient();

    const { isPending, mutate, error } = useMutation({
        mutationFn: removeOrCancelFollow,
        onSuccess: () => queryClient.invalidateQueries(["notifications"]),
        onError: (err) => console.error("Cancel follow request failed:", err),
    });

    return { cancelFollowPendig: isPending, removeOrCancelFollowMutation: mutate, cancelFollowError: error };
};

export default useCancelFollowReqs;