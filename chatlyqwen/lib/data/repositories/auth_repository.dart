/// @file lib/data/repositories/auth_repository.dart
/// @brief Authentication repository handling user authentication and profile management
/// @author Chatly Development Team
/// @date 2025-12-08
///
/// This file implements the AuthRepository class that handles all authentication
/// operations including sign-in, sign-up, phone verification, user profile management,
/// and session handling. It abstracts Firebase Authentication and Firestore operations
/// behind a clean interface for the business logic layer.

import 'package:chatly/core/constants/app_constants.dart';
import 'package:chatly/core/errors/exceptions.dart';
import 'package:chatly/data/datasources/firebase_datasource.dart';
import 'package:chatly/data/models/user_model.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';

class AuthRepository {
  final FirebaseDatasource _firebaseDataSource = FirebaseDatasource();
  final FirebaseAuth _auth = FirebaseAuth.instance;
  
  /// Sign in with email and password
  Future<UserCredential> signInWithEmail(String email, String password) async {
    try {
      return await _auth.signInWithEmailAndPassword(
        email: email.trim(),
        password: password,
      );
    } on FirebaseAuthException catch (e) {
      throw _handleFirebaseAuthException(e);
    } catch (e) {
      throw ChatlyException('Failed to sign in: ${e.toString()}');
    }
  }
  
  /// Sign up with email and password
  Future<UserCredential> signUpWithEmail(String email, String password) async {
    try {
      return await _auth.createUserWithEmailAndPassword(
        email: email.trim(),
        password: password,
      );
    } on FirebaseAuthException catch (e) {
      throw _handleFirebaseAuthException(e);
    } catch (e) {
      throw ChatlyException('Failed to create account: ${e.toString()}');
    }
  }
  
  /// Start phone verification
  Future<String> startPhoneVerification(String phoneNumber) async {
    try {
      await _auth.verifyPhoneNumber(
        phoneNumber: phoneNumber.trim(),
        verificationCompleted: (PhoneAuthCredential credential) async {
          await _auth.signInWithCredential(credential);
        },
        verificationFailed: (FirebaseAuthException e) {
          throw _handleFirebaseAuthException(e);
        },
        codeSent: (String verificationId, int? resendToken) {
          // Store verification ID for later use
        },
        codeAutoRetrievalTimeout: (String verificationId) {},
        timeout: AppConstants.networkTimeout,
      );
      
      // In a real app, we'd store the verification ID from codeSent callback
      return 'verification_id_${DateTime.now().millisecondsSinceEpoch}';
    } on FirebaseAuthException catch (e) {
      throw _handleFirebaseAuthException(e);
    } catch (e) {
      throw ChatlyException('Failed to send verification code: ${e.toString()}');
    }
  }
  
  /// Verify OTP code
  Future<UserCredential> verifyOTP(String verificationId, String otp) async {
    try {
      final credential = PhoneAuthProvider.credential(
        verificationId: verificationId,
        smsCode: otp.trim(),
      );
      return await _auth.signInWithCredential(credential);
    } on FirebaseAuthException catch (e) {
      throw _handleFirebaseAuthException(e);
    } catch (e) {
      throw ChatlyException('Invalid verification code: ${e.toString()}');
    }
  }
  
  /// Sign out current user
  Future<void> signOut() async {
    try {
      await _auth.signOut();
    } on FirebaseAuthException catch (e) {
      throw _handleFirebaseAuthException(e);
    } catch (e) {
      throw ChatlyException('Failed to sign out: ${e.toString()}');
    }
  }
  
  /// Get user profile by UID
  Future<UserModel?> getUserProfile(String uid) async {
    try {
      final userDoc = await _firebaseDataSource.getUserDocument(uid);
      if (userDoc.exists) {
        return UserModel.fromFirestore(userDoc);
      }
      return null;
    } catch (e) {
      throw ChatlyException('Failed to load user profile: ${e.toString()}');
    }
  }
  
  /// Create user profile
  Future<void> createUserProfile(UserModel userModel) async {
    try {
      final errors = userModel.validate();
      if (errors.isNotEmpty) {
        throw ValidationException(errors.join(', '));
      }
      
      await _firebaseDataSource.createUserDocument(userModel);
    } catch (e) {
      if (e is FirebaseException && e.code == 'permission-denied') {
        throw PermissionException('Insufficient permissions to create profile');
      }
      throw ChatlyException('Failed to create user profile: ${e.toString()}');
    }
  }
  
  /// Update user profile
  Future<void> updateUserProfile(UserModel updatedProfile) async {
    try {
      final errors = updatedProfile.validate();
      if (errors.isNotEmpty) {
        throw ValidationException(errors.join(', '));
      }
      
      await _firebaseDataSource.updateUserDocument(updatedProfile);
    } catch (e) {
      if (e is FirebaseException && e.code == 'permission-denied') {
        throw PermissionException('Insufficient permissions to update profile');
      }
      throw ChatlyException('Failed to update user profile: ${e.toString()}');
    }
  }
  
