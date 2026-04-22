export interface ApiResponse<T = any> {
  Data: T;
  Code: number;
  Method: string;
  Result: string;
  Value: string;
  ValueAry: any[];
  TimeTaken: string;
}

export const API_ENDPOINTS = {
  LOGIN: '/api/session/login',
  GET_ALL_INV: '/api/inv_combinelist/get_all_inv',
  GET_FULL_INV_BY_SN: '/api/inv_combinelist/get_full_inv_by_SN',
  
  // Summary and Report endpoints
  GET_DETAIL_INV_BY_SN: '/api/inv_combinelist/get_detail_inv_by_SN',
  GET_FULL_INV_EXCEL_BY_SN: '/api/inv_combinelist/get_full_inv_Excel_by_SN',
  GET_REPORT_BY_SN: '/api/inv_combinelist/get_report_by_SN',
  ADD_REPORT_BY_SN: '/api/inv_combinelist/add_report_by_SN',
  
  // Inventory (Stocks) endpoints
  GET_STOCKS_BY_SN: '/api/inv_combinelist/get_stocks_by_SN',
  ADD_STOCKS_BY_SN: '/api/inv_combinelist/add_stocks_by_SN',
  EXCEL_UPLOAD_STOCKS: '/api/inv_combinelist/excel_upload_stocks',
  DOWNLOAD_EXCEL_STOCK: '/api/inv_combinelist/download_excel_Stock',
  
  // Unit Price (MedPrices) endpoints
  GET_MEDPRICES_BY_SN: '/api/inv_combinelist/get_medPrices_by_SN',
  ADD_MEDPRICES_BY_SN: '/api/inv_combinelist/add_medPrices_by_SN',
  EXCEL_UPLOAD_MEDPRICES: '/api/inv_combinelist/excel_upload_medPrices',
  DOWNLOAD_EXCEL_MEDPRICES: '/api/inv_combinelist/download_excel_medPrices',
  
  // Alias (MedNote) endpoints
  GET_MEDNOTE_BY_SN: '/api/inv_combinelist/get_medNote_by_SN',
  ADD_MEDNOTE_BY_SN: '/api/inv_combinelist/add_medNote_by_SN',
  EXCEL_UPLOAD_MEDNOTE: '/api/inv_combinelist/excel_upload_medNote',
  DOWNLOAD_EXCEL_MEDNOTE: '/api/inv_combinelist/download_excel_medNote',
  
  // Reconciliation Review endpoints
  CHECK_RECONCILIATION_STATE: '/api/inventory/creat_get_by_INVC',
  GENERATE_RECONCILIATION: '/api/inv_combinelist/review_auto_add',
  GET_RECONCILIATION_BY_IC_SN: '/api/inventory/creat_get_by_IC_SN',
  LOCK_INVENTORY_ORDER: '/api/inventory/creat_lock_by_IC_SN',
  UNLOCK_INVENTORY_ORDER: '/api/inventory/creat_unlock_by_IC_SN',
  
  // Reconciliation Settings endpoints
  GET_SETTINGS_BY_SN: '/api/inv_combinelist/get_setting_by_SN',
  UPDATE_SETTINGS_BY_SN: '/api/inv_combinelist/update_setting_by_SN',
  UPDATE_REPORT: '/api/inv_combinelist/update_report',
  
  // Setting page endpoints
  GET_BY_PAGE_NAME: '/api/settingPage/get_by_page_name',

  // Legacy endpoints (keeping for backward compatibility)
  SAVE_RECONCILIATION_SETTINGS: '/api/reconciliation/save_settings',
  GET_RECONCILIATION_SETTINGS: '/api/reconciliation/get_settings'
} as const;