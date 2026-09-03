import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import {
  FaTshirt,
  FaClock,
  FaGem,
  FaCookieBite,
  FaPumpSoap,
  FaShoePrints,
  FaBoxes,
  FaStar,
  FaTag,
  FaArrowRight,
  FaBolt,
  FaCheckCircle,
  FaTruck,
  FaSlidersH,
  FaMobileAlt,
  FaFlask,
  FaTimes,
  FaFire,
  FaUndo,
  FaShieldAlt
} from 'react-icons/fa';

const categoryCards = [
  { id: 'all',         label: 'All Items',    icon: FaBoxes,      color: 'from-blue-500 to-indigo-600',   desc: 'Explore Entire Catalog' },
  { id: 'Electronics', label: 'Tech & Audio', icon: FaMobileAlt,  color: 'from-cyan-500 to-blue-600',     desc: 'Audio, Wearables & More' },
  { id: 'Shoes',       label: 'Footwear',     icon: FaShoePrints, color: 'from-indigo-500 to-purple-600', desc: 'Sneakers & Running Shoes' },
  { id: 'Clothes',     label: 'Fashion',      icon: FaTshirt,     color: 'from-sky-500 to-cyan-600',      desc: 'Jackets, Shirts & Pants' },
  { id: 'Watches',     label: 'Timepieces',   icon: FaClock,      color: 'from-violet-500 to-indigo-600', desc: 'Luxury & Sports Watches' },
  { id: 'Perfumes',    label: 'Fragrances',   icon: FaPumpSoap,   color: 'from-rose-500 to-pink-600',     desc: 'Eau de Parfum & Mists' },
  { id: 'Cosmetics',   label: 'Beauty & Skin',icon: FaFlask,      color: 'from-fuchsia-500 to-rose-600',  desc: 'Serums & High-end Makeup' },
  { id: 'Accessories', label: 'Accessories',  icon: FaGem,        color: 'from-amber-500 to-orange-600',  desc: 'Bags, Wallets & Shades' },
  { id: 'Chocolates',  label: 'Gourmet Treats',icon: FaCookieBite,color: 'from-amber-600 to-yellow-600',  desc: 'Swiss Truffles & Pralines' },
];

