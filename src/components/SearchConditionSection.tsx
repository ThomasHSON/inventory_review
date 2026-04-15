import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Clock } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SearchConditionSectionProps {
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  onStartDateChange: (date: string) => void;
  onStartTimeChange: (time: string) => void;
  onEndDateChange: (date: string) => void;
  onEndTimeChange: (time: string) => void;
}

const SearchConditionSection: React.FC<SearchConditionSectionProps> = ({
  startDate,
  startTime,
  endDate,
  endTime,
  onStartDateChange,
  onStartTimeChange,
  onEndDateChange,
  onEndTimeChange,
}) => {
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-8 overflow-hidden">
      {/* Header with Title and Expand/Collapse Icon */}
      <div 
        className="px-4 md:px-6 py-2 cursor-pointer hover:bg-gray-50 transition-colors border-b border-gray-100"
        onClick={toggleExpanded}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Clock className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">{t('timeRange')}</h3>
          </div>
          <div className="flex items-center space-x-2">
            {isExpanded ? (
              <ChevronUp className="h-5 w-5 text-gray-400 transition-transform duration-200" />
            ) : (
              <ChevronDown className="h-5 w-5 text-gray-400 transition-transform duration-200" />
            )}
          </div>
        </div>
      </div>

      {/* Collapsible Content */}
      <div 
        className={`transition-all duration-300 ease-in-out overflow-hidden ${
          isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <div className="p-4 md:p-6">
          <div className="flex items-end gap-12">
            {/* Time Type Section */}
            <div className="w-[15%]">
              <label className="block text-base font-medium text-gray-700 mb-2">
               {t('timeType')}
              </label>
              <select
                value="create_time"
                className="w-full border rounded-lg px-3 py-2 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                disabled
              >
                <option value="create_time">{t('ctTime')}</option>
              </select>
            </div>

            {/* Start Time */}
            <div className="w-[30%]">
              <label className="block text-base font-medium text-gray-700 mb-2">
                {t('startTime')}
              </label>
              <div className="flex gap-4">
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => onStartDateChange(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
                <input
                  type="time"
                  step="1"
                  value={startTime}
                  onChange={(e) => onStartTimeChange(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* End Time */}
            <div className="w-[30%]">
              <label className="block text-base font-medium text-gray-700 mb-2">
                {t('endTime')}
              </label>
              <div className="flex gap-4">
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => onEndDateChange(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
                <input
                  type="time"
                  step="1"
                  value={endTime}
                  onChange={(e) => onEndTimeChange(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchConditionSection;