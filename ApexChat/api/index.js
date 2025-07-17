// /api/index.js

const express = require('express');
const cors = require('cors');
// Prisma Client is used to interact with the Vercel Postgres database
const { PrismaClient } = require('@prisma/client');
// bcrypt is used for password hashing
const bcrypt = require('bcryptjs');
// jsonwebtoken is used for generating secure user tokens
const jwt = require('jsonwebtoken');

// ----------------------------------------------------
// 1. INITIALIZATION
// ----------------------------------------------------
const app = express();
const prisma = new PrismaClient();
// IMPORTANT: This should be a strong, secret environment variable in Vercel settings!
const JWT_SECRET = process.env.JWT_SECRET || 'your_strong_secret_key'; 

// Middleware
app.use(cors());
app.use(express.json()); // Allows parsing of JSON request bodies

// ----------------------------------------------------
// 2. AUTHENTICATION ROUTES
// ----------------------------------------------------

// POST /api/register - Handles new user registration
app.post('/api/register', async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Please enter all fields.' });
  }

  try {
    // Check if user already exists
    let user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    // Hash the password securely
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create the new user in the Vercel Postgres DB
    user = await prisma.user.create({
      data: {
        username,
        email,
        passwordHash,
      },
    });

    // Create a JWT for the new user
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1d' });

    res.status(201).json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });

  } catch (error) {
    console.error('Registration Error:', error);
    res.status(500).json({ message: 'Server error during registration.' });
  }
});


// POST /api/login - Handles user login
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Please enter all fields.' });
  }

  try {
    // Find the user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(400).json({ message: 'Invalid Credentials.' });
    }

    // Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid Credentials.' });
    }

    // Create a JWT for the authenticated user
    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '1d' });

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    });

  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ message: 'Server error during login.' });
  }
});


// ----------------------------------------------------
// 3. VERCEL SERVERLESS EXPORT
// ----------------------------------------------------

// Vercel requires the Express app to be exported directly.
// All requests to /api/* will be handled by this function.
module.exports = app;
