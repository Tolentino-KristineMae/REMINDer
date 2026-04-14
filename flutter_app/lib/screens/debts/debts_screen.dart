import 'package:flutter/material.dart';
import 'package:intl/intl.dart';
import '../../services/api_service.dart';
import '../../utils/currency_formatter.dart';

class DebtsScreen extends StatefulWidget {
  const DebtsScreen({super.key});

  @override
  State<DebtsScreen> createState() => _DebtsScreenState();
}

class _DebtsScreenState extends State<DebtsScreen> {
  List<dynamic> _debts = [];
  Map<String, dynamic>? _stats;
  bool _isLoading = true;
  String _filter = 'all'; // all, pending, settled

  @override
  void initState() {
    super.initState();
    _fetchData();
  }

  Future<void> _fetchData() async {
    setState(() => _isLoading = true);
    try {
      final debts = await ApiService.getDebts();
      final stats = await ApiService.getDebtStats();
      setState(() {
        _debts = debts;
        _stats = stats;
        _isLoading = false;
      });
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error loading debts: $e')),
        );
      }
    }
  }

  List<dynamic> get _filteredDebts {
    if (_filter == 'pending') {
      return _debts.where((d) => d['status'] == 'pending').toList();
    } else if (_filter == 'settled') {
      return _debts.where((d) => d['status'] == 'settled').toList();
    }
    return _debts;
  }

  Future<void> _deleteDebt(int debtId) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Debt'),
        content: const Text('Are you sure you want to delete this debt?'),
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
        await ApiService.deleteDebt(debtId);
        await _fetchData();
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Debt deleted successfully')),
          );
        }
      } catch (e) {
        if (mounted) {
          ScaffoldMessenger.of(context).showSnackBar(
            SnackBar(content: Text('Error deleting debt: $e')),
          );
        }
      }
    }
  }

  void _navigateToAddDebt() {
    Navigator.pushNamed(context, '/add-debt').then((_) => _fetchData());
  }

  void _navigateToEditDebt(dynamic debtData) {
    final debt = debtData is Map<String, dynamic> 
        ? debtData 
        : Map<String, dynamic>.from(debtData as Map);
    Navigator.pushNamed(
      context,
      '/edit-debt',
      arguments: debt,
    ).then((_) => _fetchData());
  }

  void _navigateToSettleDebt(dynamic debtData) {
    final debt = debtData is Map<String, dynamic> 
        ? debtData 
        : Map<String, dynamic>.from(debtData as Map);
    Navigator.pushNamed(
      context,
      '/settle-debt',
      arguments: debt,
    ).then((_) => _fetchData());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF064E3B),
      appBar: AppBar(
        backgroundColor: const Color(0xFF047857),
        title: const Text(
          'Utangs (Debts)',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.add, color: Colors.white),
            onPressed: _navigateToAddDebt,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator(color: Colors.white))
          : RefreshIndicator(
              onRefresh: _fetchData,
              child: Column(
                children: [
                  // Stats Cards
                  if (_stats != null) _buildStatsCards(),
                  // Filter Tabs
                  _buildFilterTabs(),
                  // Debts List
                  Expanded(child: _buildDebtsList()),
                ],
              ),
            ),
      floatingActionButton: FloatingActionButton(
        onPressed: _navigateToAddDebt,
        backgroundColor: const Color(0xFF047857),
        child: const Icon(Icons.add, color: Colors.white),
      ),
    );
  }

  Widget _buildStatsCards() {
    final totalOwed = double.tryParse(_stats?['total_owed']?.toString() ?? '0') ?? 0.0;
    final totalLent = double.tryParse(_stats?['total_lent']?.toString() ?? '0') ?? 0.0;
    final netBalance = double.tryParse(_stats?['net_balance']?.toString() ?? '0') ?? 0.0;

    return Container(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          Row(
            children: [
              Expanded(
                child: _buildStatCard(
                  'I Owe',
                  totalOwed,
                  Colors.red,
                  Icons.arrow_upward,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _buildStatCard(
                  'Owed to Me',
                  totalLent,
                  Colors.green,
                  Icons.arrow_downward,
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),
          _buildNetBalanceCard(netBalance),
        ],
      ),
    );
  }

  Widget _buildStatCard(String label, dynamic value, Color color, IconData icon) {
    final amount = double.tryParse(value?.toString() ?? '0') ?? 0.0;
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
          Text(
            formatCurrency(amount),
            style: TextStyle(
              fontSize: 18,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              color: Colors.grey,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildNetBalanceCard(dynamic netBalance) {
    final amount = double.tryParse(netBalance?.toString() ?? '0') ?? 0.0;
    final isPositive = amount >= 0;
    
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: isPositive
              ? [const Color(0xFF047857), const Color(0xFF10B981)]
              : [const Color(0xFFDC2626), const Color(0xFFEF4444)],
        ),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text(
                'Net Balance',
                style: TextStyle(
                  color: Colors.white70,
                  fontSize: 14,
                ),
              ),
              const SizedBox(height: 4),
              Text(
                isPositive ? 'You are owed' : 'You owe',
                style: const TextStyle(
                  color: Colors.white,
                  fontSize: 12,
                ),
              ),
            ],
          ),
          Text(
            formatCurrency(amount.abs()),
            style: const TextStyle(
              color: Colors.white,
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
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
          Expanded(child: _buildFilterTab('Settled', 'settled')),
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

  Widget _buildDebtsList() {
    if (_filteredDebts.isEmpty) {
      return const Center(
        child: Text(
          'No debts found',
          style: TextStyle(color: Colors.white),
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(16),
      itemCount: _filteredDebts.length,
      itemBuilder: (context, index) {
        return _buildDebtCard(_filteredDebts[index]);
      },
    );
  }

  Widget _buildDebtCard(dynamic debtData) {
    final debt = debtData is Map<String, dynamic> ? debtData : {};
    final isSettled = debt['status'] == 'settled';
    final amount = double.tryParse(debt['amount']?.toString() ?? '0') ?? 0.0;
    final type = debt['type'] ?? 'owed'; // 'owed' or 'lent'
    final isOwed = type == 'owed';
    String dueDate = 'No due date';
    try {
      if (debt['due_date'] != null) {
        dueDate = DateFormat('MMM d, yyyy').format(DateTime.parse(debt['due_date'].toString()));
      }
    } catch (e) {
      dueDate = 'Invalid date';
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isSettled
              ? Colors.grey.shade300
              : (isOwed ? Colors.red.shade200 : Colors.green.shade200),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: isSettled
                      ? Colors.grey.shade100
                      : (isOwed ? Colors.red.shade50 : Colors.green.shade50),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(
                  isSettled
                      ? Icons.check_circle
                      : (isOwed ? Icons.arrow_upward : Icons.arrow_downward),
                  color: isSettled
                      ? Colors.grey
                      : (isOwed ? Colors.red : Colors.green),
                  size: 20,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      debt['description'] ?? 'No description',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                        decoration: isSettled ? TextDecoration.lineThrough : null,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${isOwed ? "I owe" : "Owed to me"} • Due: $dueDate',
                      style: const TextStyle(
                        fontSize: 12,
                        color: Colors.grey,
                      ),
                    ),
                  ],
                ),
              ),
              if (!isSettled)
                PopupMenuButton(
                  itemBuilder: (context) => [
                    const PopupMenuItem(
                      value: 'edit',
                      child: Row(
                        children: [
                          Icon(Icons.edit, size: 18),
                          SizedBox(width: 8),
                          Text('Edit'),
                        ],
                      ),
                    ),
                    const PopupMenuItem(
                      value: 'settle',
                      child: Row(
                        children: [
                          Icon(Icons.check, size: 18),
                          SizedBox(width: 8),
                          Text('Settle'),
                        ],
                      ),
                    ),
                    const PopupMenuItem(
                      value: 'delete',
                      child: Row(
                        children: [
                          Icon(Icons.delete, size: 18, color: Colors.red),
                          SizedBox(width: 8),
                          Text('Delete', style: TextStyle(color: Colors.red)),
                        ],
                      ),
                    ),
                  ],
                  onSelected: (value) {
                    if (value == 'edit') {
                      _navigateToEditDebt(debt);
                    } else if (value == 'settle') {
                      _navigateToSettleDebt(debt);
                    } else if (value == 'delete') {
                      _deleteDebt(debt['id']);
                    }
                  },
                ),
            ],
          ),
          const Divider(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              if (debt['person'] != null && debt['person'].toString().isNotEmpty)
                Text(
                  debt['person'].toString(),
                  style: const TextStyle(fontSize: 12, color: Colors.grey),
                )
              else
                const SizedBox(),
              Text(
                formatCurrency(amount),
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.bold,
                  color: isSettled
                      ? Colors.grey
                      : (isOwed ? Colors.red.shade700 : Colors.green.shade700),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
