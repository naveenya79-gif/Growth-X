import React from 'react';
import { FaCheckCircle, FaShoppingBag } from 'react-icons/fa';

const OrderSuccessHeader = ({ purchasedProduct }) => {
  return (
    <div className="bg-[#F4F9FF] border border-[#E5EAF0] text-[#172033] rounded-3xl shadow-xs p-8 sm:p-10 mb-10 text-center relative overflow-hidden">
      <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
        
        {/* Success Icon Badge */}
        <div className="w-16 h-16 bg-[#16A34A]/10 text-[#16A34A] rounded-full flex items-center justify-center mb-4 border border-[#16A34A]/20">
          <FaCheckCircle className="text-3xl" />
        </div>

        {/* Main Heading */}
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2 text-[#172033]">
          Order Confirmed!
        </h1>
        
        {/* Message */}
        <p className="text-[#667085] text-sm sm:text-base font-semibold max-w-lg mb-6 leading-relaxed">
          Thank you for your purchase with eKart. Your order has been successfully placed and is being prepared for dispatch.
        </p>

        {/* Purchased Item Highlight */}
        {purchasedProduct?.name && (
          <div className="inline-flex items-center bg-white px-5 py-2.5 rounded-2xl border border-[#E5EAF0] text-xs sm:text-sm font-semibold shadow-xs">
            <span className="text-[#667085] mr-2">Purchased Item:</span>
            <span className="font-extrabold text-[#2878D8] truncate max-w-xs sm:max-w-md">
              {purchasedProduct.name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderSuccessHeader;
