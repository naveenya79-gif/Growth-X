import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../redux/slices/cartSlice';
import { FaRobot, FaTimes, FaPaperPlane, FaShoppingBag, FaArrowRight, FaStar } from 'react-icons/fa';
import axios from 'axios';

const Chatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: 'Hello! I am your AI Shopping Assistant. Ask me anything like "Show me shoes", "Mobile accessories under $50", or "Skincare products"!',
      products: []
    }
  ]);
  const [loading, setLoading] = useState(false);
  const [catalog, setCatalog] = useState([]);

  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { cartItems } = useSelector((state) => state.cart);

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/products');
        setCatalog(data || []);
      } catch (err) {
        console.error('Error fetching catalog for chatbot:', err);
      }
    };
    fetchCatalog();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e?.preventDefault();
    if (!input.trim()) return;

    const userText = input.trim();
    const newMessages = [...messages, { sender: 'user', text: userText }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    setTimeout(() => {
      const queryLower = userText.toLowerCase();
      const isBuyIntent = queryLower.includes('buy') || queryLower.includes('purchase') || queryLower.includes('want') || queryLower.includes('order') || queryLower.includes('shoe') || queryLower.includes('mobile') || queryLower.includes('cloth') || queryLower.includes('cosmetic');

      // Extract price constraint if user mentioned "under X" or "$X"
      let maxPrice = Infinity;
      const priceMatch = queryLower.match(/under\s*\$?(\d+)/) || queryLower.match(/\$?(\d+)\s*dollars/);
      if (priceMatch && priceMatch[1]) {
        maxPrice = parseFloat(priceMatch[1]);
      }

      // Filter matching products
      let matches = catalog.filter((product) => {
        const name = (product.name || '').toLowerCase();
        const category = (product.category || '').toLowerCase();
        const desc = (product.description || '').toLowerCase();
        const tags = (product.tags || []).map((t) => t.toLowerCase());

        const matchesQuery =
          name.includes(queryLower) ||
          category.includes(queryLower) ||
          desc.includes(queryLower) ||
          tags.some((t) => t.includes(queryLower)) ||
          // Keyword rules
          (queryLower.includes('shoe') && (category.includes('shoe') || name.includes('shoe') || name.includes('sneaker'))) ||
          (queryLower.includes('phone') && (category.includes('mobile') || name.includes('iphone') || name.includes('galaxy'))) ||
          (queryLower.includes('mobile') && (category.includes('mobile') || name.includes('iphone') || name.includes('galaxy'))) ||
          (queryLower.includes('cloth') && (category.includes('cloth') || name.includes('jacket') || name.includes('shirt'))) ||
          (queryLower.includes('jacket') && name.includes('jacket')) ||
          (queryLower.includes('cosmetic') && (category.includes('cosmetic') || category.includes('skincare'))) ||
          (queryLower.includes('cream') || queryLower.includes('serum') || queryLower.includes('skincare'));

        const matchesPrice = (product.price || 0) <= maxPrice;

        return matchesQuery && matchesPrice;
      });

      // If no strict match, fallback to top catalog products
      if (matches.length === 0) {
        matches = catalog.slice(0, 3);
      } else {
        matches = matches.slice(0, 4);
      }

      const topMatch = matches[0];
      let responseText = `Here are the best matching items for "${userText}":`;

      if (topMatch && isBuyIntent) {
        responseText = `🚀 Redirecting you to buy ${topMatch.name}...`;
        
        // Auto-redirect to top match product details after 1 second
        setTimeout(() => {
          if (topMatch._id) {
            navigate(`/product/${topMatch._id}`);
            setIsOpen(false);
          }
        }, 1200);
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: responseText,
          products: matches
        }
      ]);
      setLoading(false);
    }, 500);
  };

  const handleAddToCart = (product) => {
    const existItem = cartItems.find((x) => (x.product || x._id) === product._id);
    const currentQty = existItem ? existItem.qty : 0;
    const stockLimit = product.countInStock !== undefined ? product.countInStock : 10;
    const newQty = Math.min(currentQty + 1, stockLimit);

    dispatch(
      addToCart({
        ...product,
        product: product._id,
        qty: newQty,
        countInStock: stockLimit,
      })
    );
    navigate('/cart');
    setIsOpen(false);
  };

  const handleViewProduct = (productId) => {
    navigate(`/product/${productId}`);
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Toggle Floating Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-full shadow-2xl hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 border-2 border-white"
          title="Open AI Shopping Assistant"
        >
          <FaRobot className="text-2xl animate-bounce" />
          <span className="font-bold text-sm hidden sm:inline pr-1">AI Assistant</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-96 max-w-[92vw] h-[520px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white p-4 flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 p-2 rounded-xl">
                <FaRobot className="text-xl" />
              </div>
              <div>
                <h3 className="font-bold text-sm flex items-center space-x-1">
                  <span>Growth-X AI Assistant</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                </h3>
                <p className="text-[11px] text-indigo-200">Conversational In-App Checkout</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-indigo-200 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <FaTimes size={18} />
            </button>
          </div>

          {/* Messages Log */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50/50">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-medium leading-relaxed shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 border border-gray-100 rounded-bl-none'
                  }`}
                >
                  {msg.text}
                </div>

                {/* Render Product Cards inside AI Message */}
                {msg.products && msg.products.length > 0 && (
                  <div className="mt-3 w-full space-y-2">
                    {msg.products.map((prod) => (
                      <div
                        key={prod._id}
                        className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-sm hover:border-indigo-300 transition-all flex items-center justify-between space-x-3"
                      >
                        <img
                          src={prod.image || 'https://via.placeholder.com/60'}
                          alt={prod.name}
                          className="w-12 h-12 rounded-lg object-cover bg-gray-100 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-gray-900 truncate">{prod.name}</h4>
                          <p className="text-xs text-indigo-600 font-extrabold mt-0.5">
                            ${typeof prod.price === 'number' ? prod.price.toFixed(2) : prod.price}
                          </p>
                        </div>
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={() => handleViewProduct(prod._id)}
                            className="p-2 text-gray-600 hover:text-indigo-600 bg-gray-100 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="View Product Details"
                          >
                            <FaArrowRight className="text-xs" />
                          </button>
                          <button
                            onClick={() => handleAddToCart(prod)}
                            className="p-2 text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-sm"
                            title="Add to Cart & Checkout"
                          >
                            <FaShoppingBag className="text-xs" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center space-x-2 text-gray-400 text-xs italic bg-white p-3 rounded-2xl w-fit shadow-sm border border-gray-100">
                <div className="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-indigo-600"></div>
                <span>AI is searching product catalog...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-2 bg-white border-t border-gray-100 flex gap-1.5 overflow-x-auto text-[11px] font-semibold text-gray-600 no-scrollbar">
            <button
              onClick={() => { setInput('Buy shoes'); }}
              className="bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors"
            >
              👟 Buy Shoes
            </button>
            <button
              onClick={() => { setInput('Buy mobile phone'); }}
              className="bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors"
            >
              📱 Buy Mobiles
            </button>
            <button
              onClick={() => { setInput('Buy denim jacket clothes'); }}
              className="bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors"
            >
              🧥 Buy Clothes
            </button>
            <button
              onClick={() => { setInput('Buy cosmetics skincare'); }}
              className="bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 px-2.5 py-1 rounded-full whitespace-nowrap transition-colors"
            >
              💄 Buy Cosmetics
            </button>
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-100 flex items-center space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AI for products or price..."
              className="flex-1 bg-gray-100 border-0 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 text-gray-800"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white p-2.5 rounded-xl transition-colors shadow-sm"
            >
              <FaPaperPlane className="text-xs" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
