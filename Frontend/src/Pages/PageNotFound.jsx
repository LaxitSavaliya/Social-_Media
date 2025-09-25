import { Link } from "react-router";

const PageNotFound = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <h1 className="text-5xl font-bold mb-4">404</h1>
            <p className="text-xl mb-4">Page Not Found</p>
            <Link to="/" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">Go to Home</Link>
        </div>
    );
};

export default PageNotFound;
