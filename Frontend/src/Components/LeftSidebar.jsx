import { useState } from "react";
import { Bell, CirclePlus, Compass, House, LogOut, MessageCircleMore, Search, Settings, User } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import useAuthUser from "../Hooks/useAuthUser";
import useLogout from "../Hooks/useLogout";

import Logo from "../assets/logo.svg";
import CreateModel from "./CreateModel";
import SearchModel from "./SearchModel";

const navItems = [
    { path: "/", label: "Home", icon: <House className="w-6 h-6" /> },
    { path: "/search", label: "Search", icon: <Search className="w-6 h-6" /> },
    { path: "/explore", label: "Explore", icon: <Compass className="w-6 h-6" /> },
    { path: "/messages", label: "Messages", icon: <MessageCircleMore className="w-6 h-6" /> },
    { path: "/notifications", label: "Notifications", icon: <Bell className="w-6 h-6" /> },
    { path: "/create", label: "Create", icon: <CirclePlus className="w-6 h-6" /> },
    { path: "/settings", label: "Settings", icon: <Settings className="w-6 h-6" /> },
];

const mobileNavItems = [
    { path: "/", label: "Home", icon: <House className="w-6 h-6" /> },
    { path: "/search", label: "Search", icon: <Search className="w-6 h-6" /> },
    { path: "/create", label: "Create", icon: <CirclePlus className="w-6 h-6" /> },
    { path: "/notifications", label: "Notifications", icon: <Bell className="w-6 h-6" /> },
];

const LeftSidebar = () => {
    const [showCreateModel, setShowCreateModel] = useState(false);
    const [showSearchModel, setShowSearchModel] = useState(false);

    const { authUser } = useAuthUser();
    const { logoutMutation } = useLogout();
    const location = useLocation();
    const currentPath = location.pathname;

    // --- Helper for nav items ---
    const renderNavItem = (item) => {
        const isActive = currentPath === item.path;
        const baseClasses = "flex items-center justify-center xl:justify-start w-full px-4 py-3 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-200";

        if (item.path === "/create") {
            return (
                <button key={item.label} onClick={() => setShowCreateModel(true)} className={baseClasses}>
                    {item.icon}
                    <span className="hidden xl:inline ml-3">{item.label}</span>
                </button>
            );
        }

        if (item.path === "/search") {
            return (
                <button key={item.label} onClick={() => setShowSearchModel(true)} className={baseClasses}>
                    {item.icon}
                    <span className="hidden xl:inline ml-3">{item.label}</span>
                </button>
            );
        }

        return (
            <Link key={item.label} to={item.path} className={`${baseClasses} ${isActive ? "bg-gray-300 font-semibold" : ""}`}>
                {item.icon}
                <span className="hidden xl:inline ml-3">{item.label}</span>
            </Link>
        );
    };

    return (
        <>
            {/* Desktop Sidebar */}
            <div className="hidden md:flex flex-col fixed top-0 left-0 h-screen z-10 w-20 lg:w-20 xl:w-60 2xl:w-60 bg-white shadow-lg border-r border-gray-200">
                {/* Logo */}
                <div className="flex items-center justify-center xl:justify-start gap-2 p-6 border-b border-gray-200">
                    <img src={Logo} className="w-10 h-10" alt="Logo" />
                    <h1 className="hidden xl:inline text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 bg-clip-text text-transparent">
                        Social Media
                    </h1>
                </div>

                {/* Nav */}
                <nav className="mt-6 flex-1 flex flex-col items-center xl:items-start px-2 xl:px-4 space-y-3 overflow-y-auto">
                    {navItems.map(renderNavItem)}

                    {/* Logout */}
                    <button onClick={logoutMutation} className="flex items-center justify-center xl:justify-start w-full px-4 py-3 rounded-xl text-gray-700 hover:text-gray-900 hover:bg-gray-200">
                        <LogOut />
                        <span className="hidden xl:inline ml-3">Logout</span>
                    </button>
                </nav>

                {/* User Profile */}
                <div className="p-1.5 border-t mt-auto flex justify-center xl:justify-start">
                    <Link
                        to={`/profile/${authUser?.userName}`}
                        className={`flex items-center gap-2 xl:gap-4 hover:bg-gray-200 rounded-xl px-4 py-3 w-full ${currentPath === `/profile/${authUser?.userName}` ? "bg-gray-300 font-semibold" : ""}`}
                    >
                        {authUser?.profilePic ? (
                            <img src={authUser.profilePic} alt={authUser.name} className="w-10 h-10 rounded-full" />
                        ) : (
                            <User className="w-10 h-10 rounded-full bg-gray-300 p-1.5" />
                        )}
                        <div className="hidden xl:flex flex-col">
                            <p className="font-semibold text-sm">{authUser?.userName}</p>
                            <p className="text-xs text-success flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-green-600 inline-block" />
                                Online
                            </p>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Mobile Bottom Navbar */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg flex justify-around items-center md:hidden h-16 z-50">
                {mobileNavItems.map((item) => (
                    <Link key={item.label} to={item.path} className={`flex flex-col items-center justify-center text-gray-700 ${currentPath === item.path ? "text-blue-500" : ""}`}>
                        {item.icon}
                    </Link>
                ))}
                <Link to={`/profile/${authUser?.userName}`} className={`flex flex-col items-center justify-center rounded-full bg-gray-200 ${currentPath === `/profile/${authUser?.userName}` ? "text-blue-500" : ""}`}>
                    <img src={authUser?.profilePic} alt={authUser?.name} className="w-8 h-8 rounded-full" />
                </Link>
            </div>

            {/* Modals */}
            {showCreateModel && <CreateModel onClose={() => setShowCreateModel(false)} />}
            {showSearchModel && <SearchModel onClose={() => setShowSearchModel(false)} />}
        </>
    );
};

export default LeftSidebar;