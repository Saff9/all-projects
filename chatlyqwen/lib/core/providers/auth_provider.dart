/// @file lib/core/providers/auth_provider.dart
/// @brief Authentication state management provider
/// @author Chatly Development Team
/// @date 2025-12-08
///
/// This file manages the authentication state throughout the application.
/// It handles user sign-in, sign-up, session management, and provides
/// reactive state updates to UI components. The provider integrates with
/// Firebase Authentication and maintains user session data.

import 'package:chatly/core/constants/app_constants.dart';
import 'package:chatly/core/errors/exceptions.dart';
import 'package:chatly/core/utils/handlers/preference_handler.dart';
import 'package:chatly/data/models/user_model.dart';
import 'package:chatly/data/repositories/auth_repository.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter/foundation.dart';

class AuthProvider with ChangeNotifier {
  final AuthRepository _authRepository = AuthRepository();
  final PreferenceHandler _preferenceHandler = PreferenceHandler();
  
  User? _currentUser;
  UserModel? _userProfile;
  bool _isLoading = false;
  bool _isAuthenticated = false;
  String? _errorMessage;
  String? _verificationId;
  
  // Getters
  User? get currentUser => _currentUser;
  UserModel? get userProfile => _userProfile;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _isAuthenticated;
  String? get errorMessage => _errorMessage;
  String? get verificationId => _verificationId;
  
