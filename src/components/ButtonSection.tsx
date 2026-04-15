import React from 'react';
import { Settings, DollarSign, Tag, Target, Columns, TrendingDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface ButtonSectionProps {
  onInventorySettings: () => void;
  onUnitPriceSettings: () => void;
  onUsageQtySettings: () => void;
  onAliasSettings: () => void;
  onReconciliationSettings: () => void;
  onColumnDisplaySettings: () => void;
  onGenerateSummary: () => void;
  onDownloadReport: () => void;
  isGenerateDisabled: boolean;
  isDownloadDisabled: boolean;
}

const ButtonSection: React.FC<ButtonSectionProps> = ({
  onInventorySettings,
  onUnitPriceSettings,
  onUsageQtySettings,
  onAliasSettings,
  onReconciliationSettings,
  onColumnDisplaySettings,
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-lg mb-6">
      <div className="flex flex-wrap gap-3">
        <button
          onClick={onInventorySettings}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Settings className="h-5 w-5 mr-2" />
          {t('inventorySettings')}
        </button>
        
        <button
          onClick={onUnitPriceSettings}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <DollarSign className="h-5 w-5 mr-2" />
          {t('unitPriceSettings')}
        </button>

        <button
          onClick={onUsageQtySettings}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <TrendingDown className="h-5 w-5 mr-2" />
          {t('usageQtySettings')}
        </button>

        <button
          onClick={onAliasSettings}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Tag className="h-5 w-5 mr-2" />
          {t('aliasSettings')}
        </button>
        
        <button
          onClick={onReconciliationSettings}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Target className="h-5 w-5 mr-2" />
          {t('reconciliationSettings')}
        </button>
        
        <button
          onClick={onColumnDisplaySettings}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Columns className="h-5 w-5 mr-2" />
          {t('columnDisplaySettings')}
        </button>
      </div>
    </div>
  );
};

export default ButtonSection;