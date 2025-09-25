import toast from 'react-hot-toast';
import useAuthUser from '../Hooks/useAuthUser';
import useOnboarding from '../Hooks/useOnboarding';
import { useState } from 'react';
import { motion } from 'framer-motion';

const OnboardingPage = () => {
    const { authUser } = useAuthUser();

    const [onboardingData, setOnboardingData] = useState({
        profilePic: null,
        userName: authUser?.userName || '',
        fullName: authUser?.fullName || '',
        bio: authUser?.bio || '',
        birthDate: authUser?.birthDate || '',
        gender: authUser?.gender || '',
        location: authUser?.location || '',
    });
    const [previewUrl, setPreviewUrl] = useState('');

    const { isPending, onboardingMutation } = useOnboarding();

    const handleSubmit = (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('image', onboardingData.profilePic);
        formData.append('userName', onboardingData.userName);
        formData.append('fullName', onboardingData.fullName);
        formData.append('bio', onboardingData.bio);
        if (onboardingData.birthDate) {
            const [year, month, day] = onboardingData.birthDate.split('-');
            formData.append('birthDate', `${day}-${month}-${year}`);
        }
        formData.append('gender', onboardingData.gender);
        formData.append('location', onboardingData.location);

        onboardingMutation(formData, {
            onSuccess: () => toast.success('Profile created successfully'),
            onError: (err) => toast.error(err.response?.data?.message || err.message),
        });
    };

    return (
        <motion.div
            className="min-h-screen flex items-center justify-center p-4 relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
            <div className="w-full max-w-6xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-8 items-center">
                    {/* LEFT SIDE */}
                    <motion.div
                        className="hidden lg:block text-white"
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <div className="max-w-lg">
                            <h1 className="text-5xl font-bold mb-6 leading-tight">
                                Welcome to Your
                                <span className="bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent"> Journey</span>
                            </h1>
                            <p className="text-xl mb-8 opacity-90 leading-relaxed">
                                Complete your profile to unlock personalized experiences, connect with amazing people, and start building your digital identity.
                            </p>
                            {/* FEATURES */}
                            <div className="space-y-4">
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-white opacity-30 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5" viewBox="0 0 20 20">
                                            <path fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"></path>
                                        </svg>
                                    </div>
                                    <span className="text-lg">Personalize your profile</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-white opacity-30 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5" viewBox="0 0 20 20">
                                            <path fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"></path>
                                        </svg>
                                    </div>
                                    <span className="text-lg">Connect with friends</span>
                                </div>
                                <div className="flex items-center space-x-3">
                                    <div className="w-8 h-8 bg-white opacity-30 rounded-full flex items-center justify-center">
                                        <svg className="w-5 h-5" viewBox="0 0 20 20">
                                            <path fillRule="evenodd"
                                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                                clipRule="evenodd"></path>
                                        </svg>
                                    </div>
                                    <span className="text-lg">Secure and private</span>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* RIGHT SIDE */}
                    <motion.div
                        className="w-full"
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <div className="backdrop-blur-xl bg-white border border-white/20 rounded-3xl shadow-2xl p-8">
                            <h2 className="text-2xl text-center font-bold text-gray-800 mb-4">Complete Your Profile</h2>
                            <form className="space-y-4" onSubmit={handleSubmit} aria-label="Onboarding-Form">
                                {/* PROFILE PICTURE */}
                                <div className="text-center">
                                    <div className="relative inline-block group mx-auto">
                                        <img src={previewUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Ccircle cx='60' cy='60' r='60' fill='%23f8fafc'/%3E%3Ccircle cx='60' cy='45' r='20' fill='%23cbd5e1'/%3E%3Cpath d='M30 100c0-16.569 13.431-30 30-30s30 13.431 30 30' fill='%23cbd5e1'/%3E%3C/svg%3E"}
                                            alt="Profile Preview" id="profilePreview" className="w-[120px] h-[120px] rounded-full object-cover border-4 border-blue-500 transition-all duration-300 ease-in-out" />
                                        <label htmlFor="profilePic" className="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center opacity-0 transition-all duration-300 ease-in-out hover:opacity-70">
                                            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor"
                                                viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z">
                                                </path>
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                    d="M15 13a3 3 0 11-6 0 3 3 0 016 0z">
                                                </path>
                                            </svg>
                                        </label>
                                    </div>
                                    <input type="file" accept="image/*" className="hidden" id="profilePic"
                                        onChange={(e) => {
                                            const file = e.target.files[0];
                                            setOnboardingData({ ...onboardingData, profilePic: file });
                                            if (file) setPreviewUrl(URL.createObjectURL(file));
                                        }} />
                                </div>

                                {/* USERNAME */}
                                <div className="relative group">
                                    <input type="text" placeholder=" " id="userName" value={onboardingData.userName} onChange={(e) => setOnboardingData({ ...onboardingData, userName: e.target.value })} className="peer w-full px-4 py-3 border border-gray-300 rounded-xl bg-transparent text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-colors duration-200" aria-label="Username" required />
                                    <label htmlFor="userName" className="absolute left-4 top-3 text-gray-500 bg-white px-1 cursor-text transition-all duration-200 ease-in-out peer-placeholder-shown:text-base peer-focus:text-sm peer-focus:-top-3 peer-focus:text-blue-500 peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:text-sm">userName</label>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z">
                                            </path>
                                        </svg>
                                    </div>
                                </div>

                                {/* FULLNAME */}
                                <div className="relative group">
                                    <input type="text" placeholder=" " id="fullName" value={onboardingData.fullName} onChange={(e) => setOnboardingData({ ...onboardingData, fullName: e.target.value })} className="peer w-full px-4 py-3 border border-gray-300 rounded-xl bg-transparent text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-colors duration-200" aria-label="FullName" required />
                                    <label htmlFor="fullName" className="absolute left-4 top-3 text-gray-500 bg-white px-1 cursor-text transition-all duration-200 ease-in-out peer-placeholder-shown:text-base peer-focus:text-sm peer-focus:-top-3 peer-focus:text-blue-500 peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:text-sm">fullName</label>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z">
                                            </path>
                                        </svg>
                                    </div>
                                </div>

                                {/* BIO */}
                                <div className="relative group">
                                    <textarea placeholder=" " id="bio" value={onboardingData.bio} onChange={(e) => setOnboardingData({ ...onboardingData, bio: e.target.value })} className="peer w-full px-4 py-3 border border-gray-300 rounded-xl bg-transparent text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-colors duration-200" aria-label="Bio" />
                                    <label htmlFor="bio" className="absolute left-4 top-3 text-gray-500 bg-white px-1 cursor-text transition-all duration-200 ease-in-out peer-placeholder-shown:text-base peer-focus:text-sm peer-focus:-top-3 peer-focus:text-blue-500 peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:text-sm">bio</label>
                                    <div className="absolute bottom-3 right-3">
                                        <span className="text-xs text-gray-400">{onboardingData.bio.length}/100</span>
                                    </div>
                                </div>

                                {/* BIRTHDATE */}
                                <div className="relative group">
                                    <input type="date" placeholder=" " id="birthDate" value={onboardingData.birthDate} onChange={(e) => setOnboardingData({ ...onboardingData, birthDate: e.target.value })} className="peer w-full cursor-pointer px-4 py-3 border border-gray-300 rounded-xl bg-transparent text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-colors duration-200" aria-label="BirthDate" required />
                                    <label htmlFor="birthDate" className="absolute left-4 top-3 text-gray-500 bg-white px-1 cursor-text transition-all duration-200 ease-in-out peer-placeholder-shown:text-base peer-focus:text-sm peer-focus:-top-3 peer-focus:text-blue-500 peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:text-sm">birthDate</label>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                                    {/* GENDER */}
                                    <div className="relative group">
                                        <select name="gender" value={onboardingData.gender} onChange={(e) => setOnboardingData({ ...onboardingData, gender: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-transparent text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-colors duration-200" aria-label="Gender" required>
                                            <option value="">Select Gender</option>
                                            <option value="male">Male</option>
                                            <option value="female">Female</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    {/* LOCATION */}
                                    <div className="relative group">
                                        <input type="text" placeholder=" " id="location" value={onboardingData.location} onChange={(e) => setOnboardingData({ ...onboardingData, location: e.target.value })} className="peer w-full px-4 py-3 border border-gray-300 rounded-xl bg-transparent text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-colors duration-200" />
                                        <label htmlFor="location" className="absolute left-4 top-3 text-gray-500 bg-white px-1 cursor-text transition-all duration-200 ease-in-out peer-placeholder-shown:text-base peer-focus:text-sm peer-focus:-top-3 peer-focus:text-blue-500 peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:text-sm">Location</label>
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z">
                                                </path>
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z">
                                                </path>
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* SUBMIT */}
                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        className="bg-[linear-gradient(135deg,#3b82f6_0%,#8b5cf6_100%)] shadow-[0_4px_15px_rgba(59,130,246,0.3)] transition-all duration-300 hover:scale-101 active:scale-95 hover:shadow-[0_8px_25px_rgba(59,130,246,0.4)] w-full px-6 py-3 rounded-xl text-base relative text-white cursor-pointer font-semibold"
                                        disabled={isPending}
                                        aria-busy={isPending}
                                        aria-label="Submit"
                                    >
                                        {isPending ? 'Submitting...' : 'Submit'}
                                    </button>
                                </div>
                            </form>

                            {/* TRUST MESSAGE */}
                            <div className="mt-4 text-center">
                                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                                    <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd"
                                            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
                                            clipRule="evenodd"></path>
                                    </svg>
                                    <span>Your information is secure and encrypted</span>
                                </div>
                            </div>

                        </div>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
};

export default OnboardingPage;