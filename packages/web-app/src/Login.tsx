import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, useGoogleLogin } from '@react-oauth/google';
import { useLogin } from 'react-admin';
import './Login.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';
const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

interface GoogleAuthResponse {
  code: string;
}

const LoginButton: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const authLogin = useLogin();

  const googleLogin = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async (codeResponse: GoogleAuthResponse) => {
      try {
        setIsLoading(true);
        setError('');
        authLogin(codeResponse.code).catch((err) => {
          console.log(err);
          // err có thể là object của react-admin hoặc axios, kiểm tra kỹ
          if (typeof err === 'string') {
            setError(err); // Hiển thị đúng message từ backend
          } else if (err && err.message) {
            setError(err.message);
          } else {
            setError('Đăng nhập thất bại. Vui lòng thử lại.');
          }
        })
        .finally(() => setIsLoading(false));
        // // Gửi authentication code đến backend
        // const response = await axios.post(`${API_BASE_URL}/auth/verify-google-token`, {
        //   token: codeResponse.code
        // });
        
        // // Lưu thông tin đăng nhập vào localStorage
        // localStorage.setItem('token', response.data.token);
        // setUser(response.data.user);
        
        // // Chuyển hướng đến trang chính
        // navigate('/');
      } catch (err) {
        console.error('Login failed:', err);
        setError('Đăng nhập thất bại. Vui lòng thử lại.');
      } finally {
        setIsLoading(false);
      }
    },
    onError: (errorResponse) => {
      console.error('Google login failed:', errorResponse);
      setError('Đăng nhập thất bại. Vui lòng thử lại.');
    },
  });

  return (
    <div className="login-button-container">
      {error && <div className="error-message">{error}</div>}
      
      <button 
        className="google-login-button" 
        onClick={() => googleLogin()}
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="spinner"></div>
        ) : (
          <>
            <img 
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
              alt="Google" 
              className="google-icon" 
            />
            <span>Đăng nhập với Google</span>
          </>
        )}
      </button>
    </div>
  );
};

const Login: React.FC = () => {
  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Đăng nhập Email Sender</h1>
        <p>Đăng nhập bằng Google để sử dụng hệ thống gửi email hàng loạt</p>

        <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
          <LoginButton />
        </GoogleOAuthProvider>
      </div>
    </div>
  );
};

export default Login;
