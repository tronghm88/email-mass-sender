// authProvider.ts
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export const authProvider = {
  login: async (token: string) => {
    try {
      // Gửi authentication code đến backend
      const response = await axios.post(`${API_BASE_URL}/auth/verify-google-token`, {
        token: token
      });
      

      // Lưu thông tin đăng nhập vào localStorage
      localStorage.setItem('token', response.data.token);

      // Thực hiện login, lưu token vào localStorage/sessionStorage
      localStorage.setItem('user', JSON.stringify(response.data.user));
      return Promise.resolve();
    } catch (error: any) {
      console.log('Đăng nhập lỗi:', error);
      console.log(error?.response?.data);
      const message = error?.response?.data?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
      return Promise.reject(message);
    }
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return Promise.resolve();
  },

  checkAuth: () => {
    console.log(localStorage.getItem('token'));
    return localStorage.getItem('token')
      ? Promise.resolve()
      : Promise.reject({ redirectTo: '/login' }); // Nếu không có auth, redirect về login
  },

  checkError: (error: any) => {
    const status = error?.status || error?.response?.status;
    if (status === 401 || status === 403) {
      console.log(error);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return Promise.reject(); // react-admin sẽ redirect về /login
    }
    return Promise.resolve();
  },

  getIdentity: () => {
    const user = localStorage.getItem('user');
    if (user) {
      const { username } = JSON.parse(user);
      return Promise.resolve({
        id: username,
        fullName: username,
      });
    }
    return Promise.reject();
  },

  getPermissions: () => Promise.resolve(),
};
