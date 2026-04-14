import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/notification_service.dart';

class AuthProvider with ChangeNotifier {
  Map<String, dynamic>? _user;
  bool _isLoading = false;
  String? _error;
  
  Map<String, dynamic>? get user => _user;
  bool get isLoading => _isLoading;
  String? get error => _error;
  bool get isAuthenticated => _user != null;
  
  Future<bool> login(String email, String password) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final response = await ApiService.login(email, password);
      _user = response['user'];
      
      // Send FCM token to backend after successful login
      try {
        final fcmToken = await NotificationService().getFCMToken();
        if (fcmToken != null) {
          await ApiService.updateFCMToken(fcmToken);
          print('FCM token sent to backend after login');
        }
      } catch (e) {
        print('Failed to send FCM token after login: $e');
        // Don't fail login if FCM token fails
      }
      
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }
  
  Future<bool> register(Map<String, dynamic> userData) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      final response = await ApiService.register(userData);
      _user = response['user'];
      
      // Send FCM token to backend after successful registration
      try {
        final fcmToken = await NotificationService().getFCMToken();
        if (fcmToken != null) {
          await ApiService.updateFCMToken(fcmToken);
          print('FCM token sent to backend after registration');
        }
      } catch (e) {
        print('Failed to send FCM token after registration: $e');
        // Don't fail registration if FCM token fails
      }
      
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString().replaceAll('Exception: ', '');
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }
  
  Future<void> loadUser() async {
    try {
      _user = await ApiService.getUser();
      notifyListeners();
    } catch (e) {
      _user = null;
      notifyListeners();
    }
  }
  
  Future<void> logout() async {
    await ApiService.logout();
    _user = null;
    notifyListeners();
  }
  
  void clearError() {
    _error = null;
    notifyListeners();
  }
}
