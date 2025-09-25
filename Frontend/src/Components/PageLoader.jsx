import { Loader } from 'lucide-react';

const PageLoader = () => {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <Loader className='animate-spin w-12 h-12 text-blue-500' />
        </div>
    );
}

export default PageLoader;