import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import { toggleWishlist } from '../redux/slices/wishlistSlice';
import {
  FaStar,
  FaShoppingCart,
  FaHeart,
  FaRegHeart,
  FaCheck,
  FaShieldAlt,
  FaBolt
} from 'react-icons/fa';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const [isAddedToCart, setIsAddedToCart] = useState(false);

  const { wishlistItems } = useSelector((state) => state.wishlist);
  const { cartItems } = useSelector((state) => state.cart);

  const isWishlisted = wishlistItems.some(
    (item) => (item._id || item.product) === (product._id || product.id)
  );

  const cartItem = cartItems.find(
    (item) => (item._id || item.product) === (product._id || product.id)
  );

  const rating = typeof product.rating === 'number' ? product.rating : 4.5;
  const numReviews = product.numReviews || 24;
  const currentPrice = typeof product.price === 'number' ? product.price : parseFloat(product.price || 0);
  const originalPrice = Math.round(currentPrice * 1.25 * 100) / 100;
  const discountPercent = Math.round(((originalPrice - currentPrice) / originalPrice) * 100);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const currentQty = cartItem ? cartItem.qty : 0;
    const stockLimit = product.countInStock !== undefined ? product.countInStock : 10;
    const newQty = Math.min(currentQty + 1, stockLimit);

    dispatch(
      addToCart({
        ...product,
        product: product._id || product.id,
        qty: newQty,
        countInStock: stockLimit,
      })
    );

    setIsAddedToCart(true);
    setTimeout(() => {
      setIsAddedToCart(false);
    }, 2000);
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleWishlist(product));
  };

  return (
    <div className="product-card-hover group relative bg-white border border-slate-200/80 rounded-3xl overflow-hidden flex flex-col justify-between shadow-sm">
      
      {/* Top Media / Thumbnail Section */}
      <div className="relative aspect-square w-full bg-slate-50/70 p-5 overflow-hidden flex items-center justify-center">
        
        {/* Floating Badges */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
          {discountPercent > 0 && (
            <span className="bg-gradient-to-r from-rose-500 to-red-600 text-white text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shadow-sm">
              {discountPercent}% OFF
            </span>
          )}
          {rating >= 4.8 && (
            <span className="bg-amber-400 text-amber-950 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-lg shadow-xs flex items-center space-x-1">
              <FaBolt size={9} />
              <span>HOT</span>
            </span>
          )}
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={handleWishlistToggle}
          className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer ${
            isWishlisted
              ? 'bg-rose-50 text-rose-600 border border-rose-200 shadow-sm'
              : 'bg-white/90 backdrop-blur-md text-slate-400 hover:text-rose-500 border border-slate-200 shadow-xs hover:scale-110'
          }`}
          title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        >
          {isWishlisted ? <FaHeart size={16} /> : <FaRegHeart size={16} />}
        </button>

        {/* Product Image Link */}
        <Link to={`/product/${product._id || product.id}`} className="w-full h-full flex items-center justify-center">
          <img
            src={product.image || 'https://via.placeholder.com/400x400?text=Product'}
            alt={product.name}
            className="max-h-full max-w-full object-contain ekart-img-zoom filter drop-shadow-sm"
            loading="lazy"
          />
        </Link>
      </div>

      {/* Product Content Body */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Brand Pill */}
          <div className="flex items-center justify-between mb-1.5 text-[11px] text-slate-400 font-semibold uppercase tracking-wider">
            <span className="text-blue-600 font-bold">{product.category || 'Lifestyle'}</span>
            {product.brand && <span className="truncate max-w-[100px]">{product.brand}</span>}
          </div>

          {/* Product Title */}
          <Link to={`/product/${product._id || product.id}`}>
            <h3 className="text-sm font-bold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug mb-2">
              {product.name}
            </h3>
          </Link>

          {/* Rating Badge */}
          <div className="flex items-center space-x-1.5 mb-3">
            <div className="flex items-center space-x-1 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md text-[11px] font-bold text-amber-700">
              <FaStar className="text-amber-500" size={10} />
              <span>{rating.toFixed(1)}</span>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">({numReviews})</span>
            {product.countInStock > 0 && product.countInStock <= 10 && (
              <span className="text-[10px] text-rose-500 font-bold ml-auto">
                Only {product.countInStock} left!
              </span>
            )}
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-lg font-black text-slate-900 font-heading">
                ₹{currentPrice.toFixed(2)}
              </span>
              {originalPrice > currentPrice && (
                <span className="text-xs text-slate-400 line-through font-medium">
                  ₹{originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.countInStock === 0}
            className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-sm cursor-pointer ${
              product.countInStock === 0
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : isAddedToCart
                ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                : 'bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/20 active:scale-95'
            }`}
          >
            {isAddedToCart ? (
              <>
                <FaCheck size={12} />
                <span>Added</span>
              </>
            ) : (
              <>
                <FaShoppingCart size={12} />
                <span>Add</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
