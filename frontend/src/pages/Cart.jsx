import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaTrash, FaStar } from 'react-icons/fa';
import { addToCart, removeFromCart } from '../redux/slices/cartSlice';
import RecommendationCard from '../components/RecommendationCard';
import axios from 'axios';

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [addedMap, setAddedMap] = useState({});

  useEffect(() => {
    const fetchRecs = async () => {
      if (cartItems.length === 0) {
        setRecommendations([]);
        return;
      }
      const primaryItem = cartItems[0];
      const targetId = primaryItem.product || primaryItem._id;
      if (!targetId) return;

      setLoadingRecs(true);
      try {
        const { data } = await axios.get(`http://localhost:5000/api/products/${targetId}/recommendations`);
        if (data.success) {
          // Filter out items already in cart
          const cartProductIds = new Set(cartItems.map((c) => c.product || c._id));
          const filtered = (data.recommendations || []).filter((rec) => !cartProductIds.has(rec._id));
          setRecommendations(filtered);
        }
      } catch (err) {
        console.error('Error fetching cart recommendations:', err);
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

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
  };

  const checkoutHandler = () => {
    navigate('/login?redirect=/checkout');
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
      
      {cartItems.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <p className="text-gray-600 mb-4">Your cart is currently empty.</p>
          <Link to="/" className="text-indigo-600 hover:text-indigo-800 font-medium">Continue Shopping</Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <li key={item.product || item._id} className="p-6 flex items-center hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-md overflow-hidden">
                      <img src={item.image || 'https://via.placeholder.com/150'} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="ml-6 flex-1 flex flex-col justify-between">
                      <div className="flex justify-between">
                        <Link to={`/product/${item.product || item._id}`} className="text-lg font-medium text-gray-900 hover:text-indigo-600">{item.name}</Link>
                        <p className="font-bold text-gray-900">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <select 
                          value={item.qty} 
                          onChange={(e) => dispatch(addToCart({ ...item, qty: Number(e.target.value) }))}
                          className="border border-gray-300 rounded p-1"
                        >
                          {[...Array(item.countInStock || 10).keys()].map((x) => (
                            <option key={x + 1} value={x + 1}>
                              {x + 1}
                            </option>
                          ))}
                        </select>
                        <button 
                          onClick={() => removeFromCartHandler(item.product || item._id)}
                          className="text-red-500 hover:text-red-700 p-2"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-4 mb-4">Order Summary</h2>
              <div className="flex justify-between mb-4">
                <span className="text-gray-600">Items ({cartItems.reduce((acc, item) => acc + item.qty, 0)})</span>
                <span className="font-medium text-gray-900">${cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}</span>
              </div>
              <button 
                onClick={checkoutHandler}
                disabled={cartItems.length === 0}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-bold shadow transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Recommendations Section in Cart */}
      {cartItems.length > 0 && (
        <div className="mt-12">
          <div className="flex items-center space-x-2 mb-6">
            <span className="text-indigo-600 text-xl font-bold">✨ AI Recommended Add-ons</span>
            <span className="text-xs text-gray-500 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-full font-medium">Frequently Bought Together</span>
          </div>

          {loadingRecs ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-64 bg-gray-100 animate-pulse rounded-2xl"></div>
              ))}
            </div>
          ) : recommendations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
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

export default Cart;
