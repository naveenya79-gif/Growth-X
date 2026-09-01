import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import { curatedProducts } from '../utils/productCatalog';
import {
  FaTshirt,
  FaClock,
  FaGem,
  FaCookieBite,
  FaPumpSoap,
  FaShoePrints,
  FaLaptop,
  FaBoxes,
  FaTag,
  FaArrowRight,
  FaBolt,
  FaCheckCircle,
  FaShieldAlt,
  FaTruck,
  FaHeadset,
  FaFlask,
  FaMobileAlt
} from 'react-icons/fa';

const categoryCards = [
  { id: 'all',         label: 'All Categories',   icon: FaBoxes,      color: 'bg-blue-50 text-[#2878D8]',    desc: 'Browse Everything' },
  { id: 'Clothes',     label: 'Clothes',           icon: FaTshirt,     color: 'bg-sky-50 text-[#2878D8]',     desc: 'Shirts, Jeans & Jackets' },
  { id: 'Watches',     label: 'Watches',           icon: FaClock,      color: 'bg-indigo-50 text-[#1769C2]',  desc: 'Smart & Luxury Watches' },
  { id: 'Accessories', label: 'Accessories',       icon: FaGem,        color: 'bg-emerald-50 text-[#16A34A]', desc: 'Bags, Belts & Sunglasses' },
  { id: 'Chocolates',  label: 'Chocolates',        icon: FaCookieBite, color: 'bg-amber-50 text-amber-600',   desc: 'Swiss & Belgian Truffles' },
  { id: 'Perfumes',    label: 'Perfumes',          icon: FaPumpSoap,   color: 'bg-rose-50 text-rose-500',     desc: 'Luxury Eau de Parfum' },
  { id: 'Shoes',       label: 'Shoes & Footwear',  icon: FaShoePrints, color: 'bg-cyan-50 text-cyan-600',     desc: 'Sneakers & Boots' },
  { id: 'Cosmetics',   label: 'Cosmetics',         icon: FaFlask,      color: 'bg-violet-50 text-violet-600', desc: 'Makeup & Skincare' },
  { id: 'Electronics', label: 'Electronics',       icon: FaMobileAlt,  color: 'bg-orange-50 text-orange-500', desc: 'Phones, Laptops & More' },
];

