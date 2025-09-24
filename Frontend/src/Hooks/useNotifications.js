import { useQuery } from "@tanstack/react-query";
import { getNotifications } from "../Lib/api";

const useNotifications = () => {
    return useQuery({
        queryKey: ["notifications"],
        queryFn: getNotifications,
        staleTime: 1000 * 60,
    });
};

export default useNotifications;