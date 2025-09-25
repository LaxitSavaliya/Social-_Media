import { X, User as UserIcon } from "lucide-react";
import useNotifications from "../Hooks/useNotifications";
import useAuthUser from "../Hooks/useAuthUser";
import useCancelFollowReqs from "../Hooks/useCancleFollowReqs";
import useFollowRequest from "../Hooks/useFollowRequest";
import { Link, useParams } from "react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { removeFollower } from "../Lib/api";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";


const PopupBox = ({ isOpen, onClose, Data = [], label, onUpdate }) => {
    if (!isOpen) return null;

    const { authUser } = useAuthUser();
    const { userName: name } = useParams();
    const { data: notifications } = useNotifications();

    // Local state for refreshing this component only
    const [visibleData, setVisibleData] = useState(Data);

    useEffect(() => {
        setVisibleData(Data);
    }, [Data]);

    const allRequests = notifications?.sendedRequests || [];
    const pendingRecipientIds = allRequests.filter(req => req.status === "pending").map(req => req.recipient._id);
    const acceptedRecipientIds = authUser?.following?.map(req => req._id);

    const { removeOrCancelFollowMutation } = useCancelFollowReqs();
    const { followReqsMutation } = useFollowRequest();
    const queryClient = useQueryClient();

    const removeFollowerMutation = useMutation({
        mutationFn: (userId) => removeFollower(userId),
        onSuccess: (_, userId) => {
            toast.success("Follower removed successfully");
            // Refresh only local data, not the entire page
            setVisibleData(prev => prev.filter(u => u._id !== userId));
            queryClient.invalidateQueries({ queryKey: ["authUser"] });
            if (onUpdate) onUpdate();
        },
        onError: (error) => {
            toast.error(error.response?.data?.message || error.message);
        }
    });

    const handleRemoveFollower = (userId) => {
        if (window.confirm("Are you sure you want to remove this follower?")) {
            removeFollowerMutation.mutate(userId);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex justify-center items-center bg-black/50" onClick={onClose}>
            <div className="w-full max-w-lg sm:w-2/3 md:w-full bg-white rounded-2xl shadow-lg border border-gray-200 py-4 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-center border-b px-5 pb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-100 transition cursor-pointer">
                        <X className="text-gray-600" />
                    </button>
                </div>

                <div className="flex flex-col overflow-y-auto h-80 px-4 pt-4 space-y-4 scrollbar-hide">
                    {visibleData.length === 0 ? (
                        <p className="text-center text-gray-500 text-sm py-10">No {label} yet</p>
                    ) : (
                        visibleData.map((user) => {
                            const isRequested = pendingRecipientIds.includes(user._id);
                            const isAccepted = acceptedRecipientIds.includes(user._id);

                            return (
                                <div key={user._id} className="flex items-center justify-between flex-shrink-0">
                                    <div className="flex items-center">
                                        {user.profilePic ? (
                                            <img src={user.profilePic} alt={user.userName} className="w-10 h-10 rounded-full object-cover" />
                                        ) : (
                                            <UserIcon className="w-10 h-10 rounded-full p-1.5 bg-gray-200 text-gray-500" />
                                        )}
                                        <div className="ml-3">
                                            <Link to={`/profile/${user.userName}`} onClick={onClose} className="font-medium text-gray-900">
                                                {user.userName}
                                            </Link>
                                            {label === "Followers" && authUser?.userName === name && (
                                                <button
                                                    onClick={() => handleRemoveFollower(user._id)}
                                                    className="ml-3 text-xs text-blue-500 cursor-pointer"
                                                    disabled={removeFollowerMutation.isLoading}
                                                >
                                                    {removeFollowerMutation.isLoading ? "Removing..." : "Remove"}
                                                </button>
                                            )}
                                            <p className="text-sm text-gray-500">{user.fullName}</p>
                                        </div>
                                    </div>
                                    {authUser?._id !== user._id && (
                                        <button
                                            onClick={() => {
                                                isRequested || isAccepted
                                                    ? removeOrCancelFollowMutation(user._id, {
                                                        onSuccess: () => {
                                                            toast.success("Cancle Succesfully");
                                                        },
                                                        onError: () => {
                                                            toast.error(error.response?.data?.message || error.message);
                                                        }
                                                    })
                                                    : followReqsMutation(user._id, {
                                                        onSuccess: () => {
                                                            toast.success("Follow request sended Succesfully");
                                                        },
                                                        onError: () => {
                                                            toast.error(error.response?.data?.message || error.message);
                                                        }
                                                    })
                                            }}
                                            className={`py-1.5 px-5 rounded-full transition font-medium text-sm cursor-pointer ${isRequested || isAccepted ? "bg-gray-200 hover:bg-gray-300" : "bg-blue-500 hover:bg-blue-600 text-white"}`}
                                        >
                                            {isRequested ? "Requested" : isAccepted ? "Following" : "Follow"}
                                        </button>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default PopupBox;