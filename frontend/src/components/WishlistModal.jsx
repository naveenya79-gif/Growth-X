import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { FaTimes, FaTrash, FaShoppingCart, FaHeart } from 'react-icons/fa';
import { toggleWishlist } from '../redux/slices/wishlistSlice';
import { addToCart } from '../redux/slices/cartSlice';

const WishlistModal = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { wishlistItems } = useSelector((state) => state.wishlist);

  if (!isOpen) return null;

  const handleAddToCart = (item) => {
    dispatch(
      addToCart({
        ...item,
        product: item._id || item.product,
        qty: 1,
        countInStock: item.countInStock || 10,
      })
    );
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/40 backdrop-blur-xs flex justify-end transition-opacity">
      <div className="w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between transform transition-transform duration-300">
        {/* Header */}
        <div className="p-5 border-b border-[#E5EAF0] flex items-center justify-between bg-[#F4F9FF]">
          <div className="flex items-center space-x-2">
            <FaHeart className="text-[#E53935]" />
            <h2 className="text-lg font-bold text-[#172033]">
              Your Wishlist <span className="text-sm font-semibold text-[#667085]">({wishlistItems.length})</span>
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white text-[#667085] hover:text-[#172033] hover:bg-[#E8F3FF] flex items-center justify-center transition-colors"
          >
            <FaTimes size={16} />
          </button>
        </div>

        {/* Content List */}
        <div className="p-5 flex-1 overflow-y-auto divide-y divide-[#E5EAF0]">
          {wishlistItems.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 bg-[#F4F9FF] rounded-full flex items-center justify-center mx-auto mb-4 text-[#2878D8]">
                <FaHeart size={28} className="text-[#2878D8]/40" />
              </div>
              <h3 className="text-base font-bold text-[#172033] mb-1">Your wishlist is empty</h3>
              <p className="text-xs text-[#667085] max-w-xs mx-auto mb-6">
                Explore our collections and save items you love by clicking the heart icon.
              </p>
              <button
                onClick={onClose}
                className="bg-[#2878D8] text-white px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-[#1769C2] transition-colors"
              >
                Start Exploring
              </button>
            </div>
          ) : (
            wishlistItems.map((item) => {
              const itemId = item._id || item.product;
              return (
                <div key={itemId} className="py-4 flex items-center justify-between gap-4 group">
                  <img
                    src={item.image || 'https://via.placeholder.com/80'}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-lg border border-[#E5EAF0]"
                  />
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${itemId}`}
                      onClick={onClose}
                      className="text-sm font-bold text-[#172033] hover:text-[#2878D8] truncate block"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-[#667085] mt-0.5">{item.category}</p>
                    <p className="text-sm font-extrabold text-[#2878D8] mt-1">
                      ${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleAddToCart(item)}
                      title="Add to Cart"
                      className="p-2.5 rounded-xl bg-[#F4F9FF] text-[#2878D8] hover:bg-[#2878D8] hover:text-white transition-colors"
                    >
                      <FaShoppingCart size={14} />
                    </button>
                    <button
                      onClick={() => dispatch(toggleWishlist(item))}
                      title="Remove from Wishlist"
                      className="p-2.5 rounded-xl text-[#667085] hover:text-[#E53935] hover:bg-red-50 transition-colors"
                    >
                      <FaTrash size={14} />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {wishlistItems.length > 0 && (
          <div className="p-4 border-t border-[#E5EAF0] bg-[#F4F9FF] flex justify-between items-center">
            <span className="text-xs text-[#667085]">
              {wishlistItems.length} Saved {wishlistItems.length === 1 ? 'item' : 'items'}
            </span>
            <button
              onClick={onClose}
              className="text-xs font-bold text-[#2878D8] hover:underline"
            >
              Continue Shopping &rarr;
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WishlistModal;
