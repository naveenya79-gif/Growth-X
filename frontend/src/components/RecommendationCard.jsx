import React from 'react';
import { FaStar, FaShoppingCart, FaCheck } from 'react-icons/fa';

const RecommendationCard = ({ item, isAdded, onAddToCart }) => {
  const isOutOfStock = item.countInStock === 0;
  const imageSrc = item.image || 'https://via.placeholder.com/300x200?text=No+Image+Available';
  const ratingValue = Number(item.rating);
  const hasRating = !isNaN(ratingValue) && ratingValue > 0;

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col justify-between overflow-hidden relative">
      {/* Image Container with Hover Zoom */}
      <div className="relative w-full h-44 bg-gray-50 overflow-hidden flex items-center justify-center">
        <img
          src={imageSrc}
          alt={item.name || 'Product Image'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://via.placeholder.com/300x200?text=Image+Unavailable';
          }}
        />
        
        {/* Brand Pill Badge */}
        {item.brand && (
          <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-gray-800 text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full shadow-sm border border-gray-200/60 tracking-wider">
            {item.brand}
          </span>
        )}
      </div>

      {/* Card Content */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Rating */}
          <div className="flex items-center space-x-1 mb-1.5">
            <FaStar className={`text-xs ${hasRating ? 'text-yellow-400' : 'text-gray-300'}`} />
            <span className="text-xs font-semibold text-gray-600">
              {hasRating ? ratingValue.toFixed(1) : 'New'}
            </span>
          </div>

          {/* Product Name */}
          <h3
            className="font-bold text-gray-900 text-sm leading-snug line-clamp-2 group-hover:text-indigo-600 transition-colors mb-2"
            title={item.name}
          >
            {item.name}
          </h3>
        </div>

        {/* Price & Action Section */}
        <div className="mt-3 pt-3 border-t border-gray-100 flex flex-col space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-gray-500 font-medium">Price</span>
            <span className="text-lg font-extrabold text-indigo-600">
              ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
            </span>
          </div>

          {/* Add to Routine / Cart Button */}
          <button
            onClick={() => onAddToCart(item)}
            disabled={isOutOfStock}
            className={`w-full font-bold py-2.5 px-4 rounded-xl text-xs sm:text-sm flex items-center justify-center space-x-2 transition-all duration-300 shadow-sm ${
              isOutOfStock
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-200'
                : isAdded
                ? 'bg-emerald-600 text-white shadow-emerald-200 shadow-md scale-[0.98]'
                : 'bg-indigo-600 hover:bg-indigo-700 active:scale-[0.98] text-white shadow-indigo-200 shadow-md hover:shadow-indigo-300'
            }`}
          >
            {isOutOfStock ? (
              <span>Out of Stock</span>
            ) : isAdded ? (
              <>
                <FaCheck className="text-sm animate-pulse" />
                <span>Added to Routine</span>
              </>
            ) : (
              <>
                <FaShoppingCart className="text-xs" />
                <span>Add to Routine</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecommendationCard;
