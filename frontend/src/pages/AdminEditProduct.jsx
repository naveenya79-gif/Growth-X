import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';
import { FiArrowLeft } from 'react-icons/fi';

const API_URL = 'http://localhost:5000/api/products';

const AdminEditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { userInfo } = useSelector((state) => state.user);
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`${API_URL}/${id}`);
        setForm({
          name: data.name || '',
          description: data.description || '',
          price: data.price ?? '',
          category: data.category || '',
          brand: data.brand || '',
          image: data.image || '',
          countInStock: data.countInStock ?? '',
          status: data.status || 'Active',
        });
      } catch (err) {
        setError(err.response?.data?.message || err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  const changeHandler = (event) => {
    setForm((currentForm) => ({ ...currentForm, [event.target.name]: event.target.value }));
  };

  const submitHandler = async (event) => {
    event.preventDefault();
    setError(null);
    const price = Number(form.price);
    const stock = Number(form.countInStock);
    if (!form.name.trim() || form.name.trim().length < 2) return setError('Product name must be at least 2 characters');
    if (!form.description.trim()) return setError('Description is required');
    if (!form.category.trim()) return setError('Category is required');
    if (!form.brand.trim()) return setError('Brand is required');
    if (!/^https?:\/\/\S+$/i.test(form.image.trim())) return setError('Please enter a valid image URL');
    if (!Number.isFinite(price) || price < 0) return setError('Price must be a non-negative number');
    if (!Number.isInteger(stock) || stock < 0) return setError('Stock quantity must be a non-negative integer');

    setSaving(true);
    try {
      await axios.put(`${API_URL}/${id}`, {
        ...form,
        name: form.name.trim(),
        description: form.description.trim(),
        category: form.category.trim(),
        brand: form.brand.trim(),
        image: form.image.trim(),
        price,
        countInStock: stock,
      }, { headers: { Authorization: `Bearer ${userInfo.token}` } });
      navigate('/admin/products', { state: { success: 'Product updated successfully.' } });
    } catch (err) {
      setError(err.response?.data?.message || err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar userInfo={userInfo} />
      <main className="flex-1 lg:ml-64">
        <header className="bg-white border-b border-gray-200 pt-20 lg:pt-0">
          <div className="px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Edit Product</h1>
              <p className="text-gray-600 text-sm mt-1">Update your product information</p>
            </div>
            <button type="button" onClick={() => navigate('/admin/products')} className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm flex items-center gap-1">
              <FiArrowLeft size={20} />
              <span>Back to Products</span>
            </button>
          </div>
        </header>
        <div className="p-4 sm:p-6 lg:p-8 max-w-3xl">
          {loading && <p className="text-gray-600">Loading product...</p>}
          {error && <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded mb-6">{error}</div>}
          {form && !loading && (
            <form onSubmit={submitHandler} className="bg-white rounded-lg shadow-lg p-6 sm:p-8 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <Field label="Product Name" name="name" value={form.name} onChange={changeHandler} />
                <Field label="Price ($)" name="price" type="number" min="0" step="0.01" value={form.price} onChange={changeHandler} />
                <Field label="Category" name="category" value={form.category} onChange={changeHandler} />
                <Field label="Brand" name="brand" value={form.brand} onChange={changeHandler} />
                <Field label="Stock Quantity" name="countInStock" type="number" min="0" step="1" value={form.countInStock} onChange={changeHandler} />
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="status">Product Status</label>
                  <select id="status" name="status" value={form.status} onChange={changeHandler} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
              <Field label="Product Image URL" name="image" value={form.image} onChange={changeHandler} />
              {form.image && <img src={form.image} alt="Product preview" className="h-24 w-24 object-cover rounded border border-gray-200" onError={(event) => { event.currentTarget.style.display = 'none'; }} />}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor="description">Description</label>
                <textarea id="description" name="description" rows="5" value={form.description} onChange={changeHandler} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={saving} className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold py-3 px-4 rounded-lg">{saving ? 'Saving...' : 'Save Changes'}</button>
                <button type="button" onClick={() => navigate('/admin/products')} className="px-6 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg">Cancel</button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

const Field = ({ label, name, type = 'text', ...props }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2" htmlFor={name}>{label}</label>
    <input id={name} name={name} type={type} required {...props} className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
  </div>
);

export default AdminEditProduct;
