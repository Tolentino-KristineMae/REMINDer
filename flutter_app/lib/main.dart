import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:google_fonts/google_fonts.dart';

import 'firebase_options.dart';
import 'providers/auth_provider.dart';
import 'providers/bill_provider.dart';
import 'providers/debt_provider.dart';
import 'providers/notification_provider.dart';
import 'screens/splash_screen.dart';
import 'screens/auth/login_screen.dart';
import 'screens/auth/signup_screen.dart';
import 'screens/dashboard/dashboard_screen.dart';
import 'screens/bills/add_bill_screen.dart';
import 'screens/bills/edit_bill_screen.dart';
import 'screens/bills/settle_bill_screen.dart';
import 'screens/bills/view_payment_screen.dart';
import 'screens/debts/debts_screen.dart';
import 'screens/debts/add_debt_screen.dart';
import 'screens/debts/edit_debt_screen.dart';
import 'screens/debts/settle_debt_screen.dart';
import 'screens/calendar/calendar_screen.dart';
import 'screens/settlements/settlements_screen.dart';
import 'screens/management/management_screen.dart';
import 'screens/test/notification_test_screen.dart';
import 'services/notification_service.dart';
import 'utils/theme.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  try {
    // Initialize Firebase with options
    await Firebase.initializeApp(
      options: DefaultFirebaseOptions.currentPlatform,
    );
    
    // Initialize Notification Service
    await NotificationService().initialize();
  } catch (e) {
    print('Initialization error: $e');
  }
  
  // Set system UI overlay style
  SystemChrome.setSystemUIOverlayStyle(
    const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.dark,
    ),
  );
  
  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => BillProvider()),
        ChangeNotifierProvider(create: (_) => DebtProvider()),
        ChangeNotifierProvider(create: (_) => NotificationProvider()),
      ],
      child: MaterialApp(
        title: 'REMINDer',
        debugShowCheckedModeBanner: false,
        theme: ThemeData(
          useMaterial3: true,
          colorScheme: ColorScheme.fromSeed(
            seedColor: const Color(0xFF047857), // Green-700
            brightness: Brightness.light,
          ),
          textTheme: GoogleFonts.dmSansTextTheme(),
          scaffoldBackgroundColor: const Color(0xFFF8FAFC),
          // Add page transitions to prevent black screen
          pageTransitionsTheme: const PageTransitionsTheme(
            builders: {
              TargetPlatform.android: CupertinoPageTransitionsBuilder(),
              TargetPlatform.iOS: CupertinoPageTransitionsBuilder(),
            },
          ),
        ),
        initialRoute: '/',
        routes: {
          '/': (context) => const SplashScreen(),
          '/login': (context) => const LoginScreen(),
          '/signup': (context) => const SignupScreen(),
          '/dashboard': (context) => const DashboardScreen(),
          '/add-bill': (context) => const AddBillScreen(),
          '/edit-bill': (context) => const EditBillScreen(),
          '/settle-bill': (context) => const SettleBillScreen(),
          '/view-payment': (context) => const ViewPaymentScreen(),
          '/debts': (context) => const DebtsScreen(),
          '/add-debt': (context) => const AddDebtScreen(),
          '/edit-debt': (context) => const EditDebtScreen(),
          '/settle-debt': (context) => const SettleDebtScreen(),
          '/calendar': (context) => const CalendarScreen(),
          '/settlements': (context) => const SettlementsScreen(),
          '/management': (context) => const ManagementScreen(),
          '/notification-test': (context) => const NotificationTestScreen(),
        },
      ),
    );
  }
}