  /// Initialize authentication state
  Future<void> initialize() async {
    _isLoading = true;
    notifyListeners();
    
    try {
      final currentUser = FirebaseAuth.instance.currentUser;
      if (currentUser != null) {
        await _loadUserProfile(currentUser.uid);
        _currentUser = currentUser;
        _isAuthenticated = true;
      }
    } catch (e) {
      _handleError(e);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  
  /// Sign in with email and password
  Future<bool> signInWithEmail(String email, String password) async {
    _resetError();
    _isLoading = true;
    notifyListeners();
    
    try {
      final userCredential = await _authRepository.signInWithEmail(email, password);
      await _handleSuccessfulSignIn(userCredential);
      return true;
    } catch (e) {
      _handleError(e);
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  
  /// Sign up with email and password
  Future<bool> signUpWithEmail(String email, String password, String username) async {
    _resetError();
    _isLoading = true;
    notifyListeners();
    
    try {
      final userCredential = await _authRepository.signUpWithEmail(email, password);
      await _authRepository.setUsername(userCredential.user!.uid, username);
      await _handleSuccessfulSignIn(userCredential);
      return true;
    } catch (e) {
      _handleError(e);
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  
  /// Phone authentication - start verification
  Future<bool> startPhoneVerification(String phoneNumber) async {
    _resetError();
    _isLoading = true;
    notifyListeners();
    
    try {
      _verificationId = await _authRepository.startPhoneVerification(phoneNumber);
      return true;
    } catch (e) {
      _handleError(e);
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  
  /// Verify OTP code
  Future<bool> verifyOTP(String otp) async {
    _resetError();
    _isLoading = true;
    notifyListeners();
    
    try {
      if (_verificationId == null) {
        throw ChatlyException('Verification ID not found');
      }
      
      final userCredential = await _authRepository.verifyOTP(_verificationId!, otp);
      await _handleSuccessfulSignIn(userCredential);
      return true;
    } catch (e) {
      _handleError(e);
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  
  /// Sign out current user
  Future<void> signOut() async {
    _isLoading = true;
    notifyListeners();
    
    try {
      await _authRepository.signOut();
      _currentUser = null;
      _userProfile = null;
      _isAuthenticated = false;
      await _preferenceHandler.clearSessionData();
    } catch (e) {
      _handleError(e);
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  
  /// Handle successful sign-in
  Future<void> _handleSuccessfulSignIn(UserCredential userCredential) async {
    _currentUser = userCredential.user;
    _isAuthenticated = true;
    
    // Load or create user profile
    if (_currentUser != null) {
      await _loadOrCreateProfile(_currentUser!.uid);
    }
    
    // Save session data
    await _preferenceHandler.saveSessionData(_currentUser!.uid);
  }
  
  /// Load user profile from database
  Future<void> _loadUserProfile(String uid) async {
    try {
      _userProfile = await _authRepository.getUserProfile(uid);
    } catch (e) {
      if (kDebugMode) {
        print('Error loading user profile: $e');
      }
    }
  }
  
  /// Load or create user profile
  Future<void> _loadOrCreateProfile(String uid) async {
    try {
      _userProfile = await _authRepository.getUserProfile(uid);
      if (_userProfile == null) {
        // Create default profile if none exists
        _userProfile = UserModel(
          uid: uid,
          username: 'user_${uid.substring(0, 8)}',
          email: _currentUser?.email ?? '',
          tier: 'free',
          createdAt: DateTime.now(),
          lastSeen: DateTime.now(),
          settings: {
            'theme': AppConstants.defaultTheme,
            'fontSize': AppConstants.defaultFontSize.toString(),
            'retentionDays': AppConstants.defaultMessageRetentionDays.toString(),
            'showOnlineStatus': AppConstants.defaultShowOnlineStatus.toString(),
            'allowContactsSync': AppConstants.defaultAllowContactsSync.toString(),
          },
          limits: {
            'anonymousThisWeek': '0',
            'messagesToday': '0',
            'groupsCreated': '0',
          },
        );
        await _authRepository.createUserProfile(_userProfile!);
      }
    } catch (e) {
      _handleError(e);
    }
  }
  
  /// Handle errors consistently
  void _handleError(dynamic error) {
    if (error is FirebaseException) {
      switch (error.code) {
        case 'wrong-password':
        case 'invalid-email':
        case 'user-not-found':
        case 'user-disabled':
        case 'too-many-requests':
        case 'invalid-verification-code':
        case 'invalid-verification-id':
          _errorMessage = _getFirebaseErrorMessage(error.code);
          break;
        case 'email-already-in-use':
          _errorMessage = 'This email is already registered';
          break;
        case 'weak-password':
          _errorMessage = 'Password must be at least 8 characters long';
          break;
        case 'operation-not-allowed':
          _errorMessage = 'This sign-in method is disabled';
          break;
        default:
          _errorMessage = 'Authentication failed. Please try again.';
      }
    } else if (error is ChatlyException) {
      _errorMessage = error.message;
    } else {
      _errorMessage = 'An unexpected error occurred. Please try again.';
    }
    
    if (kDebugMode) {
      print('Auth Error: $_errorMessage');
    }
  }
  
  /// Get user-friendly Firebase error messages
  String _getFirebaseErrorMessage(String errorCode) {
    switch (errorCode) {
      case 'wrong-password':
        return 'Incorrect password. Please try again.';
      case 'invalid-email':
        return 'Please enter a valid email address.';
      case 'user-not-found':
        return 'No account found with this email address.';
      case 'user-disabled':
        return 'This account has been disabled.';
      case 'too-many-requests':
        return 'Too many attempts. Please try again later.';
      case 'invalid-verification-code':
        return 'Invalid OTP code. Please check and try again.';
      case 'invalid-verification-id':
        return 'Verification session expired. Please start again.';
      default:
        return 'Authentication failed. Please try again.';
    }
  }
  
  /// Reset error message
  void _resetError() {
    _errorMessage = null;
  }
  
  /// Update user profile
  Future<bool> updateUserProfile(UserModel updatedProfile) async {
    _resetError();
    _isLoading = true;
    notifyListeners();
    
    try {
      await _authRepository.updateUserProfile(updatedProfile);
      _userProfile = updatedProfile;
      return true;
    } catch (e) {
      _handleError(e);
      return false;
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }
  
  /// Check if username is available
  Future<bool> isUsernameAvailable(String username) async {
    try {
      return await _authRepository.isUsernameAvailable(username);
    } catch (e) {
      _handleError(e);
      return false;
    }
  }
  
  /// Update last seen timestamp
  Future<void> updateLastSeen() async {
    if (_currentUser != null && _userProfile != null) {
      try {
        await _authRepository.updateLastSeen(_currentUser!.uid);
        _userProfile = _userProfile!.copyWith(
          lastSeen: DateTime.now(),
        );
        notifyListeners();
      } catch (e) {
        if (kDebugMode) {
          print('Error updating last seen: $e');
        }
      }
    }
  }
  
  /// Check daily message limits
  bool canSendMessage() {
    if (_userProfile == null) return false;
    
    final today = DateTime.now().day;
    final messagesToday = int.tryParse(_userProfile!.limits['messagesToday'] ?? '0') ?? 0;
    final dailyLimit = AppConstants.getMessageLimit(_userProfile!.tier);
    
    return messagesToday < dailyLimit;
  }
  
  /// Increment message count
  Future<void> incrementMessageCount() async {
    if (_currentUser != null && _userProfile != null) {
      try {
        final currentCount = int.tryParse(_userProfile!.limits['messagesToday'] ?? '0') ?? 0;
        final updatedProfile = _userProfile!.copyWith(
          limits: {
            ..._userProfile!.limits,
            'messagesToday': (currentCount + 1).toString(),
          }
        );
        await _authRepository.updateUserProfile(updatedProfile);
        _userProfile = updatedProfile;
      } catch (e) {
        if (kDebugMode) {
          print('Error incrementing message count: $e');
        }
      }
    }
  }
  
  /// Reset daily message count at midnight
  void resetDailyMessageCount() {
    if (_userProfile != null) {
      _userProfile = _userProfile!.copyWith(
        limits: {
          ..._userProfile!.limits,
          'messagesToday': '0',
        }
      );
    }
  }
  
  /// TODO: Implement session timeout functionality
  /// TODO: Add multi-device session management
  /// WARNING: Handle sensitive data carefully - never store passwords locally
}
