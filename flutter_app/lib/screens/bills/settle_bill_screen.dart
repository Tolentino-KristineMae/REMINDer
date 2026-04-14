import 'dart:io';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:flutter_sound/flutter_sound.dart';
import 'package:permission_handler/permission_handler.dart';
import 'package:path_provider/path_provider.dart';
import '../../services/api_service.dart';
import '../../utils/currency_formatter.dart';

class SettleBillScreen extends StatefulWidget {
  const SettleBillScreen({super.key});

  @override
  State<SettleBillScreen> createState() => _SettleBillScreenState();
}

class _SettleBillScreenState extends State<SettleBillScreen> {
  final _detailsController = TextEditingController();
  final _recorder = FlutterSoundRecorder();
  final _player = FlutterSoundPlayer();
  
  File? _imageFile;
  String? _audioPath;
  bool _isRecording = false;
  bool _isPlaying = false;
  bool _isLoading = false;
  bool _recorderInitialized = false;
  bool _playerInitialized = false;
  Map<String, dynamic>? _bill;
  int? _billId;

  @override
  void initState() {
    super.initState();
    _initRecorder();
    _initPlayer();
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (_billId == null) {
      _billId = ModalRoute.of(context)!.settings.arguments as int?;
      if (_billId != null) {
        _fetchBillDetails();
      }
    }
  }

  Future<void> _initRecorder() async {
    final status = await Permission.microphone.request();
    if (status != PermissionStatus.granted) {
      return;
    }
    
    try {
      await _recorder.openRecorder();
      setState(() => _recorderInitialized = true);
    } catch (e) {
      print('Error initializing recorder: $e');
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
    _detailsController.dispose();
    _recorder.closeRecorder();
    _player.closePlayer();
    super.dispose();
  }

  Future<void> _fetchBillDetails() async {
    // In a real app, you'd fetch bill details from the API
    // For now, we'll just use a placeholder
    setState(() {
      _bill = {
        'id': _billId,
        'details': 'Loading...',
        'amount': 0,
      };
    });
  }

  Future<void> _pickImage() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(
      source: ImageSource.gallery,
      maxWidth: 1920,
      maxHeight: 1920,
      imageQuality: 85,
    );

    if (pickedFile != null) {
      setState(() {
        _imageFile = File(pickedFile.path);
      });
    }
  }

  Future<void> _takePhoto() async {
    final picker = ImagePicker();
    final pickedFile = await picker.pickImage(
      source: ImageSource.camera,
      maxWidth: 1920,
      maxHeight: 1920,
      imageQuality: 85,
    );

    if (pickedFile != null) {
      setState(() {
        _imageFile = File(pickedFile.path);
      });
    }
  }

