import React, { useState, useEffect, useCallback } from 'react';
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
  FaMobileAlt,
  FaSpinner,
  FaRupeeSign,
  FaRobot,
  FaTimes,
  FaPlus,
} from 'react-icons/fa';
import { SiRazorpay } from 'react-icons/si';

// ── Utility: load Razorpay checkout script ──────────────────────────────────
const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (document.getElementById('razorpay-sdk')) {
      resolve(true);
      return;
    }
    const script = document.createElement('script');
    script.id = 'razorpay-sdk';
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

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
  const [showAiModal, setShowAiModal] = useState(false);

  // Checkout Steps state
  const [step, setStep] = useState(1); // 1: Address, 2: Delivery, 3: Payment
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [shippingAddress, setShippingAddress] = useState({
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
  });

  useEffect(() => {
    const fetchRecs = async () => {
      if (cartItems.length === 0) return;

      setLoadingRecs(true);
      try {
        // AI Endpoint Integration
        const { data } = await axios.post(`http://localhost:5000/api/products/ai-checkout-recommendations`, {
          cartItems
        });
        
        if (data.success) {
          const cartProductIds = new Set(cartItems.map((c) => c.product || c._id));
          const filtered = (data.recommendations || []).filter((rec) => !cartProductIds.has(rec._id));
          setRecommendations(filtered);
        }
      } catch (err) {
        console.error('Error fetching AI checkout recommendations:', err);
      } finally {
        setLoadingRecs(false);
      }
    };
    
    // Simple debounce so it doesn't spam AI if user quickly modifies cart
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

  if (!userInfo) {
    navigate('/login');
    return null;
  }

  const itemsPrice = cartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
  const shippingPrice = itemsPrice > 50 || itemsPrice === 0 ? 0 : 9.99;
  const taxPrice = Number((0.08 * itemsPrice).toFixed(2));
  const totalPrice = Number((itemsPrice + shippingPrice + taxPrice).toFixed(2));

  // ── Razorpay Payment Handler ─────────────────────────────────────────────
  const handleRazorpayPayment = async (activeCartItems = cartItems) => {
    setLoading(true);
    setResult(null);

    const currentItemsPrice = activeCartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    const currentShippingPrice = currentItemsPrice > 50 || currentItemsPrice === 0 ? 0 : 9.99;
    const currentTaxPrice = Number((0.08 * currentItemsPrice).toFixed(2));
    const currentTotalPrice = Number((currentItemsPrice + currentShippingPrice + currentTaxPrice).toFixed(2));

    // 1. Load Razorpay SDK
    const scriptLoaded = await loadRazorpayScript();
    if (!scriptLoaded) {
      setResult({ success: false, status: 'Error', reason: 'Failed to load Razorpay SDK. Check your internet connection.' });
      setLoading(false);
      return;
    }

    const config = {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${userInfo.token}`,
      },
    };

    try {
      // 2. Create Razorpay order on backend
      const { data: orderData } = await axios.post(
        'http://localhost:5000/api/payment/create-order',
        { amount: currentTotalPrice, currency: 'INR' },
        config
      );

      const primaryProductId = activeCartItems[0]?.product || activeCartItems[0]?._id;

      // Inner helper to dry up verification logic
      const verifyPaymentOnBackend = async (response) => {
        try {
          const { data: verifyData } = await axios.post(
            'http://localhost:5000/api/payment/verify',
            {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              orderItems: activeCartItems,
              totalAmount: currentTotalPrice,
              shippingAddress,
              paymentMethod: 'razorpay',
            },
            config
          );

          if (verifyData.success) {
            dispatch(clearCart());
            if (primaryProductId) {
              navigate(`/post-purchase/${primaryProductId}`);
            } else {
              setResult({ success: true, status: 'Success' });
            }
          } else {
            setResult({ success: false, status: 'Failed', reason: 'Payment verification failed.' });
          }
        } catch (err) {
          setResult({
            success: false,
            status: 'Error',
            reason: err.response?.data?.message || err.message,
          });
        } finally {
          setLoading(false);
        }
      };

      // 3. Open Razorpay checkout popup (real flow) OR bypass for Demo
      if (orderData.orderId && orderData.orderId.startsWith('order_demo_')) {
        // We are in Developer / Demo Mode (no real Razorpay keys)
        // Simulate a successful payment flow so it doesn't crash real Razorpay SDK
        setTimeout(() => {
          verifyPaymentOnBackend({
            razorpay_order_id: orderData.orderId,
            razorpay_payment_id: 'pay_demo_' + Date.now(),
            razorpay_signature: 'demo_signature',
          });
        }, 1500); // Small delay to simulate processing
      } else {
        // Real Razorpay integration
        const options = {
          key: orderData.keyId,
          amount: orderData.amount,
          currency: orderData.currency,
          name: 'Growth-X Store',
          description: `Order for ${cartItems.length} item(s)`,
          order_id: orderData.orderId,
          prefill: {
            name: userInfo.name || '',
            email: userInfo.email || '',
            contact: userInfo.phone || '',
          },
          theme: {
            color: '#2878D8',
          },
          handler: (response) => {
            verifyPaymentOnBackend(response);
          },
          modal: {
            ondismiss: () => {
              setLoading(false);
              setResult({ success: false, status: 'Cancelled', reason: 'Payment was cancelled by you.' });
            },
          },
        };

        const rzpInstance = new window.Razorpay(options);
        rzpInstance.on('payment.failed', (response) => {
          setLoading(false);
          setResult({
            success: false,
            status: 'Failed',
            reason: response.error?.description || 'Payment failed',
          });
        });
        rzpInstance.open();
      }
    } catch (error) {
      setResult({
        success: false,
        status: 'Error',
        reason: error.response?.data?.message || error.message,
      });
      setLoading(false);
    }
  };

  // ── COD Handler ──────────────────────────────────────────────────────────
  const handleCODPayment = async (activeCartItems = cartItems) => {
    setLoading(true);
    setResult(null);

    const currentItemsPrice = activeCartItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    const currentShippingPrice = currentItemsPrice > 50 || currentItemsPrice === 0 ? 0 : 9.99;
    const currentTaxPrice = Number((0.08 * currentItemsPrice).toFixed(2));
    const currentTotalPrice = Number((currentItemsPrice + currentShippingPrice + currentTaxPrice).toFixed(2));

    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userInfo.token}`,
        },
      };
      const primaryProductId = activeCartItems[0]?.product || activeCartItems[0]?._id;
      const { data } = await axios.post(
        'http://localhost:5000/api/orders',
        {
          orderItems: activeCartItems,
          totalAmount: currentTotalPrice,
          shippingAddress,
          paymentMethod: 'cod',
        },
        config
      );

      if (data.paymentStatus === 'Success' || data.order) {
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
        orderId: data.order?._id,
      });
    } catch (error) {
      setResult({
        success: false,
        status: 'Error',
        reason: error.response?.data?.message || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const executeFinalOrder = (currentCartItems = cartItems) => {
    if (paymentMethod === 'cod') {
      handleCODPayment(currentCartItems);
    } else {
      handleRazorpayPayment(currentCartItems);
    }
  };

  const placeOrderHandler = () => {
    // If AI recommendations exist and user hasn't added them yet, present the quick AI add-on modal
    const unaddedRecs = recommendations.filter(
      (rec) => !cartItems.some((c) => (c.product || c._id) === rec._id)
    );

    if (unaddedRecs.length > 0) {
      setShowAiModal(true);
    } else {
      executeFinalOrder();
    }
  };

  const handleAddAiProductAndOrder = (recItem) => {
    setShowAiModal(false);
    // Add to cart directly
    const stockLimit = recItem.countInStock !== undefined ? recItem.countInStock : 10;
    const newItem = {
      ...recItem,
      product: recItem._id,
      qty: 1,
      countInStock: stockLimit,
    };
    dispatch(addToCart(newItem));

    // Calculate updated cart and execute order immediately with the added product
    const updatedCart = [...cartItems, newItem];
    executeFinalOrder(updatedCart);
  };

  const handleSkipAndOrder = () => {
    setShowAiModal(false);
    executeFinalOrder();
  };

  return (
    <div className="max-w-5xl mx-auto py-6 space-y-8 animate-fade-in">

      {/* Premium Checkout Page Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] p-8 sm:p-10 shadow-2xl border border-white/10">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 rounded-full bg-[#2878D8]/20 blur-3xl mix-blend-screen pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl mix-blend-screen pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Secure Checkout
            </h1>
            <p className="text-sm text-slate-300 font-medium mt-2 flex items-center space-x-2">
              <FaShieldAlt className="text-emerald-400" />
              <span>Protected by 256-bit SSL encryption &amp; Razorpay</span>
            </p>
          </div>
          <Link
            to="/cart"
            className="text-xs font-bold text-white/80 hover:text-white bg-white/10 hover:bg-white/20 backdrop-blur-md px-4 py-2 rounded-xl flex items-center space-x-2 transition-all border border-white/10"
          >
            <FaArrowLeft size={11} />
            <span>Back to Cart</span>
          </Link>
        </div>
      </div>

      {/* Progress Step Indicator */}
      <div className="bg-white border border-[#E5EAF0] rounded-2xl p-3 shadow-md shadow-slate-200/50">
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
            <span className="hidden sm:inline">3. Payment &amp; Review</span>
            <span className="sm:hidden">3. Payment</span>
          </button>

        </div>
      </div>

      {/* Result Status Banner */}
      {result && (
        <div className={`p-8 rounded-3xl border shadow-2xl ${
          result.success
            ? 'bg-gradient-to-br from-green-50 to-emerald-100 border-emerald-200 text-emerald-900 shadow-emerald-900/10'
            : 'bg-gradient-to-br from-red-50 to-rose-100 border-rose-200 text-rose-900 shadow-rose-900/10'
        }`}>
          <div className="flex items-center space-x-4 mb-3">
            <FaCheckCircle className={`text-4xl ${result.success ? 'text-emerald-500' : 'text-rose-500'}`} />
            <h2 className="text-2xl font-extrabold">
              {result.success ? 'Payment Successful!' : `Payment ${result.status}`}
            </h2>
          </div>
          <p className="text-sm font-medium mb-6 ml-14">
            {result.success
              ? 'Your order has been recorded. Redirecting to post purchase...'
              : `Reason: ${result.reason}`}
          </p>
          <div className="flex gap-4 ml-14">
            {result.success ? (
              <button
                onClick={() => navigate('/')}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all"
              >
                Continue Shopping
              </button>
            ) : (
              <button
                onClick={() => setResult(null)}
                className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-lg shadow-rose-500/20 transition-all"
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
                        placeholder="e.g. 12 MG Road, Koramangala"
                        value={shippingAddress.street}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, street: e.target.value })}
                        className="w-full px-3 py-2.5 bg-[#F4F9FF] border border-[#E5EAF0] rounded-xl text-xs text-[#172033] focus:outline-none focus:border-[#2878D8]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#172033] mb-1">City</label>
                      <input
                        type="text"
                        placeholder="e.g. Bengaluru"
                        value={shippingAddress.city}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, city: e.target.value })}
                        className="w-full px-3 py-2.5 bg-[#F4F9FF] border border-[#E5EAF0] rounded-xl text-xs text-[#172033] focus:outline-none focus:border-[#2878D8]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#172033] mb-1">State</label>
                      <input
                        type="text"
                        placeholder="e.g. Karnataka"
                        value={shippingAddress.state}
                        onChange={(e) => setShippingAddress({ ...shippingAddress, state: e.target.value })}
                        className="w-full px-3 py-2.5 bg-[#F4F9FF] border border-[#E5EAF0] rounded-xl text-xs text-[#172033] focus:outline-none focus:border-[#2878D8]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#172033] mb-1">PIN Code</label>
                      <input
                        type="text"
                        placeholder="e.g. 560034"
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
                    Save &amp; Continue to Delivery &rarr;
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
                      {shippingPrice === 0 ? 'FREE' : `₹${shippingPrice.toFixed(2)}`}
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                    {/* Razorpay Option */}
                    <button
                      onClick={() => setPaymentMethod('razorpay')}
                      className={`p-4 rounded-2xl border text-left flex flex-col gap-3 transition-all relative overflow-hidden ${
                        paymentMethod === 'razorpay'
                          ? 'border-[#3395FF] bg-gradient-to-br from-[#F4F9FF] to-white ring-4 ring-[#3395FF]/20 shadow-lg shadow-[#3395FF]/10'
                          : 'border-[#E5EAF0] bg-white hover:border-[#3395FF]/50 hover:shadow-md'
                      }`}
                    >
                      {paymentMethod === 'razorpay' && (
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#3395FF]/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                      )}
                      <div className="flex items-center gap-3">
                        <div className="bg-[#02042B] text-white p-2.5 rounded-xl shadow-md">
                          <SiRazorpay size={24} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[15px] font-extrabold text-[#072654]">Razorpay </span>
                          <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider">Recommended</span>
                        </div>
                        {paymentMethod === 'razorpay' && (
                          <div className="ml-auto bg-[#3395FF] text-white px-3 py-1 rounded-full text-[10px] font-extrabold shadow-sm flex items-center space-x-1">
                            <FaCheckCircle size={10} />
                            <span>Selected</span>
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] text-[#667085] font-medium leading-relaxed">
                        Pay securely via UPI, Credit/Debit Cards, Net Banking, EMI &amp; Wallets.
                      </span>
                    </button>

                    {/* COD Option */}
                    <button
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-4 rounded-2xl border text-left flex flex-col gap-3 transition-all relative overflow-hidden ${
                        paymentMethod === 'cod'
                          ? 'border-[#16A34A] bg-gradient-to-br from-[#F0FDF4] to-white ring-4 ring-[#16A34A]/20 shadow-lg shadow-[#16A34A]/10'
                          : 'border-[#E5EAF0] bg-white hover:border-[#16A34A]/50 hover:shadow-md'
                      }`}
                    >
                      {paymentMethod === 'cod' && (
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[#16A34A]/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>
                      )}
                      <div className="flex items-center gap-3">
                        <div className={`${paymentMethod === 'cod' ? 'bg-[#16A34A]' : 'bg-[#E5EAF0]'} text-white p-2.5 rounded-xl shadow-md transition-colors`}>
                          <FaMoneyBillWave size={24} className={paymentMethod === 'cod' ? 'text-white' : 'text-[#667085]'} />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[15px] font-extrabold text-[#172033]">Cash on Delivery</span>
                          <span className="text-[10px] font-bold text-[#667085] uppercase tracking-wider">Pay at Doorstep</span>
                        </div>
                        {paymentMethod === 'cod' && (
                          <div className="ml-auto bg-[#16A34A] text-white px-3 py-1 rounded-full text-[10px] font-extrabold shadow-sm flex items-center space-x-1">
                            <FaCheckCircle size={10} />
                            <span>Selected</span>
                          </div>
                        )}
                      </div>
                      <span className="text-[11px] text-[#667085] font-medium leading-relaxed">
                        Pay in cash or UPI when your order arrives at your designated delivery address.
                      </span>
                    </button>

                  </div>

                  {/* Razorpay Badge */}
                  {paymentMethod === 'razorpay' && (
                    <div className="p-4 bg-[#F4F9FF] border border-[#E5EAF0] rounded-2xl space-y-2">
                      <div className="flex items-center space-x-2 text-xs text-[#667085]">
                        <FaLock className="text-[#16A34A]" />
                        <span>Secured by Razorpay — OTP sent to your registered mobile number</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {['UPI', 'Visa', 'Mastercard', 'Netbanking', 'Wallets', 'EMI'].map((m) => (
                          <span key={m} className="text-[10px] bg-white border border-[#E5EAF0] px-2 py-0.5 rounded-full text-[#172033] font-semibold">
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="p-3 bg-[#F4F9FF] border border-[#E5EAF0] rounded-2xl flex items-center space-x-2 text-xs text-[#667085]">
                    <FaShieldAlt className="text-[#16A34A]" />
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
                      ₹{(item.qty * item.price).toFixed(2)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Right Order Summary Column */}
          <div className="lg:col-span-4">
            <div className="bg-white/80 backdrop-blur-xl border border-slate-200/60 rounded-3xl p-6 shadow-2xl shadow-[#2878D8]/5 sticky top-24 space-y-6">
              <h2 className="text-lg font-extrabold text-[#172033] border-b border-[#E5EAF0] pb-4">
                Order Summary
              </h2>

              <ul className="divide-y divide-[#E5EAF0] text-sm">
                <li className="py-3 flex justify-between text-[#667085]">
                  <span>Items ({cartItems.reduce((a, c) => a + c.qty, 0)})</span>
                  <span className="font-bold text-[#172033]">₹{itemsPrice.toFixed(2)}</span>
                </li>
                <li className="py-3 flex justify-between text-[#667085]">
                  <span>Shipping</span>
                  <span className="font-bold text-emerald-500">
                    {shippingPrice === 0 ? 'FREE' : `₹${shippingPrice.toFixed(2)}`}
                  </span>
                </li>
                <li className="py-3 flex justify-between text-[#667085]">
                  <span>Tax (GST 8%)</span>
                  <span className="font-bold text-[#172033]">₹{taxPrice.toFixed(2)}</span>
                </li>
                <li className="py-5 flex justify-between border-t border-[#E5EAF0] items-baseline bg-slate-50/50 -mx-6 px-6 mt-2">
                  <span className="text-sm font-extrabold text-[#172033]">Total Amount</span>
                  <span className="text-3xl font-black text-[#2878D8] flex items-center">
                    <FaRupeeSign size={18} />
                    {totalPrice.toFixed(2)}
                  </span>
                </li>
              </ul>

              <button
                id="place-order-btn"
                onClick={placeOrderHandler}
                disabled={cartItems.length === 0 || loading}
                className={`w-full py-4 rounded-2xl font-extrabold text-sm uppercase tracking-wider shadow-xl transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 ${
                  paymentMethod === 'razorpay'
                    ? 'bg-gradient-to-r from-[#02042B] via-[#0F377A] to-[#3395FF] hover:from-[#0F377A] hover:to-[#02042B] text-white shadow-[#3395FF]/30 border border-[#3395FF]/20'
                    : 'bg-gradient-to-r from-[#2878D8] to-[#1769C2] hover:from-[#1769C2] hover:to-[#0F539B] text-white shadow-[#2878D8]/30'
                }`}
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin text-lg" />
                    <span>Processing...</span>
                  </>
                ) : paymentMethod === 'razorpay' ? (
                  <>
                    <SiRazorpay className="text-xl" />
                    <span className="tracking-widest">Pay securely</span>
                  </>
                ) : (
                  <>
                    <FaMoneyBillWave className="text-xl" />
                    <span>Place Order (COD)</span>
                  </>
                )}
              </button>

              <div className="text-center text-xs text-[#667085] flex items-center justify-center space-x-2 font-medium bg-emerald-50 text-emerald-700 py-3 rounded-xl">
                <FaShieldAlt />
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

      {/* AI Pre-Order Recommendation Intercept Modal */}
      {showAiModal && recommendations.length > 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-[#E5EAF0] relative overflow-hidden space-y-6 transform transition-all scale-100">
            
            {/* Header Badge & Title */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="inline-flex items-center space-x-2 bg-[#E8F3FF] text-[#2878D8] px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider">
                  <FaRobot className="text-sm" />
                  <span>AI Agent Suggestion</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-[#172033] tracking-tight">
                  Complete Your Order with an Add-on?
                </h3>
                <p className="text-xs text-[#667085]">
                  Our AI selected these perfectly matched items for what's in your cart. Add one directly or skip to purchase as-is.
                </p>
              </div>
              <button
                onClick={handleSkipAndOrder}
                className="text-[#667085] hover:text-[#172033] p-2 rounded-full hover:bg-slate-100 transition-colors"
                title="Skip and continue"
              >
                <FaTimes size={18} />
              </button>
            </div>

            {/* Recommended Products Quick Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-72 overflow-y-auto pr-1">
              {recommendations.slice(0, 2).map((rec) => {
                const price = typeof rec.price === 'number' ? rec.price : parseFloat(rec.price || 0);
                return (
                  <div
                    key={rec._id}
                    className="p-3.5 rounded-2xl border border-[#E5EAF0] hover:border-[#2878D8] bg-[#F8FAFC] flex flex-col justify-between space-y-3 transition-all"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-16 h-16 rounded-xl bg-white p-1.5 border border-[#E5EAF0] flex-shrink-0 flex items-center justify-center overflow-hidden">
                        <img
                          src={rec.image}
                          alt={rec.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://via.placeholder.com/100?text=Product';
                          }}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[9px] font-extrabold text-[#2878D8] uppercase tracking-wider block">
                          {rec.category}
                        </span>
                        <h4 className="text-xs font-bold text-[#172033] truncate" title={rec.name}>
                          {rec.name}
                        </h4>
                        <span className="text-sm font-black text-[#172033] mt-0.5 block">
                          ₹{price.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => handleAddAiProductAndOrder(rec)}
                      className="w-full bg-[#2878D8] hover:bg-[#1769C2] text-white py-2 px-3 rounded-xl text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-1.5"
                    >
                      <FaPlus size={11} />
                      <span>Add &amp; Place Order</span>
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Modal Bottom Actions */}
            <div className="pt-2 border-t border-[#E5EAF0] flex flex-col sm:flex-row items-center justify-between gap-3">
              <span className="text-[11px] text-[#667085] text-center sm:text-left">
                No thanks? You can proceed with your existing items.
              </span>
              <button
                onClick={handleSkipAndOrder}
                className="w-full sm:w-auto bg-slate-100 hover:bg-slate-200 text-[#172033] px-6 py-2.5 rounded-xl text-xs font-extrabold transition-all"
              >
                Skip &amp; Continue Purchase &rarr;
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Checkout;
