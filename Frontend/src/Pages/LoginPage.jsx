import { useState } from 'react';
import useLogin from '../Hooks/useLogin';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const LoginPage = () => {
    const [loginData, setLoginData] = useState({ emailOrUserName: '', password: '' });
    const { isPending, loginMutation } = useLogin();

    const handleSubmit = (e) => {
        e.preventDefault();
        loginMutation(loginData, {
            onSuccess: () => toast.success('Login successful'),
            onError: (error) => toast.error(error.response?.data?.message || error.message),
        });
    };

    return (
        <motion.div
            className="min-h-screen flex"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
            {/* LEFT SIDE - ILLUSTRATION */}
            <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
                <div className="max-w-lg text-center text-white">
                    <h1 className="text-4xl font-bold mb-6">Connect with Amazing People</h1>
                    <p className="text-xl mb-8 opacity-90">Join thousands of creators, thinkers, and innovators sharing their knowledge and ideas.</p>
                    <div className="relative w-80 h-80 mx-auto">
                        <svg viewBox="0 0 320 320" className="w-full h-full">

                            {/* CONNECTION LINES */}
                            <line x1="80" y1="80" x2="240" y2="160" stroke="rgba(255,255,255,0.3)" strokeWidth="2"
                                className="network-animation" style={{ animationDelay: "0s" }} />
                            <line x1="160" y1="60" x2="80" y2="200" stroke="rgba(255,255,255,0.3)" strokeWidth="2"
                                className="network-animation" style={{ animationDelay: "0.5s" }} />
                            <line x1="240" y1="80" x2="160" y2="240" stroke="rgba(255,255,255,0.3)" strokeWidth="2"
                                className="network-animation" style={{ animationDelay: "1s" }} />
                            <line x1="80" y1="200" x2="240" y2="240" stroke="rgba(255,255,255,0.3)" strokeWidth="2"
                                className="network-animation" style={{ animationDelay: "1.5s" }} />

                            {/* USER NODES */}
                            <circle cx="80" cy="80" r="20" fill="rgba(255,255,255,0.9)" className="network-animation"
                                style={{ animationDelay: "0s" }} />
                            <circle cx="240" cy="80" r="20" fill="rgba(255,255,255,0.9)" className="network-animation"
                                style={{ animationDelay: "0.3s" }} />
                            <circle cx="160" cy="160" r="25" fill="rgba(255,255,255,1)" className="network-animation"
                                style={{ animationDelay: "0.6s" }} />
                            <circle cx="80" cy="240" r="20" fill="rgba(255,255,255,0.9)" className="network-animation"
                                style={{ animationDelay: "0.9s" }} />
                            <circle cx="240" cy="240" r="20" fill="rgba(255,255,255,0.9)" className="network-animation"
                                style={{ animationDelay: "1.2s" }} />

                            {/* USER ICONS */}
                            <text x="80" y="87" textAnchor="middle" fill="#667eea" fontSize="16">👤</text>
                            <text x="240" y="87" textAnchor="middle" fill="#667eea" fontSize="16">👤</text>
                            <text x="160" y="170" textAnchor="middle" fill="#667eea" fontSize="20">👤</text>
                            <text x="80" y="247" textAnchor="middle" fill="#667eea" fontSize="16">👤</text>
                            <text x="240" y="247" textAnchor="middle" fill="#667eea" fontSize="16">👤</text>
                        </svg>
                    </div>
                </div>
            </div>

            {/* RIGHT SIDE - LOGIN FORM */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-md">

                    {/* MOBILE HEADER */}
                    <div className="lg:hidden text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
                        <p className="text-white opacity-90">Sign in to continue</p>
                    </div>

                    {/* LOGIN FORM CARD */}
                    <motion.div
                        className="bg-white rounded-3xl shadow-2xl p-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Sign in to your Account</h2>
                            <p className="text-gray-600">Join our community today</p>
                        </div>

                        {/* LOGIN FORM */}
                        <form className="space-y-6" onSubmit={handleSubmit} aria-label="Login Form">
                            {/* USERNAME/EMAIL FIELD */}
                            <div className="relative">
                                <input type="text" id="username" placeholder=" " value={loginData.emailOrUserName} onChange={(e) => setLoginData({ ...loginData, emailOrUserName: e.target.value })} className="peer w-full px-4 py-3 border border-gray-300 rounded-xl bg-transparent text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-colors duration-200" aria-label="Username or Email" required />
                                <label htmlFor="username" className="absolute left-4 top-3 text-gray-500 bg-white px-1 cursor-text transition-all duration-200 ease-in-out peer-placeholder-shown:text-base peer-focus:text-sm peer-focus:-top-2 peer-focus:text-blue-500 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-sm">
                                    Username or Email
                                </label>
                            </div>

                            {/* PASSWORD FIELD */}
                            <div className="relative">
                                <input type="password" id="password" placeholder=" " value={loginData.password} onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} className="peer w-full px-4 py-3 border border-gray-300 rounded-xl bg-transparent text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-colors duration-200" aria-label="Password" required />
                                <label htmlFor="password" className="absolute left-4 top-3 text-gray-500 bg-white px-1 cursor-text transition-all duration-200 ease-in-out peer-placeholder-shown:text-base peer-focus:text-sm peer-focus:-top-2 peer-focus:text-blue-500 peer-[:not(:placeholder-shown)]:-top-2 peer-[:not(:placeholder-shown)]:text-sm">
                                    Password
                                </label>
                            </div>

                            {/* SUBMIT BUTTON */}
                            <button type="submit" className="w-full cursor-pointer gradient-button text-white font-semibold py-3 px-4 rounded-xl hover:opacity-90 transition-all transform hover:scale-101 active:scale-95 shadow-lg" disabled={isPending} aria-busy={isPending} aria-label="Login">
                                {isPending ? (
                                    <>
                                        <span className="loading loading-spinner loading-xs" aria-hidden="true"></span>
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign in'
                                )}
                            </button>
                        </form>

                        {/* TRUST BADGE */}
                        <div className="mt-6 flex items-center justify-center space-x-6 text-xs text-gray-500">
                            <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd"
                                        d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                        clipRule="evenodd"></path>
                                </svg>
                                SSL Secured
                            </div>
                            <div className="flex items-center">
                                <svg className="w-4 h-4 mr-1 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd"
                                        d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                        clipRule="evenodd"></path>
                                </svg>
                                Privacy Protected
                            </div>
                        </div>

                        {/* LOGIN LINK */}
                        <div className="mt-6 text-center">
                            <p className="text-gray-600 font-medium">Don't have an account? <Link to="/signup" className="text-blue-600 hover:underline font-medium">SignUp</Link></p>
                        </div>

                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default LoginPage;