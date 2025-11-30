import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';
import { MapPin, Lock, User } from 'lucide-react';

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
    
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
    }
  }, [isAuthenticated, navigate, location.state]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData);
    
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleGoogleLogin = () => {
    window.location.href = authAPI.googleLogin();
  };

  return (
    <div className="min-h-screen bg-primary-600 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
      
      <div className="relative max-w-md w-full">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white bg-opacity-90 rounded-full mb-6 shadow-strong">
            <MapPin className="h-10 w-10 text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold text-white font-display mb-2">TripCraft</h1>
          <p className="text-lg text-white text-opacity-90">Premium Travel Planning</p>
        </div>

        {/* Login Card */}
        <div className="card shadow-strong">
          <div className="p-8">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 font-display mb-2">
                Welcome Back
              </h2>
              <p className="text-gray-600">
                Sign in to continue your journey
              </p>
            </div>
            
            {successMessage && (
              <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
                <p className="text-green-700 font-medium">{successMessage}</p>
              </div>
            )}

            {error && (
              <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label htmlFor="username" className="block text-sm font-semibold text-gray-700 mb-2">
                    Username
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      id="username"
                      name="username"
                      type="text"
                      required
                      className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      placeholder="Enter your username"
                      value={formData.username}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <input
                      id="password"
                      name="password"
                      type="password"
                      required
                      className="pl-10 pr-4 py-3 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full text-lg"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="font-semibold text-primary-600 hover:text-primary-700 transition-colors"
                >
                  Create one now
                </Link>
              </p>
            </div>
          </div>
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-white text-opacity-90 text-sm">
            Secure • Reliable • Premium Travel Experience
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;