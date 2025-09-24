import { useMutation, useQueryClient } from "@tanstack/react-query";
import { onboarding } from "../Lib/api";

const useOnboarding = () => {
    const queryClient = useQueryClient();
    const { isPending, mutate, error } = useMutation({
        mutationFn: onboarding,
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["authUser"] }),
    });
    return { isPending, onboardingMutation: mutate, error }
}

export default useOnboarding;