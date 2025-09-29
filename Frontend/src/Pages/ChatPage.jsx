import { Link } from "react-router";
import useAuthUser from "../Hooks/useAuthUser";
import { User } from "lucide-react";
import ChatBox from "../Components/ChatBox";

const ChatPage = ({ showChat }) => {

    const { authUser } = useAuthUser();

    const friends = [...(authUser?.followers || []), ...(authUser?.following || [])];
    const allFriends = friends.filter((friend, index, self) => index === self.findIndex((f) => f._id === friend._id));

    return (
        <div className="h-screen py-12 md:py-0 flex">
            {/* Friends list */}
            <div
                className={`${showChat
                    ? "hidden md:flex md:flex-col md:w-60 lg:w-72"
                    : "flex flex-col w-full md:w-72"
                    }`}
            >
                <div className="border-b md:border border-gray-400 py-5 text-2xl font-semibold text-center">
                    Your Friends
                </div>
                <div className="flex-1 md:border border-gray-400 flex flex-col gap-3 py-3 overflow-auto scrollbar-hide">
                    {allFriends.map((friend) => (
                        <Link
                            key={friend._id}
                            to={`/chat/${friend._id}`}
                            className="flex items-center p-2 gap-3 hover:bg-gray-200"
                        >
                            {friend.profilePic ? (
                                <img
                                    src={friend.profilePic}
                                    className="h-12 w-12 bg-gray-200 rounded-full"
                                />
                            ) : (
                                <User className="h-12 w-12 bg-gray-200 p-1.5 rounded-full" />
                            )}
                            <div>
                                <h1 className="font-semibold">{friend.userName}</h1>
                                <h1 className="text-sm">{friend.fullName}</h1>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>

            {/* Chat Section */}
            {showChat ? (
                <div className="flex-1 flex items-center justify-center md:py-10">
                    <ChatBox currentUser={authUser} />
                </div>
            ) : (
                <div className="hidden md:flex flex-1 border text-2xl font-semibold items-center justify-center">
                    Let's start chat with your friends
                </div>
            )}
        </div>
    )
}

export default ChatPage;