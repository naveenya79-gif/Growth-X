import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const fetchRecommendations = async () => {
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
    };

    fetchRecommendations();
  }, [productId]);

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
    <div className="max-w-4xl mx-auto py-12 text-center">
      {/* Premium Order Confirmed Banner */}
      <OrderSuccessHeader purchasedProduct={purchasedProduct} />

      {/* Main Recommendation Section */}
      <CompleteRoutine
        recommendations={recommendations}
        loading={loading}
        error={error}
        addedMap={addedMap}
        onAddToCart={handleAddToCart}
      />

      <div className="mt-10">
        <Link
          to="/"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 font-medium text-lg hover:underline transition-all"
        >
          &larr; Return to Home
        </Link>
      </div>
    </div>
  );
};

export default PostPurchase;
