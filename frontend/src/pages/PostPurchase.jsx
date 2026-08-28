import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import axios from 'axios';
import OrderSuccessHeader from '../components/OrderSuccessHeader';
import CompleteRoutine from '../components/CompleteRoutine';

const PostPurchase = () => {
  const { productId } = useParams();
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.cart);

  const [purchasedProduct, setPurchasedProduct] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addedMap, setAddedMap] = useState({});

  const fetchRecommendations = useCallback(async () => {
    if (!productId) return;
    setLoading(true);
    setError('');
    try {
      const { data } = await axios.get(`http://localhost:5000/api/products/${productId}/recommendations`);
      if (data.success) {
        setPurchasedProduct(data.purchasedProduct);
        setRecommendations(data.recommendations || []);
      } else {
        setError(data.message || 'Unable to load recommendations.');
      }
    } catch (err) {
      setError(
        err.response?.data?.message || 'Invalid product ID or error fetching recommendations.'
      );
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    fetchRecommendations();
  }, [fetchRecommendations]);

  const handleAddToCart = (item) => {
    const existItem = cartItems.find((x) => x.product === item._id);
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

  return (
    <div className="max-w-5xl mx-auto py-8 sm:py-12 px-4 sm:px-6 lg:px-8 text-center">
      {/* Premium Order Confirmed Banner */}
      <OrderSuccessHeader purchasedProduct={purchasedProduct} />

      {/* Main Recommendation Section */}
      <CompleteRoutine
        recommendations={recommendations}
        loading={loading}
        error={error}
        addedMap={addedMap}
        onAddToCart={handleAddToCart}
        onRetry={fetchRecommendations}
      />

      <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row justify-center items-center gap-4">
        <Link
          to="/"
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 text-indigo-600 hover:text-indigo-800 font-bold text-sm sm:text-base transition-all py-3 px-6 rounded-xl border border-indigo-100 hover:border-indigo-200 bg-white shadow-sm"
        >
          <span>&larr; Return to Home</span>
        </Link>
        <Link
          to="/cart"
          className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 text-gray-700 hover:text-gray-900 font-bold text-sm sm:text-base transition-all py-3 px-6 rounded-xl border border-gray-200 hover:border-gray-300 bg-gray-50 shadow-sm"
        >
          <span>View Shopping Cart</span>
        </Link>
      </div>
    </div>
  );
};

export default PostPurchase;
