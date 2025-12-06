-- Schema for RoastMyResume DB (Neon PostgreSQL)

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(255) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255),
    password VARCHAR(255), -- Hashed password for custom credentials login
    tier VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create usage limits table for rate limiting (1 free roast per day)
CREATE TABLE IF NOT EXISTS usage_limits (
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    date DATE DEFAULT CURRENT_DATE,
    count INT DEFAULT 0,
    PRIMARY KEY (user_id, date)
);

-- Create orders table for tracking Razorpay payments
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(255) PRIMARY KEY, -- Razorpay Order ID
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    payment_id VARCHAR(255), -- Razorpay Payment ID
    signature VARCHAR(255), -- Razorpay Signature
    amount INT NOT NULL, -- Amount in paise / cents
    currency VARCHAR(10) DEFAULT 'INR',
    status VARCHAR(50) DEFAULT 'created', -- 'created', 'paid', 'failed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_usage_limits_user_date ON usage_limits(user_id, date);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
