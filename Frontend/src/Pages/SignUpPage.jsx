import { useState } from 'react';
import useSignUp from '../Hooks/useSignUp';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const SignUpPage = () => {
    const [signUpData, setSignUpData] = useState({ fullName: '', userName: '', email: '', password: '' });
    const { isPending, signUpMutation } = useSignUp();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (signUpData.password.length < 6) {
            toast.error('Password must be at least 6 characters long');
            return;
        }

        signUpMutation(signUpData, {
            onSuccess: () => toast.success('Account created successfully'),
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

            {/* RIGHT SIDE - SIGNUP FORM */}
            <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
                <div className="w-full max-w-md">

                    {/* MOBILE HEADER */}
                    <div className="lg:hidden text-center mb-8">
                        <h1 className="text-3xl font-bold text-white mb-2">Join Us</h1>
                        <p className="text-white opacity-90">Connect with Amazing People</p>
                    </div>

                    {/* SIGNUP FORM CARD */}
                    <motion.div
                        className="bg-white rounded-3xl shadow-2xl p-8"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                    >
                        {/* FORM HEADER */}
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-800 mb-2">Create an Account</h2>
                            <p className="text-gray-600">Join our community today</p>
                        </div>

                        {/* SIGNUP FORM */}
                        <form className="space-y-6" onSubmit={handleSubmit} aria-label="SignUp Form">

                            {/* FULLNAME FIELD */}
                            <div className="relative">
                                <input type="text" id="fullName" placeholder=" " value={signUpData.fullName} onChange={(e) => setSignUpData({ ...signUpData, fullName: e.target.value })} className="peer w-full px-4 py-3 border border-gray-300 rounded-xl bg-transparent text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-colors duration-200" aria-label="Full Name" required />
                                <label htmlFor="fullName" className="absolute left-4 top-3 text-gray-500 bg-white px-1 cursor-text transition-all duration-200 ease-in-out peer-placeholder-shown:text-base peer-focus:text-sm peer-focus:-top-3 peer-focus:text-blue-500 peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:text-sm">
                                    Full Name
                                </label>
                            </div>

                            {/* USERNAME FIELD */}
                            <div className="relative">
                                <input type="text" id="username" placeholder=" " value={signUpData.userName} onChange={(e) => setSignUpData({ ...signUpData, userName: e.target.value })} className="peer w-full px-4 py-3 border border-gray-300 rounded-xl bg-transparent text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-colors duration-200" aria-label="Username" required />
                                <label htmlFor="username" className="absolute left-4 top-3 text-gray-500 bg-white px-1 cursor-text transition-all duration-200 ease-in-out peer-placeholder-shown:text-base peer-focus:text-sm peer-focus:-top-3 peer-focus:text-blue-500 peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:text-sm">
                                    Username
                                </label>
                            </div>

                            {/* EMAIL FIELD */}
                            <div className="relative">
                                <input type="email" id="email" placeholder=" " value={signUpData.email} onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })} className="peer w-full px-4 py-3 border border-gray-300 rounded-xl bg-transparent text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-colors duration-200" aria-label="Email Address" required />
                                <label htmlFor="email" className="absolute left-4 top-3 text-gray-500 bg-white px-1 cursor-text transition-all duration-200 ease-in-out peer-placeholder-shown:text-base peer-focus:text-sm peer-focus:-top-3 peer-focus:text-blue-500 peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:text-sm">
                                    Email Address
                                </label>
                            </div>

                            {/* PASSWORD FIELD */}
                            <div className="relative">
                                <input type="password" id="password" placeholder=" " value={signUpData.password} onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })} className="peer w-full px-4 py-3 border border-gray-300 rounded-xl bg-transparent text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-colors duration-200" aria-label="Password" required />
                                <label htmlFor="password" className="absolute left-4 top-3 text-gray-500 bg-white px-1 cursor-text transition-all duration-200 ease-in-out peer-placeholder-shown:text-base peer-focus:text-sm peer-focus:-top-3 peer-focus:text-blue-500 peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:text-sm">
                                    Password
                                </label>
                            </div>

                            {/* TERMS CHECKBOX */}
                            <div className="flex items-center">
                                <input type="checkbox" id="terms" className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" required />
                                <label htmlFor="terms" className="ml-3 text-sm text-gray-600">
                                    I agree to the <a href="#" className="text-blue-600 hover:underline">Terms of Service</a> and <a href="#" className="text-blue-600 hover:underline">Privacy Policy</a>
                                </label>
                            </div>

                            {/* SUBMIT BUTTON */}
                            <button type="submit" className="w-full cursor-pointer gradient-button text-white font-semibold py-3 px-4 rounded-xl hover:opacity-90 transition-all transform hover:scale-101 active:scale-95 shadow-lg" disabled={isPending} aria-busy={isPending} aria-label="Create Account">
                                {isPending ? (
                                    <>
                                        <span className="loading loading-spinner loading-xs" aria-hidden="true"></span>
                                        Creating Account...
                                    </>
                                ) : (
                                    "Create Account"
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
                            <p className="text-gray-600 font-medium">Already have an account? <Link to="/login" className="text-blue-600 hover:underline font-medium">Sign in</Link></p>
                        </div>

                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default SignUpPage;