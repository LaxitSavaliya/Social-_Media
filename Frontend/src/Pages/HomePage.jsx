import { motion } from "framer-motion";
import PostCard from "../Components/PostCard";

const HomePage = () => {
    const stories = ["Sarah", "John"];

    return (
        <div className="flex justify-center w-full">
            <div className="flex-1 w-full sm:max-w-xl lg:max-w-2xl mx-auto">

                {/* STORIES */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white rounded-2xl shadow-lg border border-gray-200 p-4 sm:p-6 mb-4 sm:mb-6 mt-4 sm:mt-6"
                >
                    <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
                        {stories.map((name, i) => (
                            <motion.div
                                key={i}
                                className="flex-shrink-0 text-center"
                                whileHover={{ scale: 1.1 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <div className="story-ring rounded-full">
                                    <img
                                        src={`data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 64 64'%3E%3Ccircle cx='32' cy='32' r='32' fill='%23f59e0b'/%3E%3Ctext x='32' y='40' text-anchor='middle' font-size='24' fill='white'%3E👩%3C/text%3E%3C/svg%3E`}
                                        alt="Story"
                                        className="w-14 h-14 sm:w-16 sm:h-16 rounded-full object-cover"
                                    />
                                </div>
                                <p className="text-xs mt-2 text-gray-600">{name}</p>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* POSTS */}
                <PostCard />

            </div>
        </div>
    );
};

export default HomePage;