/// @file lib/features/auth/presentation/screens/forgot_password_screen.dart
/// @brief Forgot password screen for password recovery
/// @author Chatly Development Team
/// @date 2025-12-08
///
/// This file implements the forgot password screen that allows users to reset
/// their password via email or phone number. It includes form validation,
/// error handling, and provides feedback on the password reset process.
/// The screen supports both email and phone-based password recovery.

import 'package:chatly/core/constants/route_constants.dart';
import 'package:chatly/core/providers/auth_provider.dart';
import 'package:chatly/core/utils/handlers/toast_handler.dart';
import 'package:chatly/core/widgets/common/custom_button.dart';
import 'package:chatly/core/widgets/common/custom_textfield.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class ForgotPasswordScreen extends StatefulWidget {
  const ForgotPasswordScreen({super.key});

  @override
  State<ForgotPasswordScreen> createState() => _ForgotPasswordScreenState();
}

class _ForgotPasswordScreenState extends State<ForgotPasswordScreen> {
  final _emailController = TextEditingController();
  final _phoneController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _isLoading = false;
  String? _errorMessage;
  bool _useEmail = true;

  @override
  void dispose() {
    _emailController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      
      if (_useEmail) {
        // Email password reset
        final success = await authProvider.resetPassword(_emailController.text.trim());
        if (success) {
          ToastHandler.showSuccess(
            context, 
            'Password reset email sent. Check your inbox.',
          );
          Navigator.pop(context);
        }
      } else {
        // Phone OTP for password reset
        final success = await authProvider.startPhoneVerification(_phoneController.text.trim());
        if (success) {
          ToastHandler.showSuccess(
            context,
            'OTP sent to your phone. Check your messages.',
          );
          Navigator.pushNamed(
            context, 
            RouteConstants.verifyOTP,
            arguments: {'resetPassword': true},
          );
        }
      }
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
      });
      ToastHandler.showError(context, 'Failed to send reset instructions: ${e.toString()}');
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Back button
                Align(
                  alignment: Alignment.topLeft,
                  child: IconButton(
                    icon: const Icon(Icons.arrow_back),
                    onPressed: () => Navigator.pop(context),
                  ),
                ),
                const SizedBox(height: 24),
                
                // Title and subtitle
                Text(
                  'Reset Password',
                  style: theme.textTheme.displayMedium!.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  _useEmail 
                    ? 'Enter your email address to reset your password'
                    : 'Enter your phone number to receive OTP for password reset',
                  style: theme.textTheme.bodyLarge,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
                
                // Toggle between email and phone
                SegmentedButton<String>(
                  segments: const [
                    ButtonSegment(value: 'email', label: Text('Email')),
                    ButtonSegment(value: 'phone', label: Text('Phone')),
                  ],
                  selected: {_useEmail ? 'email' : 'phone'},
                  onSelectionChanged: (Set<String> newSelection) {
                    setState(() {
                      _useEmail = newSelection.first == 'email';
                    });
                  },
                ),
                const SizedBox(height: 24),
                
                // Email field
                if (_useEmail)
                  CustomTextField(
                    controller: _emailController,
                    label: 'Email Address',
                    keyboardType: TextInputType.emailAddress,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Email is required';
                      }
                      if (!RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$').hasMatch(value)) {
                        return 'Enter a valid email address';
                      }
                      return null;
                    },
                    prefixIcon: Icons.email,
                  ),
                
                // Phone field
                if (!_useEmail)
                  CustomTextField(
                    controller: _phoneController,
                    label: 'Phone Number',
                    keyboardType: TextInputType.phone,
                    validator: (value) {
                      if (value == null || value.isEmpty) {
                        return 'Phone number is required';
                      }
                      if (value.length < 10) {
                        return 'Enter a valid phone number';
                      }
                      return null;
                    },
                    prefixIcon: Icons.phone,
                  ),
                
                const SizedBox(height: 8),
                
                // Error message
                if (_errorMessage != null)
                  Text(
                    _errorMessage!,
                    style: theme.textTheme.bodyMedium!.copyWith(
                      color: theme.colorScheme.error,
                    ),
                  ),
                
                const SizedBox(height: 32),
                
                // Reset button
                CustomButton(
                  text: _isLoading ? 'Sending reset instructions...' : 'Send Reset Instructions',
                  onPressed: _isLoading ? null : _handleSubmit,
                  isLoading: _isLoading,
                ),
                const SizedBox(height: 24),
                
                // Remembered password option
                TextButton(
                  onPressed: () => Navigator.pop(context),
                  child: Text(
                    'Remembered your password? Log in',
                    style: theme.textTheme.bodyMedium!.copyWith(
                      color: theme.primaryColor,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
