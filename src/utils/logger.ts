export class Logger {
  static logApiRequest(endpoint: string, method: string, body?: any) {
    console.group(`🌐 API Request: ${method} ${endpoint}`);
    console.log('📤 Request Payload:', body || 'No payload');
    console.groupEnd();
  }

  static logApiResponse(endpoint: string, response: any) {
    console.group(`✅ API Response: ${endpoint}`);
    console.log('📥 Response Data:', response);
    console.groupEnd();
  }

  static logApiError(endpoint: string, error: any) {
    console.group(`❌ API Error: ${endpoint}`);
    console.error('Error Details:', error);
    console.groupEnd();
  }
}