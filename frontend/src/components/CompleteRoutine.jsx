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
    <div className="bg-white p-5 sm:p-8 lg:p-10 rounded-2xl shadow-sm border border-gray-100 mt-8 text-left transition-all duration-300">
      {/* Loading Skeleton Grid */}
      {loading && (
        <div>
          <div className="mb-8 text-center sm:text-left animate-pulse">
            <div className="h-3 bg-gray-200 rounded w-32 mb-2 mx-auto sm:mx-0" />
            <div className="h-7 bg-gray-200 rounded w-60 mb-2 mx-auto sm:mx-0" />
            <div className="h-4 bg-gray-200 rounded w-72 mx-auto sm:mx-0" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 animate-pulse">
            {[1, 2, 3, 4].map((n) => (
              <div
                key={n}
                className="bg-gray-50 rounded-2xl h-80 p-4 flex flex-col justify-between border border-gray-100"
              >
                <div className="w-full h-40 bg-gray-200 rounded-xl mb-4" />
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/3" />
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                </div>
                <div className="h-9 bg-gray-200 rounded-xl mt-4" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error State with Retry Button */}
      {error && !loading && (
        <div className="py-10 text-center flex flex-col items-center justify-center space-y-3">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center border border-red-100">
            <FaExclamationTriangle className="text-xl" />
          </div>
          <h3 className="text-lg font-bold text-gray-900">Unable to Load Recommendations</h3>
          <p className="text-xs sm:text-sm text-gray-600 max-w-md bg-red-50/50 p-3 rounded-xl border border-red-100">
            {error}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 inline-flex items-center space-x-2 bg-indigo-600 hover:bg-indigo-700 active:scale-95 text-white text-xs sm:text-sm font-bold py-2.5 px-5 rounded-xl transition-all shadow-md shadow-indigo-200"
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
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-indigo-600 block mb-1">
              COMPLETE YOUR ROUTINE
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Complete Your Routine
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">
              Handpicked products that complement your purchase.
            </p>
          </div>

          {/* Empty State */}
          {recommendations.length === 0 ? (
            <div className="text-center py-12 px-4 bg-gray-50/80 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center space-y-3">
              <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center border border-indigo-100">
                <FaShoppingBag className="text-xl" />
              </div>
              <h3 className="text-base font-bold text-gray-800">No Recommendations Available</h3>
              <p className="text-xs sm:text-sm text-gray-500 max-w-sm">
                We couldn't find complementary products right now, but feel free to explore our full product catalog.
              </p>
              <Link
                to="/"
                className="mt-2 inline-flex items-center text-xs sm:text-sm font-bold text-indigo-600 hover:text-indigo-800 bg-white border border-indigo-200 px-4 py-2 rounded-xl shadow-sm hover:shadow transition-all"
              >
                <span>Explore Catalog &rarr;</span>
              </Link>
            </div>
          ) : (
            /* Responsive Product Grid */
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
