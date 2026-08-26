const User = require('../models/User');
const Product = require('../models/Product');
const generateToken = require('../utils/generateToken');

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
const authUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = async (req, res) => {
  const { name, email, password } = req.body;
  const userExists = await User.findOne({ email });

  if (userExists) {
    return res.status(400).json({ message: 'User already exists' });
  }

  const user = await User.create({ name, email, password });

  if (user) {
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(400).json({ message: 'Invalid user data' });
  }
};

const authAdmin = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  if (!user.isAdmin) {
    return res.status(401).json({ message: 'Not authorized as an admin' });
  }

  if (await user.matchPassword(password)) {
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      isAdmin: user.isAdmin,
      token: generateToken(user._id),
    });
  } else {
    res.status(401).json({ message: 'Invalid email or password' });
  }
};

// @desc    Get admin/seller dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private/Admin
const getDashboardStats = async (req, res) => {
  try {
    // Get authenticated seller/admin from token
    const seller = await User.findById(req.user._id).select('-password');
    
    if (!seller) {
      return res.status(404).json({ message: 'Seller not found' });
    }

    // Calculate product statistics
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ countInStock: { $gt: 0 } });
    const outOfStockProducts = await Product.countDocuments({ countInStock: 0 });

    // Get recent products (last 5)
    const recentProducts = await Product.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name price countInStock category image');

    res.json({
      seller: {
        _id: seller._id,
        name: seller.name,
        email: seller.email,
        isAdmin: seller.isAdmin,
      },
      statistics: {
        totalProducts,
        activeProducts,
        outOfStockProducts,
      },
      recentProducts,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
};

module.exports = { authUser, registerUser, authAdmin, getDashboardStats };

