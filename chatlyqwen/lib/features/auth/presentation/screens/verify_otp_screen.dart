/// @file lib/features/auth/presentation/screens/verify_otp_screen.dart
/// @brief OTP verification screen for phone authentication
/// @author Chatly Development Team
/// @date 2025-12-08
///
/// This file implements the OTP verification screen for phone number authentication.
/// It includes a 6-digit OTP input field with auto-focus functionality, countdown timer
/// for resend capability, and handles the phone verification process with Firebase.

import 'dart:async';

import 'package:chatly/core/constants/route_constants.dart';
import 'package:chatly/core/providers/auth_provider.dart';
import 'package:chatly/core/utils/handlers/toast_handler.dart';
import 'package:chatly/core/widgets/common/custom_button.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class VerifyOTPScreen extends StatefulWidget {
  const VerifyOTPScreen({super.key});

  @override
  State<VerifyOTPScreen> createState() => _VerifyOTPScreenState();
}

class _VerifyOTPScreenState extends State<VerifyOTPScreen> {
  final List<TextEditingController> _otpControllers = List.generate(6, (_) => TextEditingController());
  String _phoneNumber = '';
  int _countdown = 60;
  Timer? _timer;
  String? _errorMessage;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _startCountdown();
  }

  @override
  void dispose() {
    for (var controller in _otpControllers) {
      controller.dispose();
    }
    _timer?.cancel();
    super.dispose();
  }

  void _startCountdown() {
    _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_countdown > 0) {
        setState(() {
          _countdown--;
        });
      } else {
        timer.cancel();
      }
    });
  }

  Future<void> _handleVerifyOTP() async {
    final otp = _otpControllers.map((e) => e.text).join();
    if (otp.length != 6) {
      setState(() {
        _errorMessage = 'Please enter all 6 digits';
      });
      ToastHandler.showError(context, 'Please enter all 6 digits');
      return;
    }

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final success = await authProvider.verifyOTP(otp);
      
      if (success) {
        Navigator.pushReplacementNamed(context, RouteConstants.usernameSetup);
      } else {
        setState(() {
          _errorMessage = authProvider.errorMessage;
        });
        ToastHandler.showError(context, authProvider.errorMessage ?? 'Verification failed');
      }
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _handleResendOTP() async {
    if (_countdown > 0) return;

    setState(() {
      _isLoading = true;
      _errorMessage = null;
    });

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final success = await authProvider.startPhoneVerification(_phoneNumber);
      
      if (success) {
        setState(() {
          _countdown = 60;
        });
        _startCountdown();
        ToastHandler.showSuccess(context, 'OTP sent successfully');
      } else {
        setState(() {
          _errorMessage = authProvider.errorMessage;
        });
        ToastHandler.showError(context, authProvider.errorMessage ?? 'Failed to resend OTP');
      }
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  void _setupPhoneNumber(String phone) {
    setState(() {
      _phoneNumber = phone;
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    
    return Scaffold(
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.all(16.0),
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
                'Verify Your Phone',
                style: theme.textTheme.displayMedium!.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'We sent a 6-digit code to your phone number',
                style: theme.textTheme.bodyLarge,
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 32),
              
              // OTP Input Fields
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: List.generate(6, (index) {
                  return SizedBox(
                    width: 50,
                    child: TextField(
                      controller: _otpControllers[index],
                      keyboardType: TextInputType.number,
                      maxLength: 1,
                      textAlign: TextAlign.center,
                      style: theme.textTheme.headlineMedium!.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                      decoration: InputDecoration(
                        counterText: '',
                        filled: true,
                        fillColor: theme.cardColor,
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(12),
                          borderSide: BorderSide(
                            color: _errorMessage != null ? theme.colorScheme.error : theme.primaryColor,
                          ),
                        ),
                      ),
                      onChanged: (value) {
                        if (value.isNotEmpty && index < 5) {
                          FocusScope.of(context).nextFocus();
                        }
                      },
                      onSubmitted: (value) {
                        if (index == 5) {
                          _handleVerifyOTP();
                        }
                      },
                    ),
                  );
                }),
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
              
              const SizedBox(height: 24),
              
              // Verify button
              CustomButton(
                text: _isLoading ? 'Verifying...' : 'Verify Code',
                onPressed: _isLoading ? null : _handleVerifyOTP,
                isLoading: _isLoading,
              ),
              const SizedBox(height: 24),
              
              // Resend OTP
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text('Didn\'t receive the code? '),
                  if (_countdown > 0)
                    Text('Resend in $_countdown seconds', style: theme.textTheme.bodyMedium),
                  if (_countdown == 0)
                    TextButton(
                      onPressed: _isLoading ? null : _handleResendOTP,
                      child: Text(
                        'Resend OTP',
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
    );
  }
}
