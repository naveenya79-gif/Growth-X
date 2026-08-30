import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import RecommendationCard from '../components/RecommendationCard';
import axios from 'axios';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  const [product, setProduct] = useState({});
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecs, setLoadingRecs] = useState(false);
  const [addedMap, setAddedMap] = useState({});

  useEffect(() => {
    const fetchProductAndRecs = async () => {
      setLoading(true);
      try {
        const { data } = await axios.get(`http://localhost:5000/api/products/${id}`);
        setProduct(data);

        // Fetch recommendations for this product
        if (data && data._id) {
          setLoadingRecs(true);
          try {
            const recRes = await axios.get(`http://localhost:5000/api/products/${data._id}/recommendations`);
            if (recRes.data.success) {
              setRecommendations(recRes.data.recommendations || []);
            }
          } catch (recErr) {
            console.error('Error loading recommendations:', recErr);
          } finally {
            setLoadingRecs(false);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductAndRecs();
  }, [id]);

  const addToCartHandler = () => {
    dispatch(addToCart({ ...product, product: product._id, qty: Number(qty) }));
    navigate('/cart');
  };

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

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  if (!product._id) {
    return <div className="text-center mt-10">Product not found. <Link to="/" className="text-indigo-600">Go Back</Link></div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <Link to="/" className="text-indigo-600 hover:underline mb-6 inline-block font-medium">&larr; Back to Results</Link>
      
      <div className="bg-white rounded-xl shadow-lg overflow-hidden flex flex-col md:flex-row mb-12">
        <div className="md:w-1/2 p-8 flex justify-center bg-gray-50">
          <img src={product.image || 'https://via.placeholder.com/600x600?text=Product'} alt={product.name} className="max-w-full h-auto object-contain rounded-lg shadow-sm" />
        </div>
        <div className="md:w-1/2 p-8 flex flex-col justify-between">
          <div>
            <span className="text-sm text-indigo-500 font-semibold tracking-wider uppercase">{product.category}</span>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mt-2 mb-4">{product.name}</h1>
            <p className="text-gray-600 text-base sm:text-lg mb-6 leading-relaxed">{product.description}</p>
          </div>
          
          <div className="bg-gray-50 p-6 rounded-xl border border-gray-100">
            <div className="flex justify-between items-center mb-6">
              <span className="text-3xl font-extrabold text-gray-900">${product.price.toFixed(2)}</span>
              <span className={`px-4 py-2 rounded-full text-sm font-medium ${product.countInStock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                {product.countInStock > 0 ? `${product.countInStock} In Stock` : 'Out of Stock'}
              </span>
            </div>

            {product.countInStock > 0 && (
              <div className="flex items-center mb-6">
                <span className="mr-4 text-gray-700 font-medium">Quantity:</span>
                <select 
                  value={qty} 
                  onChange={(e) => setQty(e.target.value)}
                  className="form-select block w-24 px-3 py-2 text-base font-normal text-gray-700 bg-white bg-clip-padding bg-no-repeat border border-solid border-gray-300 rounded transition ease-in-out m-0 focus:text-gray-700 focus:bg-white focus:border-indigo-600 focus:outline-none"
                >
                  {[...Array(product.countInStock).keys()].map((x) => (
                    <option key={x + 1} value={x + 1}>
                      {x + 1}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button 
              onClick={addToCartHandler}
              disabled={product.countInStock === 0}
              className={`w-full py-4 px-6 rounded-lg shadow-md font-bold text-lg transition-all duration-300 ${
                product.countInStock === 0 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:shadow-lg'
              }`}
            >
              Add to Cart
            </button>
          </div>
        </div>
      </div>

      {/* AI Recommendations Section on Product Details Page */}
      <div className="mt-12">
        <div className="flex items-center space-x-2 mb-6">
          <span className="text-indigo-600 text-xl font-bold">✨ Frequently Bought Together / Related Add-ons</span>
          <span className="text-xs text-gray-500 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-full font-medium">AI Suggestions</span>
        </div>

        {loadingRecs ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((n) => (
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
        ) : (
          <p className="text-gray-500 text-sm">No additional recommendations found.</p>
        )}
      </div>
    </div>
  );
};

export default ProductDetails;
