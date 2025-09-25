import { Navigate, useNavigate, useParams } from "react-router";
import useAuthUser from "../Hooks/useAuthUser";
import { useState } from "react";
import useUpdateProfile from "../Hooks/useUpdateProfile";
import toast from "react-hot-toast";

const toInputDateFormat = (ddmmyyyy) => {
    if (!ddmmyyyy) return "";
    const [day, month, year] = ddmmyyyy.split("-");
    return `${year}-${month}-${day}`;
};

const UpdateProfile = () => {
    const navigate = useNavigate();
    const { userName } = useParams();
    const { authUser } = useAuthUser();

    if (userName !== authUser?.userName) {
        return <Navigate to="/404" replace={true} />;
    }

    const [updateData, setUpdateData] = useState({
        profilePic: null,
        userName: authUser?.userName || "",
        fullName: authUser?.fullName || "",
        bio: authUser?.bio || "",
        birthDate: authUser?.birthDate || "",
        gender: authUser?.gender || "",
        location: authUser?.location || "",
    });

    const [previewUrl, setPreviewUrl] = useState(authUser?.profilePic || "");
    const { isPending, updateProfileMutation } = useUpdateProfile();

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        if (updateData.profilePic) formData.append("image", updateData.profilePic);
        formData.append("userName", updateData.userName);
        formData.append("fullName", updateData.fullName);
        formData.append("bio", updateData.bio);
        formData.append("birthDate", updateData.birthDate);
        formData.append("gender", updateData.gender);
        formData.append("location", updateData.location);
        formData.append("removeProfilePic", previewUrl === "" ? "true" : "false");

        updateProfileMutation({ userId: authUser?._id, updateData: formData }, {
            onSuccess: () => {
                toast.success("Profile updated successfully");
                navigate("/", { replace: true });
            },
            onError: (err) => {
                toast.error(err.response?.data?.message || err.message);
            }
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative">
            <div className="w-full fade-in">
                <div className="backdrop-blur-xl bg-white border border-white/20 rounded-3xl shadow-2xl p-8">
                    <h2 className="text-2xl text-center font-bold text-gray-800 mb-4">Update Your Profile</h2>
                    <form className="space-y-4" onSubmit={handleSubmit} aria-label="Update-Profile-Form">
                        {/* Profile Picture Section */}
                        <div className="text-center flex flex-col justify-center items-center gap-2">
                            <div className="relative inline-block group mx-auto">
                                <img src={previewUrl || "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' viewBox='0 0 120 120'%3E%3Ccircle cx='60' cy='60' r='60' fill='%23f8fafc'/%3E%3Ccircle cx='60' cy='45' r='20' fill='%23cbd5e1'/%3E%3Cpath d='M30 100c0-16.569 13.431-30 30-30s30 13.431 30 30' fill='%23cbd5e1'/%3E%3C/svg%3E"}
                                    alt="Profile Preview" id="profilePreview" className="w-[120px] h-[120px] rounded-full object-cover border-4 border-blue-500 transition-all duration-300 ease-in-out" />
                                <label htmlFor="profilePic" className="cursor-pointer absolute inset-0 bg-black/70 rounded-full flex items-center justify-center opacity-0 transition-all duration-300 ease-in-out hover:opacity-70">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                    </svg>
                                </label>
                            </div>
                            <input type="file" accept="image/*" className="hidden" id="profilePic" onChange={(e) => {
                                const file = e.target.files[0];
                                setUpdateData({ ...updateData, profilePic: file });
                                if (file) setPreviewUrl(URL.createObjectURL(file));
                            }} />
                            <button type="button" className="bg-blue-500 text-white px-5 py-1 rounded-lg hover:bg-blue-600 transition-all duration-300 ease-in-out cursor-pointer" onClick={() => { setUpdateData({ ...updateData, profilePic: null }); setPreviewUrl(""); }}>
                                Remove Profile Picture
                            </button>
                        </div>
                        {/* USERNAME */}
                        <div className="relative group">
                            <input type="text" placeholder=" " id="userName" value={updateData.userName} onChange={(e) => setUpdateData({ ...updateData, userName: e.target.value })} className="peer w-full px-4 py-3 border border-gray-300 rounded-xl bg-transparent text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-colors duration-200" aria-label="Username" required />
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
                            <input type="text" placeholder=" " id="fullName" value={updateData.fullName} onChange={(e) => setUpdateData({ ...updateData, fullName: e.target.value })} className="peer w-full px-4 py-3 border border-gray-300 rounded-xl bg-transparent text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-colors duration-200" aria-label="FullName" required />
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
                            <textarea placeholder=" " id="bio" value={updateData.bio} onChange={(e) => setUpdateData({ ...updateData, bio: e.target.value })} className="peer w-full px-4 py-3 border border-gray-300 rounded-xl bg-transparent text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-colors duration-200" aria-label="Bio" />
                            <label htmlFor="bio" className="absolute left-4 top-3 text-gray-500 bg-white px-1 cursor-text transition-all duration-200 ease-in-out peer-placeholder-shown:text-base peer-focus:text-sm peer-focus:-top-3 peer-focus:text-blue-500 peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:text-sm">bio</label>
                            <div className="absolute bottom-3 right-3">
                                <span className="text-xs text-gray-400">{updateData.bio.length}/100</span>
                            </div>
                        </div>

                        {/* BIRTHDATE */}
                        <div className="relative group">
                            <input type="date" placeholder=" " id="birthDate" value={toInputDateFormat(updateData.birthDate)} onChange={(e) => setUpdateData({ ...updateData, birthDate: toInputDateFormat(e.target.value) })} className="peer w-full cursor-pointer px-4 py-3 border border-gray-300 rounded-xl bg-transparent text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-colors duration-200" aria-label="BirthDate" required />
                            <label htmlFor="birthDate" className="absolute left-4 top-3 text-gray-500 bg-white px-1 cursor-text transition-all duration-200 ease-in-out peer-placeholder-shown:text-base peer-focus:text-sm peer-focus:-top-3 peer-focus:text-blue-500 peer-[:not(:placeholder-shown)]:-top-3 peer-[:not(:placeholder-shown)]:text-sm">birthDate</label>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                            {/* GENDER */}
                            <div className="relative group">
                                <select name="gender" value={updateData.gender} onChange={(e) => setUpdateData({ ...updateData, gender: e.target.value })} className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-transparent text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-colors duration-200" aria-label="Gender" required>
                                    <option value="">Select Gender</option>
                                    <option value="male">Male</option>
                                    <option value="female">Female</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            {/* LOCATION */}
                            <div className="relative group">
                                <input type="text" placeholder=" " id="location" value={updateData.location} onChange={(e) => setUpdateData({ ...updateData, location: e.target.value })} className="peer w-full px-4 py-3 border border-gray-300 rounded-xl bg-transparent text-gray-900 focus:border-transparent focus:ring-2 focus:ring-blue-500 outline-none transition-colors duration-200" />
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
                            <button type="submit" className="bg-gradient-to-r from-blue-500 to-purple-500 shadow-lg hover:scale-101 active:scale-95 w-full px-6 py-3 rounded-xl text-base text-white font-semibold" disabled={isPending} aria-busy={isPending} aria-label="Submit">
                                {isPending ? <span className="loading loading-spinner loading-xs" aria-hidden="true">Updating...</span> : "Save Changes"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default UpdateProfile;