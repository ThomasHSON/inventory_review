import React, { useState, useEffect } from 'react';
import { X, Eye, RotateCcw } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ColumnVisibilitySettings, ColumnConfig } from '../types';

interface ColumnVisibilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  columnSettings: ColumnVisibilitySettings;
  onSettingsChange: (settings: ColumnVisibilitySettings) => void;
}

const COLUMN_CONFIGS: ColumnConfig[] = [
  { key: 'CODE', label: '藥碼', translationKey: 'drugCode' },
  { key: 'SKDIACODE', label: '料號', translationKey: 'productCode' },
  { key: 'NAME', label: '藥名', translationKey: 'drugName' },
  { key: 'ALIAS', label: '別名', translationKey: 'alias' },
  { key: 'PRICE', label: '單價', translationKey: 'unitPrice' },
  { key: 'STOCK', label: '庫存量', translationKey: 'stockQty' },
  { key: 'COUNT', label: '盤點量', translationKey: 'countQty' },
  { key: 'REVIEW', label: '覆盤量', translationKey: 'reviewQty' },
  { key: 'stockAmount', label: '庫存金額', translationKey: 'stockAmount' },
  { key: 'finalBalance', label: '結存金額', translationKey: 'finalBalance' },
  { key: 'QTY', label: '消耗量', translationKey: 'usageQty' },
  { key: 'ERROR', label: '誤差量', translationKey: 'errorQty' },
  { key: 'ERROR_MONEY', label: '誤差金額', translationKey: 'errorAmount' },
  { key: 'ERROR_PERCENT', label: '誤差百分率', translationKey: 'errorPercentage' },
];

const MINIMUM_COLUMNS_REQUIRED = 10;

const ColumnVisibilityModal: React.FC<ColumnVisibilityModalProps> = ({
  isOpen,
  onClose,
  columnSettings,
  onSettingsChange,
}) => {
  const { t } = useTranslation();
  const [localSettings, setLocalSettings] = useState<ColumnVisibilitySettings>(columnSettings);

  useEffect(() => {
    setLocalSettings(columnSettings);
  }, [columnSettings]);

  const enabledColumnsCount = Object.values(localSettings).filter(Boolean).length;
  const isMinimumMet = enabledColumnsCount >= MINIMUM_COLUMNS_REQUIRED;

  const handleToggle = (columnKey: keyof ColumnVisibilitySettings) => {
    const newSettings = {
      ...localSettings,
      [columnKey]: !localSettings[columnKey],
    };

    // Check if disabling this column would violate the minimum requirement
    const newEnabledCount = Object.values(newSettings).filter(Boolean).length;
    if (newEnabledCount >= MINIMUM_COLUMNS_REQUIRED) {
      setLocalSettings(newSettings);
    }
  };

  const handleResetToDefault = () => {
    const defaultSettings: ColumnVisibilitySettings = {
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
    };
    setLocalSettings(defaultSettings);
  };

  const handleSave = () => {
    onSettingsChange(localSettings);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-900">{t('columnDisplaySettings')}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mt-1">{t('selectColumns')}</p>
        </div>

        <div className="px-6 py-4 overflow-y-auto">
          {/* Status and Reset Button */}
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-4">
              <div className={`text-sm ${isMinimumMet ? 'text-green-600' : 'text-red-600'}`}>
                {enabledColumnsCount} / {COLUMN_CONFIGS.length} {t('columnVisibility')}
              </div>
              {!isMinimumMet && (
                <div className="text-sm text-red-600">
                  {t('minimumColumnsRequired')}
                </div>
              )}
            </div>
            <button
              onClick={handleResetToDefault}
              className="flex items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {t('resetToDefault')}
            </button>
          </div>

          {/* Column Toggle Grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {COLUMN_CONFIGS.map((column) => {
              const isEnabled = localSettings[column.key];
              const canDisable = enabledColumnsCount > MINIMUM_COLUMNS_REQUIRED || !isEnabled;

              return (
                <div
                  key={column.key}
                  className={`flex items-center p-3 rounded-lg border transition-colors ${
                    isEnabled
                      ? 'bg-blue-50 border-blue-200'
                      : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <button
                    onClick={() => handleToggle(column.key)}
                    disabled={!canDisable}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isEnabled ? 'bg-blue-600' : 'bg-gray-300'
                    } ${!canDisable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  <div className="ml-3 flex-1">
                    <div className="flex items-center">
                      <Eye className={`h-4 w-4 mr-2 ${isEnabled ? 'text-blue-600' : 'text-gray-400'}`} />
                      <span className={`text-sm font-medium ${isEnabled ? 'text-blue-900' : 'text-gray-600'}`}>
                        {t(column.translationKey)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {column.label}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            {t('cancel')}
          </button>
          <button
            onClick={handleSave}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {t('save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ColumnVisibilityModal;