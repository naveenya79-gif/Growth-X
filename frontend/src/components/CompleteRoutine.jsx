import React from 'react';
import { FaRedo, FaExclamationTriangle, FaShoppingBag } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import RecommendationCard from './RecommendationCard';

const CompleteRoutine = ({
  recommendations,
  loading,
  error,
  addedMap,
  onAddToCart,
  onRetry,
}) => {
  return (
    <div className="bg-white p-5 sm:p-8 lg:p-10 rounded-3xl shadow-xs border border-[#E5EAF0] mt-8 text-left">
      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="bg-[#F4F9FF] rounded-2xl h-80 skeleton border border-[#E5EAF0]"
            />
          ))}
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="py-10 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center border border-red-100">
            <FaExclamationTriangle className="text-xl" />
          </div>
          <h3 className="text-lg font-bold text-[#172033]">Unable to Load Recommendations</h3>
          <p className="text-xs text-[#667085] max-w-md bg-red-50 p-3 rounded-xl border border-red-200">
            {error}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 inline-flex items-center space-x-2 bg-[#2878D8] text-white text-xs font-bold py-2.5 px-5 rounded-xl hover:bg-[#1769C2] transition-colors"
            >
              <FaRedo className="text-xs" />
              <span>Try Again</span>
            </button>
          )}
        </div>
      )}

      {/* Main Content */}
      {!loading && !error && (
        <div>
          {/* Section Header */}
          <div className="mb-6 sm:mb-8 text-center sm:text-left">
            <span className="text-xs font-extrabold uppercase tracking-widest text-[#2878D8] block mb-1">
              RECOMMENDED FOR YOU
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#172033] tracking-tight">
              Complete Your Collection
            </h2>
            <p className="text-[#667085] text-xs sm:text-sm mt-1 font-semibold">
              Handpicked products that complement your purchase.
            </p>
          </div>

          {/* Empty State */}
          {recommendations.length === 0 ? (
            <div className="text-center py-12 px-4 bg-[#F4F9FF] rounded-2xl border border-[#E5EAF0] flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 bg-white text-[#2878D8] rounded-full flex items-center justify-center border border-[#E5EAF0]">
                <FaShoppingBag className="text-xl" />
              </div>
              <h3 className="text-base font-bold text-[#172033]">No Recommendations Available</h3>
              <p className="text-xs text-[#667085] max-w-sm">
                Feel free to explore our full eKart product catalog for shirts, watches, perfumes, and more.
              </p>
              <Link
                to="/"
                className="mt-2 inline-flex items-center text-xs font-bold text-[#2878D8] bg-white border border-[#E5EAF0] px-4 py-2 rounded-xl hover:bg-[#E8F3FF] transition-all"
              >
                <span>Explore Catalog &rarr;</span>
              </Link>
            </div>
          ) : (
            /* Product Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {recommendations.map((item) => (
                <RecommendationCard
                  key={item._id}
                  item={item}
                  isAdded={!!addedMap[item._id]}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompleteRoutine;
