import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import axios from 'axios';
import OrderSuccessHeader from '../components/OrderSuccessHeader';

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

      {/* Recommendation Section */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mt-8">
        {loading && (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
            <h2 className="text-2xl font-bold text-gray-800">
              Finding products that complement your purchase...
            </h2>
          </div>
        )}

        {error && !loading && (
          <div className="py-8 text-red-600 font-medium">
            <p className="text-lg mb-2">Unable to load recommendations</p>
            <p className="text-sm bg-red-50 py-2 px-4 rounded inline-block border border-red-200">{error}</p>
          </div>
        )}

        {!loading && !error && (
          <div>
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Recommended for You
            </h2>

            {recommendations.length === 0 ? (
              <p className="text-gray-500 py-6 text-lg">
                We couldn't find additional recommendations right now.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
                {recommendations.map((item) => {
                  const isOutOfStock = item.countInStock === 0;
                  const isAdded = addedMap[item._id];

                  return (
                    <div
                      key={item._id}
                      className="border border-gray-200 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow p-4 bg-white flex flex-col justify-between"
                    >
                      <div>
                        <img
                          src={item.image || 'https://via.placeholder.com/300x200?text=Product'}
                          alt={item.name}
                          className="w-full h-40 object-cover rounded mb-3"
                        />
                        <h3 className="font-semibold text-gray-900 truncate mb-1" title={item.name}>
                          {item.name}
                        </h3>
                        <p className="text-xs text-gray-500 mb-2">
                          Brand: <span className="font-medium text-gray-700">{item.brand || 'N/A'}</span>
                        </p>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mt-3 text-sm">
                          <span className="font-bold text-indigo-600 text-lg">
                            ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                          </span>
                          <span className="text-yellow-500 font-semibold text-sm">
                            ★ {item.rating || 0}
                          </span>
                        </div>

                        <button
                          onClick={() => handleAddToCart(item)}
                          disabled={isOutOfStock}
                          className={`w-full font-medium py-2 px-4 rounded text-sm transition-all mt-3 shadow-sm ${
                            isOutOfStock
                              ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                              : isAdded
                              ? 'bg-green-600 text-white'
                              : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                          }`}
                        >
                          {isOutOfStock ? 'Out of Stock' : isAdded ? '✓ Added to Cart' : 'Add to Cart'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

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
