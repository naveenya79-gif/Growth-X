import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaStar, FaHeart, FaRegHeart, FaShoppingCart, FaCheck } from 'react-icons/fa';
import { toggleWishlist } from '../redux/slices/wishlistSlice';
import { addToCart } from '../redux/slices/cartSlice';

const ProductCard = ({ product }) => {
  const dispatch = useDispatch();
  const { wishlistItems } = useSelector((state) => state.wishlist);
  const { cartItems } = useSelector((state) => state.cart);

  const productId = product._id || product.id;
  const isWishlisted = wishlistItems.some((x) => (x._id || x.product) === productId);
  const isAddedToCart = cartItems.some((x) => (x._id || x.product) === productId);

  // Calculate prices and discount
  const currentPrice = typeof product.price === 'number' ? product.price : parseFloat(product.price || 0);
  const originalPrice = product.originalPrice ? parseFloat(product.originalPrice) : currentPrice * 1.25;
  const discountPercent = product.discount
    ? product.discount
    : Math.round(((originalPrice - currentPrice) / originalPrice) * 100);

  const rating = product.rating ? Number(product.rating) : 4.5;
  const numReviews = product.numReviews ? product.numReviews : Math.floor(Math.random() * 80) + 12;

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(toggleWishlist(product));
  };

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dispatch(
      addToCart({
        ...product,
        product: productId,
        qty: 1,
        countInStock: product.countInStock !== undefined ? product.countInStock : 10,
      })
    );
  };

  return (
    <div className="group ekart-card relative flex flex-col justify-between overflow-hidden bg-white">
      {/* Discount Tag */}
      {discountPercent > 0 && (
        <span className="absolute top-3 left-3 z-10 bg-[#E53935] text-white text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-md shadow-xs tracking-wider">
          {discountPercent}% OFF
        </span>
      )}

      {/* Wishlist Heart Icon */}
      <button
        onClick={handleWishlistToggle}
        className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all ${
          isWishlisted
            ? 'bg-red-50 text-[#E53935] border border-red-200'
            : 'bg-white/80 backdrop-blur-md text-[#667085] hover:text-[#E53935] border border-[#E5EAF0] shadow-xs'
        }`}
        title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
      >
        {isWishlisted ? <FaHeart size={15} /> : <FaRegHeart size={15} />}
      </button>

      {/* Image Area with Hover Zoom */}
      <Link to={`/product/${productId}`} className="relative w-full aspect-square bg-[#F4F9FF] overflow-hidden flex items-center justify-center p-4">
        <img
          src={product.image || 'https://via.placeholder.com/400x400?text=Product'}
          alt={product.name}
          className="w-full h-full object-contain ekart-img-zoom"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=600&auto=format&fit=crop';
          }}
        />
      </Link>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category Pill */}
          <div className="flex items-center justify-between text-[11px] text-[#667085] mb-1.5 font-semibold">
            <span className="bg-[#F4F9FF] px-2 py-0.5 rounded-md text-[#2878D8] border border-[#E5EAF0] uppercase text-[9px] font-bold">
              {product.category || 'Featured'}
            </span>
            <span className={product.countInStock > 0 ? 'text-[#16A34A]' : 'text-red-500'}>
              {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
            </span>
          </div>

          {/* Product Title */}
          <Link to={`/product/${productId}`}>
            <h3
              className="text-sm font-bold text-[#172033] hover:text-[#2878D8] transition-colors line-clamp-2 leading-snug mb-2"
              title={product.name}
            >
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center space-x-1.5 mb-3">
            <div className="flex items-center text-amber-400 text-xs">
              <FaStar />
            </div>
            <span className="text-xs font-bold text-[#172033]">{rating.toFixed(1)}</span>
            <span className="text-[11px] text-[#667085]">({numReviews})</span>
          </div>
        </div>

        {/* Price & Add to Cart */}
        <div className="pt-3 border-t border-[#E5EAF0] flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-lg font-extrabold text-[#172033]">
                ${currentPrice.toFixed(2)}
              </span>
              {originalPrice > currentPrice && (
                <span className="text-xs text-[#667085] line-through font-medium">
                  ${originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={product.countInStock === 0}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs ${
              product.countInStock === 0
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                : isAddedToCart
                ? 'bg-[#16A34A] text-white hover:bg-green-700'
                : 'bg-[#2878D8] text-white hover:bg-[#1769C2]'
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
