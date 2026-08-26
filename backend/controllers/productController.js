const Product = require('../models/Product');

const validateProductData = (data) => {
  const { name, description, price, category, brand, image, countInStock, status } = data;
  const errors = [];

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

  return { errors, priceValue, stockValue };
};

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  const products = await Product.find({ status: 'Active', countInStock: { $gt: 0 } })
    .select('-sellerId')
    .sort({ createdAt: -1 });
  res.json(products);
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  const product = await Product.findOne({
    _id: req.params.id,
    status: 'Active',
    countInStock: { $gt: 0 }
  }).select('-sellerId');
  if (product) {
    res.json(product);
  } else {
    res.status(404).json({ message: 'Product not found' });
  }
};

// @desc    Create a new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const { name, description, price, category, brand, image, countInStock, status } = req.body;

    const { errors, priceValue, stockValue } = validateProductData({
      name, description, price, category, brand, image, countInStock, status: status || 'Active'
    });
    if (errors.length) return res.status(400).json({ message: errors.join('. ') });

    // Create product with sellerId from authenticated user
    const product = await Product.create({
      name,
      description,
      price: priceValue,
      category: category.trim(),
      brand: brand.trim(),
      image: image.trim(),
      countInStock: stockValue,
      status: status || 'Active',
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
    const { errors, priceValue, stockValue } = validateProductData(data);
    if (errors.length) return res.status(400).json({ message: errors.join('. ') });

    product.name = data.name.trim();
    product.description = data.description.trim();
    product.price = priceValue;
    product.category = data.category.trim();
    product.brand = data.brand.trim();
    product.image = data.image.trim();
    product.countInStock = stockValue;
    product.status = data.status;

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

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  getMyProducts,
  updateProduct,
  deleteProduct
};