  /// Set username for user
  Future<void> setUsername(String uid, String username) async {
    try {
      if (username.isEmpty || username.length < 3) {
        throw ValidationException('Username must be at least 3 characters long');
      }
      
      if (!username.contains(RegExp(r'^[a-zA-Z0-9_]+$'))) {
        throw ValidationException('Username can only contain letters, numbers, and underscores');
      }
      
      await _firebaseDataSource.setUsername(uid, username);
    } catch (e) {
      if (e is FirebaseException && e.code == 'permission-denied') {
        throw PermissionException('Insufficient permissions to set username');
      }
      throw ChatlyException('Failed to set username: ${e.toString()}');
    }
  }
  
  /// Check if username is available
  Future<bool> isUsernameAvailable(String username) async {
    try {
      return await _firebaseDataSource.isUsernameAvailable(username);
    } catch (e) {
      throw ChatlyException('Failed to check username availability: ${e.toString()}');
    }
  }
  
  /// Update last seen timestamp
  Future<void> updateLastSeen(String uid) async {
    try {
      await _firebaseDataSource.updateLastSeen(uid);
    } catch (e) {
      // Don't throw exception for this operation - it's not critical
      // if (FirebaseCore.instance.options.logLevel == Level.debug) {
      //   print('Warning: Failed to update last seen timestamp: ${e.toString()}');
      // }
    }
  }
  
  /// Handle Firebase auth exceptions and convert to meaningful errors
  ChatlyException _handleFirebaseAuthException(FirebaseAuthException e) {
    switch (e.code) {
      case 'wrong-password':
      case 'invalid-password':
        return AuthenticationException('Incorrect password');
      case 'user-not-found':
        return AuthenticationException('No account found with this email');
      case 'email-already-in-use':
        return AuthenticationException('Email already in use');
      case 'invalid-email':
        return ValidationException('Invalid email address');
      case 'weak-password':
        return ValidationException('Password must be at least 8 characters long');
      case 'user-disabled':
        return AuthenticationException('Account has been disabled');
      case 'too-many-requests':
        return RateLimitException('Too many attempts. Please try again later');
      case 'operation-not-allowed':
        return PermissionException('This sign-in method is disabled');
      case 'invalid-verification-code':
        return AuthenticationException('Invalid verification code');
      case 'invalid-verification-id':
        return AuthenticationException('Verification session expired');
      case 'session-expired':
        return AuthenticationException('Session expired. Please sign in again');
      case 'network-request-failed':
        return NetworkException('Network error. Please check your connection');
      default:
        return ChatlyException('Authentication failed: ${e.message}');
    }
  }
  
  /// Reset password for user
  Future<void> resetPassword(String email) async {
    try {
      await _auth.sendPasswordResetEmail(email: email.trim());
    } on FirebaseAuthException catch (e) {
      throw _handleFirebaseAuthException(e);
    } catch (e) {
      throw ChatlyException('Failed to send password reset: ${e.toString()}');
    }
  }
  
  /// Delete user account
  Future<void> deleteUserAccount(String uid) async {
    try {
      // First delete user from Firestore
      await _firebaseDataSource.deleteUserDocument(uid);
      
      // Then delete Firebase Auth user
      if (_auth.currentUser?.uid == uid) {
        await _auth.currentUser?.delete();
      }
    } on FirebaseAuthException catch (e) {
      throw _handleFirebaseAuthException(e);
    } catch (e) {
      throw ChatlyException('Failed to delete account: ${e.toString()}');
    }
  }
  
  /// Check if user exists by email
  Future<bool> userExistsByEmail(String email) async {
    try {
      final user = await _auth.fetchSignInMethodsForEmail(email.trim());
      return user.isNotEmpty;
    } on FirebaseAuthException catch (e) {
      throw _handleFirebaseAuthException(e);
    } catch (e) {
      throw ChatlyException('Failed to check user existence: ${e.toString()}');
    }
  }
  
  /// Get current user
  User? getCurrentUser() {
    return _auth.currentUser;
  }
  
  /// Refresh user token
  Future<void> refreshUserToken() async {
    try {
      await _auth.currentUser?.getIdToken(true);
    } on FirebaseAuthException catch (e) {
      throw _handleFirebaseAuthException(e);
    } catch (e) {
      throw ChatlyException('Failed to refresh token: ${e.toString()}');
    }
  }
  
  /// TODO: Implement rate limiting for authentication attempts
  /// TODO: Add multi-factor authentication support
  /// WARNING: Handle sensitive authentication data carefully - never log passwords
}
