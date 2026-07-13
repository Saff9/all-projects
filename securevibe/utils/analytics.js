const User = require('../models/User');

// User engagement and analytics features
class SecureVibeAnalytics {
  // Track user engagement metrics
  static async trackUserEngagement(userId, action, metadata = {}) {
    try {
      const user = await User.findById(userId);
      if (!user) return;

      // Update user engagement score
      const engagementPoints = this.getEngagementPoints(action);
      user.engagementScore = (user.engagementScore || 0) + engagementPoints;

      // Track last activity
      user.lastActivity = new Date();

      // Add to activity log
      if (!user.activityLog) user.activityLog = [];
      user.activityLog.unshift({
        action,
        timestamp: new Date(),
        metadata,
        ipAddress: metadata.ipAddress,
        userAgent: metadata.userAgent
      });

      // Keep only last 100 activities
      if (user.activityLog.length > 100) {
        user.activityLog = user.activityLog.slice(0, 100);
      }

      await user.save();

      return user.engagementScore;
    } catch (error) {
      console.error('Error tracking user engagement:', error);
    }
  }

  // Calculate engagement points based on action
  static getEngagementPoints(action) {
    const pointsMap = {
      LOGIN: 5,
      PROFILE_UPDATE: 3,
      PASSWORD_CHANGE: 10,
      API_KEY_GENERATED: 15,
      SUBSCRIPTION_UPGRADE: 50,
      SECURITY_ALERT_VIEWED: 2,
      DOCUMENTATION_VIEWED: 1,
      SUPPORT_CONTACTED: 5,
      FEEDBACK_SUBMITTED: 8,
      SOCIAL_SHARE: 12,
      REFERRAL_USED: 25
    };
    return pointsMap[action] || 1;
  }

  // Get user insights
  static async getUserInsights(userId) {
    try {
      const user = await User.findById(userId);
      if (!user) return null;

      const insights = {
        engagementScore: user.engagementScore || 0,
        totalLogins: user.devices ? user.devices.length : 0,
        lastActivity: user.lastActivity,
        accountAge: user.createdAt ? Math.floor((Date.now() - user.createdAt) / (1000 * 60 * 60 * 24)) : 0,
        securityScore: this.calculateSecurityScore(user),
        activitySummary: this.summarizeActivity(user.activityLog || []),
        riskLevel: this.assessRiskLevel(user)
      };

      return insights;
    } catch (error) {
      console.error('Error getting user insights:', error);
      return null;
    }
  }

  // Calculate security score
  static calculateSecurityScore(user) {
    let score = 50; // Base score

    // Email verified (+20)
    if (user.isVerified) score += 20;

    // Password strength (+10-30)
    if (user.password && user.password.length >= 8) score += 10;
    if (user.password && /[!@#$%^&*]/.test(user.password)) score += 10;
    if (user.password && /\d/.test(user.password)) score += 10;

    // Two-factor enabled (+15) - future feature
    // if (user.twoFactorEnabled) score += 15;

    // Recent security events (-10-30)
    const recentSecurityEvents = user.securityLogs?.filter(log =>
      log.timestamp > Date.now() - 30 * 24 * 60 * 60 * 1000 // Last 30 days
    ) || [];

    const failedAttempts = recentSecurityEvents.filter(log =>
      log.action.includes('FAILED') || log.action.includes('INVALID')
    ).length;

    score -= Math.min(failedAttempts * 5, 30);

    // Device diversity (+5-15)
    const deviceCount = user.devices?.length || 0;
    score += Math.min(deviceCount * 3, 15);

    return Math.max(0, Math.min(100, score));
  }

  // Summarize user activity
  static summarizeActivity(activityLog) {
    const summary = {
      totalActions: activityLog.length,
      recentActions: [],
      actionCounts: {}
    };

    // Get last 10 actions
    summary.recentActions = activityLog.slice(0, 10).map(activity => ({
      action: activity.action,
      timestamp: activity.timestamp,
      metadata: activity.metadata
    }));

    // Count actions by type
    activityLog.forEach(activity => {
      summary.actionCounts[activity.action] = (summary.actionCounts[activity.action] || 0) + 1;
    });

    return summary;
  }

  // Assess risk level
  static assessRiskLevel(user) {
    const recentLogs = user.securityLogs?.filter(log =>
      log.timestamp > Date.now() - 7 * 24 * 60 * 60 * 1000 // Last 7 days
    ) || [];

    const failedLogins = recentLogs.filter(log => log.action === 'LOGIN_FAILED').length;
    const suspiciousActivities = recentLogs.filter(log =>
      log.action.includes('INVALID') || log.action.includes('SUSPICIOUS')
    ).length;

    if (failedLogins > 10 || suspiciousActivities > 5) return 'HIGH';
    if (failedLogins > 5 || suspiciousActivities > 2) return 'MEDIUM';
    return 'LOW';
  }

  // Generate personalized recommendations
  static generateRecommendations(userInsights) {
    const recommendations = [];

    if (userInsights.securityScore < 70) {
      recommendations.push({
        type: 'security',
        priority: 'high',
        message: 'Consider enabling additional security features',
        action: 'Review security settings'
      });
    }

    if (userInsights.engagementScore < 50) {
      recommendations.push({
        type: 'engagement',
        priority: 'medium',
        message: 'Try exploring more features to increase your engagement score',
        action: 'Explore dashboard features'
      });
    }

    if (userInsights.totalLogins < 3) {
      recommendations.push({
        type: 'onboarding',
        priority: 'low',
        message: 'Login from multiple devices for better account security',
        action: 'Add another device'
      });
    }

    if (userInsights.riskLevel === 'HIGH') {
      recommendations.push({
        type: 'security',
        priority: 'critical',
        message: 'Unusual activity detected. Please review your account security.',
        action: 'Contact support immediately'
      });
    }

    return recommendations;
  }

  // System-wide analytics
  static async getSystemAnalytics() {
    try {
      const totalUsers = await User.countDocuments();
      const verifiedUsers = await User.countDocuments({ isVerified: true });
      const paidUsers = await User.countDocuments({ isPaid: true });
      const activeUsers = await User.countDocuments({
        lastActivity: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
      });

      const securityEvents = await User.aggregate([
        { $unwind: '$securityLogs' },
        {
          $match: {
            'securityLogs.timestamp': {
              $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        },
        {
          $group: {
            _id: '$securityLogs.action',
            count: { $sum: 1 }
          }
        }
      ]);

      return {
        totalUsers,
        verifiedUsers,
        paidUsers,
        activeUsers,
        verificationRate: totalUsers > 0 ? (verifiedUsers / totalUsers * 100).toFixed(1) : 0,
        paidRate: totalUsers > 0 ? (paidUsers / totalUsers * 100).toFixed(1) : 0,
        activityRate: totalUsers > 0 ? (activeUsers / totalUsers * 100).toFixed(1) : 0,
        securityEvents: securityEvents.reduce((acc, event) => {
          acc[event._id] = event.count;
          return acc;
        }, {})
      };
    } catch (error) {
      console.error('Error getting system analytics:', error);
      return null;
    }
  }
}

module.exports = SecureVibeAnalytics;
