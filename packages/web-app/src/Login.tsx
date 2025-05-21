import React from 'react';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

export default function Login() {
  const handleLogin = () => {
    window.location.href = `${API_BASE_URL}/auth/google`;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Đăng nhập bằng Google</h1>
        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded bg-white hover:bg-gray-100 text-gray-700 font-medium shadow-sm transition"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48">
            <g>
              <path fill="#4285F4" d="M24 9.5c3.54 0 6.72 1.23 9.23 3.25l6.87-6.87C35.82 2.09 30.3 0 24 0 14.82 0 6.91 5.45 2.69 13.39l8.09 6.28C12.36 13.2 17.74 9.5 24 9.5z"/>
              <path fill="#34A853" d="M46.1 24.5c0-1.56-.14-3.07-.39-4.5H24v9h12.41c-.54 2.89-2.19 5.34-4.63 6.99l7.18 5.59C43.83 37.09 46.1 31.27 46.1 24.5z"/>
              <path fill="#FBBC05" d="M13.13 28.16a9.12 9.12 0 0 1 0-8.32l-8.09-6.28A23.97 23.97 0 0 0 0 24c0 3.94.94 7.67 2.69 10.84l8.09-6.28z"/>
              <path fill="#EA4335" d="M24 48c6.3 0 11.57-2.09 15.41-5.69l-7.18-5.59c-2.01 1.35-4.59 2.15-8.23 2.15-6.26 0-11.64-3.7-13.22-8.97l-8.09 6.28C6.91 42.55 14.82 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </g>
          </svg>
          Đăng nhập với Google
        </button>
      </div>
    </div>
  );
}
