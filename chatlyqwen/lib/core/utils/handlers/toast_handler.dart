/// @file lib/core/utils/handlers/toast_handler.dart
/// @brief Toast notification handler for user feedback
/// @author Chatly Development Team
/// @date 2025-12-08
///
/// This file provides a centralized system for displaying toast notifications
/// throughout the application. It handles success messages, error messages,
/// warnings, and informational messages with consistent styling and behavior.

import 'package:flutter/material.dart';
import 'package:fluttertoast/fluttertoast.dart';

class ToastHandler {
  /// Show success toast
  static void showSuccess(BuildContext context, String message) {
    _showToast(
      context,
      message,
      backgroundColor: Colors.green,
      textColor: Colors.white,
      icon: Icons.check_circle,
    );
  }
  
  /// Show error toast
  static void showError(BuildContext context, String message) {
    _showToast(
      context,
      message,
      backgroundColor: Colors.red,
      textColor: Colors.white,
      icon: Icons.error,
    );
  }
  
  /// Show warning toast
  static void showWarning(BuildContext context, String message) {
    _showToast(
      context,
      message,
      backgroundColor: Colors.orange,
      textColor: Colors.white,
      icon: Icons.warning,
    );
  }
  
  /// Show info toast
  static void showInfo(BuildContext context, String message) {
    _showToast(
      context,
      message,
      backgroundColor: Colors.blue,
      textColor: Colors.white,
      icon: Icons.info,
    );
  }
  
  /// Show custom toast
  static void showCustom(
    BuildContext context,
    String message, {
    required Color backgroundColor,
    required Color textColor,
    IconData? icon,
  }) {
    _showToast(
      context,
      message,
      backgroundColor: backgroundColor,
      textColor: textColor,
      icon: icon,
    );
  }
  
  /// Internal toast implementation
  static void _showToast(
    BuildContext context,
    String message, {
    required Color backgroundColor,
    required Color textColor,
    IconData? icon,
  }) {
    Fluttertoast.showToast(
      msg: message,
      toastLength: ToastLength.LENGTH_SHORT,
      gravity: ToastGravity.BOTTOM,
      timeInSecForIosWeb: 2,
      backgroundColor: backgroundColor,
      textColor: textColor,
      fontSize: 16.0,
      webShowClose: true,
      webBgColor: backgroundColor.value.toString(),
      webPosition: 'center',
    );
  }
  
  /// Show loading toast
  static void showLoading(BuildContext context, String message) {
    Fluttertoast.showToast(
      msg: '$message\n${_getLoadingDots()}',
      toastLength: ToastLength.LENGTH_SHORT,
      gravity: ToastGravity.BOTTOM,
      timeInSecForIosWeb: 1,
      backgroundColor: Colors.grey[800]!,
      textColor: Colors.white,
      fontSize: 16.0,
    );
  }
  
  /// Hide loading toast
  static void hideLoading() {
    Fluttertoast.cancel();
  }
  
  /// Get animated loading dots
  static String _getLoadingDots() {
    final now = DateTime.now().millisecondsSinceEpoch ~/ 500;
    final dots = now % 4;
    return '.' * dots;
  }
  
  /// Show form validation error
  static void showFormError(BuildContext context, String message) {
    showError(context, message);
  }
  
  /// Show network error
  static void showNetworkError(BuildContext context) {
    showError(context, 'Network error. Please check your connection and try again.');
  }
  
  /// Show permission error
  static void showPermissionError(BuildContext context, String permissionName) {
    showError(context, 'Permission denied for $permissionName. Please enable it in settings.');
  }
  
  /// Show success with action
  static void showSuccessWithAction(
    BuildContext context,
    String message,
    String actionText,
    VoidCallback onAction,
  ) {
    final scaffoldMessenger = ScaffoldMessenger.of(context);
    
    scaffoldMessenger.showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(Icons.check_circle, color: Colors.green),
            const SizedBox(width: 8),
            Text(message, style: const TextStyle(color: Colors.white)),
          ],
        ),
        action: SnackBarAction(
          label: actionText,
          onPressed: onAction,
          textColor: Colors.white,
        ),
        backgroundColor: Colors.green,
        duration: const Duration(seconds: 3),
      ),
    );
  }
  
  /// Show error with retry action
  static void showErrorWithRetry(
    BuildContext context,
    String message,
    VoidCallback onRetry,
  ) {
    final scaffoldMessenger = ScaffoldMessenger.of(context);
    
    scaffoldMessenger.showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(Icons.error, color: Colors.red),
            const SizedBox(width: 8),
            Text(message, style: const TextStyle(color: Colors.white)),
          ],
        ),
        action: SnackBarAction(
          label: 'Retry',
          onPressed: onRetry,
          textColor: Colors.white,
        ),
        backgroundColor: Colors.red,
        duration: const Duration(seconds: 5),
      ),
    );
  }
  
  /// TODO: Implement toast queue system to prevent overlapping toasts
  /// TODO: Add toast customization options (position, duration, etc.)
  /// TODO: Implement accessibility support for toast notifications
}
