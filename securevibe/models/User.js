const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name must be less than 50 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    validate: {
      validator: function(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      },
      message: 'Please enter a valid email'
    }
  },
  password: {
    type: String,
    required: function() {
      return !this.googleId; // Not required if Google auth
    },
    minlength: [6, 'Password must be at least 6 characters']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  googleId: {
    type: String,
    sparse: true
  },
  profilePicture: {
    type: String
  },
  verificationToken: String,
  verificationTokenExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  isPaid: {
    type: Boolean,
    default: false
  },
  subscriptionEndDate: Date,
  apiKey: {
    type: String,
    unique: true,
    sparse: true
  },
  devices: [{
    deviceId: { type: String, required: true },
    deviceName: { type: String },
    userAgent: { type: String },
    ipAddress: { type: String },
    lastLogin: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true }
  }],
  securityLogs: [{
    action: { type: String, required: true },
    ipAddress: { type: String },
    userAgent: { type: String },
    timestamp: { type: Date, default: Date.now },
    details: { type: String }
  }],
  lastLogin: Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  if (this.password) {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Generate API key
userSchema.methods.generateApiKey = function() {
  this.apiKey = require('crypto').randomBytes(32).toString('hex');
};

module.exports = mongoose.model('User', userSchema);
