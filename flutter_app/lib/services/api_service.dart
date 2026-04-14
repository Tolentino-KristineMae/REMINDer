import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

class ApiService {
  // Update this to your backend URL
  // For local development (emulator): 'http://10.0.2.2:8000/api'
  // For production (Render): 'https://reminder-system-3j70.onrender.com/api'
  static const String baseUrl = 'https://reminder-system-3j70.onrender.com/api';
  
  static Future<String?> getToken() async {
    final prefs = await SharedPreferences.getInstance();
    return prefs.getString('auth_token');
  }
  
  static Future<void> saveToken(String token) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('auth_token', token);
  }
  
  static Future<void> removeToken() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('auth_token');
  }
  
  static Future<Map<String, String>> getHeaders() async {
    final token = await getToken();
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      if (token != null) 'Authorization': 'Bearer $token',
    };
  }
  
  // Auth endpoints
  static Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await http.post(
      Uri.parse('$baseUrl/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      // Backend returns 'access_token', not 'token'
      if (data['access_token'] != null) {
        await saveToken(data['access_token'].toString());
      }
      return data;
    } else {
      final errorData = jsonDecode(response.body);
      throw Exception(errorData['message'] ?? 'Login failed');
    }
  }
  
  static Future<Map<String, dynamic>> register(Map<String, dynamic> userData) async {
    final response = await http.post(
      Uri.parse('$baseUrl/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode(userData),
    );
    
    if (response.statusCode == 200 || response.statusCode == 201) {
      final data = jsonDecode(response.body);
      // Backend returns 'access_token', not 'token'
      if (data['access_token'] != null) {
        await saveToken(data['access_token'].toString());
      }
      return data;
    } else {
      final errorData = jsonDecode(response.body);
      throw Exception(errorData['message'] ?? 'Registration failed');
    }
  }
  
  static Future<void> logout() async {
    try {
      final headers = await getHeaders();
      await http.post(
        Uri.parse('$baseUrl/logout'),
        headers: headers,
      );
    } finally {
      await removeToken();
    }
  }
  
  static Future<Map<String, dynamic>> getUser() async {
    final headers = await getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/user'),
      headers: headers,
    );
    
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to get user');
    }
  }
  
  // Send FCM token to backend
  static Future<void> updateFCMToken(String fcmToken) async {
    final headers = await getHeaders();
    final response = await http.post(
      Uri.parse('$baseUrl/user/fcm-token'),
      headers: headers,
      body: jsonEncode({'token': fcmToken}),
    );
    
    if (response.statusCode != 200) {
      throw Exception('Failed to update FCM token');
    }
  }
  
  // Bills endpoints
  static Future<Map<String, dynamic>> getDashboardData() async {
    final headers = await getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/bills/dashboard'),
      headers: headers,
    );
    
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load dashboard data');
    }
  }
  
  static Future<List<dynamic>> getBills() async {
    final headers = await getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/bills'),
      headers: headers,
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      // Handle different response formats
      if (data is List) {
        return data;
      } else if (data is Map && data['bills'] != null) {
        final bills = data['bills'];
        if (bills is List) {
          return bills;
        } else if (bills is Map && bills['data'] != null) {
          return bills['data'] as List;
        }
      } else if (data is Map && data['data'] != null) {
        return data['data'] as List;
      }
      return [];
    } else {
      throw Exception('Failed to load bills');
    }
  }
  
  static Future<Map<String, dynamic>> getCreateData() async {
    final headers = await getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/bills/create-data'),
      headers: headers,
    );
    
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load form data');
    }
  }
  
  static Future<Map<String, dynamic>> createBill(Map<String, dynamic> billData) async {
    final headers = await getHeaders();
    final response = await http.post(
      Uri.parse('$baseUrl/bills'),
      headers: headers,
      body: jsonEncode(billData),
    );
    
    if (response.statusCode == 200 || response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception(jsonDecode(response.body)['message'] ?? 'Failed to create bill');
    }
  }
  
  static Future<Map<String, dynamic>> updateBill(int id, Map<String, dynamic> billData) async {
    final headers = await getHeaders();
    final response = await http.put(
      Uri.parse('$baseUrl/bills/$id'),
      headers: headers,
      body: jsonEncode(billData),
    );
    
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to update bill');
    }
  }
  
  static Future<void> deleteBill(int id) async {
    final headers = await getHeaders();
    final response = await http.delete(
      Uri.parse('$baseUrl/bills/$id'),
      headers: headers,
    );
    
    if (response.statusCode != 200 && response.statusCode != 204) {
      throw Exception('Failed to delete bill');
    }
  }
  
  static Future<Map<String, dynamic>> uploadProof(int billId, String imagePath) async {
    final headers = await getHeaders();
    headers.remove('Content-Type'); // Let multipart set its own content type
    
    final request = http.MultipartRequest(
      'POST',
      Uri.parse('$baseUrl/bills/$billId/proof'),
    );
    
    request.headers.addAll(headers);
    request.files.add(await http.MultipartFile.fromPath('proof', imagePath));
    
    final streamedResponse = await request.send();
    final response = await http.Response.fromStream(streamedResponse);
    
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to upload proof');
    }
  }
  
  // Debts endpoints
  static Future<List<dynamic>> getDebts() async {
    final headers = await getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/debts'),
      headers: headers,
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      // Handle different response formats
      if (data is List) {
        return data;
      } else if (data is Map && data['debts'] != null) {
        final debts = data['debts'];
        if (debts is List) {
          return debts;
        } else if (debts is Map && debts['data'] != null) {
          return debts['data'] as List;
        }
      } else if (data is Map && data['data'] != null) {
        return data['data'] as List;
      }
      return [];
    } else {
      throw Exception('Failed to load debts');
    }
  }
  
  static Future<Map<String, dynamic>> getDebtStats() async {
    final headers = await getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/debts/stats'),
      headers: headers,
    );
    
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to load debt stats');
    }
  }
  
  static Future<Map<String, dynamic>> createDebt(Map<String, dynamic> debtData) async {
    final headers = await getHeaders();
    final response = await http.post(
      Uri.parse('$baseUrl/debts'),
      headers: headers,
      body: jsonEncode(debtData),
    );
    
    if (response.statusCode == 200 || response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to create debt');
    }
  }
  
  static Future<Map<String, dynamic>> updateDebt(int id, Map<String, dynamic> debtData) async {
    final headers = await getHeaders();
    final response = await http.put(
      Uri.parse('$baseUrl/debts/$id'),
      headers: headers,
      body: jsonEncode(debtData),
    );
    
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to update debt');
    }
  }
  
  static Future<Map<String, dynamic>> settleDebt(int id, Map<String, dynamic> settlementData) async {
    final headers = await getHeaders();
    final response = await http.post(
      Uri.parse('$baseUrl/debts/$id/settle'),
      headers: headers,
      body: jsonEncode(settlementData),
    );
    
    if (response.statusCode == 200) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to settle debt');
    }
  }
  
  static Future<void> deleteDebt(int id) async {
    final headers = await getHeaders();
    final response = await http.delete(
      Uri.parse('$baseUrl/debts/$id'),
      headers: headers,
    );
    
    if (response.statusCode != 200 && response.statusCode != 204) {
      throw Exception('Failed to delete debt');
    }
  }
  
  // Categories endpoints
  static Future<List<dynamic>> getCategories() async {
    final headers = await getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/categories'),
      headers: headers,
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      // Handle different response formats
      if (data is List) {
        return data;
      } else if (data is Map && data['categories'] != null) {
        final categories = data['categories'];
        if (categories is List) {
          return categories;
        } else if (categories is Map && categories['data'] != null) {
          return categories['data'] as List;
        }
      } else if (data is Map && data['data'] != null) {
        return data['data'] as List;
      }
      return [];
    } else {
      throw Exception('Failed to load categories');
    }
  }
  
  static Future<Map<String, dynamic>> createCategory(Map<String, dynamic> categoryData) async {
    final headers = await getHeaders();
    final response = await http.post(
      Uri.parse('$baseUrl/categories'),
      headers: headers,
      body: jsonEncode(categoryData),
    );
    
    if (response.statusCode == 200 || response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to create category');
    }
  }
  
  // People endpoints
  static Future<List<dynamic>> getPeople() async {
    final headers = await getHeaders();
    final response = await http.get(
      Uri.parse('$baseUrl/people'),
      headers: headers,
    );
    
    if (response.statusCode == 200) {
      final data = jsonDecode(response.body);
      // Handle different response formats
      if (data is List) {
        return data;
      } else if (data is Map && data['people'] != null) {
        final people = data['people'];
        if (people is List) {
          return people;
        } else if (people is Map && people['data'] != null) {
          return people['data'] as List;
        }
      } else if (data is Map && data['data'] != null) {
        return data['data'] as List;
      }
      return [];
    } else {
      throw Exception('Failed to load people');
    }
  }
  
  static Future<Map<String, dynamic>> createPerson(Map<String, dynamic> personData) async {
    final headers = await getHeaders();
    final response = await http.post(
      Uri.parse('$baseUrl/people'),
      headers: headers,
      body: jsonEncode(personData),
    );
    
    if (response.statusCode == 200 || response.statusCode == 201) {
      return jsonDecode(response.body);
    } else {
      throw Exception('Failed to create person');
    }
  }
}