  Future<void> _startRecording() async {
    if (!_recorderInitialized) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Microphone not available')),
      );
      return;
    }

    try {
      final directory = await getTemporaryDirectory();
      final path = '${directory.path}/voice_note_${DateTime.now().millisecondsSinceEpoch}.aac';
      
      await _recorder.startRecorder(
        toFile: path,
        codec: Codec.aacADTS,
      );
      
      setState(() {
        _isRecording = true;
        _audioPath = path;
      });
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error starting recording: $e')),
      );
    }
  }

  Future<void> _stopRecording() async {
    try {
      await _recorder.stopRecorder();
      setState(() => _isRecording = false);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error stopping recording: $e')),
      );
    }
  }

  Future<void> _playRecording() async {
    if (_audioPath == null || !_playerInitialized) return;

    try {
      if (_isPlaying) {
        await _player.stopPlayer();
        setState(() => _isPlaying = false);
      } else {
        await _player.startPlayer(
          fromURI: _audioPath,
          whenFinished: () {
            setState(() => _isPlaying = false);
          },
        );
        setState(() => _isPlaying = true);
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error playing recording: $e')),
      );
    }
  }

  Future<void> _deleteRecording() async {
    if (_audioPath != null) {
      try {
        final file = File(_audioPath!);
        if (await file.exists()) {
          await file.delete();
        }
      } catch (e) {
        print('Error deleting recording: $e');
      }
      setState(() {
        _audioPath = null;
        _isPlaying = false;
      });
    }
  }

  Future<void> _submitSettlement() async {
    if (_imageFile == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a receipt image')),
      );
      return;
    }

    setState(() => _isLoading = true);

    try {
      await ApiService.uploadProof(
        _billId!,
        _imageFile!.path,
      );

      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Payment settled successfully!')),
        );
        Navigator.pop(context);
      }
    } catch (e) {
      setState(() => _isLoading = false);
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Error: $e')),
        );
      }
    }
  }

  void _showImageSourceDialog() {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.camera_alt, color: Color(0xFF047857)),
              title: const Text('Take Photo'),
              onTap: () {
                Navigator.pop(context);
                _takePhoto();
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library, color: Color(0xFF047857)),
              title: const Text('Choose from Gallery'),
              onTap: () {
                Navigator.pop(context);
                _pickImage();
              },
            ),
          ],
        ),
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
          'Settle Bill',
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
            // Step 1: Upload Receipt
            _buildStepCard(
              stepNumber: '1',
              title: 'Upload Receipt',
              child: Column(
                children: [
                  if (_imageFile != null)
                    Stack(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: Image.file(
                            _imageFile!,
                            height: 200,
                            width: double.infinity,
                            fit: BoxFit.cover,
                          ),
                        ),
                        Positioned(
                          top: 8,
                          right: 8,
                          child: IconButton(
                            onPressed: () => setState(() => _imageFile = null),
                            icon: const Icon(Icons.close),
                            style: IconButton.styleFrom(
                              backgroundColor: Colors.red,
                              foregroundColor: Colors.white,
                            ),
                          ),
                        ),
                      ],
                    )
                  else
                    GestureDetector(
                      onTap: _showImageSourceDialog,
                      child: Container(
                        height: 200,
                        decoration: BoxDecoration(
                          color: Colors.grey.shade100,
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: Colors.grey.shade300,
                            width: 2,
                            style: BorderStyle.solid,
                          ),
                        ),
                        child: const Column(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.cloud_upload, size: 48, color: Colors.grey),
                            SizedBox(height: 12),
                            Text(
                              'Tap to upload receipt',
                              style: TextStyle(
                                fontWeight: FontWeight.bold,
                                color: Colors.grey,
                              ),
                            ),
                            SizedBox(height: 4),
                            Text(
                              'JPEG, PNG — Max 5MB',
                              style: TextStyle(
                                fontSize: 10,
                                color: Colors.grey,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 16),

            // Step 2: Payment Details
            _buildStepCard(
              stepNumber: '2',
              title: 'Payment Details',
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  TextField(
                    controller: _detailsController,
                    maxLines: 4,
                    decoration: InputDecoration(
                      hintText: 'Type how you paid (e.g. GCash, Bank Transfer, Cash)...',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      filled: true,
                      fillColor: Colors.grey.shade50,
                    ),
                  ),
                  const SizedBox(height: 16),
                  
                  // Voice Recording Section
                  const Text(
                    'OPTIONAL: VOICE NOTE',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.bold,
                      color: Colors.grey,
                      letterSpacing: 1.2,
                    ),
                  ),
                  const SizedBox(height: 12),
                  
                  if (_audioPath == null)
                    ElevatedButton.icon(
                      onPressed: _isRecording ? _stopRecording : _startRecording,
                      icon: Icon(_isRecording ? Icons.stop : Icons.mic),
                      label: Text(_isRecording ? 'Stop Recording' : 'Add Voice Note'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: _isRecording ? Colors.red : Colors.grey.shade200,
                        foregroundColor: _isRecording ? Colors.white : Colors.black87,
                        minimumSize: const Size(double.infinity, 50),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(12),
                        ),
                      ),
                    )
                  else
                    Container(
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.green.shade50,
                        borderRadius: BorderRadius.circular(12),
                        border: Border.all(color: Colors.green.shade200),
                      ),
                      child: Row(
                        children: [
                          Container(
                            width: 40,
                            height: 40,
                            decoration: BoxDecoration(
                              color: const Color(0xFF047857),
                              borderRadius: BorderRadius.circular(8),
                            ),
                            child: const Icon(Icons.mic, color: Colors.white),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                const Text(
                                  'RECORDED VOICE NOTE',
                                  style: TextStyle(
                                    fontSize: 10,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF047857),
                                    letterSpacing: 1.2,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Row(
                                  children: [
                                    IconButton(
                                      onPressed: _playRecording,
                                      icon: Icon(_isPlaying ? Icons.pause : Icons.play_arrow),
                                      color: const Color(0xFF047857),
                                    ),
                                    const Expanded(
                                      child: Text(
                                        'Tap to play',
                                        style: TextStyle(fontSize: 12),
                                      ),
                                    ),
                                  ],
                                ),
                              ],
                            ),
                          ),
                          IconButton(
                            onPressed: _deleteRecording,
                            icon: const Icon(Icons.delete, color: Colors.red),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // Submit Button
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _submitSettlement,
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF047857),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.all(16),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _isLoading
                    ? const SizedBox(
                        height: 20,
                        width: 20,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2,
                        ),
                      )
                    : const Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Text(
                            'Finalize Settlement',
                            style: TextStyle(
                              fontSize: 16,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                          SizedBox(width: 8),
                          Icon(Icons.check_circle),
                        ],
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStepCard({
    required String stepNumber,
    required String title,
    required Widget child,
  }) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  width: 32,
                  height: 32,
                  decoration: BoxDecoration(
                    color: const Color(0xFF064E3B),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Center(
                    child: Text(
                      stepNumber,
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Text(
                  title,
                  style: const TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.bold,
                    color: Colors.grey,
                    letterSpacing: 1.2,
                  ),
                ),
              ],
            ),
          ),
          const Divider(height: 1),
          Padding(
            padding: const EdgeInsets.all(16),
            child: child,
          ),
        ],
      ),
    );
  }
}