const pricePresets = [
  { id: 'all', label: 'All Prices' },
  { id: 'under_50', label: 'Under ₹50' },
  { id: '50_100', label: '₹50 - ₹100' },
  { id: '100_200', label: '₹100 - ₹200' },
  { id: 'above_200', label: '₹200 & Above' },
];

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Active Query Parameters
  const activeCategory = searchParams.get('category') || 'all';
  const searchQuery = searchParams.get('search') || '';
  const sortQuery = searchParams.get('sort') || '';
  const priceFilter = searchParams.get('price') || 'all';
  const minRatingFilter = searchParams.get('rating') ? parseFloat(searchParams.get('rating')) : 0;
  const inStockOnly = searchParams.get('inStock') === 'true';

  // Mobile Filter Drawer State
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Deal Countdown Timer
  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 48, seconds: 32 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Products
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get('http://localhost:5000/api/products');
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.warn('API error:', err.message);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Filter & Search Logic
  const filteredProducts = useMemo(() => {
    return products.filter((item) => {
      const cat = (item.category || '').trim().toLowerCase();
      const activeLower = activeCategory.toLowerCase().trim();

      // Category matching
      const matchesCategory =
        activeCategory === 'all' ||
        cat === activeLower ||
        cat.includes(activeLower) ||
        (item.tags && item.tags.some((t) => t.toLowerCase().trim() === activeLower));

      // Search matching
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        (item.name || '').toLowerCase().includes(q) ||
        (item.description || '').toLowerCase().includes(q) ||
        cat.includes(q) ||
        (item.brand || '').toLowerCase().includes(q) ||
        (item.tags && item.tags.some((t) => t.toLowerCase().includes(q)));

      // Price preset matching
      const price = typeof item.price === 'number' ? item.price : parseFloat(item.price || 0);
      let matchesPrice = true;
      if (priceFilter === 'under_50') matchesPrice = price < 50;
      else if (priceFilter === '50_100') matchesPrice = price >= 50 && price <= 100;
      else if (priceFilter === '100_200') matchesPrice = price > 100 && price <= 200;
      else if (priceFilter === 'above_200') matchesPrice = price > 200;

      // Rating matching
      const rating = typeof item.rating === 'number' ? item.rating : 0;
      const matchesRating = rating >= minRatingFilter;

      // In Stock matching
      const matchesStock = !inStockOnly || (item.countInStock || 0) > 0;

      return matchesCategory && matchesSearch && matchesPrice && matchesRating && matchesStock;
    });
  }, [products, activeCategory, searchQuery, priceFilter, minRatingFilter, inStockOnly]);

  // Sorting
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      const priceA = Number(a.price || 0);
      const priceB = Number(b.price || 0);
      const ratingA = Number(a.rating || 0);
      const ratingB = Number(b.rating || 0);

      if (sortQuery === 'price_asc') return priceA - priceB;
      if (sortQuery === 'price_desc') return priceB - priceA;
      if (sortQuery === 'rating') return ratingB - ratingA;
      return 0; // default order
    });
  }, [filteredProducts, sortQuery]);

  // Helper to update search params
  const updateFilterParam = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value === null || value === undefined || value === 'all' || value === '' || value === false || value === 0) {
      params.delete(key);
    } else {
      params.set(key, String(value));
    }
    setSearchParams(params);
  };

  const handleClearFilters = () => {
    setSearchParams({});
  };

  const activeFilterCount =
    (activeCategory !== 'all' ? 1 : 0) +
    (searchQuery ? 1 : 0) +
    (priceFilter !== 'all' ? 1 : 0) +
    (minRatingFilter > 0 ? 1 : 0) +
    (inStockOnly ? 1 : 0) +
    (sortQuery ? 1 : 0);

  return (
    <div className="space-y-10 sm:space-y-14 pb-16">
      
      {/* 1. HERO SHOWCASE SECTION (Visible on 'all' categories) */}
      {activeCategory === 'all' && !searchQuery && (
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white p-6 sm:p-10 md:p-14 shadow-2xl border border-slate-800">
          
          {/* Ambient Glow Orbs */}
          <div className="absolute top-0 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Hero Details */}
            <div className="lg:col-span-7 space-y-5">
              <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/15 px-3.5 py-1.5 rounded-full text-xs font-bold text-cyan-300 shadow-sm">
                <FaBolt className="text-amber-400 animate-bounce" />
                <span>Next-Gen E-Commerce with Instant AI</span>
              </div>

              <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                Curated Luxury & Tech for <span className="gradient-text-blue">Tomorrow</span>
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl font-medium">
                Experience 60+ verified items spanning Apple AirPods, smart wearables, luxury French perfumes, Nike streetwear, and Swiss truffles—accompanied by our Gemini 3.8 Flash shopping assistant.
              </p>

              {/* Call-to-actions */}
              <div className="flex flex-wrap items-center gap-3 pt-3">
                <a
                  href="#catalog-browser-section"
                  className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-7 py-3.5 rounded-2xl text-sm font-extrabold shadow-lg shadow-blue-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center space-x-2 cursor-pointer"
                >
                  <span>Explore 60+ Products</span>
                  <FaArrowRight size={13} />
                </a>
                <a
                  href="#flash-deals-section"
                  className="bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 text-white px-6 py-3.5 rounded-2xl text-sm font-bold transition-all shadow-xs cursor-pointer flex items-center space-x-2"
                >
                  <FaFire className="text-rose-400" />
                  <span>Flash Deals</span>
                </a>
              </div>

              {/* Highlights Pill */}
              <div className="pt-4 flex flex-wrap items-center gap-5 text-xs text-slate-300 font-semibold border-t border-white/10">
                <div className="flex items-center space-x-2">
                  <FaCheckCircle className="text-emerald-400" />
                  <span>100% Genuine Brands</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaTruck className="text-cyan-400" />
                  <span>Free Express Delivery</span>
                </div>
                <div className="flex items-center space-x-2">
                  <FaShieldAlt className="text-indigo-400" />
                  <span>Razorpay 256-Bit SSL</span>
                </div>
              </div>
            </div>

            {/* Right Interactive Hero Card */}
            <div className="lg:col-span-5 relative flex justify-center">
              <div className="relative w-full max-w-sm sm:max-w-md bg-white/10 backdrop-blur-xl p-5 rounded-3xl border border-white/15 shadow-2xl group">
                
                <div className="relative h-64 sm:h-72 w-full overflow-hidden rounded-2xl bg-white/5 flex items-center justify-center">
                  <img
                    src="https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?q=80&w=800&auto=format&fit=crop"
                    alt="Apple AirPods Pro"
                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                  />
                  <span className="absolute top-3 left-3 bg-gradient-to-r from-rose-500 to-red-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-md">
                    TRENDING #1
                  </span>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-cyan-300 font-bold uppercase tracking-wider">Electronics</p>
                    <h4 className="text-base font-extrabold text-white">AirPods Pro (2nd Gen)</h4>
                    <p className="text-lg font-black text-white font-heading mt-0.5">₹249.00</p>
                  </div>
                  <button
                    onClick={() => {
                      const el = document.getElementById('catalog-browser-section');
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="bg-white text-slate-950 font-bold px-4 py-2.5 rounded-xl text-xs hover:bg-slate-100 transition-colors cursor-pointer shadow-md"
                  >
                    View Deals
                  </button>
                </div>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* 2. CATEGORY TILES EXPLORER */}
      <section id="category-tiles-section" className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-slate-200/80 pb-3">
          <div>
            <span className="text-xs font-black uppercase text-blue-600 tracking-widest">
              INSTANT DISCOVERY
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 font-heading">
              Shop by Category
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-medium">
            Browse high-demand collections with active stock availability
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-9 gap-3">
          {categoryCards.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => updateFilterParam('category', cat.id)}
                className={`p-3.5 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center group cursor-pointer ${
                  isSelected
                    ? 'bg-blue-50 border-blue-500 shadow-md ring-2 ring-blue-500/20 scale-[1.03]'
                    : 'bg-white border-slate-200/80 hover:border-blue-300 hover:shadow-md hover:bg-slate-50/50'
                }`}
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${cat.color} text-white flex items-center justify-center text-xl mb-2.5 shadow-md group-hover:scale-110 transition-transform`}
                >
                  <Icon />
                </div>
                <span className={`text-xs font-bold truncate max-w-full ${isSelected ? 'text-blue-600' : 'text-slate-800'}`}>
                  {cat.label}
                </span>
                <span className="text-[10px] text-slate-400 truncate max-w-full mt-0.5 hidden sm:block">
                  {cat.desc}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. FLASH DEALS BANNER (Only on 'all' view) */}
      {activeCategory === 'all' && !searchQuery && (
        <section id="flash-deals-section" className="bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-blue-500/10 border border-rose-200/80 rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-rose-200/60 pb-5 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500 to-red-600 text-white flex items-center justify-center text-xl shadow-md shadow-rose-500/20">
                <FaFire />
              </div>
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                  Flash Deals of the Day
                </h3>
                <p className="text-xs text-slate-500 font-semibold">Special limited-time offers with 25% to 40% OFF</p>
              </div>
            </div>

            {/* Countdown Badge */}
            <div className="flex items-center space-x-2 bg-white border border-rose-200 px-4 py-2 rounded-2xl shadow-xs">
              <span className="text-[10px] uppercase font-black text-slate-400">Offer Ends In:</span>
              <div className="flex items-center space-x-1 font-mono text-rose-600 font-black text-xs sm:text-sm">
                <span className="bg-rose-50 px-2 py-0.5 rounded-md">{String(timeLeft.hours).padStart(2, '0')}h</span>
                <span>:</span>
                <span className="bg-rose-50 px-2 py-0.5 rounded-md">{String(timeLeft.minutes).padStart(2, '0')}m</span>
                <span>:</span>
                <span className="bg-rose-50 px-2 py-0.5 rounded-md">{String(timeLeft.seconds).padStart(2, '0')}s</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.slice(0, 4).map((dealItem) => (
              <ProductCard key={dealItem._id || dealItem.id} product={dealItem} />
            ))}
          </div>
        </section>
      )}

      {/* 4. MAIN PRODUCT BROWSER WITH COMPREHENSIVE FILTER SIDEBAR */}
      <section id="catalog-browser-section" className="space-y-6 pt-4">
        
        {/* Top Control Header */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 font-heading">
                All Products Catalog
              </h2>
              <span className="bg-blue-50 text-blue-600 font-black text-xs px-3 py-1 rounded-full border border-blue-200">
                {sortedProducts.length} Results
              </span>
            </div>
            
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                <span className="text-slate-400 font-semibold">Active:</span>
                {activeCategory !== 'all' && (
                  <span className="bg-blue-100/70 text-blue-700 font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                    <span>Category: {activeCategory}</span>
                    <button onClick={() => updateFilterParam('category', 'all')} className="ml-1 hover:text-black">&times;</button>
                  </span>
                )}
                {searchQuery && (
                  <span className="bg-blue-100/70 text-blue-700 font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                    <span>Search: "{searchQuery}"</span>
                    <button onClick={() => updateFilterParam('search', '')} className="ml-1 hover:text-black">&times;</button>
                  </span>
                )}
                {priceFilter !== 'all' && (
                  <span className="bg-blue-100/70 text-blue-700 font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                    <span>Price: {pricePresets.find((p) => p.id === priceFilter)?.label}</span>
                    <button onClick={() => updateFilterParam('price', 'all')} className="ml-1 hover:text-black">&times;</button>
                  </span>
                )}
                {minRatingFilter > 0 && (
                  <span className="bg-amber-100/70 text-amber-800 font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                    <span>Rating: {minRatingFilter}★+</span>
                    <button onClick={() => updateFilterParam('rating', 0)} className="ml-1 hover:text-black">&times;</button>
                  </span>
                )}
                {inStockOnly && (
                  <span className="bg-emerald-100/70 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                    <span>In Stock Only</span>
                    <button onClick={() => updateFilterParam('inStock', false)} className="ml-1 hover:text-black">&times;</button>
                  </span>
                )}
                <button
                  onClick={handleClearFilters}
                  className="text-rose-600 font-bold hover:underline ml-2"
                >
                  Reset All
                </button>
              </div>
            )}
          </div>

          {/* Right Action Controls: Sorting & Mobile Filter Drawer Button */}
          <div className="flex items-center space-x-3">
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setIsFilterDrawerOpen(true)}
              className="lg:hidden flex items-center space-x-2 bg-slate-100 hover:bg-slate-200 text-slate-800 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <FaSlidersH size={12} />
              <span>Filters ({activeFilterCount})</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center space-x-2 text-xs">
              <span className="text-slate-400 font-semibold hidden sm:inline">Sort:</span>
              <select
                value={sortQuery}
                onChange={(e) => updateFilterParam('sort', e.target.value)}
                className="bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-800 font-bold px-3 py-2 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer"
              >
                <option value="">Featured</option>
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Catalog Grid Layout with Left Filter Sidebar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* DESKTOP FILTER SIDEBAR */}
          <aside className="hidden lg:block lg:col-span-3 sticky top-36 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-sm">
                <FaSlidersH className="text-blue-600" />
                <span>Filter Catalog</span>
              </div>
              {activeFilterCount > 0 && (
                <button
                  onClick={handleClearFilters}
                  className="text-xs text-rose-500 font-bold hover:underline cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* 1. Category Filter List */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Category
              </label>
              <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
                {categoryCards.map((cat) => {
                  const isSelected = activeCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => updateFilterParam('category', cat.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white font-bold shadow-xs'
                          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <span>{cat.label}</span>
                      {isSelected && <FaCheckCircle size={11} />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Price Preset Filter */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <label className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Price Budget
              </label>
              <div className="grid grid-cols-1 gap-1.5">
                {pricePresets.map((preset) => {
                  const isSelected = priceFilter === preset.id;
                  return (
                    <button
                      key={preset.id}
                      onClick={() => updateFilterParam('price', preset.id)}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-50 text-blue-600 font-bold border border-blue-200'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {preset.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Rating Filter */}
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <label className="text-xs font-black uppercase text-slate-400 tracking-wider">
                Customer Rating
              </label>
              <div className="space-y-1">
                {[4.8, 4.5, 4.0].map((star) => {
                  const isSelected = minRatingFilter === star;
                  return (
                    <button
                      key={star}
                      onClick={() => updateFilterParam('rating', isSelected ? 0 : star)}
                      className={`w-full flex items-center space-x-2 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-amber-50 text-amber-700 font-bold border border-amber-200'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center text-amber-400 space-x-0.5">
                        <FaStar size={11} />
                      </div>
                      <span>{star} Stars & Above</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. Availability Checkbox */}
            <div className="border-t border-slate-100 pt-4">
              <label className="flex items-center space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => updateFilterParam('inStock', e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                />
                <span className="text-xs font-bold text-slate-700">In Stock Items Only</span>
              </label>
            </div>
          </aside>

          {/* PRODUCT GRID DISPLAY */}
          <main className="lg:col-span-9">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                  <div key={n} className="h-80 rounded-3xl skeleton border border-slate-200"></div>
                ))}
              </div>
            ) : sortedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {sortedProducts.map((prod) => (
                  <ProductCard key={prod._id || prod.id} product={prod} />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-slate-200/80 rounded-3xl p-12 text-center max-w-md mx-auto my-6 shadow-sm">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
                  <FaBoxes />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">No matching products</h3>
                <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                  We couldn't find items that match all your applied filters. Try adjusting the category or price range.
                </p>
                <button
                  onClick={handleClearFilters}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </main>

        </div>
      </section>

      {/* MOBILE FILTER MODAL DRAWER */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-black/50 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xs bg-white h-full shadow-2xl flex flex-col justify-between p-6 overflow-y-auto">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b pb-4">
                <h3 className="font-bold text-base text-slate-900 flex items-center space-x-2">
                  <FaSlidersH className="text-blue-600" />
                  <span>Filter Products</span>
                </h3>
                <button onClick={() => setIsFilterDrawerOpen(false)} className="p-1 text-slate-400 hover:text-slate-600">
                  <FaTimes size={18} />
                </button>
              </div>

              {/* Categories */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">Category</label>
                <div className="space-y-1">
                  {categoryCards.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        updateFilterParam('category', cat.id);
                        setIsFilterDrawerOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold ${
                        activeCategory === cat.id ? 'bg-blue-600 text-white font-bold' : 'text-slate-700 hover:bg-slate-100'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price */}
              <div className="space-y-2 border-t pt-4">
                <label className="text-xs font-bold text-slate-400 uppercase">Price</label>
                <div className="space-y-1">
                  {pricePresets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => {
                        updateFilterParam('price', preset.id);
                        setIsFilterDrawerOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold ${
                        priceFilter === preset.id ? 'bg-blue-50 text-blue-600 font-bold border border-blue-200' : 'text-slate-700'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-6 border-t mt-6">
              <button
                onClick={() => {
                  handleClearFilters();
                  setIsFilterDrawerOpen(false);
                }}
                className="w-full bg-slate-100 text-slate-700 py-3 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors"
              >
                Reset All Filters
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Home;
