import React, { useState, useEffect } from 'react';
import { X, Info, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ReconciliationSettings } from '../types';
import { ApiService } from '../services/api';

interface ReconciliationSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRecord: string;
}

const ReconciliationSettingsModal: React.FC<ReconciliationSettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  selectedRecord 
}) => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<ReconciliationSettings>({
    errorAmount: { enabled: false, min: 0, max: 1000 },
    errorPercentage: { enabled: false, min: 0, max: 10 },
    errorQuantity: { enabled: false, min: 0, max: 100 }
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen && selectedRecord) {
      loadSettings();
    }
  }, [isOpen, selectedRecord]);

  const loadSettings = async () => {
    if (!selectedRecord) return;
    
    try {
      setLoading(true);
      const data = await ApiService.getReconciliationSettingsByRecord(selectedRecord);
      setSettings(data);
    } catch (error) {
      console.error('Failed to load reconciliation settings:', error);
      // Set default values on error
      setSettings({
        errorAmount: { enabled: false, min: 0, max: 1000 },
        errorPercentage: { enabled: false, min: 0, max: 10 },
        errorQuantity: { enabled: false, min: 0, max: 100 }
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!selectedRecord) return;
    
    try {
      setSaving(true);
      await ApiService.saveReconciliationSettingsByRecord(selectedRecord, settings);
      onClose();
    } catch (error) {
      console.error('Failed to save reconciliation settings:', error);
      alert('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (
    type: keyof ReconciliationSettings,
    field: 'enabled' | 'min' | 'max',
    value: boolean | number
  ) => {
    setSettings(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-900">{t('reconciliationSettings')}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>
          {selectedRecord && (
            <p className="text-sm text-gray-600 mt-1">Selected Record: {selectedRecord}</p>
          )}
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {!selectedRecord ? (
            <div className="text-center py-8 text-gray-500">
              <p>Please select a merged record first to configure reconciliation settings.</p>
            </div>
          ) : loading ? (
            <div className="text-center py-8">{t('loading')}</div>
          ) : (
            <div className="space-y-8">
              {/* Explanation Section */}
              <div className="bg-blue-50 rounded-lg p-6">
                <div className="flex items-start space-x-3">
                  <Info className="h-6 w-6 text-blue-600 mt-0.5" />
                  <div>
                    <h3 className="text-lg font-semibold text-blue-900 mb-3">{t('abnormalCountDefinition')}</h3>
                    <div className="space-y-2 text-blue-800">
                      <p><strong>{t('errorAmount')}</strong> = {t('errorQty')} × {t('unitPrice')}</p>
                      <p><strong>{t('errorPercentage')}</strong> = {t('errorQty')} ÷ {t('usageQty')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Settings Section */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6">{t('abnormalSettings')}</h3>
                
                <div className="space-y-6">
                  {/* Error Amount Range */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-base font-medium text-gray-900">{t('errorAmountRange')}</label>
                      <div className="flex items-center">
                        <span className="mr-3 text-sm text-gray-600">{t('calculation')}</span>
                        <button
                          onClick={() => updateSetting('errorAmount', 'enabled', !settings.errorAmount.enabled)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings.errorAmount.enabled ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              settings.errorAmount.enabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('minValue')}</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={settings.errorAmount.min}
                            onChange={(e) => updateSetting('errorAmount', 'min', Number(e.target.value))}
                            disabled={!settings.errorAmount.enabled}
                            className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                          />
                          <span className="absolute right-3 top-2.5 text-sm text-gray-500">NT$</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('maxValue')}</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={settings.errorAmount.max}
                            onChange={(e) => updateSetting('errorAmount', 'max', Number(e.target.value))}
                            disabled={!settings.errorAmount.enabled}
                            className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                          />
                          <span className="absolute right-3 top-2.5 text-sm text-gray-500">NT$</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Error Percentage Range */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-base font-medium text-gray-900">{t('errorPercentageRange')}</label>
                      <div className="flex items-center">
                        <span className="mr-3 text-sm text-gray-600">{t('calculation')}</span>
                        <button
                          onClick={() => updateSetting('errorPercentage', 'enabled', !settings.errorPercentage.enabled)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings.errorPercentage.enabled ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              settings.errorPercentage.enabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('minValue')}</label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.1"
                            value={settings.errorPercentage.min}
                            onChange={(e) => updateSetting('errorPercentage', 'min', Number(e.target.value))}
                            disabled={!settings.errorPercentage.enabled}
                            className="w-full px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                          />
                          <span className="absolute right-3 top-2.5 text-sm text-gray-500">%</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('maxValue')}</label>
                        <div className="relative">
                          <input
                            type="number"
                            step="0.1"
                            value={settings.errorPercentage.max}
                            onChange={(e) => updateSetting('errorPercentage', 'max', Number(e.target.value))}
                            disabled={!settings.errorPercentage.enabled}
                            className="w-full px-4 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                          />
                          <span className="absolute right-3 top-2.5 text-sm text-gray-500">%</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Error Quantity Range */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-base font-medium text-gray-900">{t('errorQuantityRange')}</label>
                      <div className="flex items-center">
                        <span className="mr-3 text-sm text-gray-600">{t('calculation')}</span>
                        <button
                          onClick={() => updateSetting('errorQuantity', 'enabled', !settings.errorQuantity.enabled)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            settings.errorQuantity.enabled ? 'bg-blue-600' : 'bg-gray-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              settings.errorQuantity.enabled ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('minValue')}</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={settings.errorQuantity.min}
                            onChange={(e) => updateSetting('errorQuantity', 'min', Number(e.target.value))}
                            disabled={!settings.errorQuantity.enabled}
                            className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                          />
                          <span className="absolute right-3 top-2.5 text-sm text-gray-500">pcs</span>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">{t('maxValue')}</label>
                        <div className="relative">
                          <input
                            type="number"
                            value={settings.errorQuantity.max}
                            onChange={(e) => updateSetting('errorQuantity', 'max', Number(e.target.value))}
                            disabled={!settings.errorQuantity.enabled}
                            className="w-full px-4 py-2 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100"
                          />
                          <span className="absolute right-3 top-2.5 text-sm text-gray-500">pcs</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
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
            disabled={saving || !selectedRecord}
            className={`flex items-center px-6 py-2 rounded-lg transition-colors ${
              saving || !selectedRecord
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <Save className="h-5 w-5 mr-2" />
            {saving ? t('saving') : t('save')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReconciliationSettingsModal;