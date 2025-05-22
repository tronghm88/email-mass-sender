import React from 'react';
import { useUser } from './UserContext';

const Dashboard: React.FC = () => {
  const { user } = useUser();
  const defaultAvatar = 'https://ui-avatars.com/api/?name=User&background=eee&color=555&rounded=true&size=80';

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Responsive Header */}
      <header className="bg-white shadow sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-center py-4 gap-4">
            {/* Left: Menu */}
            <nav className="flex flex-row space-x-2 sm:space-x-6 w-full sm:w-auto justify-center">
              <a href="#" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400">Gửi email</a>
              <a href="#" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400">Quản lý User</a>
              <a href="#" className="px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400">Quản lý Sender Email</a>
            </nav>
            {/* Right: Avatar & Greeting */}
            <div className="flex items-center space-x-3">
              <img
                className="h-10 w-10 rounded-full border border-gray-200 object-cover bg-gray-100"
                src={user?.picture || defaultAvatar}
                alt="User Avatar"
                referrerPolicy="no-referrer"
              />
              <span className="text-base sm:text-lg font-semibold text-gray-900 whitespace-nowrap">
                Xin chào {user?.firstName ? user.firstName : 'User'}
              </span>
            </div>
          </div>
        </div>
      </header>
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Dashboard content goes here */}
      </main>
    </div>
  );
};

export default Dashboard;
