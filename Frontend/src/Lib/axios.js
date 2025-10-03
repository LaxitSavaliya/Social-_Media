import axios from "axios";

const axiosInstance = axios.create({
    baseURL: "https://tixent-media.onrender.com/api",
    withCredentials: true,
});

export default axiosInstance;