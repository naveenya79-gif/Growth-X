import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

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

  useEffect(() => {
    if (!userInfo || !userInfo.isAdmin) {
      navigate('/admin/login');
    }
  }, [userInfo, navigate]);

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
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Product</h1>
          <p className="mt-1 text-sm text-gray-500 font-medium">Create a new item in your inventory</p>
        </div>
        <button
          onClick={() => navigate('/admin/products')}
          className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm flex items-center transition-colors"
        >
          <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
          </svg>
          Back to List
        </button>
      </div>

      <div className="bg-white shadow-xl rounded-2xl p-8 border border-gray-100">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6 text-sm flex items-start">
            <span className="font-medium">{error}</span>
          </div>
        )}

        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 rounded mb-6 text-sm flex items-start">
            <span className="font-medium">Product created successfully!</span>
          </div>
        )}

        <form onSubmit={submitHandler} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-sans">Product Name</label>
              <input
                type="text"
                placeholder="Product Name"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-sans">Price ($)</label>
              <input
                type="number"
                step="0.01"
                placeholder="0.00"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-sans">Category</label>
              <input
                type="text"
                placeholder="Category"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-sans">Count In Stock</label>
              <input
                type="number"
                placeholder="0"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm"
                value={countInStock}
                onChange={(e) => setCountInStock(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-sans">Image URL</label>
            <input
              type="text"
              placeholder="/images/sample.jpg"
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1.5 font-sans">Description</label>
            <textarea
              rows="4"
              placeholder="Product description goes here..."
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-sm"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3.5 px-4 rounded-lg transition-colors flex items-center justify-center shadow-lg shadow-indigo-600/10 active:scale-[0.98] transform"
          >
            {loading ? 'Creating...' : 'Create Product'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminAddProduct;
