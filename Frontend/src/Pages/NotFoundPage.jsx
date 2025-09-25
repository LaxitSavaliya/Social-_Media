import { Link } from "react-router";

const NotFoundPage = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-5xl font-bold mb-4">404</h1>
            <p className="text-xl mb-4">Page Not Found</p>
            <Link to="/" className="bg-blue-500 hover:bg-blue-600 transition-colors p-2 px-4 rounded-lg text-white">Go to Home</Link>
        </div>
    );
};

export default NotFoundPage;