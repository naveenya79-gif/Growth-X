const Product = require('../models/Product');

const validateProductData = (data) => {
  const { name, description, price, category, brand, image, countInStock, status, tags, rating } = data;
  const errors = [];

  const ratingValue = Number(rating || 0);
  if (!Number.isFinite(ratingValue) || ratingValue < 0 || ratingValue > 5) errors.push('Rating must be a number between 0 and 5');

  if (tags && !Array.isArray(tags)) errors.push('Tags must be an array');

  if (!name || name.trim().length < 2) errors.push('Product name must be at least 2 characters');
  if (!description || !description.trim()) errors.push('Description is required');
  if (!category || !category.trim()) errors.push('Category is required');
  if (!brand || !brand.trim()) errors.push('Brand is required');
  if (!image || !/^https?:\/\/\S+$/i.test(image.trim())) errors.push('A valid image URL is required');

  const priceValue = Number(price);
  if (!Number.isFinite(priceValue) || priceValue < 0) errors.push('Price must be a non-negative number');

  const stockValue = Number(countInStock);
  if (!Number.isInteger(stockValue) || stockValue < 0) errors.push('Stock quantity must be a non-negative integer');

  if (status !== 'Active' && status !== 'Inactive') errors.push('Status must be Active or Inactive');

  return { errors, priceValue, stockValue, ratingValue, parsedTags: tags || [] };
};

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const products = await Product.find({ status: 'Active', countInStock: { $gt: 0 } })
      .select('-sellerId')
      .sort({ createdAt: -1 });
    console.log('getProducts count:', products.length);
    res.json(products);
  } catch (error) {
    console.error('getProducts error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findOne({
      _id: req.params.id,
      status: 'Active',
      countInStock: { $gt: 0 }
    }).select('-sellerId');
    if (product) {
      return res.json(product);
    }
    return res.status(404).json({ message: 'Product not found' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ message: 'Product not found' });
    }
    return res.status(500).json({ message: 'Error fetching product' });
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, brand, image, countInStock, status, tags, rating } = req.body;

    const { errors, priceValue, stockValue, ratingValue, parsedTags } = validateProductData({
      name, description, price, category, brand, image, countInStock, status: status || 'Active', tags, rating
    });
    if (errors.length) return res.status(400).json({ message: errors.join('. ') });

    const product = await Product.create({
      name,
      description,
      price: priceValue,
      category: category.trim(),
      brand: brand.trim(),
      image: image.trim(),
      countInStock: stockValue,
      status: status || 'Active',
      tags: parsedTags,
      rating: ratingValue,
      sellerId: req.user._id
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      product
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating product', error: error.message });
  }
};

// @desc    Fetch products created by the authenticated seller
// @route   GET /api/products/my-products
// @access  Private/Admin
const getMyProducts = async (req, res) => {
  const products = await Product.find({ sellerId: req.user._id }).sort({ createdAt: -1 });
  res.json(products);
};

// @desc    Update a seller-owned product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, sellerId: req.user._id });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    const data = { ...product.toObject(), ...req.body };
    const { errors, priceValue, stockValue, ratingValue, parsedTags } = validateProductData(data);
    if (errors.length) return res.status(400).json({ message: errors.join('. ') });

    product.name = data.name.trim();
    product.description = data.description.trim();
    product.price = priceValue;
    product.category = data.category.trim();
    product.brand = data.brand.trim();
    product.image = data.image.trim();
    product.countInStock = stockValue;
    product.status = data.status;
    product.tags = parsedTags;
    product.rating = ratingValue;

    const updatedProduct = await product.save();
    res.json(updatedProduct);
  } catch (error) {
    if (error.name === 'CastError') return res.status(404).json({ message: 'Product not found' });
    res.status(500).json({ message: 'Error updating product', error: error.message });
  }
};

// @desc    Delete a seller-owned product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, sellerId: req.user._id });
    if (!product) return res.status(404).json({ message: 'Product not found' });

    await product.deleteOne();
    res.json({ message: 'Product removed' });
  } catch (error) {
    if (error.name === 'CastError') return res.status(404).json({ message: 'Product not found' });
    res.status(500).json({ message: 'Error deleting product', error: error.message });
  }
};

// @desc    Get recommendations for a product
// @route   GET /api/products/:id/recommendations
// @access  Public
const getProductRecommendations = async (req, res) => {
  try {
    const productId = req.params.id;

    // Find the purchased product
    const purchasedProduct = await Product.findById(productId);

    // If the product does not exist, return a proper 404
    if (!purchasedProduct) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Efficient Database Query: find products with same category OR brand OR tags
    const query = {
      _id: { $ne: purchasedProduct._id },
      status: 'Active',
      $or: [
        { category: purchasedProduct.category },
        { brand: purchasedProduct.brand }
      ]
    };
    
    if (Array.isArray(purchasedProduct.tags) && purchasedProduct.tags.length > 0) {
      query.$or.push({ tags: { $in: purchasedProduct.tags } });
    }

    let potentialProducts = await Product.find(query).select('name brand category tags price image rating');

    // Scoring Algorithm
    const scoredProducts = potentialProducts.map(product => {
      let score = 0;

      // Same category = +5
      if (product.category === purchasedProduct.category) score += 5;
      
      // Same brand = +3
      if (product.brand === purchasedProduct.brand) score += 3;

      // Each matching tag = +2
      if (Array.isArray(purchasedProduct.tags) && Array.isArray(product.tags)) {
        const matchingTags = purchasedProduct.tags.filter(tag => product.tags.includes(tag));
        score += (matchingTags.length * 2);
      }

      return { product, score };
    });

    // Sort by score (desc), then rating (desc)
    scoredProducts.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (b.product.rating || 0) - (a.product.rating || 0);
    });

    let recommendations = scoredProducts.slice(0, 4).map(item => item.product);

    // Fallback: If fewer than 4 items found, prioritize category-based fallback
    if (recommendations.length < 4) {
      const existingIds = recommendations.map(p => p._id);
      existingIds.push(purchasedProduct._id);
      
      const fallbackProducts = await Product.find({
        _id: { $nin: existingIds },
        category: purchasedProduct.category,
        status: 'Active'
      }).limit(4 - recommendations.length).select('name brand category tags price image rating');
      
      recommendations = [...recommendations, ...fallbackProducts];
      
      // If still fewer than 4, grab ANY active product
      if (recommendations.length < 4) {
          const newExistingIds = recommendations.map(p => p._id);
          newExistingIds.push(purchasedProduct._id);
          const finalFallback = await Product.find({
             _id: { $nin: newExistingIds },
             status: 'Active'
          }).limit(4 - recommendations.length).select('name brand category tags price image rating');
          recommendations = [...recommendations, ...finalFallback];
      }
    }

    res.json({
      success: true,
      purchasedProduct: {
        _id: purchasedProduct._id,
        name: purchasedProduct.name
      },
      recommendations
    });

  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ success: false, message: 'Invalid product ID' });
    }
    res.status(500).json({ success: false, message: 'Error fetching recommendations', error: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  getMyProducts,
  updateProduct,
  deleteProduct,
  getProductRecommendations
};
