import React from 'react';
import { FaCheckCircle, FaShoppingBag } from 'react-icons/fa';

const OrderSuccessHeader = ({ purchasedProduct }) => {
  return (
    <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 text-white rounded-2xl shadow-xl p-8 sm:p-10 mb-10 text-center relative overflow-hidden transition-all duration-300">
      {/* Background Decorative Element */}
      <div className="absolute -right-8 -bottom-8 opacity-10 pointer-events-none">
        <FaShoppingBag className="text-9xl" />
      </div>

      <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
        {/* Animated Success Icon Badge */}
        <div className="w-16 h-16 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center mb-5 shadow-lg border border-white/30 transform hover:scale-110 transition-transform duration-300">
          <FaCheckCircle className="text-white text-4xl drop-shadow-md" />
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-3 drop-shadow-sm">
          Order Confirmed!
        </h1>
        
        {/* Thank You Message */}
        <p className="text-emerald-100 text-base sm:text-lg font-medium max-w-lg mb-6 leading-relaxed">
          Thank you for your purchase. Your order has been successfully placed and is currently being processed.
        </p>

        {/* Purchased Item Highlight Badge */}
        {purchasedProduct?.name && (
          <div className="inline-flex items-center bg-white/15 backdrop-blur-md px-5 py-2.5 rounded-full border border-white/25 text-sm sm:text-base font-medium shadow-sm">
            <span className="text-emerald-200 mr-2">You purchased:</span>
            <span className="font-bold text-white tracking-wide truncate max-w-xs sm:max-w-md">
              {purchasedProduct.name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderSuccessHeader;
