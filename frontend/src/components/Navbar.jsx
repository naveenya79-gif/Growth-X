import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  FaShoppingCart,
  FaHeart,
  FaUser,
  FaSearch,
  FaStore,
  FaChevronDown,
  FaSignOutAlt,
  FaBoxes,
  FaBars,
  FaTimes,
  FaTshirt,
  FaClock,
  FaGem,
  FaCookieBite,
  FaPumpSoap,
  FaLaptop,
  FaFire
} from 'react-icons/fa';
import { logout } from '../redux/slices/userSlice';
import WishlistModal from './WishlistModal';

const categoriesList = [
  { id: 'all', label: 'All Products', icon: FaBoxes },
  { id: 'Shirt', label: 'Shirt & Apparel', icon: FaTshirt },
  { id: 'Watch', label: 'Watches', icon: FaClock },
  { id: 'Accessories', label: 'Accessories', icon: FaGem },
  { id: 'Chocolates', label: 'Chocolates', icon: FaCookieBite },
  { id: 'Perfumes', label: 'Perfumes', icon: FaPumpSoap },
  { id: 'Electronics', label: 'Mobiles & Tech', icon: FaLaptop },
];

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  const { cartItems } = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.user);
  const { wishlistItems } = useSelector((state) => state.wishlist);

  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || 'all');
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const totalCartQty = cartItems.reduce((a, c) => a + c.qty, 0);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const query = searchTerm.trim();
    if (query || selectedCategory !== 'all') {
      const params = new URLSearchParams();
      if (query) params.set('search', query);
      if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
      navigate(`/?${params.toString()}`);
    } else {
      navigate('/');
    }
  };

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    const query = searchTerm.trim();
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    if (catId && catId !== 'all') params.set('category', catId);
    navigate(`/?${params.toString()}`);
    setIsMobileMenuOpen(false);
  };

  const logoutHandler = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-[#E5EAF0] shadow-xs">
        {/* Top Header Bar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4 sm:gap-6">
            
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2.5 group flex-shrink-0">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#2878D8] to-[#1769C2] flex items-center justify-center text-white shadow-md shadow-[#2878D8]/20 group-hover:scale-105 transition-transform">
                <FaStore className="text-xl" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-2xl tracking-tight text-[#172033] leading-none">
                  e<span className="text-[#2878D8]">Kart</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider text-[#667085] uppercase">
                  Premium Store
                </span>
              </div>
            </Link>

            {/* Desktop Center Search Bar */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-2xl items-center relative">
              <div className="relative w-full flex items-center bg-[#F4F9FF] border border-[#E5EAF0] focus-within:border-[#2878D8] focus-within:ring-2 focus-within:ring-[#2878D8]/10 rounded-2xl overflow-hidden transition-all shadow-xs">
                
                {/* Search Input */}
                <FaSearch className="ml-4 text-[#667085] flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search products, brands, shirts, watches, perfumes..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-2.5 px-3 bg-transparent text-sm text-[#172033] placeholder-[#667085] focus:outline-none"
                />

                {/* Submit Button */}
                <button
                  type="submit"
                  className="bg-[#2878D8] hover:bg-[#1769C2] text-white px-5 py-2.5 text-xs font-bold uppercase tracking-wider transition-colors flex items-center space-x-1"
                >
                  <span>Search</span>
                </button>
              </div>
            </form>

            {/* Right Action Icons */}
            <div className="flex items-center space-x-2 sm:space-x-5">
              
              {/* Wishlist Button */}
              <button
                onClick={() => setIsWishlistOpen(true)}
                className="relative p-2.5 rounded-xl text-[#172033] hover:bg-[#F4F9FF] hover:text-[#2878D8] transition-colors flex items-center space-x-1.5"
                title="Wishlist"
              >
                <div className="relative">
                  <FaHeart size={20} className="text-[#667085] group-hover:text-[#2878D8]" />
                  {wishlistItems.length > 0 && (
                    <span className="absolute -top-2 -right-2 bg-[#E53935] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                      {wishlistItems.length}
                    </span>
                  )}
                </div>
                <span className="hidden lg:inline text-xs font-bold">Wishlist</span>
              </button>

              {/* Shopping Cart Button */}
              <Link
                to="/cart"
                className="relative p-2.5 rounded-xl bg-[#F4F9FF] border border-[#E5EAF0] text-[#172033] hover:border-[#2878D8] hover:bg-[#E8F3FF] transition-all flex items-center space-x-2"
              >
                <div className="relative">
                  <FaShoppingCart size={19} className="text-[#2878D8]" />
                  {totalCartQty > 0 && (
                    <span className="absolute -top-2 -right-2.5 bg-[#2878D8] text-white text-[10px] font-extrabold rounded-full w-4 h-4 flex items-center justify-center animate-pulse">
                      {totalCartQty}
                    </span>
                  )}
                </div>
                <div className="hidden sm:flex flex-col text-left leading-tight">
                  <span className="text-[10px] uppercase font-bold text-[#667085]">My Cart</span>
                  <span className="text-xs font-extrabold text-[#172033]">
                    {totalCartQty > 0 ? `${totalCartQty} Items` : '$0.00'}
                  </span>
                </div>
              </Link>

              {/* User Menu / Account */}
              {userInfo ? (
                <div className="relative group cursor-pointer">
                  <div className="flex items-center space-x-2 py-2 px-3 rounded-xl border border-[#E5EAF0] hover:bg-[#F4F9FF] transition-colors">
                    <div className="w-8 h-8 rounded-full bg-[#E8F3FF] text-[#2878D8] font-extrabold text-sm flex items-center justify-center border border-[#2878D8]/20">
                      {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="hidden lg:flex flex-col text-left leading-none">
                      <span className="text-[10px] text-[#667085] font-semibold">Hello,</span>
                      <span className="text-xs font-bold text-[#172033] truncate max-w-[90px]">{userInfo.name}</span>
                    </div>
                    <FaChevronDown className="text-[10px] text-[#667085] hidden lg:block" />
                  </div>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-2xl shadow-xl border border-[#E5EAF0] py-2 hidden group-hover:block z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="px-4 py-2 border-b border-[#E5EAF0]">
                      <p className="text-xs font-semibold text-[#667085]">Signed in as</p>
                      <p className="text-xs font-bold text-[#172033] truncate">{userInfo.email}</p>
                    </div>
                    {userInfo.isAdmin && (
                      <>
                        <Link to="/admin/dashboard" className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-[#172033] hover:bg-[#F4F9FF] hover:text-[#2878D8]">
                          <FaBoxes size={14} />
                          <span>Admin Dashboard</span>
                        </Link>
                        <Link to="/admin/products" className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-[#172033] hover:bg-[#F4F9FF] hover:text-[#2878D8]">
                          <FaBoxes size={14} />
                          <span>Manage Products</span>
                        </Link>
                      </>
                    )}
                    <button
                      onClick={logoutHandler}
                      className="w-full flex items-center space-x-2 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 text-left"
                    >
                      <FaSignOutAlt size={14} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-[#2878D8] hover:bg-[#1769C2] text-white text-xs font-bold transition-colors shadow-xs"
                >
                  <FaUser size={13} />
                  <span>Sign In</span>
                </Link>
              )}

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2.5 rounded-xl text-[#172033] hover:bg-[#F4F9FF] border border-[#E5EAF0]"
              >
                {isMobileMenuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden pb-3">
            <form onSubmit={handleSearchSubmit} className="flex items-center">
              <div className="relative w-full flex items-center bg-[#F4F9FF] border border-[#E5EAF0] rounded-xl overflow-hidden">
                <FaSearch className="ml-3 text-[#667085]" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-2 px-3 bg-transparent text-xs text-[#172033] focus:outline-none"
                />
                <button type="submit" className="bg-[#2878D8] text-white px-3 py-2 text-xs font-bold">
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Quick Category Filter Bar */}
        <div className="bg-[#F4F9FF] border-t border-[#E5EAF0] py-2 overflow-x-auto no-scrollbar">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center space-x-2 sm:space-x-3 text-xs font-semibold">
            <span className="text-[#667085] font-bold text-[11px] uppercase tracking-wider hidden sm:inline mr-2 flex-shrink-0">
              Categories:
            </span>
            {categoriesList.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full flex-shrink-0 transition-all ${
                    isActive
                      ? 'bg-[#2878D8] text-white shadow-xs font-bold'
                      : 'bg-white text-[#172033] hover:bg-[#E8F3FF] border border-[#E5EAF0]'
                  }`}
                >
                  <Icon className={isActive ? 'text-white' : 'text-[#2878D8]'} size={12} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-[#E5EAF0] bg-white p-4 space-y-3">
            <p className="text-xs font-bold uppercase text-[#667085] tracking-wider">Browse Categories</p>
            <div className="grid grid-cols-2 gap-2">
              {categoriesList.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    className="flex items-center space-x-2 p-2.5 rounded-xl border border-[#E5EAF0] bg-[#F4F9FF] text-xs font-semibold text-[#172033]"
                  >
                    <Icon className="text-[#2878D8]" />
                    <span className="truncate">{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Wishlist Drawer */}
      <WishlistModal isOpen={isWishlistOpen} onClose={() => setIsWishlistOpen(false)} />
    </>
  );
};

export default Navbar;
