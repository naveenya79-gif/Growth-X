import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../redux/slices/userSlice';
import axios from 'axios';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { userInfo } = useSelector((state) => state.user);
  
  const redirect = location.search ? location.search.split('=')[1] : '/';

  useEffect(() => {
    if (userInfo) {
      navigate(redirect);
    }
  }, [navigate, userInfo, redirect]);

  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      const { data } = await axios.post('http://localhost:5000/api/users/login', { email, password });
      dispatch(setCredentials(data));
      navigate(redirect);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-[70vh]">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-6">Sign In</h1>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4 text-sm">{error}</div>}
        
        <form onSubmit={submitHandler}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">Email Address</label>
            <input 
              type="email" 
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500" 
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">Password</label>
            <input 
              type="password" 
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:border-indigo-500" 
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded hover:bg-indigo-700 transition-colors">
            Sign In
          </button>
        </form>
        <div className="mt-6 text-center text-sm">
          New Customer?{' '}
          <Link to={redirect ? `/register?redirect=${redirect}` : '/register'} className="text-indigo-600 hover:underline">
            Register Here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
