import 'package:flutter/material.dart';
import '../services/api_service.dart';
import '../services/notification_service.dart';

class BillProvider with ChangeNotifier {
  List<dynamic> _bills = [];
  Map<String, dynamic>? _dashboardData;
  Map<String, dynamic>? _createData;
  bool _isLoading = false;
  String? _error;
  
  List<dynamic> get bills => _bills;
  Map<String, dynamic>? get dashboardData => _dashboardData;
  Map<String, dynamic>? get createData => _createData;
  bool get isLoading => _isLoading;
  String? get error => _error;
  
  Future<void> loadDashboardData() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      _dashboardData = await ApiService.getDashboardData();
      _isLoading = false;
      notifyListeners();
      
      // Check for due bills and send notifications
      if (_dashboardData != null && _dashboardData!['bills'] != null) {
        await NotificationService().checkDueBills(
          List<Map<String, dynamic>>.from(_dashboardData!['bills'])
        );
      }
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }
  
  Future<void> loadBills() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      _bills = await ApiService.getBills();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }
  
  Future<void> loadCreateData() async {
    try {
      _createData = await ApiService.getCreateData();
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }
  
  Future<bool> createBill(Map<String, dynamic> billData) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      await ApiService.createBill(billData);
      await loadBills();
      await loadDashboardData();
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
  
  Future<bool> updateBill(int id, Map<String, dynamic> billData) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      await ApiService.updateBill(id, billData);
      await loadBills();
      await loadDashboardData();
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }
  
  Future<bool> deleteBill(int id) async {
    try {
      await ApiService.deleteBill(id);
      await loadBills();
      await loadDashboardData();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }
  
  Future<bool> uploadProof(int billId, String imagePath) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      await ApiService.uploadProof(billId, imagePath);
      await loadBills();
      await loadDashboardData();
      _isLoading = false;
      notifyListeners();
      return true;
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
      return false;
    }
  }
  
  void clearError() {
    _error = null;
    notifyListeners();
  }
}
