import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';

const AdminDashboard = () => {
  const [failedPayments, setFailedPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { userInfo } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchFailedPayments = async () => {
      try {
        const config = {
          headers: {
            Authorization: `Bearer ${userInfo.token}`,
          },
        };
        const { data } = await axios.get('http://localhost:5000/api/revenue-risk', config);
        setFailedPayments(data);
      } catch (error) {
        console.error('Error fetching failed payments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFailedPayments();
  }, [userInfo]);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  return (
    <div className="max-w-7xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard - Revenue Risk</h1>
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6 bg-red-50 border-b border-red-200">
          <h3 className="text-lg leading-6 font-medium text-red-900">Failed Payments Monitoring (ReviveX Target API)</h3>
          <p className="mt-1 max-w-2xl text-sm text-red-700">Endpoint: GET /api/revenue-risk</p>
        </div>
        
        {failedPayments.length === 0 ? (
          <div className="p-6 text-center text-gray-500">No failed payments recorded yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Failure Reason</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {failedPayments.map((payment) => (
                  <tr key={payment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">{payment.orderId}</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{payment.customerId?.name || 'Unknown'}</div>
                      <div className="text-sm text-gray-500">{payment.customerId?.email || 'Unknown'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                      ${payment.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                        {payment.failureReason}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(payment.timestamp || payment.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
