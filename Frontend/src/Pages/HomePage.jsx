import { motion } from "framer-motion";
import PostCard from "../Components/PostCard";

const HomePage = () => {
    const stories = ["Sarah", "John", "Emma", "Alex", "Mia", "James"];

    return (
        <div className="flex justify-center w-full">
            <div className="flex-1 w-full sm:max-w-xl lg:max-w-2xl mx-auto">

                {/* STORIES */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6 mt-4 sm:mt-6"
                >
                    <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
                        {stories.map((name, i) => (
                            <div key={i} className="flex-shrink-0 text-center">
                                <div className="relative p-[2px] rounded-full bg-gradient-to-tr from-pink-500 via-yellow-500 to-purple-500">
                                    <img
                                        src={`https://ui-avatars.com/api/?name=${name}&background=random`}
                                        alt="Story"
                                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover border-2 border-white"
                                    />
                                </div>
                                <p className="text-xs mt-2 text-gray-600 truncate w-14 sm:w-16">{name}</p>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* POSTS */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    <PostCard />
                </motion.div>

            </div>
        </div>
    );
};

export default HomePage;