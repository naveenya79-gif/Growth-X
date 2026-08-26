const Product = require('../models/Product');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  const products = await Product.find({});
  res.json(products);
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id);
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

    // Validate required fields
    if (!name || !description || !price || !category || !brand || !image || countInStock === undefined) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    // Validate price and stock
    if (price < 0) {
      return res.status(400).json({ message: 'Price must be a positive number' });
    }

    if (countInStock < 0) {
      return res.status(400).json({ message: 'Stock quantity must be a positive number' });
    }

    // Create product with sellerId from authenticated user
    const product = await Product.create({
      name,
      description,
      price: parseFloat(price),
      category,
      brand,
      image,
      countInStock: parseInt(countInStock),
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

module.exports = { getProducts, getProductById, createProduct };
