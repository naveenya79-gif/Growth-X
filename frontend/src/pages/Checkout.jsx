import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, clearCart } from '../redux/slices/cartSlice';
import RecommendationCard from '../components/RecommendationCard';
import axios from 'axios';

const Checkout = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);
  const { userInfo } = useSelector((state) => state.user);
  const { cartItems } = cart;

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [addedMap, setAddedMap] = useState({});

  useEffect(() => {
    const fetchRecs = async () => {
      if (cartItems.length === 0) return;
      const primaryItem = cartItems[0];
      const targetId = primaryItem.product || primaryItem._id;
      if (!targetId) return;

      setLoadingRecs(true);
      try {
        const { data } = await axios.get(`http://localhost:5000/api/products/${targetId}/recommendations`);
        if (data.success) {
          const cartProductIds = new Set(cartItems.map((c) => c.product || c._id));
          const filtered = (data.recommendations || []).filter((rec) => !cartProductIds.has(rec._id));
          setRecommendations(filtered);
        }
      } catch (err) {
        console.error('Error fetching checkout recommendations:', err);
      } finally {
        setLoadingRecs(false);
      }
    };

    fetchRecs();
  }, [cartItems]);

  const handleAddRecToCart = (item) => {
    const existItem = cartItems.find((x) => (x.product || x._id) === item._id);
    const currentQty = existItem ? existItem.qty : 0;
    const stockLimit = item.countInStock !== undefined ? item.countInStock : 10;
    const newQty = Math.min(currentQty + 1, stockLimit);

    dispatch(
      addToCart({
        ...item,
        product: item._id,
        qty: newQty,
        countInStock: stockLimit,
      })
    );

    setAddedMap((prev) => ({ ...prev, [item._id]: true }));
    setTimeout(() => {
      setAddedMap((prev) => ({ ...prev, [item._id]: false }));
    }, 2500);
  };

  if (!userInfo) {
    navigate('/login');
    return null;
  }

  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const taxPrice = Number((0.15 * itemsPrice).toFixed(2));
  const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

  const placeOrderHandler = async () => {
    setLoading(true);
    setResult(null);
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };

      const primaryProductId = cartItems[0]?.product || cartItems[0]?._id;

      const { data } = await axios.post(
        'http://localhost:5000/api/orders',
        {
          orderItems: cartItems,
          totalAmount: totalPrice,
        },
        config
      );

      if (data.paymentStatus === 'Success') {
        dispatch(clearCart());
        if (primaryProductId) {
          navigate(`/post-purchase/${primaryProductId}`);
          return;
        }
      }

      setResult({
        success: data.paymentStatus === 'Success',
        status: data.paymentStatus,
        reason: data.failureReason,
        orderId: data.order._id
      });

    } catch (error) {
      setResult({
        success: false,
        status: 'Error',
        reason: error.response && error.response.data.message ? error.response.data.message : error.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
      
      {result && (
        <div className={`mb-8 p-6 rounded-xl shadow-lg border-l-4 ${result.success ? 'bg-green-50 border-green-500 text-green-900' : 'bg-red-50 border-red-500 text-red-900'}`}>
          <h2 className="text-2xl font-bold mb-2">
            {result.success ? 'Payment Successful!' : 'Payment Failed'}
          </h2>
          <p className="text-lg mb-4">
            {result.success ? `Your order has been placed successfully.` : `Reason: ${result.reason}`}
          </p>
          <div className="flex gap-4 mt-4">
            {result.success ? (
              <button onClick={() => navigate('/')} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-medium">Continue Shopping</button>
            ) : (
              <button onClick={() => setResult(null)} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-medium">Try Again</button>
            )}
          </div>
        </div>
      )}

      {!result && (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <div className="bg-white rounded-xl shadow overflow-hidden p-6 mb-8">
              <h2 className="text-xl font-bold border-b pb-4 mb-4">Order Items</h2>
              {cartItems.length === 0 ? (
                <p>Your cart is empty</p>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {cartItems.map((item, index) => (
                    <li key={index} className="py-4 flex items-center">
                      <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden">
                        <img src={item.image || 'https://via.placeholder.com/100'} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="ml-4 flex-1">
                        <h3 className="text-gray-900 font-medium">{item.name}</h3>
                      </div>
                      <div className="text-gray-600 font-medium">
                        {item.qty} x ${item.price.toFixed(2)} = ${(item.qty * item.price).toFixed(2)}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-4 mb-4">Order Summary</h2>
              <ul className="divide-y divide-gray-200 mb-6">
                <li className="py-2 flex justify-between">
                  <span className="text-gray-600">Items</span>
                  <span className="font-medium">${itemsPrice.toFixed(2)}</span>
                </li>
                <li className="py-2 flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium">${shippingPrice.toFixed(2)}</span>
                </li>
                <li className="py-2 flex justify-between">
                  <span className="text-gray-600">Tax</span>
                  <span className="font-medium">${taxPrice.toFixed(2)}</span>
                </li>
                <li className="py-4 flex justify-between border-t border-gray-300">
                  <span className="text-lg font-bold">Total</span>
                  <span className="text-lg font-bold text-indigo-600">${totalPrice.toFixed(2)}</span>
                </li>
              </ul>
              
              <button 
                onClick={placeOrderHandler}
                disabled={cartItems.length === 0 || loading}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-bold shadow transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing Payment...' : 'Place Order & Pay'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Recommendations Section on Checkout Page */}
      {cartItems.length > 0 && !result && (
        <div className="mt-12">
          <div className="flex items-center space-x-2 mb-6">
            <span className="text-indigo-600 text-xl font-bold">✨ Recommended Add-ons Before You Order</span>
            <span className="text-xs text-gray-500 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full font-medium">Smart AI Suggestions</span>
          </div>

          {loadingRecs ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-64 bg-gray-100 animate-pulse rounded-2xl"></div>
              ))}
            </div>
          ) : recommendations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {recommendations.map((item) => (
                <RecommendationCard
                  key={item._id}
                  item={item}
                  isAdded={!!addedMap[item._id]}
                  onAddToCart={handleAddRecToCart}
                />
              ))}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default Checkout;
