import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/products');
        setProducts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-64"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Latest Products</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {products.map((product) => (
          <div key={product._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
            <Link to={`/product/${product._id}`}>
              <div className="h-48 overflow-hidden relative">
                <img src={product.image || 'https://via.placeholder.com/400x300?text=Product'} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
            </Link>
            <div className="p-5">
              <Link to={`/product/${product._id}`}>
                <h3 className="text-lg font-semibold text-gray-800 hover:text-indigo-600 truncate">{product.name}</h3>
              </Link>
              <div className="mt-2 flex items-center justify-between">
                <span className="text-2xl font-bold text-gray-900">${product.price.toFixed(2)}</span>
                <span className={`text-sm px-2 py-1 rounded ${product.countInStock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  {product.countInStock > 0 ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
            </div>
          </div>
        ))}
        {products.length === 0 && <div className="col-span-full text-center text-gray-500">No products found. (Run the seeder or add via admin dashboard)</div>}
      </div>
    </div>
  );
};

export default Home;
