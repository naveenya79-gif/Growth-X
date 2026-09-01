const mongoose = require('mongoose');

const seedInitialData = async () => {
  try {
    const Product = require('../models/Product');
    const User = require('../models/User');
    const productsData = require('../data/products');

    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      console.log('Seeding initial products into database...');
      
      let adminUser = await User.findOne({ isAdmin: true });
      if (!adminUser) {
        adminUser = await User.create({
          name: 'Admin User',
          email: 'admin@example.com',
          password: 'password123',
          isAdmin: true
        });
        console.log('Admin user created (admin@example.com / password123)');
      }

      const productsWithSeller = productsData.map((p) => ({
        ...p,
        brand: p.brand || 'Generic',
        status: p.status || 'Active',
        sellerId: adminUser._id
      }));

      await Product.insertMany(productsWithSeller);
      console.log(`Successfully seeded ${productsWithSeller.length} products!`);
    }
  } catch (err) {
    console.warn('Seeding warning:', err.message);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 2500,
    });
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    await seedInitialData();
  } catch (error) {
    console.warn(`Local MongoDB connection failed (${error.message}). Attempting MongoMemoryServer fallback...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      const uri = mongod.getUri();
      const conn = await mongoose.connect(uri);
      console.log(`MongoDB Memory Server Connected: ${conn.connection.host}`);
      await seedInitialData();
    } catch (memError) {
      console.error(`MongoDB Connection Error: ${memError.message}`);
      console.log('Continuing server startup with fallback mode...');
    }
  }
};

module.exports = connectDB;
