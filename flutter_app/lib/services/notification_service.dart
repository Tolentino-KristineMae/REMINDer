import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter_local_notifications/flutter_local_notifications.dart';
import 'package:permission_handler/permission_handler.dart';
import 'dart:io';
import 'api_service.dart';

// Background message handler
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  print('Handling background message: ${message.messageId}');
}

class NotificationService {
  static final NotificationService _instance = NotificationService._internal();
  factory NotificationService() => _instance;
  NotificationService._internal();
  
  final FirebaseMessaging _firebaseMessaging = FirebaseMessaging.instance;
  final FlutterLocalNotificationsPlugin _localNotifications = FlutterLocalNotificationsPlugin();
  
  bool _initialized = false;
  
  Future<void> initialize() async {
    if (_initialized) return;
    
    // Request notification permissions
    await _requestPermissions();
    
    // Initialize local notifications
    await _initializeLocalNotifications();
    
    // Initialize Firebase Messaging
    await _initializeFirebaseMessaging();
    
    _initialized = true;
  }
  
  Future<void> _requestPermissions() async {
    if (Platform.isIOS) {
      await Permission.notification.request();
    }
    
    // Request Firebase Messaging permissions
    NotificationSettings settings = await _firebaseMessaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      provisional: false,
    );
    
    print('Notification permission status: ${settings.authorizationStatus}');
  }
  
  Future<void> _initializeLocalNotifications() async {
    const AndroidInitializationSettings androidSettings = AndroidInitializationSettings('@mipmap/ic_launcher');
    
    const DarwinInitializationSettings iosSettings = DarwinInitializationSettings(
      requestAlertPermission: true,
      requestBadgePermission: true,
      requestSoundPermission: true,
    );
    
    const InitializationSettings initSettings = InitializationSettings(
      android: androidSettings,
      iOS: iosSettings,
    );
    
    await _localNotifications.initialize(
      initSettings,
      onDidReceiveNotificationResponse: _onNotificationTapped,
    );
  }
  
  Future<void> _initializeFirebaseMessaging() async {
    // Set background message handler
    FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);
    
    // Get FCM token
    String? token = await _firebaseMessaging.getToken();
    print('FCM Token: $token');
    
    // Send token to backend
    if (token != null) {
      try {
        await ApiService.updateFCMToken(token);
        print('FCM token sent to backend successfully');
      } catch (e) {
        print('Failed to send FCM token to backend: $e');
      }
    }
    
    // Listen to token refresh
    _firebaseMessaging.onTokenRefresh.listen((newToken) async {
      print('FCM Token refreshed: $newToken');
      try {
        await ApiService.updateFCMToken(newToken);
        print('Refreshed FCM token sent to backend');
      } catch (e) {
        print('Failed to send refreshed FCM token: $e');
      }
    });
    
    // Handle foreground messages
    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);
    
    // Handle notification opened from background
    FirebaseMessaging.onMessageOpenedApp.listen(_handleNotificationOpened);
    
    // Check if app was opened from a terminated state
    RemoteMessage? initialMessage = await _firebaseMessaging.getInitialMessage();
    if (initialMessage != null) {
      _handleNotificationOpened(initialMessage);
    }
  }
  
  void _handleForegroundMessage(RemoteMessage message) {
    print('Foreground message received: ${message.notification?.title}');
    
    // Show local notification when app is in foreground
    if (message.notification != null) {
      _showLocalNotification(
        title: message.notification!.title ?? 'REMINDer',
        body: message.notification!.body ?? '',
        payload: message.data.toString(),
      );
    }
  }
  
  void _handleNotificationOpened(RemoteMessage message) {
    print('Notification opened: ${message.data}');
    // TODO: Navigate to specific screen based on notification data
  }
  
  void _onNotificationTapped(NotificationResponse response) {
    print('Notification tapped: ${response.payload}');
    // TODO: Handle notification tap
  }
  
  Future<void> _showLocalNotification({
    required String title,
    required String body,
    String? payload,
  }) async {
    const AndroidNotificationDetails androidDetails = AndroidNotificationDetails(
      'bill_reminders',
      'Bill Reminders',
      channelDescription: 'Notifications for bill due dates',
      importance: Importance.high,
      priority: Priority.high,
      showWhen: true,
      icon: '@mipmap/ic_launcher',
    );
    
    const DarwinNotificationDetails iosDetails = DarwinNotificationDetails(
      presentAlert: true,
      presentBadge: true,
      presentSound: true,
    );
    
    const NotificationDetails details = NotificationDetails(
      android: androidDetails,
      iOS: iosDetails,
    );
    
    await _localNotifications.show(
      DateTime.now().millisecondsSinceEpoch ~/ 1000,
      title,
      body,
      details,
      payload: payload,
    );
  }
  
  // Schedule a local notification for bill due date
  Future<void> scheduleBillReminder({
    required int billId,
    required String billTitle,
    required DateTime dueDate,
    required double amount,
  }) async {
    // Schedule notification 1 day before due date
    final notificationDate = dueDate.subtract(const Duration(days: 1));
    
    if (notificationDate.isAfter(DateTime.now())) {
      const AndroidNotificationDetails androidDetails = AndroidNotificationDetails(
        'bill_reminders',
        'Bill Reminders',
        channelDescription: 'Notifications for bill due dates',
        importance: Importance.high,
        priority: Priority.high,
        icon: '@mipmap/ic_launcher',
      );
      
      const DarwinNotificationDetails iosDetails = DarwinNotificationDetails(
        presentAlert: true,
        presentBadge: true,
        presentSound: true,
      );
      
      const NotificationDetails details = NotificationDetails(
        android: androidDetails,
        iOS: iosDetails,
      );
      
      // Note: For actual scheduling, you'd need to use a plugin like flutter_local_notifications
      // with timezone support or a background task scheduler
      print('Scheduled reminder for bill $billId on $notificationDate');
    }
  }
  
  // Check for bills due today or tomorrow and send notifications
  Future<void> checkDueBills(List<Map<String, dynamic>> bills) async {
    final now = DateTime.now();
    final today = DateTime(now.year, now.month, now.day);
    final tomorrow = today.add(const Duration(days: 1));
    
    for (var bill in bills) {
      if (bill['status'] == 'paid') continue;
      
      final dueDate = DateTime.parse(bill['due_date']);
      final dueDateOnly = DateTime(dueDate.year, dueDate.month, dueDate.day);
      
      String? notificationBody;
      
      if (dueDateOnly.isAtSameMomentAs(today)) {
        notificationBody = '${bill['details']} - ₱${bill['amount']} is due TODAY!';
      } else if (dueDateOnly.isAtSameMomentAs(tomorrow)) {
        notificationBody = '${bill['details']} - ₱${bill['amount']} is due TOMORROW!';
      } else if (dueDateOnly.isBefore(today)) {
        final daysOverdue = today.difference(dueDateOnly).inDays;
        notificationBody = '${bill['details']} - ₱${bill['amount']} is $daysOverdue days OVERDUE!';
      }
      
      if (notificationBody != null) {
        await _showLocalNotification(
          title: '💰 Bill Reminder',
          body: notificationBody,
          payload: 'bill_${bill['id']}',
        );
      }
    }
  }
  
  Future<String?> getFCMToken() async {
    return await _firebaseMessaging.getToken();
  }
  
  Future<void> subscribeToTopic(String topic) async {
    await _firebaseMessaging.subscribeToTopic(topic);
  }
  
  Future<void> unsubscribeFromTopic(String topic) async {
    await _firebaseMessaging.unsubscribeFromTopic(topic);
  }
}
