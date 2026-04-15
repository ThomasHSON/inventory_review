export interface Permission {
  name: string;
  index: number;
  type: string;
  state: boolean;
}

export interface User {
  GUID: string;
  ID: string;
  Name: string;
  Employer: string;
  loginTime: string;
  verifyTime: string;
  color: string;
  level: string;
  license: string;
  Permissions: Permission[];
}

export interface LoginResponse {
  Data: User;
  Code: number;
  Result: string;
}

// New types for inventory reconciliation
export interface MergedRecord {
  GUID: string;
  INV_NAME: string;
  INV_SN: string;
  StockRecord_GUID: string;
  StockRecord_ServerName: string;
  StockRecord_ServerType: string;
  MaxTotalErrorAmount: string;
  MinTotalErrorAmount: string;
  TotalErrorAmountEnable: string;
  MaxErrorPercentage: string;
  MinErrorPercentage: string;
  ErrorPercentageEnable: string;
  MaxErrorCount: string;
  MinErrorCount: string;
  ErrorCountEnable: string;
  CT: string;
  CT_TIME: string;
  consumption_startTime: string;
  consumption_endTime: string;
  NOTE: string;
  records_Ary: any[];
  contents: any[];
  stocks: any[];
  consumptions: any[];
  medPrices: any[];
  medNotes: any[];
  medReviews: any[];
}

// Updated ReconciliationSummaryItem to match API response structure
export interface ReconciliationSummaryItem {
  index: number; // Auto-generated index
  GUID?: string; // Add GUID for update operations
  CODE: string; // 藥碼
  SKDIACODE: string; // 料號
  NAME: string; // 藥名
  ALIAS: string; // 別名
  PRICE: number; // 單價
  STOCK: number; // 庫存量
  COUNT: number; // 盤點量
  REVIEW: number; // 覆盤量
  stockAmount: number; // 庫存金額 (STOCK * PRICE)
  finalBalance: number; // 結存金額 (COUNT * PRICE)
  QTY: number; // 消耗量
  ERROR: number; // 誤差量
  ERROR_MONEY: number; // 誤差金額
  ERROR_PERCENT: number; // 誤差百分率
  COMMENT: string; // 註記
}

// Updated API response types based on real API structure
export interface InventoryItem {
  GUID?: string;
  SN?: string;
  CODE: string;
  NAME: string;
  QTY: string | number;
  ADD_TIME?: string;
  selected?: boolean;
}

export interface UnitPriceItem {
  GUID?: string;
  SN?: string;
  CODE: string;
  NAME: string;
  price: string | number;
  ADD_TIME?: string;
  selected?: boolean;
}

export interface AliasItem {
  GUID?: string;
  SN?: string;
  CODE: string;
  NAME: string;
  note: string;
  ADD_TIME?: string;
  selected?: boolean;
}

export interface ReconciliationSettings {
  errorAmount: {
    enabled: boolean;
    min: number;
    max: number;
  };
  errorPercentage: {
    enabled: boolean;
    min: number;
    max: number;
  };
  errorQuantity: {
    enabled: boolean;
    min: number;
    max: number;
  };
}

// Reconciliation Review State types
export interface ReconciliationReviewState {
  STATE: string;
  [key: string]: any;
}

export type ReconciliationButtonState = 
  | 'generate' // 生成覆盤單
  | 'enter' // 進入覆盤單
  | 'locked' // 鎖定狀態
  | 'disabled'; // 無法使用

// Lock Inventory Orders types
export interface InventoryOrder {
  IC_SN: string;
  IC_NAME: string;
  STATE: string;
}

export interface InventoryOrderRecord {
  creat: InventoryOrder;
}

// Column visibility types
export interface ColumnVisibilitySettings {
  CODE: boolean;
  SKDIACODE: boolean;
  NAME: boolean;
  ALIAS: boolean;
  PRICE: boolean;
  STOCK: boolean;
  COUNT: boolean;
  REVIEW: boolean;
  stockAmount: boolean;
  finalBalance: boolean;
  QTY: boolean;
  ERROR: boolean;
  ERROR_MONEY: boolean;
  ERROR_PERCENT: boolean;
}

export interface ColumnConfig {
  key: keyof ColumnVisibilitySettings;
  label: string;
  translationKey: string;
}

interface ReconciliationSummaryTableProps {
  data: ReconciliationSummaryItem[];
  selectedRecordName?: string;
  columnSettings: ColumnVisibilitySettings;
  onReconciliationAction: () => void;
  reconciliationButtonState: ReconciliationButtonState;
  isReconciliationButtonDisabled: boolean;
  reconciliationLoading: boolean;
  onLockToggle: () => void;
  lockToggleLoading: boolean;
  reconciliationData: any;
  onDataUpdate?: (updatedData: ReconciliationSummaryItem[]) => void;
  handleCreateReconciliation: (reconciliationName: string) => Promise<void>;
}