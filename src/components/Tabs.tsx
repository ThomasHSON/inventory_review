import React from 'react';
import { useTranslation } from 'react-i18next';

const Tabs = () => {
  const { t } = useTranslation();

  return (
    <div className="h-[40px] mb-2">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 border-b border-gray-200">
          <a href="../inventory_manager" className="px-4 py-2 text-base font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">
            {t('tabs.manage')}
          </a>
          <a href="../inventory_merge" className="px-4 py-2 text-base font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">
            {t('tabs.merge')}
          </a>
          <a href="#" className="px-4 py-2 text-base font-medium border-b-2 border-blue-500 text-blue-600">
            {t('tabs.review')}
          </a>
          <a href="../inventory_daily_report" className="px-4 py-2 text-base font-medium border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300">
            {t('tabs.daily')}
          </a>
        </div>
      </div>
    </div>
  );
};

export default Tabs;