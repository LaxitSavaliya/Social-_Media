import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateProfile } from "../Lib/api";

const useUpdateProfile = () => {
    const queryClient = useQueryClient();
    const { isPending, mutate } = useMutation({
        mutationFn: ({ userId, updateData }) => updateProfile(userId, updateData),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
    });
    return { isPending, updateProfileMutation: mutate };
};

export default useUpdateProfile;