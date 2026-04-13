import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../../services/notification_service.dart';

class NotificationTestScreen extends StatefulWidget {
  const NotificationTestScreen({super.key});

  @override
  State<NotificationTestScreen> createState() => _NotificationTestScreenState();
}

class _NotificationTestScreenState extends State<NotificationTestScreen> {
  String? _fcmToken;
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadFCMToken();
  }

  Future<void> _loadFCMToken() async {
    setState(() => _isLoading = true);
    try {
      final token = await NotificationService().getFCMToken();
      setState(() {
        _fcmToken = token;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      _showMessage('Error loading FCM token: $e', isError: true);
    }
  }

  Future<void> _testLocalNotification() async {
    try {
      await NotificationService().checkDueBills([
        {
          'id': 1,
          'details': 'Test Bill - Electricity',
          'amount': 1500.00,
          'due_date': DateTime.now().toIso8601String(),
          'status': 'pending',
        }
      ]);
      _showMessage('Local notification sent! Check your notification tray.');
    } catch (e) {
      _showMessage('Error: $e', isError: true);
    }
  }

  Future<void> _testTomorrowNotification() async {
    try {
      await NotificationService().checkDueBills([
        {
          'id': 2,
          'details': 'Test Bill - Water',
          'amount': 500.00,
          'due_date': DateTime.now().add(const Duration(days: 1)).toIso8601String(),
          'status': 'pending',
        }
      ]);
      _showMessage('Tomorrow notification sent!');
    } catch (e) {
      _showMessage('Error: $e', isError: true);
    }
  }

  Future<void> _testOverdueNotification() async {
    try {
      await NotificationService().checkDueBills([
        {
          'id': 3,
          'details': 'Test Bill - Internet',
          'amount': 1200.00,
          'due_date': DateTime.now().subtract(const Duration(days: 3)).toIso8601String(),
          'status': 'pending',
        }
      ]);
      _showMessage('Overdue notification sent!');
    } catch (e) {
      _showMessage('Error: $e', isError: true);
    }
  }

  void _copyTokenToClipboard() {
    if (_fcmToken != null) {
      Clipboard.setData(ClipboardData(text: _fcmToken!));
      _showMessage('FCM Token copied to clipboard!');
    }
  }

  void _showMessage(String message, {bool isError = false}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: isError ? Colors.red : Colors.green,
        duration: const Duration(seconds: 3),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF064E3B),
      appBar: AppBar(
        backgroundColor: const Color(0xFF047857),
        title: const Text(
          'Notification Test',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
          ),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              // FCM Token Card
              Card(
                color: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(15),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.vpn_key, color: Color(0xFF047857)),
                          const SizedBox(width: 10),
                          const Text(
                            'FCM Token',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 15),
                      if (_isLoading)
                        const Center(child: CircularProgressIndicator())
                      else if (_fcmToken != null)
                        Column(
                          children: [
                            Container(
                              padding: const EdgeInsets.all(12),
                              decoration: BoxDecoration(
                                color: Colors.grey[100],
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: Text(
                                _fcmToken!,
                                style: const TextStyle(
                                  fontSize: 12,
                                  fontFamily: 'monospace',
                                ),
                              ),
                            ),
                            const SizedBox(height: 10),
                            ElevatedButton.icon(
                              onPressed: _copyTokenToClipboard,
                              icon: const Icon(Icons.copy),
                              label: const Text('Copy Token'),
                              style: ElevatedButton.styleFrom(
                                backgroundColor: const Color(0xFF047857),
                                foregroundColor: Colors.white,
                              ),
                            ),
                          ],
                        )
                      else
                        const Text('No FCM token available'),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Instructions Card
              Card(
                color: Colors.white,
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(15),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(20),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          const Icon(Icons.info_outline, color: Color(0xFF047857)),
                          const SizedBox(width: 10),
                          const Text(
                            'How to Test',
                            style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 15),
                      const Text(
                        '1. Test local notifications using buttons below\n'
                        '2. Copy FCM token and use Firebase Console to send test messages\n'
                        '3. Go to Firebase Console > Cloud Messaging > Send test message\n'
                        '4. Paste your FCM token and send',
                        style: TextStyle(fontSize: 14, height: 1.5),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 20),

              // Test Buttons
              const Text(
                'Local Notification Tests',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                ),
              ),
              const SizedBox(height: 15),

              _buildTestButton(
                icon: Icons.notifications_active,
                label: 'Test "Due Today" Notification',
                color: Colors.red,
                onPressed: _testLocalNotification,
              ),
              const SizedBox(height: 12),

              _buildTestButton(
                icon: Icons.schedule,
                label: 'Test "Due Tomorrow" Notification',
                color: Colors.orange,
                onPressed: _testTomorrowNotification,
              ),
              const SizedBox(height: 12),

              _buildTestButton(
                icon: Icons.warning,
                label: 'Test "Overdue" Notification',
                color: Colors.purple,
                onPressed: _testOverdueNotification,
              ),
              const SizedBox(height: 30),

              // Firebase Console Link
              Card(
                color: Colors.amber[100],
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(15),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(15),
                  child: Column(
                    children: [
                      const Icon(Icons.cloud, color: Colors.orange, size: 40),
                      const SizedBox(height: 10),
                      const Text(
                        'Firebase Console',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(height: 5),
                      Text(
                        'Project: billreminderapp-690ed',
                        style: TextStyle(
                          fontSize: 12,
                          color: Colors.grey[700],
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildTestButton({
    required IconData icon,
    required String label,
    required Color color,
    required VoidCallback onPressed,
  }) {
    return ElevatedButton.icon(
      onPressed: onPressed,
      icon: Icon(icon, size: 24),
      label: Text(
        label,
        style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
      ),
      style: ElevatedButton.styleFrom(
        backgroundColor: color,
        foregroundColor: Colors.white,
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
      ),
    );
  }
}
