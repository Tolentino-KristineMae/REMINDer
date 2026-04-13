import 'package:flutter/material.dart';
import '../services/notification_service.dart';

class NotificationProvider with ChangeNotifier {
  String? _fcmToken;
  bool _notificationsEnabled = true;
  
  String? get fcmToken => _fcmToken;
  bool get notificationsEnabled => _notificationsEnabled;
  
  Future<void> initialize() async {
    _fcmToken = await NotificationService().getFCMToken();
    notifyListeners();
  }
  
  void toggleNotifications(bool enabled) {
    _notificationsEnabled = enabled;
    notifyListeners();
  }
  
  Future<void> subscribeToTopic(String topic) async {
    await NotificationService().subscribeToTopic(topic);
  }
  
  Future<void> unsubscribeFromTopic(String topic) async {
    await NotificationService().unsubscribeFromTopic(topic);
  }
}
