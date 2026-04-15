import React, { useState, useEffect, useMemo } from 'react';
import { X, Upload, Download, ChevronUp, ChevronDown, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { UnitPriceItem } from '../types';
import { ApiService } from '../services/api';

interface UnitPriceConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRecord: string;
}

type SortField = 'CODE' | 'NAME' | 'price';
type SortDirection = 'asc' | 'desc';

const UnitPriceConfigModal: React.FC<UnitPriceConfigModalProps> = ({ isOpen, onClose, selectedRecord }) => {
  const { t } = useTranslation();
  const [items, setItems] = useState<UnitPriceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [sortField, setSortField] = useState<SortField>('CODE');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectAll, setSelectAll] = useState(false);

  useEffect(() => {
    if (isOpen && selectedRecord) {
      loadUnitPrices();
    }
  }, [isOpen, selectedRecord]);

  const loadUnitPrices = async () => {
    if (!selectedRecord) return;
    
    try {
      setLoading(true);
      const data = await ApiService.getUnitPrices(selectedRecord);
      setItems(data.map(item => ({ ...item, selected: false })));
    } catch (error) {
      console.error('Failed to load unit prices:', error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (sortField === 'price') {
        const aNum = typeof aValue === 'string' ? parseFloat(aValue) || 0 : Number(aValue);
        const bNum = typeof bValue === 'string' ? parseFloat(bValue) || 0 : Number(bValue);
        return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
      }

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      return sortDirection === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  }, [items, sortField, sortDirection]);

  const handleSelectAll = () => {
    const newSelectAll = !selectAll;
    setSelectAll(newSelectAll);
    setItems(items.map(item => ({ ...item, selected: newSelectAll })));
  };

  const handleItemSelect = (code: string) => {
    setItems(items.map(item => 
      item.CODE === code ? { ...item, selected: !item.selected } : item
    ));
  };

  const handlePriceChange = (code: string, newPrice: string) => {
    setItems(items.map(item => 
      item.CODE === code ? { ...item, price: newPrice } : item
    ));
  };

  const handleSave = async () => {
    if (!selectedRecord) return;
    
    try {
      setSaving(true);
      await ApiService.updateUnitPrices(selectedRecord, items);
      // Reload data after successful save
      await loadUnitPrices();
    } catch (error) {
      console.error('Failed to save unit prices:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleImport = () => {
    if (!selectedRecord) {
      alert('Please select a merged record first');
      return;
    }

    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.xlsx,.xls';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        try {
          setLoading(true);
          await ApiService.importUnitPricesExcel(selectedRecord, file);
          await loadUnitPrices(); // Reload data after import
        } catch (error) {
          console.error('Failed to import unit prices:', error);
          alert('Failed to import unit prices file');
        } finally {
          setLoading(false);
        }
      }
    };
    input.click();
  };

  const handleExport = async () => {
    if (!selectedRecord) {
      alert('Please select a merged record first');
      return;
    }

    try {
      await ApiService.exportUnitPrices(selectedRecord, items);
    } catch (error) {
      console.error('Failed to export unit prices:', error);
      alert('Failed to export unit prices');
    }
  };

  const SortableHeader: React.FC<{ field: SortField; children: React.ReactNode }> = ({ field, children }) => (
    <th 
      className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors"
      onClick={() => handleSort(field)}
    >
      <div className="flex items-center space-x-1">
        <span>{children}</span>
        {sortField === field && (
          sortDirection === 'asc' ? 
            <ChevronUp className="h-4 w-4" /> : 
            <ChevronDown className="h-4 w-4" />
        )}
      </div>
    </th>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-900">{t('unitPriceSettings')}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X className="w-6 h-6" />
            </button>
          </div>
          {selectedRecord && (
            <p className="text-sm text-gray-600 mt-1">Selected Record: {selectedRecord}</p>
          )}
        </div>

        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex space-x-3">
              <button
                onClick={handleImport}
                disabled={!selectedRecord || loading}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  !selectedRecord || loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Upload className="h-5 w-5 mr-2" />
                {t('importExcel')}
              </button>
              <button
                onClick={handleExport}
                disabled={!selectedRecord || items.length === 0}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  !selectedRecord || items.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-green-600 text-white hover:bg-green-700'
                }`}
              >
                <Download className="h-5 w-5 mr-2" />
                {t('exportExcel')}
              </button>
              <button
                onClick={handleSave}
                disabled={!selectedRecord || saving || items.length === 0}
                className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                  !selectedRecord || saving || items.length === 0
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                <Save className="h-5 w-5 mr-2" />
                {saving ? t('saving') : t('save')}
              </button>
            </div>
            <div className="text-sm text-gray-600">
              {items.length}{t('totalItems')}
            </div>
          </div>

          {!selectedRecord ? (
            <div className="text-center py-8 text-gray-500">
              <p>Please select a merged record first to view unit price data.</p>
            </div>
          ) : (
            <div className="overflow-x-auto max-h-96">
              {loading ? (
                <div className="text-center py-8">{t('loading')}</div>
              ) : items.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <p>No unit price data found for this record.</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <SortableHeader field="CODE">{t('drugCode')}</SortableHeader>
                      <SortableHeader field="NAME">{t('drugName')}</SortableHeader>
                      <SortableHeader field="price">{t('unitPrice')}</SortableHeader>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {sortedItems.map((item) => (
                      <tr key={item.CODE} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">{item.CODE}</td>
                        <td className="px-4 py-3 text-sm text-gray-900">{item.NAME}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center">
                            <input
                              type="number"
                              step="0.01"
                              value={item.price}
                              onChange={(e) => handlePriceChange(item.CODE, e.target.value)}
                              className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-right"
                            />
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnitPriceConfigModal;