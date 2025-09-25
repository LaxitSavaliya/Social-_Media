import { Link } from "react-router";

const PageNotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-50">
            <h1 className="text-6xl font-extrabold text-gray-800 mb-4 animate-bounce">404</h1>
            <p className="text-xl text-gray-600 mb-4">Oops! Page Not Found</p>
            <Link to="/" className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition-all duration-300">
                Go to Home
            </Link>
        </div>
    );
};

export default PageNotFound;