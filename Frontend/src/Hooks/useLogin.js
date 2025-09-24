import { useMutation, useQueryClient } from "@tanstack/react-query";
import { login } from "../Lib/api";

const useLogin = () => {
    const queryClient = useQueryClient();
    const { isPending, mutate, error } = useMutation({
        mutationFn: login,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
    });

    return { isPending, loginMutation: mutate, error }
}

export default useLogin;