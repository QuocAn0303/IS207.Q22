import axios from 'axios';

// Khởi tạo instance của axios
const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL, // Kết nối tới Backend cổng 3000 đã setup
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request Interceptor: Tự động thêm Bearer token vào mỗi request 
axiosInstance.interceptors.request.use(
    (config) => {
        // Lấy token từ localStorage hoặc Zustand store
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Xử lý lỗi tập trung (ví dụ: 401 Unauthorized) 
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Tự động redirect về trang Login khi token hết hạn hoặc không hợp lệ 
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;