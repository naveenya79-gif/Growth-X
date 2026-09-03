import React from 'react';
import { FaStar, FaShoppingCart, FaCheck } from 'react-icons/fa';

const RecommendationCard = ({ item, isAdded, onAddToCart }) => {
  const isOutOfStock = item.countInStock === 0;
  const imageSrc = item.image || 'https://via.placeholder.com/300x200?text=No+Image+Available';
  const ratingValue = Number(item.rating);
  const hasRating = !isNaN(ratingValue) && ratingValue > 0;
  const priceValue = typeof item.price === 'number' ? item.price : parseFloat(item.price || 0);

  return (
    <div className="group bg-white rounded-2xl border border-[#E5EAF0] hover:border-[#2878D8] shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
      
      {/* Image Container */}
      <div className="relative w-full h-44 bg-[#F4F9FF] overflow-hidden flex items-center justify-center p-3">
        <img
          src={imageSrc}
          alt={item.name || 'Product Image'}
          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-400 ease-out"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/300x200?text=Image+Unavailable';
          }}
        />
        
        {/* Brand Badge */}
        {item.brand && (
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-[#172033] text-[9px] font-extrabold uppercase px-2.5 py-1 rounded-md shadow-xs border border-[#E5EAF0] tracking-wider">
            {item.brand}
          </span>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating */}
          <div className="flex items-center space-x-1 mb-1.5 text-xs">
            <FaStar className={hasRating ? 'text-amber-400' : 'text-gray-300'} />
            <span className="font-bold text-[#172033]">
              {hasRating ? ratingValue.toFixed(1) : 'New'}
            </span>
          </div>

          {/* Product Name */}
          <h3
            className="font-bold text-[#172033] text-xs sm:text-sm leading-snug line-clamp-2 group-hover:text-[#2878D8] transition-colors mb-2"
            title={item.name}
          >
            {item.name}
          </h3>
        </div>

        {/* Price & Action Button */}
        <div className="mt-3 pt-3 border-t border-[#E5EAF0] flex flex-col space-y-2.5">
          <div className="flex items-baseline justify-between">
            <span className="text-[10px] text-[#667085] uppercase font-bold">Add-on Price</span>
            <span className="text-base font-extrabold text-[#2878D8]">
              ₹{priceValue.toFixed(2)}
            </span>
          </div>

          <button
            onClick={() => onAddToCart(item)}
            disabled={isOutOfStock}
            className={`w-full font-extrabold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all shadow-xs ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                : isAdded
                ? 'bg-[#16A34A] text-white shadow-xs scale-[0.98]'
                : 'bg-[#2878D8] hover:bg-[#1769C2] active:scale-[0.98] text-white shadow-xs'
            }`}
          >
            {isOutOfStock ? (
              <span>Out of Stock</span>
            ) : isAdded ? (
              <>
                <FaCheck className="text-xs animate-pulse" />
                <span>Added to Cart</span>
              </>
            ) : (
              <>
                <FaShoppingCart className="text-xs" />
                <span>Add to Cart</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;
