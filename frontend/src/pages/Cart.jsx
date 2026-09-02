import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaTrash, FaShoppingCart, FaArrowLeft, FaShieldAlt, FaTruck, FaHeart } from 'react-icons/fa';
import { addToCart, removeFromCart } from '../redux/slices/cartSlice';
import { toggleWishlist } from '../redux/slices/wishlistSlice';
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

      setLoadingRecs(true);
      try {
        const { data } = await axios.post(`http://localhost:5000/api/products/ai-checkout-recommendations`, {
          cartItems
        });
        
        if (data.success) {
          const cartProductIds = new Set(cartItems.map((c) => c.product || c._id));
          const filtered = (data.recommendations || []).filter((rec) => !cartProductIds.has(rec._id));
          setRecommendations(filtered);
        }
      } catch (err) {
        console.error('Error fetching cart AI recommendations:', err);
      } finally {
        setLoadingRecs(false);
      }
    };

    const timer = setTimeout(() => {
      fetchRecs();
    }, 500);
    return () => clearTimeout(timer);
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

  const handleSaveForLater = (item) => {
    dispatch(toggleWishlist(item));
    dispatch(removeFromCart(item.product || item._id));
  };

  const checkoutHandler = () => {
    navigate('/login?redirect=/checkout');
  };

  const subtotal = cartItems.reduce((acc, item) => acc + item.qty * item.price, 0);
  const estimatedShipping = subtotal > 50 || cartItems.length === 0 ? 0 : 9.99;
  const estimatedTax = subtotal * 0.08;
  const totalPrice = subtotal + estimatedShipping + estimatedTax;

  return (
    <div className="max-w-6xl mx-auto py-6 space-y-8">
      
      {/* Page Heading */}
      <div className="flex items-center justify-between border-b border-[#E5EAF0] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033]">
            Shopping Cart
          </h1>
          <p className="text-xs text-[#667085] font-semibold mt-1">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>
        <Link
          to="/"
          className="text-xs font-bold text-[#2878D8] hover:underline flex items-center space-x-1"
        >
          <FaArrowLeft size={11} />
          <span>Continue Shopping</span>
        </Link>
      </div>

      {cartItems.length === 0 ? (
        /* Empty State */
        <div className="bg-white border border-[#E5EAF0] rounded-3xl p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-16 h-16 bg-[#F4F9FF] rounded-full text-[#2878D8] flex items-center justify-center mx-auto mb-4 text-2xl">
            <FaShoppingCart />
          </div>
          <h3 className="text-lg font-bold text-[#172033] mb-2">Your cart is currently empty</h3>
          <p className="text-xs text-[#667085] mb-6">
            Looks like you haven't added any products to your shopping cart yet.
          </p>
          <Link
            to="/"
            className="inline-flex items-center space-x-2 bg-[#2878D8] hover:bg-[#1769C2] text-white px-6 py-3 rounded-xl text-xs font-bold transition-colors shadow-xs"
          >
            <span>Explore Collections</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Cart Items List */}
          <div className="lg:col-span-8 space-y-4">
            <div className="bg-white border border-[#E5EAF0] rounded-3xl overflow-hidden shadow-xs">
              <ul className="divide-y divide-[#E5EAF0]">
                {cartItems.map((item) => {
                  const itemId = item.product || item._id;
                  const itemPrice = typeof item.price === 'number' ? item.price : parseFloat(item.price || 0);

                  return (
                    <li key={itemId} className="p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-[#F4F9FF]/50 transition-colors">
                      
                      {/* Product Thumbnail */}
                      <Link to={`/product/${itemId}`} className="w-20 h-20 bg-[#F4F9FF] border border-[#E5EAF0] rounded-2xl overflow-hidden flex-shrink-0 flex items-center justify-center p-2">
                        <img
                          src={item.image || 'https://via.placeholder.com/150'}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      </Link>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0 space-y-1">
                        <span className="text-[10px] font-extrabold uppercase text-[#2878D8] bg-[#E8F3FF] px-2 py-0.5 rounded">
                          {item.category || 'eKart'}
                        </span>
                        <Link
                          to={`/product/${itemId}`}
                          className="text-sm font-bold text-[#172033] hover:text-[#2878D8] transition-colors truncate block"
                        >
                          {item.name}
                        </Link>
                        <p className="text-xs text-[#16A34A] font-semibold flex items-center space-x-1">
                          <FaShieldAlt size={11} />
                          <span>In Stock • Ready to ship</span>
                        </p>
                      </div>

                      {/* Quantity Selector & Action Controls */}
                      <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                        
                        {/* Qty Dropdown */}
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-[#667085] font-semibold">Qty:</span>
                          <select
                            value={item.qty}
                            onChange={(e) => dispatch(addToCart({ ...item, qty: Number(e.target.value) }))}
                            className="bg-[#F4F9FF] border border-[#E5EAF0] text-[#172033] font-bold text-xs rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#2878D8]"
                          >
                            {[...Array(item.countInStock || 10).keys()].slice(0, 10).map((x) => (
                              <option key={x + 1} value={x + 1}>
                                {x + 1}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <p className="text-base font-extrabold text-[#172033]">
                            ${(itemPrice * item.qty).toFixed(2)}
                          </p>
                          <p className="text-[10px] text-[#667085]">${itemPrice.toFixed(2)} each</p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleSaveForLater(item)}
                            title="Save for Later (Wishlist)"
                            className="p-2 rounded-xl text-[#667085] hover:text-[#2878D8] hover:bg-[#F4F9FF] transition-colors"
                          >
                            <FaHeart size={14} />
                          </button>
                          <button
                            onClick={() => removeFromCartHandler(itemId)}
                            title="Remove from Cart"
                            className="p-2 rounded-xl text-[#667085] hover:text-[#E53935] hover:bg-red-50 transition-colors"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>

                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Delivery Promise */}
            <div className="bg-[#F4F9FF] border border-[#E5EAF0] p-4 rounded-2xl flex items-center space-x-3 text-xs text-[#667085]">
              <FaTruck className="text-[#2878D8] text-lg flex-shrink-0" />
              <span>
                Orders over <strong className="text-[#172033]">$50.00</strong> qualify for <strong>FREE Express Delivery</strong>.
              </span>
            </div>
          </div>

          {/* Order Summary Card */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-[#E5EAF0] rounded-3xl p-6 shadow-xs sticky top-24 space-y-6">
              <h2 className="text-lg font-extrabold text-[#172033] border-b border-[#E5EAF0] pb-4">
                Order Summary
              </h2>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-[#667085]">
                  <span>Subtotal ({cartItems.reduce((a, c) => a + c.qty, 0)} items)</span>
                  <span className="font-bold text-[#172033]">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[#667085]">
                  <span>Estimated Shipping</span>
                  <span className="font-bold text-[#16A34A]">
                    {estimatedShipping === 0 ? 'FREE' : `$${estimatedShipping.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-[#667085]">
                  <span>Estimated Tax (8%)</span>
                  <span className="font-bold text-[#172033]">${estimatedTax.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-[#E5EAF0] pt-4 flex justify-between items-baseline">
                <span className="text-sm font-extrabold text-[#172033]">Total Amount</span>
                <span className="text-2xl font-extrabold text-[#2878D8]">
                  ${totalPrice.toFixed(2)}
                </span>
              </div>

              <button
                onClick={checkoutHandler}
                disabled={cartItems.length === 0}
                className="w-full bg-[#2878D8] hover:bg-[#1769C2] text-white py-3.5 rounded-xl font-extrabold text-xs uppercase tracking-wider shadow-md shadow-[#2878D8]/20 transition-all"
              >
                Proceed to Checkout
              </button>

              <div className="pt-2 text-center text-[10px] text-[#667085] flex items-center justify-center space-x-1">
                <FaShieldAlt className="text-[#16A34A]" />
                <span>Safe & Secure Encrypted Checkout</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* AI Recommended Add-ons */}
      {cartItems.length > 0 && (
        <div className="pt-8 border-t border-[#E5EAF0] space-y-6">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-extrabold text-[#172033]">
              AI Recommended Add-ons
            </h2>
            <span className="text-xs text-[#2878D8] bg-[#E8F3FF] border border-[#2878D8]/20 px-2.5 py-0.5 rounded-full font-bold">
              Frequently Bought Together
            </span>
          </div>

          {loadingRecs ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((n) => (
                <div key={n} className="h-64 rounded-2xl skeleton border border-[#E5EAF0]"></div>
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
