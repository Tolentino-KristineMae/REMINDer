import 'package:flutter/material.dart';
import 'package:flutter_sound/flutter_sound.dart';
import '../../utils/currency_formatter.dart';

class ViewPaymentScreen extends StatefulWidget {
  const ViewPaymentScreen({super.key});

  @override
  State<ViewPaymentScreen> createState() => _ViewPaymentScreenState();
}

class _ViewPaymentScreenState extends State<ViewPaymentScreen> {
  final _player = FlutterSoundPlayer();
  bool _isPlaying = false;
  bool _playerInitialized = false;
  Map<String, dynamic>? _bill;

  @override
  void initState() {
    super.initState();
    _initPlayer();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_bill == null) {
      _bill = ModalRoute.of(context)!.settings.arguments as Map<String, dynamic>?;
    }
  }

  Future<void> _initPlayer() async {
    try {
      await _player.openPlayer();
      setState(() => _playerInitialized = true);
    } catch (e) {
      print('Error initializing player: $e');
    }
  }

  @override
  void dispose() {
    _player.closePlayer();
    super.dispose();
  }

  Future<void> _playAudio(String audioUrl) async {
    if (!_playerInitialized) return;

    try {
      if (_isPlaying) {
        await _player.stopPlayer();
        setState(() => _isPlaying = false);
      } else {
        await _player.startPlayer(
          fromURI: audioUrl,
          whenFinished: () {
            setState(() => _isPlaying = false);
          },
        );
        setState(() => _isPlaying = true);
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error playing audio: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_bill == null) {
      return Scaffold(
        appBar: AppBar(title: const Text('Payment Details')),
        body: const Center(child: Text('No payment data')),
      );
    }

    final proofOfPayment = _bill!['proof_of_payments'] != null && 
                          (_bill!['proof_of_payments'] as List).isNotEmpty
        ? _bill!['proof_of_payments'][0]
        : null;

    final amount = double.tryParse(_bill!['amount']?.toString() ?? '0') ?? 0;
    final hasProof = proofOfPayment != null;
    final receiptUrl = hasProof ? proofOfPayment['file_path'] : null;
    final paymentDetails = hasProof ? proofOfPayment['details'] : null;
    final voiceNoteUrl = hasProof ? proofOfPayment['voice_record_path'] : null;
    final paidBy = hasProof ? proofOfPayment['paid_by'] : null;
    final paidDate = hasProof ? proofOfPayment['created_at'] : null;

    return Scaffold(
      backgroundColor: const Color(0xFF064E3B),
      appBar: AppBar(
        backgroundColor: const Color(0xFF047857),
        title: const Text(
          'Payment Details',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
        ),
        leading: IconButton(
          icon: const Icon(Icons.arrow_back, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Bill Summary Card
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF047857), Color(0xFF10B981)],
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                children: [
                  const Icon(Icons.check_circle, color: Colors.white, size: 48),
                  const SizedBox(height: 12),
                  Text(
                    _bill!['details']?.toString() ?? 'No details',
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                    ),
                    textAlign: TextAlign.center,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    formatCurrency(amount),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 32,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'PAID',
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 14,
                      letterSpacing: 2,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            if (!hasProof)
              Container(
                padding: const EdgeInsets.all(20),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: const Column(
                  children: [
                    Icon(Icons.info_outline, size: 48, color: Colors.grey),
                    SizedBox(height: 12),
                    Text(
                      'No payment proof available',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.bold,
                        color: Colors.grey,
                      ),
                    ),
                  ],
                ),
              )
            else ...[
              // Receipt Image
              if (receiptUrl != null)
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Padding(
                        padding: EdgeInsets.all(16),
                        child: Row(
                          children: [
                            Icon(Icons.receipt, color: Color(0xFF047857)),
                            SizedBox(width: 8),
                            Text(
                              'Receipt',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const Divider(height: 1),
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Image.network(
                            receiptUrl,
                            fit: BoxFit.cover,
                            errorBuilder: (context, error, stackTrace) {
                              return Container(
                                height: 200,
                                color: Colors.grey.shade200,
                                child: const Center(
                                  child: Column(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      Icon(Icons.broken_image, size: 48, color: Colors.grey),
                                      SizedBox(height: 8),
                                      Text('Failed to load image'),
                                    ],
                                  ),
                                ),
                              );
                            },
                            loadingBuilder: (context, child, loadingProgress) {
                              if (loadingProgress == null) return child;
                              return Container(
                                height: 200,
                                color: Colors.grey.shade200,
                                child: const Center(
                                  child: CircularProgressIndicator(),
                                ),
                              );
                            },
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              const SizedBox(height: 16),

              // Payment Details
              if (paymentDetails != null && paymentDetails.toString().isNotEmpty)
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Padding(
                        padding: EdgeInsets.all(16),
                        child: Row(
                          children: [
                            Icon(Icons.description, color: Color(0xFF047857)),
                            SizedBox(width: 8),
                            Text(
                              'Payment Details',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const Divider(height: 1),
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: Text(
                          paymentDetails.toString(),
                          style: const TextStyle(fontSize: 14),
                        ),
                      ),
                    ],
                  ),
                ),
              const SizedBox(height: 16),

              // Voice Note
              if (voiceNoteUrl != null)
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Padding(
                        padding: EdgeInsets.all(16),
                        child: Row(
                          children: [
                            Icon(Icons.mic, color: Color(0xFF047857)),
                            SizedBox(width: 8),
                            Text(
                              'Voice Note',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                          ],
                        ),
                      ),
                      const Divider(height: 1),
                      Padding(
                        padding: const EdgeInsets.all(16),
                        child: Row(
                          children: [
                            IconButton(
                              onPressed: () => _playAudio(voiceNoteUrl),
                              icon: Icon(_isPlaying ? Icons.pause_circle : Icons.play_circle),
                              color: const Color(0xFF047857),
                              iconSize: 48,
                            ),
                            const Expanded(
                              child: Text(
                                'Tap to play voice note',
                                style: TextStyle(fontSize: 14, color: Colors.grey),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              const SizedBox(height: 16),

              // Payment Info
              Container(
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                ),
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    children: [
                      if (paidBy != null)
                        _buildInfoRow('Paid By', paidBy.toString()),
                      if (paidDate != null) ...[
                        const SizedBox(height: 12),
                        _buildInfoRow('Payment Date', formatDate(DateTime.parse(paidDate.toString()))),
                      ],
                      if (_bill!['person_in_charge'] != null && _bill!['person_in_charge'] is Map) ...[
                        const SizedBox(height: 12),
                        _buildInfoRow(
                          'Person in Charge',
                          '${_bill!['person_in_charge']['first_name'] ?? ''} ${_bill!['person_in_charge']['last_name'] ?? ''}',
                        ),
                      ],
                    ],
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 14,
            color: Colors.grey,
            fontWeight: FontWeight.w500,
          ),
        ),
        Text(
          value,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.bold,
          ),
        ),
      ],
    );
  }
}
