import React from 'react';

const CompleteRoutine = ({
  recommendations,
  loading,
  error,
  addedMap,
  onAddToCart,
}) => {
  return (
    <div className="bg-white p-8 sm:p-10 rounded-2xl shadow-sm border border-gray-100 mt-8 text-left transition-all duration-300">
      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4 text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          <h2 className="text-xl font-bold text-gray-800">
            Finding products that complement your purchase...
          </h2>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="py-8 text-center">
          <p className="text-lg font-bold text-red-600 mb-2">Unable to load recommendations</p>
          <p className="text-sm bg-red-50 text-red-700 py-2.5 px-4 rounded-lg inline-block border border-red-200">
            {error}
          </p>
        </div>
      )}

      {/* Main Content */}
      {!loading && !error && (
        <div>
          {/* Section Header */}
          <div className="mb-8 text-center sm:text-left">
            <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-indigo-600 block mb-1">
              COMPLETE YOUR ROUTINE
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
              Complete Your Routine
            </h2>
            <p className="text-gray-500 text-sm sm:text-base mt-1">
              Handpicked products that complement your purchase.
            </p>
          </div>

          {/* Empty State */}
          {recommendations.length === 0 ? (
            <div className="text-center py-10 bg-gray-50 rounded-xl border border-dashed border-gray-200">
              <p className="text-gray-500 text-base font-medium">
                We couldn't find additional recommendations right now.
              </p>
            </div>
          ) : (
            /* Responsive Product Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendations.map((item) => {
                const isOutOfStock = item.countInStock === 0;
                const isAdded = addedMap[item._id];

                return (
                  <div
                    key={item._id}
                    className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all p-4 bg-white flex flex-col justify-between"
                  >
                    <div>
                      <img
                        src={item.image || 'https://via.placeholder.com/300x200?text=Product'}
                        alt={item.name}
                        className="w-full h-40 object-cover rounded-lg mb-3"
                      />
                      <h3 className="font-semibold text-gray-900 truncate mb-1" title={item.name}>
                        {item.name}
                      </h3>
                      <p className="text-xs text-gray-500 mb-2">
                        Brand: <span className="font-medium text-gray-700">{item.brand || 'N/A'}</span>
                      </p>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mt-3 text-sm">
                        <span className="font-bold text-indigo-600 text-lg">
                          ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                        </span>
                        <span className="text-yellow-500 font-semibold text-sm">
                          ★ {item.rating || 0}
                        </span>
                      </div>

                      <button
                        onClick={() => onAddToCart(item)}
                        disabled={isOutOfStock}
                        className={`w-full font-medium py-2 px-4 rounded-lg text-sm transition-all mt-3 shadow-sm ${
                          isOutOfStock
                            ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                            : isAdded
                            ? 'bg-green-600 text-white'
                            : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                        }`}
                      >
                        {isOutOfStock ? 'Out of Stock' : isAdded ? '✓ Added to Cart' : 'Add to Cart'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CompleteRoutine;
