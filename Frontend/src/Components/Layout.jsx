import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";

const Layout = ({ children, showRightSidebar = false }) => {
    return (
        <div className="min-h-screen flex bg-gray-50">
            <LeftSidebar />
            <main className="flex-1 overflow-y-auto ml-0 md:ml-20 xl:ml-60 h-screen scrollbar-hide">
                {children}
            </main>
            {showRightSidebar && <RightSidebar />}
        </div>
    );
};

export default Layout;