import { Link } from "react-router";
import useAuthUser from "../Hooks/useAuthUser";
import { User } from "lucide-react";
import ChatBox from "../Components/ChatBox";

const ChatPage = ({ showChat }) => {

    const { authUser } = useAuthUser();

    const friends = [...(authUser?.followers || []), ...(authUser?.following || [])];
    const allFriends = friends.filter((friend, index, self) => index === self.findIndex((f) => f._id === friend._id));

    return (
        <div className="h-screen py-12 md:py-0 flex gap-4 p-2 md:p-4">
            {/* Friends list */}
            <aside
                className={`bg-white border border-gray-200 rounded-xl overflow-hidden transition-all duration-300 ${showChat
                    ? "hidden md:flex md:flex-col md:w-60 lg:w-72"
                    : "flex flex-col w-full md:w-72"
                    }`}
            >
                <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                    <div
                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-12 w-12"
                        style={{ backgroundImage: `url(${authUser?.profilePic || ""})` }}
                    />
                    <div>
                        <h1 className="text-gray-800 text-lg font-semibold">
                            {authUser?.fullName || authUser?.userName || "You"}
                        </h1>
                        <p className="text-green-500 text-sm">Online</p>
                    </div>
                </div>
                <div className="p-4 border-b border-gray-200">
                    <input
                        type="text"
                        placeholder="Search friends..."
                        className="w-full px-4 py-2 rounded-full bg-gray-100 border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-400"
                    />
                </div>
                <div className="flex-1 overflow-auto scrollbar-hide">
                    {allFriends.map((friend) => (
                        <Link
                            key={friend._id}
                            to={`/chat/${friend._id}`}
                            className="flex items-center gap-4 px-4 py-3 hover:bg-gray-100"
                        >
                            <div className="relative">
                                {friend.profilePic ? (
                                    <div
                                        className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-12 w-12"
                                        style={{ backgroundImage: `url(${friend.profilePic})` }}
                                    />
                                ) : (
                                    <User className="h-12 w-12 bg-gray-200 p-1.5 rounded-full" />
                                )}
                                <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 border-2 border-white" />
                            </div>
                            <div className="flex flex-col justify-center">
                                <p className="text-gray-800 text-base font-medium truncate">
                                    {friend.userName}
                                </p>
                                <p className="text-gray-500 text-sm truncate">{friend.fullName}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </aside>

            {/* Chat Section */}
            {showChat ? (
                <div className="flex-1 flex flex-col bg-white rounded-xl shadow">
                    <ChatBox currentUser={authUser} />
                </div>
            ) : (
                <div className="hidden md:flex flex-1 text-2xl font-semibold items-center justify-center bg-white rounded-xl shadow">
                    Let's start chat with your friends
                </div>
            )}
        </div>
    )
}

export default ChatPage;