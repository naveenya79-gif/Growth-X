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
  FaShoePrints,
  FaLaptop,
  FaFlask,
  FaBolt,
  FaShieldAlt
} from 'react-icons/fa';
import { logout } from '../redux/slices/userSlice';
import WishlistModal from './WishlistModal';

const categoriesList = [
  { id: 'all',         label: 'All Items',    icon: FaBoxes      },
  { id: 'Clothes',     label: 'Apparel',      icon: FaTshirt     },
  { id: 'Watches',     label: 'Timepieces',   icon: FaClock      },
  { id: 'Shoes',       label: 'Footwear',     icon: FaShoePrints },
  { id: 'Electronics', label: 'Tech & Audio', icon: FaLaptop     },
  { id: 'Perfumes',    label: 'Fragrances',   icon: FaPumpSoap   },
  { id: 'Cosmetics',   label: 'Beauty',       icon: FaFlask      },
  { id: 'Accessories', label: 'Accessories',  icon: FaGem        },
  { id: 'Chocolates',  label: 'Chocolates',   icon: FaCookieBite },
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
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    if (selectedCategory && selectedCategory !== 'all') params.set('category', selectedCategory);
    navigate(params.toString() ? `/?${params.toString()}` : '/');
  };

  const handleCategorySelect = (catId) => {
    setSelectedCategory(catId);
    const query = searchTerm.trim();
    const params = new URLSearchParams();
    if (query) params.set('search', query);
    if (catId && catId !== 'all') params.set('category', catId);
    navigate(params.toString() ? `/?${params.toString()}` : '/');
    setIsMobileMenuOpen(false);
  };

  const logoutHandler = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <>
      {/* Top Banner Ticker */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-600 text-white text-[11px] font-bold py-1.5 px-4 text-center tracking-wide flex items-center justify-center space-x-2 shadow-inner">
        <span className="bg-white/20 text-white uppercase text-[9px] px-2 py-0.5 rounded-full font-black tracking-wider">
          LIVE FESTIVAL
        </span>
        <span className="hidden sm:inline">⚡ Extra 10% instant off on UPI & Razorpay</span>
        <span className="hidden md:inline">|</span>
        <span className="flex items-center space-x-1">
          <FaBolt className="text-amber-300" size={11} />
          <span>Gemini 3.8 Flash AI Personal Shopper Online</span>
        </span>
      </div>

      <header className="sticky top-0 z-40 glass-nav border-b border-slate-200/80 shadow-xs transition-all">
        {/* Main Header Container */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 sm:h-20 gap-4 sm:gap-6">
            
            {/* Brand Logo */}
            <Link to="/" className="flex items-center space-x-3 group flex-shrink-0">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-all duration-300">
                <FaStore className="text-xl" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-extrabold text-2xl sm:text-3xl tracking-tight text-slate-900 leading-none">
                  e<span className="gradient-text-blue">Kart</span>
                </span>
                <span className="text-[10px] font-bold tracking-widest text-slate-400 uppercase mt-1 flex items-center space-x-1">
                  <span>PREMIUM STORE</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                </span>
              </div>
            </Link>

            {/* Desktop Center Search Bar with Instant Category Tag */}
            <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-2xl items-center relative">
              <div className="relative w-full flex items-center bg-slate-100/90 hover:bg-white focus-within:bg-white border border-slate-200/90 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 rounded-2xl overflow-hidden transition-all duration-200 shadow-inner">
                
                <FaSearch className="ml-4 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  placeholder="Search 60+ products, brands (Apple, Nike, Dior, Casio)..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-3 px-3 bg-transparent text-sm text-slate-800 placeholder-slate-400 focus:outline-none font-medium"
                />

                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="p-1 mr-2 text-slate-400 hover:text-slate-600 text-xs font-bold"
                  >
                    &times;
                  </button>
                )}

                <button
                  type="submit"
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 text-xs font-extrabold uppercase tracking-wider transition-all shadow-md shadow-blue-500/20 flex items-center space-x-1 flex-shrink-0 cursor-pointer"
                >
                  <span>Search</span>
                </button>
              </div>
            </form>

            {/* Right Action Icons */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              
              {/* Wishlist Button */}
              <button
                onClick={() => setIsWishlistOpen(true)}
                className="relative p-2.5 sm:px-3 sm:py-2 rounded-xl text-slate-700 hover:bg-slate-100/80 hover:text-rose-600 transition-all flex items-center space-x-2 cursor-pointer"
                title="Wishlist"
              >
                <div className="relative">
                  <FaHeart size={19} className="text-slate-500 hover:text-rose-500 transition-colors" />
                  {wishlistItems.length > 0 && (
                    <span className="absolute -top-2 -right-2.5 bg-rose-500 text-white text-[10px] font-extrabold rounded-full w-4 h-4 flex items-center justify-center shadow-xs">
                      {wishlistItems.length}
                    </span>
                  )}
                </div>
                <span className="hidden lg:inline text-xs font-bold">Wishlist</span>
              </button>

              {/* Shopping Cart Button */}
              <Link
                to="/cart"
                className="relative p-2 sm:px-3.5 sm:py-2 rounded-2xl bg-white border border-slate-200/80 text-slate-800 hover:border-blue-500 hover:shadow-md hover:shadow-blue-500/10 transition-all flex items-center space-x-2.5 group cursor-pointer"
              >
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <FaShoppingCart size={16} />
                  </div>
                  {totalCartQty > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 bg-emerald-500 text-white text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center border-2 border-white shadow-xs animate-bounce">
                      {totalCartQty}
                    </span>
                  )}
                </div>
                <div className="hidden sm:flex flex-col text-left leading-tight">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Cart</span>
                  <span className="text-xs font-black text-slate-800">
                    {totalCartQty > 0 ? `${totalCartQty} Items` : '₹0.00'}
                  </span>
                </div>
              </Link>

              {/* User Menu / Account */}
              {userInfo ? (
                <div className="relative group cursor-pointer">
                  <div className="flex items-center space-x-2 py-2 px-3 rounded-2xl border border-slate-200/80 bg-white hover:bg-slate-50 transition-all">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
                      {userInfo.name ? userInfo.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div className="hidden lg:flex flex-col text-left leading-none">
                      <span className="text-[10px] text-slate-400 font-semibold">Account</span>
                      <span className="text-xs font-bold text-slate-800 truncate max-w-[90px]">{userInfo.name}</span>
                    </div>
                    <FaChevronDown className="text-[10px] text-slate-400 hidden lg:block" />
                  </div>

                  {/* Dropdown Menu */}
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-slate-100 py-2 hidden group-hover:block z-50">
                    <div className="px-4 py-2.5 border-b border-slate-100">
                      <p className="text-[11px] font-semibold text-slate-400">Signed in as</p>
                      <p className="text-xs font-bold text-slate-800 truncate">{userInfo.email}</p>
                    </div>
                    {userInfo.isAdmin && (
                      <>
                        <Link to="/admin/dashboard" className="flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                          <FaBoxes size={14} />
                          <span>Admin Dashboard</span>
                        </Link>
                        <Link to="/admin/products" className="flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                          <FaBoxes size={14} />
                          <span>Product Catalog</span>
                        </Link>
                      </>
                    )}
                    <button
                      onClick={logoutHandler}
                      className="w-full flex items-center space-x-2 px-4 py-2.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 text-left transition-colors cursor-pointer"
                    >
                      <FaSignOutAlt size={14} />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  <FaUser size={12} />
                  <span>Sign In</span>
                </Link>
              )}

              {/* Mobile Menu Toggle Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 border border-slate-200"
              >
                {isMobileMenuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
              </button>
            </div>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden pb-3">
            <form onSubmit={handleSearchSubmit} className="flex items-center">
              <div className="relative w-full flex items-center bg-slate-100 border border-slate-200 rounded-xl overflow-hidden">
                <FaSearch className="ml-3 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search 60+ products..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full py-2 px-3 bg-transparent text-xs text-slate-800 focus:outline-none"
                />
                <button type="submit" className="bg-blue-600 text-white px-3 py-2 text-xs font-bold">
                  Search
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Quick Category Header Carousel Bar */}
        <div className="border-t border-slate-200/60 bg-white/70 py-2.5 overflow-x-auto no-scrollbar">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center space-x-2 sm:space-x-3 text-xs font-semibold">
            <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider hidden sm:inline mr-2 flex-shrink-0">
              EXPLORE:
            </span>
            {categoriesList.map((cat) => {
              const Icon = cat.icon;
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full flex-shrink-0 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 font-bold scale-[1.02]'
                      : 'bg-slate-100/90 hover:bg-blue-50 hover:text-blue-600 text-slate-700 border border-slate-200/80'
                  }`}
                >
                  <Icon className={isActive ? 'text-white' : 'text-blue-600'} size={12} />
                  <span>{cat.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white p-4 space-y-3 shadow-xl">
            <p className="text-xs font-bold uppercase text-slate-400 tracking-wider">Browse Categories</p>
            <div className="grid grid-cols-2 gap-2">
              {categoriesList.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.id)}
                    className="flex items-center space-x-2 p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold text-slate-800"
                  >
                    <Icon className="text-blue-600" />
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
