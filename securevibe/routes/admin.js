const express = require('express');
const Joi = require('joi');
const User = require('../models/User');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Validation schemas
const updateUserSchema = Joi.object({
  isPaid: Joi.boolean(),
  subscriptionEndDate: Joi.date(),
  role: Joi.string().valid('user', 'admin')
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', protect, admin, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find({})
      .select('-password -verificationToken -resetPasswordToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      },
      poweredBy: 'SecureVibe'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get single user
// @route   GET /api/admin/users/:id
// @access  Private/Admin
router.get('/users/:id', protect, admin, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-password -verificationToken -resetPasswordToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        poweredBy: 'SecureVibe'
      });
    }

    res.json({
      success: true,
      data: { user },
      poweredBy: 'SecureVibe'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
router.put('/users/:id', protect, admin, async (req, res, next) => {
  try {
    const { error } = updateUserSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.details[0].message,
        poweredBy: 'SecureVibe'
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).select('-password -verificationToken -resetPasswordToken');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        poweredBy: 'SecureVibe'
      });
    }

    res.json({
      success: true,
      data: { user },
      message: 'User updated successfully',
      poweredBy: 'SecureVibe'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
router.delete('/users/:id', protect, admin, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        poweredBy: 'SecureVibe'
      });
    }

    // Prevent deleting admin users
    if (user.role === 'admin') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete admin user',
        poweredBy: 'SecureVibe'
      });
    }

    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'User deleted successfully',
      poweredBy: 'SecureVibe'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Generate API key for user
// @route   POST /api/admin/users/:id/generate-api-key
// @access  Private/Admin
router.post('/users/:id/generate-api-key', protect, admin, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        poweredBy: 'SecureVibe'
      });
    }

    user.generateApiKey();
    await user.save();

    res.json({
      success: true,
      data: {
        apiKey: user.apiKey
      },
      message: 'API key generated successfully',
      poweredBy: 'SecureVibe'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Revoke API key
// @route   POST /api/admin/users/:id/revoke-api-key
// @access  Private/Admin
router.post('/users/:id/revoke-api-key', protect, admin, async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
        poweredBy: 'SecureVibe'
      });
    }

    user.apiKey = undefined;
    await user.save();

    res.json({
      success: true,
      message: 'API key revoked successfully',
      poweredBy: 'SecureVibe'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get dashboard stats
// @route   GET /api/admin/stats
// @access  Private/Admin
router.get('/stats', protect, admin, async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const verifiedUsers = await User.countDocuments({ isVerified: true });
    const paidUsers = await User.countDocuments({ isPaid: true });
    const recentUsers = await User.find({})
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email createdAt isPaid');

    res.json({
      success: true,
      data: {
        totalUsers,
        verifiedUsers,
        paidUsers,
        unverifiedUsers: totalUsers - verifiedUsers,
        freeUsers: totalUsers - paidUsers,
        recentUsers
      },
      poweredBy: 'SecureVibe'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
