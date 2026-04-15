import React from 'react';
import { Download, BarChart3, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MergedRecord } from '../types';

interface FilterSectionProps {
  selectedRecord: string;
  mergedRecords: MergedRecord[];
  onRecordChange: (recordSn: string) => Promise<void>;
  onDownloadReport: () => void;
  isDownloadDisabled: boolean;
  isDownloadLoading: boolean;
  onGenerateSummary: () => void;
  isGenerateDisabled: boolean;
  hasExistingReport: boolean;
}

const FilterSection: React.FC<FilterSectionProps> = ({
  selectedRecord,
  mergedRecords,
  onRecordChange,
  onDownloadReport,
  isDownloadDisabled,
  isDownloadLoading,
  onGenerateSummary,
  isGenerateDisabled,
  hasExistingReport,
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6 mb-6">
      <div className="flex items-end justify-between gap-6">
        {/* Merged Record Selection */}
        <div className="flex-1 max-w-md">
          <label className="block text-base font-medium text-gray-700 mb-2">
            {t('mergedRecord')}
          </label>
          <select
            value={selectedRecord}
            onChange={(e) => {
              const value = e.target.value;
              onRecordChange(value);
            }}
            className="w-full border rounded-lg px-3 py-2 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
          >
            <option value="">{t('selectRecord')}</option>
            {mergedRecords.map((record) => (
              <option key={record.INV_SN} value={record.INV_SN}>
                {record.INV_NAME}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onGenerateSummary}
            disabled={isGenerateDisabled}
            className={`flex items-center px-6 py-2 rounded-lg transition-colors ${
              isGenerateDisabled
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            <BarChart3 className="h-5 w-5 mr-2" />
            {hasExistingReport ? t('regenerateSummary') : t('generateSummary')}
          </button>
          
          <button
            onClick={onDownloadReport}
            disabled={isDownloadDisabled || isDownloadLoading}
            className={`flex items-center px-6 py-2 rounded-lg transition-colors ${
              isDownloadDisabled || isDownloadLoading
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-green-600 text-white hover:bg-green-700'
            }`}
          >
            {isDownloadLoading ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Download className="h-5 w-5 mr-2" />
            )}
            {t('downloadReport')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterSection;