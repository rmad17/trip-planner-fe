import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Settings, LogOut, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getUserInitials, getUserColor, getUserDisplayName } from '../utils/userUtils';

const ProfileButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const displayName = getUserDisplayName(user);
  const initials = getUserInitials(displayName);
  const avatarColor = getUserColor(displayName);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSettings = () => {
    setIsOpen(false);
    navigate('/config');
  };

  const handleAccountSettings = () => {
    setIsOpen(false);
    navigate('/account-settings');
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Profile Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 rounded-full"
        aria-label="User menu"
      >
        {/* Avatar */}
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-md hover:shadow-lg transition-shadow cursor-pointer"
          style={{ backgroundColor: avatarColor }}
        >
          {user?.profilePhoto ? (
            <img
              src={user.profilePhoto}
              alt={displayName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            initials
          )}
        </div>

        {/* User name (hidden on mobile) */}
        <span className="hidden md:inline-block text-sm font-medium text-gray-700">
          {displayName}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 z-50">
          <div className="py-1">
            {/* User Info */}
            <div className="px-4 py-3 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">{displayName}</p>
              <p className="text-sm text-gray-500 truncate">{user?.email}</p>
            </div>

            {/* Account Settings */}
            <button
              onClick={handleAccountSettings}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors"
            >
              <User className="w-4 h-4" />
              Account Settings
            </button>

            {/* Config/Settings */}
            <button
              onClick={handleSettings}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-3 transition-colors"
            >
              <Settings className="w-4 h-4" />
              Configuration
            </button>

            {/* Logout */}
            <div className="border-t border-gray-100">
              <button
                onClick={handleLogout}
                className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileButton;
