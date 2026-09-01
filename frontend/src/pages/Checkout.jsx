import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart, clearCart } from '../redux/slices/cartSlice';
import RecommendationCard from '../components/RecommendationCard';
import axios from 'axios';
import {
  FaCheckCircle,
  FaCreditCard,
  FaTruck,
  FaMapMarkerAlt,
  FaShieldAlt,
  FaLock,
  FaArrowLeft,
  FaMoneyBillWave,
  FaMobileAlt
} from 'react-icons/fa';

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

  // Checkout Steps state
  const [step, setStep] = useState(1); // 1: Address, 2: Delivery, 3: Payment
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [shippingAddress, setShippingAddress] = useState({
    street: '100 Commerce Way, Suite 4B',
    city: 'San Francisco',
    state: 'CA',
    postalCode: '94107',
    country: 'United States'
  });

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
  const shippingPrice = itemsPrice > 50 || itemsPrice === 0 ? 0 : 9.99;
  const taxPrice = Number((0.08 * itemsPrice).toFixed(2));
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
          shippingAddress,
          paymentMethod
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
        orderId: data.order?._id
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
    <div className="max-w-5xl mx-auto py-6 space-y-8">
      
      {/* Checkout Page Header */}
      <div className="flex items-center justify-between border-b border-[#E5EAF0] pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#172033]">
            Checkout
          </h1>
          <p className="text-xs text-[#667085] font-semibold mt-1">
            Complete your order safely with eKart SSL encryption
          </p>
        </div>
        <Link
          to="/cart"
          className="text-xs font-bold text-[#2878D8] hover:underline flex items-center space-x-1"
        >
          <FaArrowLeft size={11} />
          <span>Back to Cart</span>
        </Link>
      </div>

      {/* Progress Step Indicator */}
      <div className="bg-white border border-[#E5EAF0] rounded-2xl p-4 shadow-xs">
        <div className="grid grid-cols-3 gap-2 text-center text-xs font-bold">
          
          <button
            onClick={() => setStep(1)}
            className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-xl transition-colors ${
              step === 1
                ? 'bg-[#E8F3FF] text-[#2878D8] border border-[#2878D8]/20'
                : 'text-[#667085] hover:bg-[#F4F9FF]'
            }`}
          >
            <FaMapMarkerAlt size={13} />
            <span className="hidden sm:inline">1. Shipping Address</span>
            <span className="sm:hidden">1. Address</span>
          </button>

          <button
            onClick={() => setStep(2)}
            className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-xl transition-colors ${
              step === 2
                ? 'bg-[#E8F3FF] text-[#2878D8] border border-[#2878D8]/20'
                : 'text-[#667085] hover:bg-[#F4F9FF]'
            }`}
          >
            <FaTruck size={13} />
            <span className="hidden sm:inline">2. Delivery Options</span>
            <span className="sm:hidden">2. Delivery</span>
          </button>

          <button
            onClick={() => setStep(3)}
            className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-xl transition-colors ${
              step === 3
                ? 'bg-[#E8F3FF] text-[#2878D8] border border-[#2878D8]/20'
                : 'text-[#667085] hover:bg-[#F4F9FF]'
            }`}
          >
            <FaCreditCard size={13} />
            <span className="hidden sm:inline">3. Payment & Review</span>
            <span className="sm:hidden">3. Payment</span>
          </button>

        </div>
      </div>

      {/* Result Status Banner */}
      {result && (
        <div className={`p-6 rounded-3xl border ${
          result.success
            ? 'bg-green-50 border-green-200 text-green-900'
            : 'bg-red-50 border-red-200 text-red-900'
        }`}>
          <h2 className="text-xl font-bold mb-2 flex items-center space-x-2">
            <FaCheckCircle className={result.success ? 'text-[#16A34A]' : 'text-red-500'} />
            <span>{result.success ? 'Payment Successful!' : 'Payment Failed'}</span>
          </h2>
          <p className="text-xs mb-4">
            {result.success
              ? 'Your order has been recorded. Redirecting to post purchase...'
              : `Failure reason: ${result.reason}`}
          </p>
          <div className="flex gap-3">
            {result.success ? (
              <button
                onClick={() => navigate('/')}
                className="bg-[#16A34A] text-white px-5 py-2.5 rounded-xl text-xs font-bold"
              >
                Continue Shopping
              </button>
            ) : (
              <button
                onClick={() => setResult(null)}
                className="bg-[#E53935] text-white px-5 py-2.5 rounded-xl text-xs font-bold"
              >
                Try Again
              </button>
            )}
          </div>
        </div>
      )}

      {/* Checkout Form & Order Summary */}
      {!result && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Steps Form Area */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Step 1: Address */}
            <div className={`bg-white border rounded-3xl p-6 shadow-xs transition-all ${
              step === 1 ? 'border-[#2878D8] ring-2 ring-[#2878D8]/10' : 'border-[#E5EAF0]'
            }`}>
              <div className="flex items-center justify-between border-b border-[#E5EAF0] pb-4 mb-4">
                <h3 className="text-base font-extrabold text-[#172033] flex items-center space-x-2">
                  <FaMapMarkerAlt className="text-[#2878D8]" />
                  <span>1. Shipping Address</span>
                </h3>
                {step !== 1 && (
                  <button onClick={() => setStep(1)} className="text-xs font-bold text-[#2878D8] hover:underline">
                    Edit
                  </button>
                )}
              </div>

              {step === 1 ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-[#172033] mb-1">Street Address</label>
                      <input
                        type="text"
                        value={shippingAddress.street}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                        className="w-full px-3 py-2.5 bg-[#F4F9FF] border border-[#E5EAF0] rounded-xl text-xs text-[#172033] focus:outline-none focus:border-[#2878D8]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#172033] mb-1">City</label>
                      <input
                        type="text"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                        className="w-full px-3 py-2.5 bg-[#F4F9FF] border border-[#E5EAF0] rounded-xl text-xs text-[#172033] focus:outline-none focus:border-[#2878D8]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#172033] mb-1">State / Province</label>
                      <input
                        type="text"
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                        className="w-full px-3 py-2.5 bg-[#F4F9FF] border border-[#E5EAF0] rounded-xl text-xs text-[#172033] focus:outline-none focus:border-[#2878D8]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#172033] mb-1">Postal Code</label>
                      <input
                        type="text"
                        value={shippingAddress.postalCode}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, postalCode: e.target.value })}
                        className="w-full px-3 py-2.5 bg-[#F4F9FF] border border-[#E5EAF0] rounded-xl text-xs text-[#172033] focus:outline-none focus:border-[#2878D8]"
                      />
                    </div>
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    className="bg-[#2878D8] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#1769C2] transition-colors"
                  >
                    Save & Continue to Delivery &rarr;
                  </button>
                </div>
              ) : (
                <p className="text-xs text-[#667085]">
                  {shippingAddress.street}, {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
                </p>
              )}
            </div>

            {/* Step 2: Delivery */}
            <div className={`bg-white border rounded-3xl p-6 shadow-xs transition-all ${
              step === 2 ? 'border-[#2878D8] ring-2 ring-[#2878D8]/10' : 'border-[#E5EAF0]'
            }`}>
              <div className="flex items-center justify-between border-b border-[#E5EAF0] pb-4 mb-4">
                <h3 className="text-base font-extrabold text-[#172033] flex items-center space-x-2">
                  <FaTruck className="text-[#2878D8]" />
                  <span>2. Delivery Method</span>
                </h3>
                {step !== 2 && (
                  <button onClick={() => setStep(2)} className="text-xs font-bold text-[#2878D8] hover:underline">
                    Edit
                  </button>
                )}
              </div>

              {step === 2 ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-2xl border border-[#2878D8] bg-[#F4F9FF] flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-[#172033]">Standard Express Delivery</h4>
                      <p className="text-[11px] text-[#667085]">Delivered within 2 to 3 business days</p>
                    </div>
                    <span className="text-xs font-extrabold text-[#16A34A]">
                      {shippingPrice === 0 ? 'FREE' : `$${shippingPrice.toFixed(2)}`}
                    </span>
                  </div>
                  <button
                    onClick={() => setStep(3)}
                    className="bg-[#2878D8] text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-[#1769C2] transition-colors"
                  >
                    Continue to Payment &rarr;
                  </button>
                </div>
              ) : (
                <p className="text-xs text-[#667085]">Standard Express Delivery (2-3 Days)</p>
              )}
            </div>

            {/* Step 3: Payment Selection */}
            <div className={`bg-white border rounded-3xl p-6 shadow-xs transition-all ${
              step === 3 ? 'border-[#2878D8] ring-2 ring-[#2878D8]/10' : 'border-[#E5EAF0]'
            }`}>
              <div className="border-b border-[#E5EAF0] pb-4 mb-4">
                <h3 className="text-base font-extrabold text-[#172033] flex items-center space-x-2">
                  <FaCreditCard className="text-[#2878D8]" />
                  <span>3. Payment Method</span>
                </h3>
              </div>

              {step === 3 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    
                    <button
                      onClick={() => setPaymentMethod('card')}
                      className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                        paymentMethod === 'card'
                          ? 'border-[#2878D8] bg-[#E8F3FF] text-[#2878D8] font-bold'
                          : 'border-[#E5EAF0] bg-white text-[#172033] hover:border-[#2878D8]'
                      }`}
                    >
                      <FaCreditCard size={20} className="mb-2" />
                      <span className="text-xs">Credit / Debit Card</span>
                    </button>

                    <button
                      onClick={() => setPaymentMethod('upi')}
                      className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                        paymentMethod === 'upi'
                          ? 'border-[#2878D8] bg-[#E8F3FF] text-[#2878D8] font-bold'
                          : 'border-[#E5EAF0] bg-white text-[#172033] hover:border-[#2878D8]'
                      }`}
                    >
                      <FaMobileAlt size={20} className="mb-2" />
                      <span className="text-xs">UPI / Wallet / Netbanking</span>
                    </button>

                    <button
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-4 rounded-2xl border text-left flex flex-col justify-between transition-all ${
                        paymentMethod === 'cod'
                          ? 'border-[#2878D8] bg-[#E8F3FF] text-[#2878D8] font-bold'
                          : 'border-[#E5EAF0] bg-white text-[#172033] hover:border-[#2878D8]'
                      }`}
                    >
                      <FaMoneyBillWave size={20} className="mb-2" />
                      <span className="text-xs">Cash on Delivery</span>
                    </button>

                  </div>

                  <div className="p-4 bg-[#F4F9FF] border border-[#E5EAF0] rounded-2xl flex items-center space-x-2 text-xs text-[#667085]">
                    <FaLock className="text-[#16A34A]" />
                    <span>Your payment data is protected with 256-bit SSL encryption.</span>
                  </div>
                </div>
              )}
            </div>

            {/* Cart Items Preview List */}
            <div className="bg-white border border-[#E5EAF0] rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-extrabold text-[#172033] border-b border-[#E5EAF0] pb-3">
                Review Order Items ({cartItems.length})
              </h3>
              <ul className="divide-y divide-[#E5EAF0]">
                {cartItems.map((item, idx) => (
                  <li key={idx} className="py-3 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <img
                        src={item.image || 'https://via.placeholder.com/100'}
                        alt={item.name}
                        className="w-12 h-12 object-contain rounded-lg border border-[#E5EAF0] bg-[#F4F9FF] p-1"
                      />
                      <div>
                        <p className="text-xs font-bold text-[#172033] truncate max-w-xs">{item.name}</p>
                        <p className="text-[10px] text-[#667085]">Qty: {item.qty}</p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold text-[#172033]">
                      ${(item.qty * item.price).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Right Order Summary Column */}
          <div className="lg:col-span-4">
            <div className="bg-white border border-[#E5EAF0] rounded-3xl p-6 shadow-xs sticky top-24 space-y-6">
              <h2 className="text-lg font-extrabold text-[#172033] border-b border-[#E5EAF0] pb-4">
                Order Summary
              </h2>

              <ul className="divide-y divide-[#E5EAF0] text-xs">
                <li className="py-2.5 flex justify-between text-[#667085]">
                  <span>Items ({cartItems.reduce((a, c) => a + c.qty, 0)})</span>
                  <span className="font-bold text-[#172033]">${itemsPrice.toFixed(2)}</span>
                </li>
                <li className="py-2.5 flex justify-between text-[#667085]">
                  <span>Shipping</span>
                  <span className="font-bold text-[#16A34A]">
                    {shippingPrice === 0 ? 'FREE' : `$${shippingPrice.toFixed(2)}`}
                  </span>
                </li>
                <li className="py-2.5 flex justify-between text-[#667085]">
                  <span>Estimated Tax</span>
                  <span className="font-bold text-[#172033]">${taxPrice.toFixed(2)}</span>
                </li>
                <li className="py-4 flex justify-between border-t border-[#E5EAF0] items-baseline">
                  <span className="text-sm font-extrabold text-[#172033]">Total Amount</span>
                  <span className="text-2xl font-extrabold text-[#2878D8]">
                    ${totalPrice.toFixed(2)}
                  </span>
                </li>
              </ul>

              <button
                onClick={placeOrderHandler}
                disabled={cartItems.length === 0 || loading}
                className="w-full bg-[#2878D8] hover:bg-[#1769C2] text-white py-3.5 rounded-xl font-extrabold text-xs uppercase tracking-wider shadow-md shadow-[#2878D8]/20 transition-all disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing Order...' : 'Place Order & Pay'}
              </button>

              <div className="text-center text-[10px] text-[#667085] flex items-center justify-center space-x-1">
                <FaShieldAlt className="text-[#16A34A]" />
                <span>30-Day Money-Back Guarantee</span>
              </div>
            </div>
          </div>

        </div>
      )}

      {/* AI Recommendations Section */}
      {cartItems.length > 0 && !result && (
        <div className="pt-8 border-t border-[#E5EAF0] space-y-6">
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-extrabold text-[#172033]">
              Recommended Add-ons Before You Order
            </h2>
            <span className="text-xs text-[#2878D8] bg-[#E8F3FF] px-2.5 py-0.5 rounded-full font-bold">
              Smart AI Suggestions
            </span>
          </div>

          {loadingRecs ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-64 rounded-2xl skeleton border border-[#E5EAF0]"></div>
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
