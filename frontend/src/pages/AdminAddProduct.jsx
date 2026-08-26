import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import AdminSidebar from '../components/AdminSidebar';
import { FiArrowLeft } from 'react-icons/fi';

const AdminAddProduct = () => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [image, setImage] = useState('');
  const [category, setCategory] = useState('');
  const [countInStock, setCountInStock] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const { userInfo } = useSelector((state) => state.user);
  const navigate = useNavigate();

  const submitHandler = (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!name || !price || !image || !category || !countInStock || !description) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);

    // Mock API call since backend doesn't implement create product route in this module
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      // Reset form
      setName('');
      setPrice('');
      setImage('');
      setCategory('');
      setCountInStock('');
      setDescription('');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/admin/products');
      }, 2000);
    }, 1000);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar userInfo={userInfo} />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 pt-20 lg:pt-0">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Add New Product</h1>
              <p className="text-gray-600 text-sm mt-1">Create a new item in your inventory</p>
            </div>
            <button
              onClick={() => navigate('/admin/products')}
              className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm flex items-center space-x-1 transition-colors"
            >
              <FiArrowLeft size={20} />
              <span className="hidden sm:inline">Back to Products</span>
              <span className="sm:hidden">Back</span>
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-2xl">
          <div className="bg-white rounded-lg shadow-lg">
            <div className="p-6 sm:p-8">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 text-sm flex items-start">
                  <span>⚠️</span>
                  <span className="ml-3">{error}</span>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded mb-6 text-sm flex items-start">
                  <span>✓</span>
                  <div className="ml-3">
                    <p className="font-medium">Product created successfully!</p>
                    <p className="text-xs mt-1">Redirecting to products list...</p>
                  </div>
                </div>
              )}

              <form onSubmit={submitHandler} className="space-y-6">
                {/* Product Name & Price */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Product Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Wireless Headphones"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Price ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Category & Stock */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Category *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Electronics"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Count In Stock *
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="0"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      value={countInStock}
                      onChange={(e) => setCountInStock(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Image URL */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Image URL *
                  </label>
                  <input
                    type="text"
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    value={image}
                    onChange={(e) => setImage(e.target.value)}
                    required
                  />
                  {image && (
                    <div className="mt-3 p-2 bg-gray-50 rounded border border-gray-200">
                      <img
                        src={image}
                        alt="Preview"
                        className="h-20 w-20 object-cover rounded"
                        onError={(e) => {
                          e.target.src = 'https://via.placeholder.com/80?text=Invalid';
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    rows="4"
                    placeholder="Describe your product here. Include features, specifications, and other relevant details..."
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all resize-none"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  ></textarea>
                </div>

                {/* Submit Button */}
                <div className="flex space-x-3 pt-6">
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Creating...</span>
                      </>
                    ) : (
                      <span>Create Product</span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('/admin/products')}
                    className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminAddProduct;
