import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { FaShoppingCart, FaUser } from 'react-icons/fa';
import { logout } from '../redux/slices/userSlice';

const Navbar = () => {
  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.user);
  const dispatch = useDispatch();

  const logoutHandler = () => {
    dispatch(logout());
  };

  return (
    <nav className="bg-gray-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="font-bold text-2xl tracking-wider text-indigo-400">REVIVE</span>
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            <Link to="/cart" className="flex items-center hover:text-indigo-400 transition-colors">
              <FaShoppingCart className="mr-2" />
              <span>Cart</span>
              {cartItems.length > 0 && (
                <span className="ml-1 bg-indigo-500 text-white rounded-full px-2 py-0.5 text-xs">
                  {cartItems.reduce((a, c) => a + c.qty, 0)}
                </span>
              )}
            </Link>
            {userInfo ? (
              <div className="relative group cursor-pointer flex items-center hover:text-indigo-400 transition-colors">
                <FaUser className="mr-2" />
                <span>{userInfo.name}</span>
                <div className="absolute right-0 top-10 w-48 bg-white text-gray-800 rounded-md shadow-xl hidden group-hover:block z-50">
                  <div className="py-1">
                    {userInfo.isAdmin && (
                      <>
                        <Link to="/admin/dashboard" className="block px-4 py-2 text-sm hover:bg-gray-100 font-sans">Admin Dashboard</Link>
                        <Link to="/admin/products" className="block px-4 py-2 text-sm hover:bg-gray-100 font-sans">Manage Products</Link>
                      </>
                    )}
                    <button onClick={logoutHandler} className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100">Logout</button>
                  </div>
                </div>
              </div>
            ) : (
              <Link to="/login" className="flex items-center hover:text-indigo-400 transition-colors">
                <FaUser className="mr-2" />
                <span>Sign In</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
