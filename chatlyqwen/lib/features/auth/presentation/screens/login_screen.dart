/// @file lib/features/auth/presentation/screens/login_screen.dart
/// @brief Login screen with email/password and phone authentication options
/// @author Chatly Development Team
/// @date 2025-12-08
///
/// This file implements the login screen with multiple authentication options
/// including email/password and phone OTP authentication. It includes form
/// validation, error handling, and navigation to other authentication screens.

import 'package:chatly/core/constants/route_constants.dart';
import 'package:chatly/core/providers/auth_provider.dart';
import 'package:chatly/core/utils/handlers/toast_handler.dart';
import 'package:chatly/core/widgets/common/custom_button.dart';
import 'package:chatly/core/widgets/common/custom_textfield.dart';
import 'package:chatly/features/auth/presentation/widgets/social_auth_buttons.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  String? _errorMessage;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!_formKey.currentState!.validate()) return;

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    final success = await authProvider.signInWithEmail(
      _emailController.text.trim(),
      _passwordController.text.trim(),
    );

    if (success) {
      Navigator.pushReplacementNamed(context, RouteConstants.home);
    } else {
      setState(() {
        _errorMessage = authProvider.errorMessage;
      });
      ToastHandler.showError(context, authProvider.errorMessage ?? 'Login failed');
    }
  }

  void _handleForgotPassword() {
    Navigator.pushNamed(context, RouteConstants.forgotPassword);
  }

  void _handleSignUp() {
    Navigator.pushNamed(context, RouteConstants.signup);
  }

  void _handlePhoneLogin() {
    Navigator.pushNamed(context, RouteConstants.verifyOTP);
  }

  void _handleGoogleLogin() {
    // TODO: Implement Google login
    ToastHandler.showInfo(context, 'Google login coming soon');
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final authProvider = Provider.of<AuthProvider>(context);

    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
          child: Form(
            key: _formKey,
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                // Logo and title
                Column(
                  children: [
                    Icon(Icons.chat, size: 64, color: theme.primaryColor),
                    const SizedBox(height: 8),
                    Text(
                      'Chatly',
                      style: theme.textTheme.displayMedium!.copyWith(
                        color: theme.primaryColor,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Text(
                      'Private & Smart',
                      style: theme.textTheme.bodyLarge!.copyWith(
                        color: theme.colorScheme.secondary,
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 40),

                // Email field
                CustomTextField(
                  controller: _emailController,
                  labelText: 'Email',
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
                  prefixIcon: const Icon(Icons.email),
                ),
                const SizedBox(height: 16),

                // Password field
                CustomTextField(
                  controller: _passwordController,
                  labelText: 'Password',
                  obscureText: _obscurePassword,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Password is required';
                    }
                    if (value.length < 8) {
                      return 'Password must be at least 8 characters';
                    }
                    return null;
                  },
                  prefixIcon: const Icon(Icons.lock),
                  suffixIcon: IconButton(
                    icon: Icon(_obscurePassword ? Icons.visibility_off : Icons.visibility),
                    onPressed: () {
                      setState(() {
                        _obscurePassword = !_obscurePassword;
                      });
                    },
                  ),
                ),
                const SizedBox(height: 8),

                // Forgot password
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: _handleForgotPassword,
                    child: Text(
                      'Forgot Password?',
                      style: theme.textTheme.bodyMedium!.copyWith(
                        color: theme.primaryColor,
                      ),
                    ),
                  ),
                ),

                // Error message
                if (_errorMessage != null)
                  Padding(
                    padding: const EdgeInsets.only(top: 8, bottom: 16),
                    child: Text(
                      _errorMessage!,
                      style: theme.textTheme.bodyMedium!.copyWith(
                        color: theme.colorScheme.error,
                      ),
                      textAlign: TextAlign.center,
                    ),
                  ),

                // Login button
                CustomButton(
                  text: authProvider.isLoading ? 'Logging in...' : 'Log In',
                  onPressed: authProvider.isLoading ? null : _handleLogin,
                  isLoading: authProvider.isLoading,
                ),
                const SizedBox(height: 24),

                // Or continue with
                Row(
                  children: [
                    Expanded(child: Divider(color: theme.dividerColor)),
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      child: Text(
                        'Or continue with',
                        style: theme.textTheme.bodyMedium,
                      ),
                    ),
                    Expanded(child: Divider(color: theme.dividerColor)),
                  ],
                ),
                const SizedBox(height: 24),

                // Social auth buttons
                SocialAuthButtons(
                  onGoogleLogin: _handleGoogleLogin,
                  onPhoneLogin: _handlePhoneLogin,
                ),
                const SizedBox(height: 24),

                // Sign up option
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text('Don\'t have an account? '),
                    TextButton(
                      onPressed: _handleSignUp,
                      child: Text(
                        'Sign Up',
                        style: theme.textTheme.bodyMedium!.copyWith(
                          color: theme.primaryColor,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