const Home = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const activeCategory = searchParams.get('category') || 'all';
  const searchQuery = searchParams.get('search') || '';

  // Timer simulation for Best Deals banner
  const [timeLeft, setTimeLeft] = useState({ hours: 7, minutes: 42, seconds: 19 });

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

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get('http://localhost:5000/api/products');
        if (Array.isArray(data) && data.length > 0) {
          // DB products take priority; add curated only if name truly absent
          const dbNamesLower = new Set(data.map((p) => p.name.toLowerCase().trim()));
          const extras = curatedProducts.filter(
            (c) => !dbNamesLower.has(c.name.toLowerCase().trim())
          );
          setProducts([...data, ...extras]);
        } else {
          setProducts(curatedProducts);
        }
      } catch (err) {
        console.warn('API unavailable, using curated dataset:', err.message);
        setProducts(curatedProducts);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Category & Search Filter logic — case-insensitive, trims whitespace
  const filteredProducts = products.filter((item) => {
    const cat = (item.category || '').trim().toLowerCase();
    const activeLower = activeCategory.toLowerCase().trim();

    const matchesCategory =
      activeCategory === 'all' ||
      cat === activeLower ||
      cat.includes(activeLower) ||
      (item.tags && item.tags.some((t) => t.toLowerCase().trim() === activeLower));

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      (item.name || '').toLowerCase().includes(q) ||
      (item.description || '').toLowerCase().includes(q) ||
      cat.includes(q) ||
      (item.brand || '').toLowerCase().includes(q) ||
      (item.tags && item.tags.some((t) => t.toLowerCase().includes(q)));

    return matchesCategory && matchesSearch;
  });

  const handleCategoryClick = (catId) => {
    const params = new URLSearchParams(searchParams);
    if (catId === 'all') {
      params.delete('category');
    } else {
      params.set('category', catId);
    }
    setSearchParams(params);

    // Smooth scroll to product grid
    const target = document.getElementById('product-catalog-section');
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleClearFilters = () => {
    setSearchParams({});
  };

  return (
    <div className="space-y-12 sm:space-y-16 pb-12">
      {/* Hero Banner Section (Only show on 'All Categories' view) */}
      {activeCategory === 'all' && (
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#F4F9FF] via-white to-[#E8F3FF] border border-[#E5EAF0] p-6 sm:p-10 md:p-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Text */}
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center space-x-2 bg-[#E8F3FF] border border-[#2878D8]/20 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#2878D8]">
              <FaBolt className="animate-pulse text-[#2878D8]" />
              <span>Flipkart-Inspired 2026 Collection</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#172033] tracking-tight leading-tight">
              Elevate Your Everyday Style with <span className="text-[#2878D8]">eKart</span>
            </h1>

            <p className="text-sm sm:text-base text-[#667085] leading-relaxed max-w-xl">
              Discover premium shirts, luxury watches, genuine accessories, artisanal chocolates, exotic perfumes, and cutting-edge tech—all with fast delivery and trusted quality.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <a
                href="#category-cards-section"
                className="bg-[#2878D8] hover:bg-[#1769C2] text-white px-6 py-3.5 rounded-xl text-sm font-bold shadow-md shadow-[#2878D8]/20 hover:shadow-lg transition-all flex items-center space-x-2"
              >
                <span>Browse Categories</span>
                <FaArrowRight size={13} />
              </a>
              <a
                href="#best-deals-section"
                className="bg-white hover:bg-[#F4F9FF] text-[#172033] border border-[#E5EAF0] px-6 py-3.5 rounded-xl text-sm font-bold transition-all shadow-xs hover:border-[#2878D8]"
              >
                <span>Today's Special Deals</span>
              </a>
            </div>

            {/* Mini Trust Highlights */}
            <div className="pt-4 flex items-center space-x-6 text-xs text-[#667085] font-semibold border-t border-[#E5EAF0]/60">
              <div className="flex items-center space-x-1.5">
                <FaCheckCircle className="text-[#16A34A]" />
                <span>100% Genuine Products</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <FaTruck className="text-[#2878D8]" />
                <span>Free Express Shipping</span>
              </div>
            </div>
          </div>

          {/* Right Product Showcase Banner */}
          <div className="lg:col-span-5 relative flex justify-center">
            <div className="relative w-full max-w-md bg-white p-5 rounded-2xl border border-[#E5EAF0] shadow-xl group">
              <div className="relative h-64 sm:h-72 w-full overflow-hidden rounded-xl bg-[#F4F9FF] flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop"
                  alt="Featured Luxury Watch"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-[#2878D8] text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md">
                  Top Seller
                </span>
              </div>

              {/* Floating Highlight Card */}
              <div className="absolute -bottom-4 -left-4 bg-white p-3.5 rounded-xl border border-[#E5EAF0] shadow-lg flex items-center space-x-3">
                <div className="w-10 h-10 rounded-lg bg-[#E8F3FF] text-[#2878D8] font-bold text-lg flex items-center justify-center">
                  4.9★
                </div>
                <div>
                  <p className="text-xs font-bold text-[#172033]">Fossil Chronograph</p>
                  <p className="text-[11px] text-[#667085]">Special Price $149.99</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>
      )}

      {/* Flipkart-Style Interactive Category Grid Cards Section */}
      <section id="category-cards-section" className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2 border-b border-[#E5EAF0] pb-4">
          <div>
            <span className="text-xs font-extrabold uppercase text-[#2878D8] tracking-wider">Instant Quick Filter</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172033]">
              Shop by Category
            </h2>
          </div>
          <p className="text-xs text-[#667085] font-semibold">
            Click any category card to filter collections below (Shirts, Watches, Chocolates & more!)
          </p>
        </div>

        {/* 8 Category Cards Row */}
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-9 gap-3 sm:gap-4">
          {categoryCards.map((cat) => {
            const Icon = cat.icon;
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategoryClick(cat.id)}
                className={`flex flex-col items-center p-4 rounded-2xl border text-center transition-all group cursor-pointer ${
                  isSelected
                    ? 'bg-[#E8F3FF] border-[#2878D8] shadow-md ring-2 ring-[#2878D8]/20 scale-[1.02]'
                    : 'bg-white border-[#E5EAF0] hover:border-[#2878D8] hover:bg-[#F4F9FF] shadow-xs'
                }`}
              >
                <div className={`w-14 h-14 rounded-2xl ${cat.color} flex items-center justify-center text-2xl mb-3 group-hover:scale-110 transition-transform shadow-xs`}>
                  <Icon />
                </div>
                <span className={`text-xs font-extrabold line-clamp-1 ${isSelected ? 'text-[#2878D8]' : 'text-[#172033]'}`}>
                  {cat.label}
                </span>
                <span className="text-[10px] text-[#667085] font-semibold mt-0.5 line-clamp-1">
                  {cat.desc}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Best Deals of the Day Banner Section (Only show on 'All Categories' view) */}
      {activeCategory === 'all' && (
      <section id="best-deals-section" className="bg-[#F4F9FF] border border-[#E5EAF0] rounded-3xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#E5EAF0] pb-6 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#E53935] text-white flex items-center justify-center font-bold text-lg shadow-sm">
              <FaTag />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-[#172033]">
                Best Deals of the Day
              </h2>
              <p className="text-xs text-[#667085] font-semibold">Special limited time discounts up to 40% OFF</p>
            </div>
          </div>

          {/* Live Countdown Timer */}
          <div className="flex items-center space-x-2 bg-white border border-[#E5EAF0] px-4 py-2 rounded-xl text-xs font-bold text-[#172033]">
            <span className="text-[#667085] uppercase text-[10px]">Ends In:</span>
            <div className="flex items-center space-x-1 font-mono text-[#E53935]">
              <span className="bg-red-50 px-2 py-0.5 rounded text-sm">{String(timeLeft.hours).padStart(2, '0')}h</span>
              <span>:</span>
              <span className="bg-red-50 px-2 py-0.5 rounded text-sm">{String(timeLeft.minutes).padStart(2, '0')}m</span>
              <span>:</span>
              <span className="bg-red-50 px-2 py-0.5 rounded text-sm">{String(timeLeft.seconds).padStart(2, '0')}s</span>
            </div>
          </div>
        </div>

        {/* Featured Deals Products Preview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {curatedProducts.slice(0, 4).map((dealItem) => (
            <ProductCard key={dealItem._id} product={dealItem} />
          ))}
        </div>
      </section>
      )}

      {/* Product Catalog Grid Section */}
      <section id="product-catalog-section" className="space-y-6">
        
        {/* Header & Active Filter Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#E5EAF0] pb-4">
          <div>
            <h2 className="text-2xl font-extrabold text-[#172033] flex items-center space-x-2">
              <span>Trending Products</span>
              <span className="text-xs font-bold text-[#2878D8] bg-[#F4F9FF] border border-[#E5EAF0] px-2.5 py-1 rounded-full">
                {filteredProducts.length} Items
              </span>
            </h2>
            {(activeCategory !== 'all' || searchQuery) && (
              <p className="text-xs text-[#667085] font-semibold mt-1">
                Active Filter:{' '}
                {activeCategory !== 'all' && (
                  <span className="text-[#2878D8] font-bold mr-2">Category: {activeCategory}</span>
                )}
                {searchQuery && (
                  <span className="text-[#2878D8] font-bold">Search: "{searchQuery}"</span>
                )}
              </p>
            )}
          </div>

          {/* Reset Filters button */}
          {(activeCategory !== 'all' || searchQuery) && (
            <button
              onClick={handleClearFilters}
              className="text-xs font-bold text-[#E53935] bg-red-50 hover:bg-red-100 border border-red-200 px-3.5 py-1.5 rounded-xl transition-colors"
            >
              Clear All Filters &times;
            </button>
          )}
        </div>

        {/* Loading State Skeleton */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className="h-80 rounded-2xl skeleton border border-[#E5EAF0]"></div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          /* Product Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((prod) => (
              <ProductCard key={prod._id || prod.id} product={prod} />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white border border-[#E5EAF0] rounded-3xl p-12 text-center max-w-lg mx-auto my-8">
            <div className="w-16 h-16 bg-[#F4F9FF] rounded-full text-[#2878D8] flex items-center justify-center mx-auto mb-4 text-2xl">
              <FaBoxes />
            </div>
            <h3 className="text-lg font-bold text-[#172033] mb-2">No products found</h3>
            <p className="text-xs text-[#667085] mb-6">
              We couldn't find any products matching your selected category or search term.
            </p>
            <button
              onClick={handleClearFilters}
              className="bg-[#2878D8] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#1769C2] transition-colors"
            >
              Show All Products
            </button>
          </div>
        )}
      </section>

      {/* Promotional Banner Section (Only show on 'All Categories' view) */}
      {activeCategory === 'all' && (
      <section className="relative rounded-3xl bg-gradient-to-r from-[#E8F3FF] to-[#F4F9FF] border border-[#E5EAF0] p-8 sm:p-12 overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-3 max-w-xl text-center md:text-left">
          <span className="text-xs font-extrabold uppercase tracking-wider text-[#2878D8] bg-white px-3 py-1 rounded-full border border-[#E5EAF0]">
            Gift Special
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-[#172033]">
            Luxury Perfumes & Gourmet Chocolates
          </h3>
          <p className="text-xs sm:text-sm text-[#667085]">
            Treat yourself or your loved ones with handcrafted Swiss chocolates and authentic imported French fragrances.
          </p>
        </div>
        <button
          onClick={() => handleCategoryClick('Perfumes')}
          className="bg-[#2878D8] hover:bg-[#1769C2] text-white px-6 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all flex-shrink-0"
        >
          Explore Gift Collection
        </button>
      </section>
      )}

      {/* Why Choose eKart Feature Cards */}
      <section className="space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <h2 className="text-2xl font-extrabold text-[#172033]">Why Choose eKart?</h2>
          <p className="text-xs text-[#667085] font-semibold">
            Built for modern 2026 e-commerce with maximum speed, security, and quality assurance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-white border border-[#E5EAF0] rounded-2xl space-y-3 text-center hover:border-[#2878D8] transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#F4F9FF] text-[#2878D8] flex items-center justify-center mx-auto text-xl">
              <FaTruck />
            </div>
            <h4 className="text-base font-bold text-[#172033]">Fast Express Shipping</h4>
            <p className="text-xs text-[#667085]">Same-day dispatch for orders placed before 2 PM.</p>
          </div>

          <div className="p-6 bg-white border border-[#E5EAF0] rounded-2xl space-y-3 text-center hover:border-[#2878D8] transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#F4F9FF] text-[#2878D8] flex items-center justify-center mx-auto text-xl">
              <FaShieldAlt />
            </div>
            <h4 className="text-base font-bold text-[#172033]">100% Authentic Guarantee</h4>
            <p className="text-xs text-[#667085]">Direct sourcing from authorized global distributors.</p>
          </div>

          <div className="p-6 bg-white border border-[#E5EAF0] rounded-2xl space-y-3 text-center hover:border-[#2878D8] transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#F4F9FF] text-[#2878D8] flex items-center justify-center mx-auto text-xl">
              <FaCheckCircle />
            </div>
            <h4 className="text-base font-bold text-[#172033]">Easy 30-Day Returns</h4>
            <p className="text-xs text-[#667085]">Hassle-free instant refund & exchange policy.</p>
          </div>

          <div className="p-6 bg-white border border-[#E5EAF0] rounded-2xl space-y-3 text-center hover:border-[#2878D8] transition-colors">
            <div className="w-12 h-12 rounded-xl bg-[#F4F9FF] text-[#2878D8] flex items-center justify-center mx-auto text-xl">
              <FaHeadset />
            </div>
            <h4 className="text-base font-bold text-[#172033]">24/7 Dedicated Support</h4>
            <p className="text-xs text-[#667085]">Live agent and AI assistant ready to assist you anytime.</p>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-white border border-[#E5EAF0] rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-4 shadow-xs">
        <h3 className="text-2xl font-extrabold text-[#172033]">
          Subscribe for Exclusive Offers & Updates
        </h3>
        <p className="text-xs sm:text-sm text-[#667085] max-w-md mx-auto">
          Join over 50,000+ shoppers and get instant alerts on flash sales, new shirt collections, watches, and perfumes.
        </p>
        <form onSubmit={(e) => { e.preventDefault(); alert('Thank you for subscribing to eKart updates!'); }} className="flex flex-col sm:flex-row max-w-md mx-auto gap-2">
          <input
            type="email"
            placeholder="Enter your email address..."
            required
            className="flex-1 px-4 py-3 bg-[#F4F9FF] border border-[#E5EAF0] rounded-xl text-xs text-[#172033] focus:outline-none focus:border-[#2878D8]"
          />
          <button
            type="submit"
            className="bg-[#2878D8] hover:bg-[#1769C2] text-white px-6 py-3 rounded-xl text-xs font-bold transition-colors"
          >
            Subscribe
          </button>
        </form>
      </section>
    </div>
  );
};

export default Home;
