const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected');
  } catch (error) {
    console.error('Database connection error:', error.message);
    process.exit(1);
  }
};

const createAdmin = async () => {
  try {
    await connectDB();

    const adminExists = await User.findOne({ role: 'admin' });

    if (adminExists) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    const adminUser = await User.create({
      name: 'SecureVibe Admin',
      email: 'admin@securevibe.com',
      password: 'Admin123!',
      role: 'admin',
      isVerified: true,
      isPaid: true
    });

    console.log('Admin user created successfully');
    console.log('Email:', adminUser.email);
    console.log('Password: Admin123!');
    console.log('Please change the password after first login');

    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error.message);
    process.exit(1);
  }
};

createAdmin();
