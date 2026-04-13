import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

class AppDrawer extends StatelessWidget {
  const AppDrawer({super.key});

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context);
    final user = authProvider.user;

    return Drawer(
      child: Container(
        color: const Color(0xFF064E3B),
        child: SafeArea(
          child: Column(
            children: [
              // User Profile Header
              Container(
                padding: const EdgeInsets.all(24),
                child: Column(
                  children: [
                    Container(
                      width: 80,
                      height: 80,
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(20),
                      ),
                      child: const Icon(
                        Icons.person,
                        size: 40,
                        color: Color(0xFF047857),
                      ),
                    ),
                    const SizedBox(height: 16),
                    Text(
                      '${user?['first_name'] ?? ''} ${user?['last_name'] ?? ''}',
                      style: const TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w900,
                        color: Colors.white,
                      ),
                    ),
                    Text(
                      user?['email'] ?? '',
                      style: const TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: Colors.white70,
                      ),
                    ),
                  ],
                ),
              ),
              const Divider(color: Colors.white24, height: 1),
              
              // Menu Items
              Expanded(
                child: ListView(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  children: [
                    _buildMenuItem(
                      context,
                      'Dashboard',
                      Icons.dashboard,
                      '/dashboard',
                    ),
                    _buildMenuItem(
                      context,
                      'Add Bill',
                      Icons.add_circle,
                      '/add-bill',
                    ),
                    _buildMenuItem(
                      context,
                      'Calendar',
                      Icons.calendar_today,
                      '/calendar',
                    ),
                    _buildMenuItem(
                      context,
                      'Settlements',
                      Icons.receipt_long,
                      '/settlements',
                    ),
                    _buildMenuItem(
                      context,
                      'Utangs',
                      Icons.account_balance_wallet,
                      '/debts',
                    ),
                    _buildMenuItem(
                      context,
                      'Management',
                      Icons.settings,
                      '/management',
                    ),
                  ],
                ),
              ),
              
              const Divider(color: Colors.white24, height: 1),
              
              // Logout Button
              ListTile(
                leading: const Icon(Icons.logout, color: Colors.white),
                title: const Text(
                  'Logout',
                  style: TextStyle(
                    color: Colors.white,
                    fontWeight: FontWeight.w700,
                  ),
                ),
                onTap: () async {
                  await authProvider.logout();
                  if (context.mounted) {
                    Navigator.of(context).pushReplacementNamed('/login');
                  }
                },
              ),
              const SizedBox(height: 16),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildMenuItem(BuildContext context, String title, IconData icon, String route) {
    final isActive = ModalRoute.of(context)?.settings.name == route;
    
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        color: isActive ? Colors.white.withOpacity(0.1) : Colors.transparent,
        borderRadius: BorderRadius.circular(12),
      ),
      child: ListTile(
        leading: Icon(icon, color: Colors.white),
        title: Text(
          title,
          style: TextStyle(
            color: Colors.white,
            fontWeight: isActive ? FontWeight.w900 : FontWeight.w600,
          ),
        ),
        onTap: () {
          Navigator.of(context).pop(); // Close drawer first
          if (!isActive) {
            // Use pushNamed instead of pushReplacementNamed to maintain navigation stack
            Navigator.of(context).pushNamed(route);
          }
        },
      ),
    );
  }
}
