import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaTrash } from 'react-icons/fa';
import { addToCart, removeFromCart } from '../redux/slices/cartSlice';

const Cart = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const cart = useSelector((state) => state.cart);
  const { cartItems } = cart;

  const removeFromCartHandler = (id) => {
    dispatch(removeFromCart(id));
  };

  const checkoutHandler = () => {
    navigate('/login?redirect=/checkout');
  };

  return (
    <div className="max-w-6xl mx-auto py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
      
      {cartItems.length === 0 ? (
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <p className="text-gray-600 mb-4">Your cart is currently empty.</p>
          <Link to="/" className="text-indigo-600 hover:text-indigo-800 font-medium">Continue Shopping</Link>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-8">
          <div className="lg:w-2/3">
            <div className="bg-white rounded-xl shadow overflow-hidden">
              <ul className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <li key={item.product} className="p-6 flex items-center hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-md overflow-hidden">
                      <img src={item.image || 'https://via.placeholder.com/150'} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="ml-6 flex-1 flex flex-col justify-between">
                      <div className="flex justify-between">
                        <Link to={`/product/${item.product}`} className="text-lg font-medium text-gray-900 hover:text-indigo-600">{item.name}</Link>
                        <p className="font-bold text-gray-900">${item.price.toFixed(2)}</p>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        <select 
                          value={item.qty} 
                          onChange={(e) => dispatch(addToCart({ ...item, qty: Number(e.target.value) }))}
                          className="border border-gray-300 rounded p-1"
                        >
                          {[...Array(item.countInStock).keys()].map((x) => (
                            <option key={x + 1} value={x + 1}>
                              {x + 1}
                            </option>
                          ))}
                        </select>
                        <button 
                          onClick={() => removeFromCartHandler(item.product)}
                          className="text-red-500 hover:text-red-700 p-2"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="lg:w-1/3">
            <div className="bg-white rounded-xl shadow p-6">
              <h2 className="text-xl font-bold text-gray-900 border-b pb-4 mb-4">Order Summary</h2>
              <div className="flex justify-between mb-4">
                <span className="text-gray-600">Items ({cartItems.reduce((acc, item) => acc + item.qty, 0)})</span>
                <span className="font-medium text-gray-900">${cartItems.reduce((acc, item) => acc + item.qty * item.price, 0).toFixed(2)}</span>
              </div>
              <button 
                onClick={checkoutHandler}
                disabled={cartItems.length === 0}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg font-bold shadow transition-colors"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
