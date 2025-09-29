import axiosInstance from "./axios"

export const getAuthUser = async () => {
    try {
        const response = await axiosInstance.get("/auth/user");
        return response.data;
    } catch (error) {
        console.error("Error fetching auth user:", error);
        return null;
    }
}

export const signUp = async (signUpData) => {
    const response = await axiosInstance.post("/auth/signup", signUpData);
    return response.data;
}

export const login = async (loginData) => {
    const response = await axiosInstance.post("/auth/login", loginData);
    return response.data;
}

export const logout = async () => {
    const response = await axiosInstance.post("/auth/logout");
    return response.data;
}

export const onboarding = async (onboardingData) => {
    const response = await axiosInstance.post("/auth/onboard", onboardingData, {
        headers: {
            "Content-Type": "multipart/form-data",
        }
    });
    return response.data;
}

export const getPosts = async () => {
    const response = await axiosInstance.get("/posts/get-posts");
    return response.data;
}

export const toggleLike = async (postId) => {
    const response = await axiosInstance.post(`/posts/${postId}/like`);
    return response.data;
}

export const createComment = async (postId, commentData) => {
    const response = await axiosInstance.post(`/comments/create-comment/${postId}`, commentData);
    return response.data;
}

export const getRecommendedUsers = async () => {
    const response = await axiosInstance.get("/users/recommended-users");
    return response.data;
}

export const sendFollowRequest = async (userId) => {
    const response = await axiosInstance.post(`/follows/follow-request/${userId}`);
    return response.data;
}

export const getUserData = async (userName) => {
    const response = await axiosInstance.get(`/users/${userName}`);
    return response.data;
}

export const getNotifications = async () => {
    const response = await axiosInstance.get("/users/notifications");
    return response.data;
}

export const removeOrCancelFollow = async (userId) => {
    const response = await axiosInstance.delete(`/follows/follow-request/${userId}/removeOrCancelFollow`);
    return response.data;
}

export const acceptFollowRequest = async (requestId) => {
    const response = await axiosInstance.put(`/follows/follow-request/${requestId}/accept`);
    return response.data;
}

export const getPostData = async (postId) => {
    const response = await axiosInstance.get(`posts/get-user-posts/${postId}`);
    return response.data;
}

export const createPost = async (postData) => {
    const response = await axiosInstance.post("/posts/create-post", postData);
    return response.data;
}

export const fetchUsers = async (name) => {
    const response = await axiosInstance.get(`/users/fetch-users/${name}`);
    return response.data.users || [];
};

export const removeFollower = async (userId) => {
    const response = await axiosInstance.post(`/follows/remove-follower/${userId}`);
    return response.data;
};

export const updateProfile = async (userId, updateData) => {
    const response = await axiosInstance.patch(`/users/update-profile/${userId}`, updateData, {
        headers: {
            "Content-Type": "multipart/form-data",
        }
    });
    return response.data;
}

export const getChatData = async (userId) => {
    const response = await axiosInstance.get(`/messages/get-messages/${userId}`);
    return response.data;
}