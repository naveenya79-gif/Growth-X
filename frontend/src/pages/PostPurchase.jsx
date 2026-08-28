import React from 'react';
import { useParams, Link } from 'react-router-dom';

const PostPurchase = () => {
  const { productId } = useParams();

  return (
    <div className="max-w-4xl mx-auto py-12 text-center">
      <div className="bg-green-50 border border-green-200 p-8 rounded-xl shadow-sm mb-8">
        <h1 className="text-4xl font-extrabold text-green-800 mb-4">Order Confirmed!</h1>
        <p className="text-xl text-green-700">
          Thank you for your purchase. Your order is being processed.
        </p>
      </div>

      <div className="bg-white p-10 rounded-xl shadow-sm border border-gray-100 mt-8">
        <div className="flex justify-center items-center space-x-3 mb-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600"></div>
          <h2 className="text-2xl font-bold text-gray-800">
            Finding products that complement your purchase...
          </h2>
        </div>
        <p className="text-gray-500">Retrieving recommendations based on product ID: <span className="font-mono bg-gray-100 px-2 py-1 rounded">{productId}</span></p>
        
        {/* Module 3: Recommendations will be mapped and displayed here */}
      </div>
      
      <div className="mt-10">
        <Link to="/" className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium text-lg hover:underline transition-all">
          &larr; Return to Home
        </Link>
      </div>
    </div>
  );
};

export default PostPurchase;
