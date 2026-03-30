import { create } from 'zustand';

const useAuthStore = create((set) => ({
    // Trạng thái ban đầu
    user: null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),

    // Hành động: Đăng nhập thành công
    login: (userData, token) => {
        localStorage.setItem('token', token); // Lưu vào trình duyệt để không bị mất khi F5
        set({
            user: userData,
            token: token,
            isAuthenticated: true,
        });
    },

    // Hành động: Đăng xuất
    logout: () => {
        localStorage.removeItem('token'); // Xóa token
        set({
            user: null,
            token: null,
            isAuthenticated: false,
        });
    },

    // Hành động: Cập nhật thông tin user (ví dụ sau khi gọi /api/auth/me)
    setUser: (userData) => set({ user: userData }),
}));

export default useAuthStore;