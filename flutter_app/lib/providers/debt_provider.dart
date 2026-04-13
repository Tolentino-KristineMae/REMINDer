import 'package:flutter/material.dart';
import '../services/api_service.dart';

class DebtProvider with ChangeNotifier {
  List<dynamic> _debts = [];
  Map<String, dynamic>? _stats;
  bool _isLoading = false;
  String? _error;
  
  List<dynamic> get debts => _debts;
  Map<String, dynamic>? get stats => _stats;
  bool get isLoading => _isLoading;
  String? get error => _error;
  
  Future<void> loadDebts() async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      _debts = await ApiService.getDebts();
      _isLoading = false;
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      _isLoading = false;
      notifyListeners();
    }
  }
  
  Future<void> loadStats() async {
    try {
      _stats = await ApiService.getDebtStats();
      notifyListeners();
    } catch (e) {
      _error = e.toString();
      notifyListeners();
    }
  }
  
  Future<bool> createDebt(Map<String, dynamic> debtData) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      await ApiService.createDebt(debtData);
      await loadDebts();
      await loadStats();
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
  
  Future<bool> updateDebt(int id, Map<String, dynamic> debtData) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      await ApiService.updateDebt(id, debtData);
      await loadDebts();
      await loadStats();
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
  
  Future<bool> settleDebt(int id, Map<String, dynamic> settlementData) async {
    _isLoading = true;
    _error = null;
    notifyListeners();
    
    try {
      await ApiService.settleDebt(id, settlementData);
      await loadDebts();
      await loadStats();
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
  
  Future<bool> deleteDebt(int id) async {
    try {
      await ApiService.deleteDebt(id);
      await loadDebts();
      await loadStats();
      return true;
    } catch (e) {
      _error = e.toString();
      notifyListeners();
      return false;
    }
  }
  
  void clearError() {
    _error = null;
    notifyListeners();
  }
}
