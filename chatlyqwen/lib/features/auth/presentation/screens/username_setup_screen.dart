/// @file lib/features/auth/presentation/screens/username_setup_screen.dart
/// @brief Username setup screen for new users
/// @author Chatly Development Team
/// @date 2025-12-08
///
/// This file implements the username setup screen where new users can choose
/// their unique @username. It includes real-time username availability checking,
/// validation rules, and suggestions for available usernames. The screen ensures
/// usernames meet the required criteria before proceeding to the main app.

import 'dart:async';
import 'package:chatly/core/constants/route_constants.dart';
import 'package:chatly/core/providers/auth_provider.dart';
import 'package:chatly/core/utils/handlers/toast_handler.dart';
import 'package:chatly/core/widgets/common/custom_button.dart';
import 'package:chatly/core/widgets/common/custom_textfield.dart';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

class UsernameSetupScreen extends StatefulWidget {
  const UsernameSetupScreen({super.key});

  @override
  State<UsernameSetupScreen> createState() => _UsernameSetupScreenState();
}

class _UsernameSetupScreenState extends State<UsernameSetupScreen> {
  final _usernameController = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  bool _isAvailable = false;
  bool _isChecking = false;
  String? _errorMessage;
  Timer? _debounceTimer;

  @override
  void dispose() {
    _usernameController.dispose();
    _debounceTimer?.cancel();
    super.dispose();
  }

  Future<void> _checkUsernameAvailability(String username) async {
    if (username.isEmpty || username.length < 3) {
      setState(() {
        _isAvailable = false;
        _isChecking = false;
      });
      return;
    }

    setState(() {
      _isChecking = true;
    });

    try {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      final available = await authProvider.isUsernameAvailable(username);
      
      setState(() {
        _isAvailable = available;
        _isChecking = false;
        _errorMessage = available ? null : 'Username is already taken';
      });
    } catch (e) {
      setState(() {
        _isChecking = false;
        _errorMessage = 'Error checking availability';
      });
    }
  }

  void _onUsernameChanged(String value) {
    _debounceTimer?.cancel();
    
    if (value.isEmpty) {
      setState(() {
        _isAvailable = false;
        _isChecking = false;
        _errorMessage = null;
      });
      return;
    }

    _debounceTimer = Timer(const Duration(milliseconds: 500), () {
      _checkUsernameAvailability(value.trim());
    });
  }

  Future<void> _handleSubmit() async {
    if (!_formKey.currentState!.validate()) return;
    
    final username = _usernameController.text.trim();
    if (!_isAvailable) {
      ToastHandler.showError(context, 'Please choose an available username');
      return;
    }

    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    
    try {
      // Update user profile with username
      final updatedProfile = authProvider.userProfile!.copyWith(
        username: username,
      );
      
      final success = await authProvider.updateUserProfile(updatedProfile);
      
      if (success) {
        Navigator.pushReplacementNamed(context, RouteConstants.home);
      } else {
        ToastHandler.showError(context, 'Failed to set username');
      }
    } catch (e) {
      ToastHandler.showError(context, 'Error setting username: ${e.toString()}');
    }
  }

  List<String> _getUsernameSuggestions() {
    final baseUsername = _usernameController.text.trim();
    if (baseUsername.isEmpty) return [];
    
    return [
      '${baseUsername}_chat',
      '${baseUsername}_user',
      '${baseUsername}_${DateTime.now().year}',
      '${baseUsername}2025',
      '${baseUsername}official',
    ];
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
                  'Choose Your Username',
                  style: theme.textTheme.displayMedium!.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  'This will be how others find you on Chatly',
                  style: theme.textTheme.bodyLarge,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 24),
                
                // Username input with @ prefix
                CustomTextField(
                  controller: _usernameController,
                  label: 'Username',
                  prefixText: '@',
                  maxLength: 20,
                  onChanged: _onUsernameChanged,
                  validator: (value) {
                    if (value == null || value.isEmpty) {
                      return 'Username cannot be empty';
                    }
                    if (value.length < 3) {
                      return 'Username must be at least 3 characters';
                    }
                    if (!RegExp(r'^[a-zA-Z0-9_]+$').hasMatch(value)) {
                      return 'Username can only contain letters, numbers, and underscores';
                    }
                    if (!_isAvailable && !_isChecking) {
                      return 'Username is not available';
                    }
                    return null;
                  },
                  suffixIcon: _isChecking 
                    ? const CircularProgressIndicator(strokeWidth: 2)
                    : (_isAvailable && !_isChecking
                        ? Icon(Icons.check_circle, color: Colors.green)
                        : (_usernameController.text.isNotEmpty && !_isChecking
                            ? Icon(Icons.cancel, color: Colors.red)
                            : null)),
                ),
                const SizedBox(height: 8),
                
                // Username availability message
                if (_errorMessage != null)
                  Text(
                    _errorMessage!,
                    style: theme.textTheme.bodyMedium!.copyWith(
                      color: _isAvailable ? Colors.green : theme.colorScheme.error,
                    ),
                  ),
                
                // Suggestions section
                if (!_isAvailable && !_isChecking && _usernameController.text.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.only(top: 16),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Suggestions:',
                          style: theme.textTheme.bodyMedium!.copyWith(
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Wrap(
                          spacing: 8,
                          runSpacing: 8,
                          children: _getUsernameSuggestions().map((suggestion) {
                            return GestureDetector(
                              onTap: () {
                                _usernameController.text = suggestion;
                                _checkUsernameAvailability(suggestion);
                              },
                              child: Container(
                                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                decoration: BoxDecoration(
                                  color: theme.primaryColor.withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(16),
                                  border: Border.all(
                                    color: theme.primaryColor,
                                    width: 1,
                                  ),
                                ),
                                child: Text(
                                  '@$suggestion',
                                  style: theme.textTheme.bodyMedium!.copyWith(
                                    color: theme.primaryColor,
                                  ),
                                ),
                              ),
                            );
                          }).toList(),
                        ),
                      ],
                    ),
                  ),
                
                const SizedBox(height: 32),
                
                // Continue button
                CustomButton(
                  text: authProvider.isLoading ? 'Setting up...' : 'Continue',
                  onPressed: authProvider.isLoading || !_isAvailable || _isChecking 
                    ? null 
                    : _handleSubmit,
                  isLoading: authProvider.isLoading,
                ),
                const SizedBox(height: 24),
                
                // Skip option (not recommended)
                TextButton(
                  onPressed: () {
                    final tempUsername = 'user_${DateTime.now().millisecondsSinceEpoch.toString().substring(8)}';
                    _usernameController.text = tempUsername;
                    _handleSubmit();
                  },
                  child: Text(
                    'Skip for now (use temporary username)',
                    style: theme.textTheme.bodyMedium!.copyWith(
                      color: theme.colorScheme.secondary,
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
