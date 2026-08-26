import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../redux/slices/userSlice';
import axios from 'axios';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { userInfo } = useSelector((state) => state.user);

  useEffect(() => {
    if (userInfo && userInfo.isAdmin) {
      navigate('/admin/dashboard');
    }
  }, [navigate, userInfo]);

  const submitHandler = async (e) => {
    e.preventDefault();
    setError(null);

    // Front-end validation
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post('http://localhost:5000/api/admin/login', {
        email,
        password,
      });
      dispatch(setCredentials(data));
      navigate('/admin/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[75vh] px-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl border border-gray-100 max-w-md w-full transition-all duration-300 hover:shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Admin & Seller Portal</h1>
          <p className="mt-2 text-sm text-gray-500">Sign in to manage your shop and dashboard</p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 text-sm flex items-start animate-pulse">
            <svg className="w-5 h-5 mr-2 text-red-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={submitHandler} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
            <input
              type="email"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              placeholder="e.g. admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              id="admin-email-input"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
            <input
              type="password"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              id="admin-password-input"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-lg transition-colors flex items-center justify-center shadow-lg shadow-indigo-600/10 active:scale-[0.98] transform"
            id="admin-login-button"
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Signing In...</span>
              </span>
            ) : (
              'Sign In'
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;
