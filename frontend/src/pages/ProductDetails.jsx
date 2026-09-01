import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import { toggleWishlist } from '../redux/slices/wishlistSlice';
import RecommendationCard from '../components/RecommendationCard';
import ProductCard from '../components/ProductCard';
import axios from 'axios';
import {
  FaStar,
  FaHeart,
  FaRegHeart,
  FaShoppingCart,
  FaTruck,
  FaShieldAlt,
  FaUndo,
  FaCheckCircle,
  FaArrowLeft,
  FaBolt
} from 'react-icons/fa';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;
  const { wishlistItems } = useSelector((state) => state.wishlist);

  const [product, setProduct] = useState({});
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState('highlights');
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [addedMap, setAddedMap] = useState({});

  const productId = product._id || id;
  const isWishlisted = wishlistItems.some((x) => (x._id || x.product) === productId);

  useEffect(() => {
    const fetchProductAndRecs = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`http://localhost:5000/api/products/${id}`);
        setProduct(data);

        // Fetch recommendations for this product
        if (data && data._id) {
          setLoadingRecs(true);
          try {
            const recRes = await axios.get(`http://localhost:5000/api/products/${data._id}/recommendations`);
            if (recRes.data.success) {
              setRecommendations(recRes.data.recommendations || []);
            }
          } catch (recErr) {
            console.error('Error loading recommendations:', recErr);
          } finally {
            setLoadingRecs(false);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductAndRecs();
  }, [id]);

  const addToCartHandler = () => {
    dispatch(addToCart({ ...product, product: product._id || id, qty: Number(qty) }));
    navigate('/cart');
  };

  const buyNowHandler = () => {
    dispatch(addToCart({ ...product, product: product._id || id, qty: Number(qty) }));
    navigate('/checkout');
  };

  const handleAddRecToCart = (item) => {
    const existItem = cartItems.find((x) => (x.product || x._id) === item._id);
    const currentQty = existItem ? existItem.qty : 0;
    const stockLimit = item.countInStock !== undefined ? item.countInStock : 10;
    const newQty = Math.min(currentQty + 1, stockLimit);

    dispatch(
      addToCart({
        ...item,
        product: item._id,
        qty: newQty,
        countInStock: stockLimit,
      })
    );

    setAddedMap((prev) => ({ ...prev, [item._id]: true }));
    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [item._id]: false }));
    }, 2500);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-12 px-4">
        <div className="h-96 rounded-3xl skeleton border border-[#E5EAF0]"></div>
      </div>
    );
  }

  if (!product._id && !product.id) {
    return (
      <div className="max-w-xl mx-auto my-16 bg-white border border-[#E5EAF0] p-10 rounded-3xl text-center space-y-4">
        <h2 className="text-xl font-bold text-[#172033]">Product Not Found</h2>
        <p className="text-xs text-[#667085]">The item you are searching for might have been moved or updated.</p>
        <Link
          to="/"
          className="inline-flex items-center space-x-2 bg-[#2878D8] text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-[#1769C2] transition-colors"
        >
          <FaArrowLeft size={12} />
          <span>Back to Home</span>
        </Link>
      </div>
    );
  }

  const currentPrice = typeof product.price === 'number' ? product.price : parseFloat(product.price || 0);
  const originalPrice = product.originalPrice ? parseFloat(product.originalPrice) : currentPrice * 1.25;
  const discountPercent = product.discount
    ? product.discount
    : Math.round(((originalPrice - currentPrice) / originalPrice) * 100);
  const rating = product.rating ? Number(product.rating) : 4.8;
  const numReviews = product.numReviews || 84;

  return (
    <div className="max-w-6xl mx-auto space-y-10 py-4">
      
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center space-x-2 text-xs font-semibold text-[#667085]">
        <Link to="/" className="hover:text-[#2878D8]">Home</Link>
        <span>/</span>
        <span className="text-[#2878D8]">{product.category || 'Product'}</span>
        <span>/</span>
        <span className="text-[#172033] font-bold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main Product Hero Layout */}
      <div className="bg-white border border-[#E5EAF0] rounded-3xl p-6 sm:p-10 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-8 sm:gap-12">
        
        {/* Left Image Section */}
        <div className="md:col-span-6 space-y-4">
          <div className="relative w-full aspect-square bg-[#F4F9FF] border border-[#E5EAF0] rounded-2xl overflow-hidden flex items-center justify-center p-6 group">
            
            {/* Discount Badge */}
            {discountPercent > 0 && (
              <span className="absolute top-4 left-4 z-10 bg-[#E53935] text-white text-xs font-extrabold uppercase px-3 py-1 rounded-lg shadow-xs">
                {discountPercent}% OFF
              </span>
            )}

            {/* Wishlist Heart Icon */}
            <button
              onClick={() => dispatch(toggleWishlist(product))}
              className={`absolute top-4 right-4 z-10 w-11 h-11 rounded-full flex items-center justify-center transition-all ${
                isWishlisted
                  ? 'bg-red-50 text-[#E53935] border border-red-200 shadow-sm'
                  : 'bg-white text-[#667085] hover:text-[#E53935] border border-[#E5EAF0] shadow-xs'
              }`}
              title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            >
              {isWishlisted ? <FaHeart size={20} /> : <FaRegHeart size={20} />}
            </button>

            <img
              src={product.image || 'https://via.placeholder.com/600x600?text=Product'}
              alt={product.name}
              className="max-w-full max-h-full object-contain ekart-img-zoom"
            />
          </div>

          {/* Value Assurance Tags */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="p-3 bg-[#F4F9FF] border border-[#E5EAF0] rounded-xl space-y-1">
              <FaTruck className="mx-auto text-[#2878D8]" />
              <p className="text-[10px] font-bold text-[#172033]">Free Delivery</p>
            </div>
            <div className="p-3 bg-[#F4F9FF] border border-[#E5EAF0] rounded-xl space-y-1">
              <FaShieldAlt className="mx-auto text-[#2878D8]" />
              <p className="text-[10px] font-bold text-[#172033]">Authentic</p>
            </div>
            <div className="p-3 bg-[#F4F9FF] border border-[#E5EAF0] rounded-xl space-y-1">
              <FaUndo className="mx-auto text-[#2878D8]" />
              <p className="text-[10px] font-bold text-[#172033]">30-Day Return</p>
            </div>
          </div>
        </div>

        {/* Right Product Details & Buy Panel */}
        <div className="md:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            
            {/* Category & Brand Pill */}
            <div className="flex items-center space-x-2">
              <span className="bg-[#E8F3FF] text-[#2878D8] text-xs font-extrabold uppercase px-3 py-1 rounded-full border border-[#2878D8]/20">
                {product.category || 'Premium Collection'}
              </span>
              {product.brand && (
                <span className="text-xs font-bold text-[#667085] uppercase tracking-wider">
                  Brand: {product.brand}
                </span>
              )}
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033] leading-tight">
              {product.name}
            </h1>

            {/* Rating & Reviews */}
            <div className="flex items-center space-x-3 text-xs">
              <div className="flex items-center space-x-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg text-amber-700 font-bold">
                <FaStar className="text-amber-500" />
                <span>{rating.toFixed(1)}</span>
              </div>
              <span className="text-[#667085] font-semibold">{numReviews} Customer Reviews</span>
              <span className="text-[#E5EAF0]">|</span>
              <span className="text-[#16A34A] font-bold flex items-center space-x-1">
                <FaCheckCircle />
                <span>Verified Item</span>
              </span>
            </div>

            {/* Price Box */}
            <div className="bg-[#F4F9FF] border border-[#E5EAF0] p-4 rounded-2xl flex items-baseline justify-between">
              <div>
                <span className="text-3xl font-extrabold text-[#172033]">
                  ${currentPrice.toFixed(2)}
                </span>
                {originalPrice > currentPrice && (
                  <span className="ml-3 text-sm text-[#667085] line-through font-semibold">
                    ${originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
              <span className={`text-xs font-extrabold px-3 py-1 rounded-full ${
                product.countInStock > 0 ? 'bg-green-100 text-[#16A34A]' : 'bg-red-100 text-red-700'
              }`}>
                {product.countInStock > 0 ? `${product.countInStock} Available in Stock` : 'Out of Stock'}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#667085] leading-relaxed">
              {product.description}
            </p>
          </div>

          {/* Action Box: Quantity & Buttons */}
          <div className="space-y-4 pt-4 border-t border-[#E5EAF0]">
            {product.countInStock > 0 && (
              <div className="flex items-center space-x-4">
                <label className="text-xs font-bold uppercase text-[#667085] tracking-wider">
                  Quantity:
                </label>
                <select
                  value={qty}
                  onChange={(e) => setQty(e.target.value)}
                  className="bg-[#F4F9FF] border border-[#E5EAF0] text-[#172033] font-bold text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-[#2878D8]"
                >
                  {[...Array(product.countInStock || 10).keys()].slice(0, 10).map((x) => (
                    <option key={x + 1} value={x + 1}>
                      {x + 1}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={addToCartHandler}
                disabled={product.countInStock === 0}
                className={`w-full py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-xs ${
                  product.countInStock === 0
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-[#2878D8] hover:bg-[#1769C2] text-white shadow-md shadow-[#2878D8]/20'
                }`}
              >
                <FaShoppingCart size={14} />
                <span>Add to Cart</span>
              </button>

              <button
                onClick={buyNowHandler}
                disabled={product.countInStock === 0}
                className="w-full py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 bg-[#E8F3FF] hover:bg-[#2878D8] text-[#2878D8] hover:text-white border border-[#2878D8]/30 shadow-xs"
              >
                <FaBolt size={13} />
                <span>Buy Now</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Tabs Section: Highlights, Specs, Description, Reviews */}
      <div className="bg-white border border-[#E5EAF0] rounded-3xl overflow-hidden shadow-xs">
        
        {/* Tab Headers */}
        <div className="flex border-b border-[#E5EAF0] bg-[#F4F9FF] overflow-x-auto">
          {[
            { id: 'highlights', label: 'Highlights' },
            { id: 'specs', label: 'Specifications' },
            { id: 'description', label: 'Description' },
            { id: 'reviews', label: 'Customer Reviews' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-6 py-4 text-xs font-extrabold uppercase tracking-wider transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-[#2878D8] text-[#2878D8] bg-white'
                  : 'border-transparent text-[#667085] hover:text-[#172033]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Contents */}
        <div className="p-6 sm:p-8 text-xs sm:text-sm text-[#667085] leading-relaxed">
          {activeTab === 'highlights' && (
            <ul className="space-y-3 font-semibold text-[#172033]">
              <li className="flex items-center space-x-2">
                <FaCheckCircle className="text-[#16A34A]" />
                <span>100% Authentic quality assured by certified eKart inspection</span>
              </li>
              <li className="flex items-center space-x-2">
                <FaCheckCircle className="text-[#16A34A]" />
                <span>Crafted from premium durable materials for high comfort & long life</span>
              </li>
              <li className="flex items-center space-x-2">
                <FaCheckCircle className="text-[#16A34A]" />
                <span>Includes official brand packaging, manual, and warranty documentation</span>
              </li>
              <li className="flex items-center space-x-2">
                <FaCheckCircle className="text-[#16A34A]" />
                <span>Eligible for 30-day hassle-free returns and instant replacement</span>
              </li>
            </ul>
          )}

          {activeTab === 'specs' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
              <div className="flex justify-between py-2 border-b border-[#E5EAF0]">
                <span className="font-bold text-[#172033]">Brand</span>
                <span>{product.brand || 'eKart Essential'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#E5EAF0]">
                <span className="font-bold text-[#172033]">Category</span>
                <span>{product.category || 'General'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#E5EAF0]">
                <span className="font-bold text-[#172033]">Stock Status</span>
                <span>{product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[#E5EAF0]">
                <span className="font-bold text-[#172033]">Warranty</span>
                <span>1 Year Manufacturer Warranty</span>
              </div>
            </div>
          )}

          {activeTab === 'description' && (
            <div className="space-y-3">
              <p>{product.description}</p>
              <p>
                Designed to deliver outstanding value, this product seamlessly combines elegant aesthetic appeal with superior performance. Perfect for personal use or gifting.
              </p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <div className="flex items-center space-x-4 bg-[#F4F9FF] p-4 rounded-2xl border border-[#E5EAF0]">
                <span className="text-3xl font-extrabold text-[#172033]">{rating.toFixed(1)}</span>
                <div>
                  <div className="flex text-amber-400 text-sm">
                    <FaStar /><FaStar /><FaStar /><FaStar /><FaStar />
                  </div>
                  <p className="text-xs text-[#667085] mt-1">Based on {numReviews} customer ratings</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recommendations / Related Products */}
      <div className="space-y-6">
        <div className="flex items-center space-x-2 border-b border-[#E5EAF0] pb-4">
          <h2 className="text-xl font-extrabold text-[#172033]">
            Frequently Bought Together / Related Add-ons
          </h2>
          <span className="text-xs text-[#2878D8] bg-[#E8F3FF] px-2.5 py-0.5 rounded-full font-bold">
            AI Suggestions
          </span>
        </div>

        {loadingRecs ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="h-64 rounded-2xl skeleton border border-[#E5EAF0]"></div>
            ))}
          </div>
        ) : recommendations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {recommendations.map((item) => (
              <RecommendationCard
                key={item._id}
                item={item}
                isAdded={!!addedMap[item._id]}
                onAddToCart={handleAddRecToCart}
              />
            ))}
          </div>
        ) : (
          <p className="text-[#667085] text-xs">No additional recommendations found for this item.</p>
        )}
      </div>

    </div>
  );
};

export default ProductDetails;
