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

  const handleSend = async (e) => {
    e?.preventDefault();
    if (!input.trim() || loading) return;

    const userText = input.trim();
    const newMessages = [...messages, { sender: 'user', text: userText }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      // Call Backend Gemini 3.8 Flash AI endpoint
      const { data } = await axios.post('http://localhost:5000/api/products/ai-chat', {
        query: userText,
      });

      const responseText = data.message || `Here are the matching items for "${userText}":`;
      const matches = data.products || [];

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: responseText,
          products: matches,
        },
      ]);
    } catch (err) {
      console.error('Chatbot API error, falling back to catalog search:', err);

      // Graceful client-side fallback
      const queryLower = userText.toLowerCase();
      let maxPrice = Infinity;
      const priceMatch = queryLower.match(/under\s*(?:rs\.?|inr|₹|\$)?\s*(\d+)/i) || queryLower.match(/below\s*(?:rs\.?|inr|₹|\$)?\s*(\d+)/i);
      if (priceMatch && priceMatch[1]) {
        maxPrice = parseFloat(priceMatch[1]);
      }

      let matches = catalog.filter((product) => {
        const name = (product.name || '').toLowerCase();
        const category = (product.category || '').toLowerCase();
        const desc = (product.description || '').toLowerCase();
        const price = Number(product.price || 0);

        let matchesCat = true;
        if (queryLower.includes('shoe') || queryLower.includes('sneaker')) matchesCat = category.includes('shoe') || name.includes('shoe') || name.includes('sneaker');
        else if (queryLower.includes('perfume')) matchesCat = category.includes('perfume') || name.includes('parfum');
        else if (queryLower.includes('cosmetic') || queryLower.includes('lipstick')) matchesCat = category.includes('cosmetic');
        else if (queryLower.includes('chocolate')) matchesCat = category.includes('chocolate');
        else if (queryLower.includes('cloth') || queryLower.includes('shirt') || queryLower.includes('jacket')) matchesCat = category.includes('cloth');
        else if (queryLower.includes('watch')) matchesCat = category.includes('watch');
        else if (queryLower.includes('electronic')) matchesCat = category.includes('electronic');

        return matchesCat && price <= maxPrice;
      });

      if (matches.length === 0) {
        matches = catalog.slice(0, 3);
      } else {
        matches = matches.slice(0, 4);
      }

      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: matches.length > 0 ? `Here are the best matching items for "${userText}":` : `Sorry, I couldn't find products matching "${userText}".`,
          products: matches,
        },
      ]);
    } finally {
      setLoading(false);
    }
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
          className="bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-700 hover:to-indigo-700 text-white p-4 sm:px-5 sm:py-3.5 rounded-full shadow-2xl shadow-blue-500/30 hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2.5 border-2 border-white/80 cursor-pointer group"
          title="Open Gemini 3.8 Flash AI Assistant"
        >
          <div className="relative">
            <FaRobot className="text-xl sm:text-2xl group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-indigo-700 animate-ping"></span>
          </div>
          <div className="flex flex-col text-left leading-none hidden sm:flex">
            <span className="font-extrabold text-xs tracking-wider uppercase">AI Assistant</span>
            <span className="text-[9px] text-cyan-200 font-bold">Gemini 3.8 Flash</span>
          </div>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-96 max-w-[92vw] h-[540px] bg-white rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-4.5 flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 flex items-center justify-center text-cyan-300 text-lg shadow-inner">
                <FaRobot />
              </div>
              <div>
                <h3 className="font-heading font-extrabold text-sm flex items-center space-x-1.5">
                  <span>Growth-X AI Shopper</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </h3>
                <p className="text-[10px] text-cyan-200 font-medium">Powered by Gemini 3.8 Flash</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
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
                            ₹{typeof prod.price === 'number' ? prod.price.toFixed(2) : prod.price}
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
