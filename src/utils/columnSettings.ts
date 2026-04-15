import { ColumnVisibilitySettings } from '../types';

const STORAGE_KEY = 'reconciliation_column_settings';

export const getDefaultColumnSettings = (): ColumnVisibilitySettings => ({
  CODE: true,
  SKDIACODE: true,
  NAME: true,
  ALIAS: true,
  PRICE: true,
  STOCK: true,
  COUNT: true,
  REVIEW: true,
  stockAmount: true,
  finalBalance: true,
  QTY: true,
  ERROR: true,
  ERROR_MONEY: true,
  ERROR_PERCENT: true,
});

export const loadColumnSettings = (): ColumnVisibilitySettings => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Validate that all required keys exist
      const defaultSettings = getDefaultColumnSettings();
      const validatedSettings: ColumnVisibilitySettings = { ...defaultSettings };
      
      // Only use stored values for keys that exist in the default settings
      Object.keys(defaultSettings).forEach(key => {
        if (key in parsed && typeof parsed[key] === 'boolean') {
          validatedSettings[key as keyof ColumnVisibilitySettings] = parsed[key];
        }
      });
      
      return validatedSettings;
    }
  } catch (error) {
    console.error('Failed to load column settings from localStorage:', error);
  }
  
  return getDefaultColumnSettings();
};

export const saveColumnSettings = (settings: ColumnVisibilitySettings): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save column settings to localStorage:', error);
  }
};