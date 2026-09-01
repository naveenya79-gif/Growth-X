import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { setCredentials } from '../redux/slices/userSlice';
import axios from 'axios';
import { FaStore, FaUser, FaEnvelope, FaLock, FaShieldAlt } from 'react-icons/fa';

const Register = () => {
  const [name, setName] = useState('');
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
      const { data } = await axios.post('http://localhost:5000/api/users', { name, email, password });
      dispatch(setCredentials(data));
      navigate(redirect);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="flex justify-center items-center py-12 px-4 min-h-[75vh]">
      <div className="bg-white border border-[#E5EAF0] p-8 sm:p-10 rounded-3xl shadow-xs max-w-md w-full space-y-6">
        
        {/* Brand Icon & Heading */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-[#2878D8] text-white flex items-center justify-center mx-auto text-xl shadow-md shadow-[#2878D8]/20">
            <FaStore />
          </div>
          <h1 className="text-2xl font-extrabold text-[#172033]">
            Create Your <span className="text-[#2878D8]">eKart</span> Account
          </h1>
          <p className="text-xs text-[#667085]">Join thousands of shoppers for exclusive deals & instant updates</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-[#E53935] p-3.5 rounded-xl text-xs font-semibold">
            {error}
          </div>
        )}
        
        <form onSubmit={submitHandler} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#172033] mb-1.5 uppercase tracking-wider">
              Full Name
            </label>
            <div className="relative flex items-center">
              <FaUser className="absolute left-3.5 text-[#667085] text-xs" />
              <input 
                type="text" 
                className="w-full pl-9 pr-4 py-3 bg-[#F4F9FF] border border-[#E5EAF0] rounded-xl text-xs text-[#172033] focus:outline-none focus:border-[#2878D8]" 
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172033] mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative flex items-center">
              <FaEnvelope className="absolute left-3.5 text-[#667085] text-xs" />
              <input 
                type="email" 
                className="w-full pl-9 pr-4 py-3 bg-[#F4F9FF] border border-[#E5EAF0] rounded-xl text-xs text-[#172033] focus:outline-none focus:border-[#2878D8]" 
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172033] mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative flex items-center">
              <FaLock className="absolute left-3.5 text-[#667085] text-xs" />
              <input 
                type="password" 
                className="w-full pl-9 pr-4 py-3 bg-[#F4F9FF] border border-[#E5EAF0] rounded-xl text-xs text-[#172033] focus:outline-none focus:border-[#2878D8]" 
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#2878D8] hover:bg-[#1769C2] text-white font-extrabold py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-md shadow-[#2878D8]/20 transition-all"
          >
            Create Account
          </button>
        </form>

        <div className="pt-4 border-t border-[#E5EAF0] text-center text-xs text-[#667085] space-y-2">
          <p>
            Already have an account?{' '}
            <Link to={redirect ? `/login?redirect=${redirect}` : '/login'} className="text-[#2878D8] font-bold hover:underline">
              Sign In Here
            </Link>
          </p>
          <div className="flex items-center justify-center space-x-1 text-[10px] text-[#667085]">
            <FaShieldAlt className="text-[#16A34A]" />
            <span>Secure 256-Bit SSL Encrypted Registration</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;
