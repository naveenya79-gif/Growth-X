import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import AdminSidebar from '../components/AdminSidebar';
import { FiPackage, FiCheckCircle, FiAlertCircle, FiPlus } from 'react-icons/fi';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { userInfo } = useSelector((state) => state.user);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        const { data } = await axios.get('http://localhost:5000/api/admin/dashboard', config);
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching dashboard stats:', err);
        setError(err.response?.data?.message || 'Failed to load dashboard statistics');
      } finally {
        setLoading(false);
      }
    };

    if (userInfo) {
      fetchDashboardStats();
    }
  }, [userInfo]);

  const StatCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow p-6 border-l-4" style={{ borderColor: color }}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className="text-4xl" style={{ color }}>
          <Icon />
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar userInfo={userInfo} />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 font-medium">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-gray-100">
        <AdminSidebar userInfo={userInfo} />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
            <div className="text-red-600 text-5xl mb-4">⚠️</div>
            <h2 className="text-xl font-bold text-red-900 mb-2">Failed to Load Dashboard</h2>
            <p className="text-red-700 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar userInfo={userInfo} />

      {/* Main Content */}
      <div className="flex-1 lg:ml-64">
        {/* Top Bar */}
        <div className="bg-white shadow-sm border-b border-gray-200 pt-20 lg:pt-0">
          <div className="px-4 sm:px-6 lg:px-8 py-4">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 text-sm mt-1">Welcome back, {stats?.seller?.name}!</p>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-8">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <StatCard
              title="Total Products"
              value={stats?.statistics?.totalProducts || 0}
              icon={FiPackage}
              color="#6366f1"
            />
            <StatCard
              title="Active Products"
              value={stats?.statistics?.activeProducts || 0}
              icon={FiCheckCircle}
              color="#10b981"
            />
            <StatCard
              title="Out of Stock"
              value={stats?.statistics?.outOfStockProducts || 0}
              icon={FiAlertCircle}
              color="#ef4444"
            />
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg shadow-lg p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                to="/admin/products/add"
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center space-x-2"
              >
                <FiPlus size={20} />
                <span>Add Product</span>
              </Link>
              <Link
                to="/admin/products"
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center space-x-2"
              >
                <FiPackage size={20} />
                <span>Manage Products</span>
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-lg font-semibold transition"
              >
                Refresh Data
              </button>
            </div>
          </div>

          {/* Recent Products */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Recent Products</h2>
              <p className="text-gray-600 text-sm mt-1">Latest 5 products in your inventory</p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Product Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Stock
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats?.recentProducts && stats.recentProducts.length > 0 ? (
                    stats.recentProducts.map((product) => (
                      <tr key={product._id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="flex items-center space-x-3">
                            <img
                              src={product.image}
                              alt={product.name}
                              className="w-10 h-10 rounded object-cover"
                              onError={(e) => {
                                e.target.src =
                                  'https://via.placeholder.com/40?text=No+Image';
                              }}
                            />
                            <span className="font-medium text-gray-900">
                              {product.name}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {product.category}
                        </td>
                        <td className="px-6 py-4 text-sm font-semibold text-gray-900">
                          ${product.price.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {product.countInStock}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              product.countInStock > 0
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" className="px-6 py-8 text-center text-gray-600">
                        No products yet.{' '}
                        <Link
                          to="/admin/products/add"
                          className="text-indigo-600 hover:text-indigo-700 font-semibold"
                        >
                          Add your first product
                        </Link>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Seller Information Card */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-600">Seller Name</label>
                <p className="mt-2 text-lg font-semibold text-gray-900">
                  {stats?.seller?.name}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Email</label>
                <p className="mt-2 text-lg font-semibold text-gray-900">
                  {stats?.seller?.email}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">Account Type</label>
                <p className="mt-2 text-lg font-semibold text-gray-900">
                  {stats?.seller?.isAdmin ? 'Admin/Seller' : 'Seller'}
                </p>
              </div>
            </div>
          </div>

          {/* Bounded Money Actions & Audit Trail Panel (Razorpay Track 01 Requirements) */}
          <div className="bg-white rounded-lg shadow overflow-hidden border border-indigo-100">
            <div className="bg-gradient-to-r from-slate-900 to-indigo-950 px-6 py-5 text-white flex justify-between items-center">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-yellow-400 font-bold text-lg">🔒 Bounded Money Actions & Audit Trail</span>
                  <span className="bg-indigo-500/30 text-indigo-200 text-xs px-2.5 py-0.5 rounded-full border border-indigo-400/30">Track 01 Compliance</span>
                </div>
                <p className="text-gray-300 text-xs mt-1">Every transaction action explainable, bounded, gated, and failure-handled gracefully.</p>
              </div>
              <span className="bg-emerald-500/20 text-emerald-300 text-xs font-semibold px-3 py-1 rounded-full border border-emerald-500/30">
                Razorpay Test Mode Active
              </span>
            </div>

            <div className="p-6 space-y-6">
              {/* Bounded Rules Explanation */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-indigo-600 font-bold text-sm block mb-1">1. Bounded Limits</span>
                  <p className="text-gray-600">Maximum order bound: $5,000 USD. Stock levels strictly verified before money action execution.</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-indigo-600 font-bold text-sm block mb-1">2. Explainable Failure Audit</span>
                  <p className="text-gray-600">All failed attempts (Card Expired, Bank Declined, Insufficient Balance) recorded with full audit traces.</p>
                </div>
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <span className="text-indigo-600 font-bold text-sm block mb-1">3. AP2/ACP Protocol</span>
                  <p className="text-gray-600">Agent-readable catalog (<code className="text-indigo-600 font-mono">/api/agent/catalog</code>) enabled for AI buyers.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
