import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../services/api_service.dart';
import '../../utils/currency_formatter.dart';

class SettlementsScreen extends StatefulWidget {
  const SettlementsScreen({super.key});

  @override
  State<SettlementsScreen> createState() => _SettlementsScreenState();
}

class _SettlementsScreenState extends State<SettlementsScreen> {
  List<dynamic> _bills = [];
  bool _isLoading = true;
  String _filter = 'all'; // all, pending, paid

  @override
  void initState() {
    super.initState();
    _fetchBills();
  }

  Future<void> _fetchBills() async {
    setState(() => _isLoading = true);
    try {
      final bills = await ApiService.getBills();
      setState(() {
        _bills = bills;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading bills: $e')),
        );
      }
    }
  }

  List<dynamic> get _filteredBills {
    if (_filter == 'pending') {
      return _bills.where((b) => b['status'] == 'pending').toList();
    } else if (_filter == 'paid') {
      return _bills.where((b) => b['status'] == 'paid').toList();
    }
    return _bills;
  }

  double get _totalAmount {
    return _filteredBills.fold(
      0.0,
      (sum, bill) => sum + (double.tryParse(bill['amount']?.toString() ?? '0') ?? 0),
    );
  }

  int get _pendingCount {
    return _bills.where((b) => b['status'] == 'pending').length;
  }

  int get _paidCount {
    return _bills.where((b) => b['status'] == 'paid').length;
  }

  Future<void> _deleteBill(int billId) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Bill'),
        content: const Text('Are you sure you want to delete this bill?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            style: TextButton.styleFrom(foregroundColor: Colors.red),
            child: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirm == true) {
      try {
        await ApiService.deleteBill(billId);
        await _fetchBills();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Bill deleted successfully')),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error deleting bill: $e')),
          );
        }
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF064E3B),
      appBar: AppBar(
        backgroundColor: const Color(0xFF047857),
        title: const Text(
          'Settlements',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Colors.white))
          : RefreshIndicator(
              onRefresh: _fetchBills,
              child: Column(
                children: [
                  _buildSummaryCards(),
                  _buildFilterTabs(),
                  Expanded(child: _buildBillsList()),
                ],
              ),
            ),
    );
  }

  Widget _buildSummaryCards() {
    return Container(
      padding: const EdgeInsets.all(16),
      child: Row(
        children: [
          Expanded(
            child: _buildSummaryCard('Pending', _pendingCount.toString(), Colors.red, Icons.warning),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _buildSummaryCard('Paid', _paidCount.toString(), Colors.green, Icons.check_circle),
          ),
        ],
      ),
    );
  }

  Widget _buildSummaryCard(String label, String value, Color color, IconData icon) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        children: [
          Icon(icon, color: color, size: 32),
          const SizedBox(height: 8),
          Text(value, style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: color)),
          Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey)),
        ],
      ),
    );
  }

  Widget _buildFilterTabs() {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 16),
      padding: const EdgeInsets.all(4),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Expanded(child: _buildFilterTab('All', 'all')),
          Expanded(child: _buildFilterTab('Pending', 'pending')),
          Expanded(child: _buildFilterTab('Paid', 'paid')),
        ],
      ),
    );
  }

  Widget _buildFilterTab(String label, String value) {
    final isSelected = _filter == value;
    return GestureDetector(
      onTap: () => setState(() => _filter = value),
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? const Color(0xFF047857) : Colors.transparent,
          borderRadius: BorderRadius.circular(8),
        ),
        child: Text(
          label,
          textAlign: TextAlign.center,
          style: TextStyle(
            fontWeight: FontWeight.bold,
            color: isSelected ? Colors.white : Colors.grey,
          ),
        ),
      ),
    );
  }

  Widget _buildBillsList() {
    if (_filteredBills.isEmpty) {
      return const Center(child: Text('No bills found', style: TextStyle(color: Colors.white)));
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _filteredBills.length + 1,
      itemBuilder: (context, index) {
        if (index == _filteredBills.length) {
          return _buildTotalCard();
        }
        return _buildBillCard(_filteredBills[index]);
      },
    );
  }

  Widget _buildBillCard(dynamic billData) {
    final bill = billData is Map<String, dynamic> ? billData : {};
    final isPaid = bill['status'] == 'paid';
    final amount = double.tryParse(bill['amount']?.toString() ?? '0') ?? 0;
    String dueDate = 'No date';
    try {
      if (bill['due_date'] != null) {
        dueDate = DateFormat('MMM d, yyyy').format(DateTime.parse(bill['due_date'].toString()));
      }
    } catch (e) {
      dueDate = 'Invalid date';
    }

    return GestureDetector(
      onTap: () {
        if (bill['id'] != null) {
          if (isPaid) {
            // Navigate to view payment details for paid bills
            Navigator.pushNamed(context, '/view-payment', arguments: bill);
          } else {
            // Navigate to settle bill screen for pending bills
            Navigator.pushNamed(context, '/settle-bill', arguments: bill['id']).then((_) => _fetchBills());
          }
        }
      },
      child: Container(
        margin: const EdgeInsets.only(bottom: 12),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: isPaid ? Colors.green.shade200 : Colors.red.shade200),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: isPaid ? Colors.green.shade50 : Colors.red.shade50,
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Icon(isPaid ? Icons.check_circle : Icons.warning, color: isPaid ? Colors.green : Colors.red, size: 20),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        bill['details']?.toString() ?? 'No details',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                          decoration: isPaid ? TextDecoration.lineThrough : null,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text('Due: $dueDate', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                    ],
                  ),
                ),
                if (!isPaid)
                  IconButton(
                    icon: const Icon(Icons.delete, color: Colors.red),
                    onPressed: () => _deleteBill(bill['id']),
                  ),
              ],
            ),
            const Divider(height: 24),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                if (bill['person_in_charge'] != null && bill['person_in_charge'] is Map)
                  Text(
                    'PIC: ${bill['person_in_charge']['first_name'] ?? ''} ${bill['person_in_charge']['last_name'] ?? ''}',
                    style: const TextStyle(fontSize: 12, color: Colors.grey),
                  )
                else
                  const SizedBox(),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    Text(
                      formatCurrency(amount),
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: isPaid ? Colors.green.shade700 : Colors.red.shade700,
                      ),
                    ),
                    Container(
                      margin: const EdgeInsets.only(top: 4),
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: isPaid ? Colors.blue.shade50 : Colors.green.shade50,
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        isPaid ? 'Tap to View' : 'Tap to Settle',
                        style: TextStyle(
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                          color: isPaid ? Colors.blue.shade700 : const Color(0xFF047857),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildTotalCard() {
    return Container(
      margin: const EdgeInsets.only(top: 8),
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF047857),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          const Text('Total Amount', style: TextStyle(color: Colors.white, fontSize: 16, fontWeight: FontWeight.bold)),
          Text(formatCurrency(_totalAmount), style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
        ],
      ),
    );
  }
}
