import { getDomain } from '../config/config';
import { API_ENDPOINTS, ApiResponse } from '../config/api';
import { 
  User, 
  MergedRecord, 
  ReconciliationSummaryItem, 
  InventoryItem, 
  UnitPriceItem, 
  AliasItem, 
  ReconciliationSettings,
  ReconciliationReviewState,
  InventoryOrder,
  InventoryOrderRecord
} from '../types';
import { Logger } from '../utils/logger';

export class ApiService {
  private static async getBaseUrl(): Promise<string> {
    return await getDomain();
  }

  private static async fetchApi<T>(
    endpoint: string,
    method: 'GET' | 'POST' = 'POST',
    body?: any
  ): Promise<ApiResponse<T>> {
    const baseUrl = await this.getBaseUrl();
    const url = `${baseUrl}${endpoint}`;

    Logger.logApiRequest(endpoint, method, body);

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`API call failed with status ${response.status}: ${response.statusText || 'Unknown network error'}. Endpoint: ${endpoint}`);
      }

      const data = await response.json();
      Logger.logApiResponse(endpoint, data);

      // ✅ FIXED: Don't throw exceptions for backend error codes
      // Backend error codes like -200, -5, etc. are valid API responses
      // Only throw for actual network/parsing errors
      // Let the calling code handle the response.Code logic
      
      return data;
    } catch (error) {
      Logger.logApiError(endpoint, error);
      throw error;
    }
  }

  private static async uploadFile(endpoint: string, file: File, invSn?: string): Promise<ApiResponse<any>> {
    const baseUrl = await this.getBaseUrl();
    const url = invSn ? `${baseUrl}${endpoint}/${invSn}` : `${baseUrl}${endpoint}`;

    Logger.logApiRequest(endpoint, 'POST', { fileName: file.name, fileSize: file.size });

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`File upload failed with status ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      Logger.logApiResponse(endpoint, data);

      // ✅ FIXED: Don't throw exceptions for backend error codes
      // Let the calling code handle the response.Code logic
      return data;
    } catch (error) {
      Logger.logApiError(endpoint, error);
      throw error;
    }
  }

  private static async downloadFile(endpoint: string, requestBody: any, filename: string): Promise<void> {
    const baseUrl = await this.getBaseUrl();
    const url = `${baseUrl}${endpoint}`;

    Logger.logApiRequest(endpoint, 'POST', requestBody);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        throw new Error(`Download failed with status ${response.status}: ${response.statusText}`);
      }

      // Check if response is JSON (error) or file
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        Logger.logApiResponse(endpoint, data);
        
        // ✅ FIXED: Don't throw exceptions for backend error codes
        // Let the calling code handle the response.Code logic
        if (data.Code !== 200) {
          throw new Error(data.Result || 'Download failed');
        }
      } else {
        // Handle file download
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      Logger.logApiError(endpoint, error);
      throw error;
    }
  }

  static async login(id: string, password: string): Promise<ApiResponse<User>> {
    return this.fetchApi<User>(API_ENDPOINTS.LOGIN, 'POST', {
      Data: {
        ID: id,
        Password: password
      }
    });
  }

  // Updated method to use real API
  static async getMergedRecords(): Promise<MergedRecord[]> {
    try {
      const response = await this.fetchApi<MergedRecord[]>(API_ENDPOINTS.GET_ALL_INV, 'POST', {
        Data: {}
      });
      return response.Data || [];
    } catch (error) {
      console.error('Failed to fetch merged records from API:', error);
      return [];
    }
  }

  // Helper method to filter merged records by time range
  static filterMergedRecordsByTime(records: MergedRecord[], startTime: string, endTime: string): MergedRecord[] {
    if (!startTime || !endTime) return records;

    const startDate = new Date(startTime);
    const endDate = new Date(endTime);

    return records.filter(record => {
      if (!record.CT_TIME) return false;
      
      // Parse the CT_TIME format "2025/02/19 16:09:13"
      const recordDate = new Date(record.CT_TIME.replace(/\//g, '-'));
      return recordDate >= startDate && recordDate <= endDate;
    });
  }

  // ===== RECONCILIATION REVIEW STATE API METHODS =====
  static async checkReconciliationState(invSn: string): Promise<ApiResponse<ReconciliationReviewState[]>> {
    // ✅ FIXED: Don't handle response.Code here, let calling code handle it
    const response = await this.fetchApi<ReconciliationReviewState[]>(
      API_ENDPOINTS.CHECK_RECONCILIATION_STATE, 
      'POST', 
      {
        Value: invSn,
        Data: {}
      }
    );
    return response;
  }

  static async generateReconciliation(invSn: string): Promise<ApiResponse<any>> {
    // ✅ FIXED: Don't handle response.Code here, let calling code handle it
    const response = await this.fetchApi<any>(
      API_ENDPOINTS.GENERATE_RECONCILIATION, 
      'POST', 
      {
        Value: invSn,
        Data: {}
      }
    );
    return response;
  }

  static async generateReconciliationWithName(invSn: string, userName: string, reconciliationName: string): Promise<ApiResponse<any>> {
    // ✅ FIXED: Don't handle response.Code here, let calling code handle it
    const response = await this.fetchApi<any>(
      API_ENDPOINTS.GENERATE_RECONCILIATION, 
      'POST', 
      {
        Value: invSn,
        Data: {
          CT: userName,
          IC_NAME: reconciliationName
        }
      }
    );
    return response;
  }

  static async getReconciliationByIcSn(icSn: string): Promise<ApiResponse<any>> {
    const response = await this.fetchApi<any>(
      API_ENDPOINTS.GET_RECONCILIATION_BY_IC_SN,
      'POST',
      {
        Value: icSn
      }
    );
    return response;
  }

  // ===== LOCK INVENTORY ORDERS API METHODS =====
  static async getFullInventoryBySN(invSn: string): Promise<ApiResponse<any>> {
    const response = await this.fetchApi<any>(
      API_ENDPOINTS.GET_FULL_INV_BY_SN,
      'POST',
      {
        Value: invSn,
        Data: {}
      }
    );
    return response;
  }

  static async lockInventoryOrder(icSn: string): Promise<ApiResponse<any>> {
    const response = await this.fetchApi<any>(
      API_ENDPOINTS.LOCK_INVENTORY_ORDER,
      'POST',
      {
        Value: icSn,
        Data: {}
      }
    );
    return response;
  }

  static async unlockInventoryOrder(icSn: string): Promise<ApiResponse<any>> {
    const response = await this.fetchApi<any>(
      API_ENDPOINTS.UNLOCK_INVENTORY_ORDER,
      'POST',
      {
        Value: icSn,
        Data: {}
      }
    );
    return response;
  }

  // ===== SUMMARY AND REPORT API METHODS =====
  static async getReportBySN(invSn: string): Promise<ReconciliationSummaryItem[]> {
    try {
      const response = await this.fetchApi<any>(API_ENDPOINTS.GET_REPORT_BY_SN, 'POST', {
        Value: invSn,
        Data: {}
      });
      
      // Transform the API response to match our ReconciliationSummaryItem interface
      const data = response.Data || [];
      
      return data.map((item: any, index: number) => {
        const stock = parseFloat(item.STOCK || '0');
        const count = parseFloat(item.COUNT || '0');
        const price = parseFloat(item.PRICE || '0');
        
        return {
          index: index + 1,
          GUID: item.GUID || '',
          CODE: item.CODE || '',
          SKDIACODE: item.SKDIACODE || '',
          NAME: item.NAME || '',
          ALIAS: item.ALIAS || '',
          PRICE: price,
          STOCK: stock,
          COUNT: count,
          REVIEW: parseFloat(item.REVIEW || '0'),
          stockAmount: stock * price, // 庫存金額 = STOCK * PRICE
          finalBalance: count * price, // 結存金額 = COUNT * PRICE
          QTY: parseFloat(item.QTY || '0'),
          ERROR: parseFloat(item.ERROR || '0'),
          ERROR_MONEY: parseFloat(item.ERROR_MONEY || '0'),
          ERROR_PERCENT: parseFloat(item.ERROR_PERCENT || '0'),
          COMMENT: item.COMMENT || ''
        };
      });
    } catch (error) {
      console.error('Failed to get report from API:', error);
      return [];
    }
  }

  static async addReportBySN(invSn: string): Promise<ReconciliationSummaryItem[]> {
    try {
      const response = await this.fetchApi<any>(API_ENDPOINTS.ADD_REPORT_BY_SN, 'POST', {
        Value: invSn,
        Data: {}
      });
      
      // Transform the API response to match our ReconciliationSummaryItem interface
      const data = response.Data || [];
      
      return data.map((item: any, index: number) => {
        const stock = parseFloat(item.STOCK || '0');
        const count = parseFloat(item.COUNT || '0');
        const price = parseFloat(item.PRICE || '0');
        
        return {
          index: index + 1,
          GUID: item.GUID || '',
          CODE: item.CODE || '',
          SKDIACODE: item.SKDIACODE || '',
          NAME: item.NAME || '',
          ALIAS: item.ALIAS || '',
          PRICE: price,
          STOCK: stock,
          COUNT: count,
          REVIEW: parseFloat(item.REVIEW || '0'),
          stockAmount: stock * price, // 庫存金額 = STOCK * PRICE
          finalBalance: count * price, // 結存金額 = COUNT * PRICE
          QTY: parseFloat(item.QTY || '0'),
          ERROR: parseFloat(item.ERROR || '0'),
          ERROR_MONEY: parseFloat(item.ERROR_MONEY || '0'),
          ERROR_PERCENT: parseFloat(item.ERROR_PERCENT || '0'),
          COMMENT: item.COMMENT || ''
        };
      });
    } catch (error) {
      console.error('Failed to add report from API:', error);
      throw error;
    }
  }

  static async generateSummary(invSn: string): Promise<ReconciliationSummaryItem[]> {
    try {
      console.log({
        Value: invSn,
        Data: {}
      })
      const response = await this.fetchApi<any>(API_ENDPOINTS.GET_DETAIL_INV_BY_SN, 'POST', {
        Value: invSn,
        Data: {}
      });
      
      // Transform the API response to match our ReconciliationSummaryItem interface
      const data = response.Data || [];
      
      return data.map((item: any, index: number) => {
        const stock = parseFloat(item.STOCK || '0');
        const count = parseFloat(item.COUNT || '0');
        const price = parseFloat(item.PRICE || '0');
        
        return {
          index: index + 1,
          GUID: item.GUID || '',
          CODE: item.CODE || '',
          SKDIACODE: item.SKDIACODE || '',
          NAME: item.NAME || '',
          ALIAS: item.ALIAS || '',
          PRICE: price,
          STOCK: stock,
          COUNT: count,
          REVIEW: parseFloat(item.REVIEW || '0'),
          stockAmount: stock * price, // 庫存金額 = STOCK * PRICE
          finalBalance: count * price, // 結存金額 = COUNT * PRICE
          QTY: parseFloat(item.QTY || '0'),
          ERROR: parseFloat(item.ERROR || '0'),
          ERROR_MONEY: parseFloat(item.ERROR_MONEY || '0'),
          ERROR_PERCENT: parseFloat(item.ERROR_PERCENT || '0'),
          COMMENT: item.COMMENT || ''
        };
      });
    } catch (error) {
      console.error('Failed to generate summary from API:', error);
      throw error;
    }
  }

  static async downloadSummaryReport(invSn: string): Promise<void> {
    try {
      await this.downloadFile(
        API_ENDPOINTS.GET_FULL_INV_EXCEL_BY_SN,
        {
          Value: invSn,
          Data: {}
        },
        `summary_report_${invSn}.xlsx`
      );
    } catch (error) {
      console.error('Failed to download summary report:', error);
      throw error;
    }
  }

  // ===== INVENTORY (STOCKS) API METHODS =====
  static async getInventory(invSn: string): Promise<InventoryItem[]> {
    try {
      const response = await this.fetchApi<InventoryItem[]>(API_ENDPOINTS.GET_STOCKS_BY_SN, 'POST', {
        Value: invSn,
        Data: {}
      });
      return response.Data || [];
    } catch (error) {
      console.error('Failed to fetch inventory from API:', error);
      return [];
    }
  }

  static async updateInventory(invSn: string, items: InventoryItem[]): Promise<InventoryItem[]> {
    try {
      const response = await this.fetchApi<InventoryItem[]>(API_ENDPOINTS.ADD_STOCKS_BY_SN, 'POST', {
        Value: invSn,
        Data: items.map(item => ({
          CODE: item.CODE,
          NAME: item.NAME,
          QTY: item.QTY.toString()
        }))
      });
      return response.Data || [];
    } catch (error) {
      console.error('Failed to update inventory:', error);
      throw error;
    }
  }

  static async importInventoryExcel(invSn: string, file: File): Promise<InventoryItem[]> {
    try {
      const response = await this.uploadFile(API_ENDPOINTS.EXCEL_UPLOAD_STOCKS, file, invSn);
      return response.Data || [];
    } catch (error) {
      console.error('Failed to import inventory Excel:', error);
      throw error;
    }
  }

  static async exportInventory(invSn: string, data: InventoryItem[]): Promise<void> {
    try {
      const exportData = data.map(item => ({
        CODE: item.CODE,
        NAME: item.NAME,
        QTY: item.QTY.toString()
      }));

      await this.downloadFile(
        API_ENDPOINTS.DOWNLOAD_EXCEL_STOCK,
        {
          Value: invSn,
          Data: exportData
        },
        `inventory_${invSn}.xlsx`
      );
    } catch (error) {
      console.error('Failed to export inventory:', error);
      throw error;
    }
  }

  // ===== UNIT PRICE (MEDPRICES) API METHODS =====
  static async getUnitPrices(invSn: string): Promise<UnitPriceItem[]> {
    try {
      const response = await this.fetchApi<UnitPriceItem[]>(API_ENDPOINTS.GET_MEDPRICES_BY_SN, 'POST', {
        Value: invSn,
        Data: {}
      });
      return response.Data || [];
    } catch (error) {
      console.error('Failed to fetch unit prices from API:', error);
      return [];
    }
  }

  static async updateUnitPrices(invSn: string, items: UnitPriceItem[]): Promise<UnitPriceItem[]> {
    try {
      const response = await this.fetchApi<UnitPriceItem[]>(API_ENDPOINTS.ADD_MEDPRICES_BY_SN, 'POST', {
        Value: invSn,
        Data: items.map(item => ({
          CODE: item.CODE,
          NAME: item.NAME,
          price: item.price.toString()
        }))
      });
      return response.Data || [];
    } catch (error) {
      console.error('Failed to update unit prices:', error);
      throw error;
    }
  }

  static async importUnitPricesExcel(invSn: string, file: File): Promise<UnitPriceItem[]> {
    try {
      const response = await this.uploadFile(API_ENDPOINTS.EXCEL_UPLOAD_MEDPRICES, file, invSn);
      return response.Data || [];
    } catch (error) {
      console.error('Failed to import unit prices Excel:', error);
      throw error;
    }
  }

  static async exportUnitPrices(invSn: string, data: UnitPriceItem[]): Promise<void> {
    try {
      const exportData = data.map(item => ({
        CODE: item.CODE,
        NAME: item.NAME,
        price: item.price.toString()
      }));

      await this.downloadFile(
        API_ENDPOINTS.DOWNLOAD_EXCEL_MEDPRICES,
        {
          Value: invSn,
          Data: exportData
        },
        `unit_prices_${invSn}.xlsx`
      );
    } catch (error) {
      console.error('Failed to export unit prices:', error);
      throw error;
    }
  }

  // ===== ALIAS (MEDNOTE) API METHODS =====
  static async getAliases(invSn: string): Promise<AliasItem[]> {
    try {
      const response = await this.fetchApi<AliasItem[]>(API_ENDPOINTS.GET_MEDNOTE_BY_SN, 'POST', {
        Value: invSn,
        Data: {}
      });
      return response.Data || [];
    } catch (error) {
      console.error('Failed to fetch aliases from API:', error);
      return [];
    }
  }

  static async updateAliases(invSn: string, items: AliasItem[]): Promise<AliasItem[]> {
    try {
      const response = await this.fetchApi<AliasItem[]>(API_ENDPOINTS.ADD_MEDNOTE_BY_SN, 'POST', {
        Value: invSn,
        Data: items.map(item => ({
          CODE: item.CODE,
          NAME: item.NAME,
          note: item.note
        }))
      });
      return response.Data || [];
    } catch (error) {
      console.error('Failed to update aliases:', error);
      throw error;
    }
  }

  static async importAliasesExcel(invSn: string, file: File): Promise<AliasItem[]> {
    try {
      const response = await this.uploadFile(API_ENDPOINTS.EXCEL_UPLOAD_MEDNOTE, file, invSn);
      return response.Data || [];
    } catch (error) {
      console.error('Failed to import aliases Excel:', error);
      throw error;
    }
  }

  static async exportAliases(invSn: string, data: AliasItem[]): Promise<void> {
    try {
      const exportData = data.map(item => ({
        CODE: item.CODE,
        NAME: item.NAME,
        note: item.note
      }));

      await this.downloadFile(
        API_ENDPOINTS.DOWNLOAD_EXCEL_MEDNOTE,
        {
          Value: invSn,
          Data: exportData
        },
        `aliases_${invSn}.xlsx`
      );
    } catch (error) {
      console.error('Failed to export aliases:', error);
      throw error;
    }
  }

  // ===== RECONCILIATION SETTINGS API METHODS =====
  static async getReconciliationSettingsByRecord(invSn: string): Promise<ReconciliationSettings> {
    try {
      const response = await this.fetchApi<any>(API_ENDPOINTS.GET_SETTINGS_BY_SN, 'POST', {
        Value: invSn,
        Data: {}
      });
      
      const data = response.Data;
      if (!data) {
        throw new Error('No data found for the selected record');
      }

      // Transform API response to ReconciliationSettings format
      return {
        errorAmount: {
          enabled: data.TotalErrorAmountEnable === 'True',
          min: parseFloat(data.MinTotalErrorAmount || '0'),
          max: parseFloat(data.MaxTotalErrorAmount || '1000')
        },
        errorPercentage: {
          enabled: data.ErrorPercentageEnable === 'True',
          min: parseFloat(data.MinErrorPercentage || '0'),
          max: parseFloat(data.MaxErrorPercentage || '10')
        },
        errorQuantity: {
          enabled: data.ErrorCountEnable === 'True',
          min: parseFloat(data.MinErrorCount || '0'),
          max: parseFloat(data.MaxErrorCount || '100')
        }
      };
    } catch (error) {
      console.error('Failed to fetch reconciliation settings from API:', error);
      throw error;
    }
  }

  static async saveReconciliationSettingsByRecord(invSn: string, settings: ReconciliationSettings): Promise<void> {
    try {
      console.log('=== SAVING RECONCILIATION SETTINGS ===');
      console.log('INV_SN:', invSn);
      console.log('Settings:', settings);

      // First, get the current settings data from get_setting_by_SN
      const currentResponse = await this.fetchApi<any>(API_ENDPOINTS.GET_SETTINGS_BY_SN, 'POST', {
        Value: invSn,
        Data: {}
      });

      const currentData = currentResponse.Data;
      if (!currentData) {
        throw new Error('No current settings data found for the selected record');
      }

      console.log('Current Settings Data:', currentData);

      // Keep all existing data and only update the reconciliation settings fields
      const updateData = {
        ...currentData, // Keep all existing data
        // Only update the reconciliation settings fields
        MaxTotalErrorAmount: settings.errorAmount.max.toString(),
        MinTotalErrorAmount: settings.errorAmount.min.toString(),
        TotalErrorAmountEnable: settings.errorAmount.enabled ? 'True' : 'False',
        MaxErrorPercentage: settings.errorPercentage.max.toString(),
        MinErrorPercentage: settings.errorPercentage.min.toString(),
        ErrorPercentageEnable: settings.errorPercentage.enabled ? 'True' : 'False',
        MaxErrorCount: settings.errorQuantity.max.toString(),
        MinErrorCount: settings.errorQuantity.min.toString(),
        ErrorCountEnable: settings.errorQuantity.enabled ? 'True' : 'False'
      };

      console.log('Update Data (keeping all existing data, changing only settings):', updateData);

      // Call the update API with empty Value and all data in Data field
      const response = await this.fetchApi<any>(API_ENDPOINTS.UPDATE_SETTINGS_BY_SN, 'POST', {
        Value: "", // Keep Value empty as requested
        Data: updateData // All data with only the changed columns updated
      });

      console.log('API Response:', response);

      if (response.Code !== 200) {
        throw new Error(response.Result || 'Failed to save reconciliation settings');
      }

      console.log('=== RECONCILIATION SETTINGS SAVED SUCCESSFULLY ===');
      
    } catch (error) {
      console.error('Failed to save reconciliation settings:', error);
      throw error;
    }
  }

  // ===== UPDATE REPORT API METHOD =====
  static async updateReport(items: { GUID: string; COMMENT: string }[]): Promise<ApiResponse<any>> {
    const response = await this.fetchApi<any>(
      API_ENDPOINTS.UPDATE_REPORT,
      'POST',
      {
        Valeu: '',
        Data: items
      }
    );
    return response;
  }

  // ===== LEGACY METHODS (keeping for backward compatibility) =====
  static async getReconciliationSettings(): Promise<ReconciliationSettings> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return {
      errorAmount: { enabled: true, min: 10, max: 1000 },
      errorPercentage: { enabled: true, min: 1, max: 15 },
      errorQuantity: { enabled: false, min: 5, max: 100 }
    };
  }

  static async saveReconciliationSettings(settings: ReconciliationSettings): Promise<void> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    console.log('Saved reconciliation settings:', settings);
  }

  // Legacy method - keeping for backward compatibility
  static async exportSummaryReport(data: ReconciliationSummaryItem[]): Promise<void> {
    // Simulate file download
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const csvContent = 'Index,Drug Code,Product Code,Drug Name,Alias,Unit Price,Stock Qty,Count Qty,Reconciled Qty,Stock Amount,Final Balance,Usage Qty,Error Qty,Error Amount,Error %,Notes\n' + 
      data.map(item => 
        `${item.index},${item.CODE},${item.SKDIACODE},${item.NAME},${item.ALIAS},${item.PRICE},${item.STOCK},${item.COUNT},${item.REVIEW},${item.stockAmount},${item.finalBalance},${item.QTY},${item.ERROR},${item.ERROR_MONEY},${item.ERROR_PERCENT},${item.COMMENT}`
      ).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reconciliation_summary_report.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  }
}