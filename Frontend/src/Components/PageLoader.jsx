import { Loader } from 'lucide-react';

const PageLoader = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Loader className='animate-spin w-10 h-10 text-blue-500' />
        </div>
    );
}

export default PageLoader;