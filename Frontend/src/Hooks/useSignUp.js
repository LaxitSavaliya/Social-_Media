import { useMutation, useQueryClient } from "@tanstack/react-query";
import { signUp } from "../Lib/api";

const useSignUp = () => {
    const queryClient = useQueryClient();
    const { isPending, mutate, error } = useMutation({
        mutationFn: signUp,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
        },
    });
    return { isPending, signUpMutation: mutate, error };
}

export default useSignUp;