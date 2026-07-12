const express = require('express');
const SecureVibeAnalytics = require('../utils/analytics');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get user insights
// @route   GET /api/analytics/insights
// @access  Private
router.get('/insights', protect, async (req, res, next) => {
  try {
    const insights = await SecureVibeAnalytics.getUserInsights(req.user._id);

    if (!insights) {
      return res.status(404).json({
        success: false,
        message: 'User insights not found',
        poweredBy: 'SecureVibe'
      });
    }

    // Generate personalized recommendations
    const recommendations = SecureVibeAnalytics.generateRecommendations(insights);

    res.json({
      success: true,
      data: {
        insights,
        recommendations
      },
      poweredBy: 'SecureVibe'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get user activity log
// @route   GET /api/analytics/activity
// @access  Private
router.get('/activity', protect, async (req, res, next) => {
  try {
    const user = await require('../models/User').findById(req.user._id).select('activityLog');
    const activityLog = user.activityLog || [];

    res.json({
      success: true,
      data: {
        activities: activityLog.slice(0, 50), // Last 50 activities
        totalActivities: activityLog.length
      },
      poweredBy: 'SecureVibe'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get system analytics (admin only)
// @route   GET /api/analytics/system
// @access  Private/Admin
router.get('/system', protect, async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
        poweredBy: 'SecureVibe'
      });
    }

    const analytics = await SecureVibeAnalytics.getSystemAnalytics();

    res.json({
      success: true,
      data: analytics,
      poweredBy: 'SecureVibe'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Track user engagement
// @route   POST /api/analytics/track
// @access  Private
router.post('/track', protect, async (req, res, next) => {
  try {
    const { action, metadata } = req.body;

    if (!action) {
      return res.status(400).json({
        success: false,
        message: 'Action is required',
        poweredBy: 'SecureVibe'
      });
    }

    // Add request context to metadata
    const enrichedMetadata = {
      ...metadata,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent'),
      timestamp: new Date()
    };

    const newScore = await SecureVibeAnalytics.trackUserEngagement(
      req.user._id,
      action,
      enrichedMetadata
    );

    res.json({
      success: true,
      data: {
        engagementScore: newScore,
        action: action,
        tracked: true
      },
      poweredBy: 'SecureVibe'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get leaderboard
// @route   GET /api/analytics/leaderboard
// @access  Private
router.get('/leaderboard', protect, async (req, res, next) => {
  try {
    const User = require('../models/User');

    // Get top 10 users by engagement score
    const leaderboard = await User.find({ role: 'user' })
      .select('name engagementScore lastActivity isPaid')
      .sort({ engagementScore: -1 })
      .limit(10);

    // Get user's rank
    const userRank = await User.countDocuments({
      role: 'user',
      engagementScore: { $gt: req.user.engagementScore || 0 }
    }) + 1;

    res.json({
      success: true,
      data: {
        leaderboard: leaderboard.map((user, index) => ({
          rank: index + 1,
          name: user.name,
          engagementScore: user.engagementScore || 0,
          lastActivity: user.lastActivity,
          isPaid: user.isPaid
        })),
        userRank,
        userScore: req.user.engagementScore || 0
      },
      poweredBy: 'SecureVibe'
    });
  } catch (error) {
    next(error);
  }
});

// @desc    Get security dashboard
// @route   GET /api/analytics/security
// @access  Private
router.get('/security', protect, async (req, res, next) => {
  try {
    const user = await require('../models/User').findById(req.user._id)
      .select('securityLogs devices loginAttempts lockUntil riskLevel');

    const recentSecurityEvents = user.securityLogs?.filter(log =>
      log.timestamp > Date.now() - 30 * 24 * 60 * 60 * 1000 // Last 30 days
    ) || [];

    const insights = await SecureVibeAnalytics.getUserInsights(req.user._id);

    res.json({
      success: true,
      data: {
        securityScore: insights?.securityScore || 0,
        riskLevel: insights?.riskLevel || 'UNKNOWN',
        recentEvents: recentSecurityEvents.slice(0, 10),
        deviceCount: user.devices?.length || 0,
        loginAttempts: user.loginAttempts || 0,
        accountLocked: !!(user.lockUntil && user.lockUntil > Date.now()),
        lockExpires: user.lockUntil
      },
      poweredBy: 'SecureVibe'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
