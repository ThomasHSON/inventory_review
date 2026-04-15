import React, { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, BarChart3, Search, Play, X, ChevronLeft, ChevronRight, Loader2, Plus, Lock, Unlock, CreditCard as Edit, Save } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ReconciliationSummaryItem, ColumnVisibilitySettings, ReconciliationButtonState } from '../types';
import { ApiService } from '../services/api';

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

type SortField = keyof Omit<ReconciliationSummaryItem, 'index' | 'stockAmount' | 'finalBalance'>;
type SortDirection = 'asc' | 'desc';

const ITEMS_PER_PAGE = 50;

const ReconciliationSummaryTable: React.FC<ReconciliationSummaryTableProps> = ({ 
  data, 
  selectedRecordName, 
  columnSettings,
  onReconciliationAction,
  reconciliationButtonState,
  isReconciliationButtonDisabled,
  reconciliationLoading,
  onLockToggle,
  lockToggleLoading,
  reconciliationData,
  onDataUpdate,
  handleCreateReconciliation
}) => {
  const { t } = useTranslation();
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Review items adjustment state
  const [isAdjustingReviewItems, setIsAdjustingReviewItems] = useState(false);
  const [reviewItemsState, setReviewItemsState] = useState<{ [key: string]: boolean }>({});
  const [originalReviewState, setOriginalReviewState] = useState<{ [key: string]: boolean }>({});
  const [selectAllReviewItems, setSelectAllReviewItems] = useState(false);
  const [savingReviewItems, setSavingReviewItems] = useState(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedData = useMemo(() => {
    let filtered = data;

    // Apply search filter - search both drug code and drug name
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = data.filter(item => 
        item.CODE.toLowerCase().includes(term) || 
        item.NAME.toLowerCase().includes(term)
      );
    }

    // Apply sorting
    if (!sortField) return filtered;

    return [...filtered].sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      
      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr);
      } else {
        return bStr.localeCompare(aStr);
      }
    });
  }, [data, sortField, sortDirection, searchTerm]);

  // Check if there are any records with "覆盤" in COMMENT field for Generate button disable logic
  const hasReviewRecords = useMemo(() => {
    console.log('=== CHECKING FOR REVIEW RECORDS (for Generate button disable) ===');
    console.log('Total data items:', data.length);
    
    if (data.length === 0) {
      console.log('No data available');
      return false;
    }

    const reviewRecords = data.filter(item => {
      const comment = item.COMMENT;
      const hasReview = comment.includes('覆盤');
      console.log(`Item ${item.CODE}: COMMENT="${comment}", hasReview=${hasReview}`);
      return hasReview;
    });
    
    console.log('Review records found:', reviewRecords.length);
    console.log('Has review records:', reviewRecords.length > 0);
    console.log('=== END REVIEW RECORDS CHECK ===');
    
    return reviewRecords.length > 0;
  }, [data]);

  // Determine which button to show and its state based on API response
  const buttonState = useMemo(() => {
    console.log('=== API-BASED BUTTON STATE LOGIC ===');
    console.log('Reconciliation Button State from API:', reconciliationButtonState);
    console.log('Has review records in data:', hasReviewRecords);
    console.log('Data length:', data.length);
    console.log('Loading:', reconciliationLoading);

    // Button display logic based on API response:
    // - If API returns Code === 200: show "Enter Review Sheet" button
    // - If API returns Code === -5: show "Generate Review Sheet" button
    const showGenerateButton = reconciliationButtonState === 'generate';
    const showEnterButton = reconciliationButtonState === 'enter' || reconciliationButtonState === 'locked';

    console.log('Show Generate Button:', showGenerateButton);
    console.log('Show Enter Button:', showEnterButton);

    // Disable logic:
    // - "Enter Review Sheet" disabled if creat_get_by_INVC returns Data[0].STATE === "鎖定"
    // - "Generate Review Sheet" disabled if get_full_inv_by_SN returns dataset where none of the items contain "覆盤" in COMMENT
    const generateButtonDisabled = isReconciliationButtonDisabled || 
                                   reconciliationLoading || 
                                   !hasReviewRecords || // Disabled if no "覆盤" records in data
                                   reconciliationButtonState !== 'generate';

    const enterButtonDisabled = isReconciliationButtonDisabled || 
                               reconciliationLoading || 
                               reconciliationButtonState === 'locked' || // Disabled if state is "鎖定"
                               (reconciliationButtonState !== 'enter' && reconciliationButtonState !== 'locked');

    console.log('Generate Button Disabled:', generateButtonDisabled);
    console.log('Generate Button Disabled Reasons:');
    console.log('  - isReconciliationButtonDisabled:', isReconciliationButtonDisabled);
    console.log('  - reconciliationLoading:', reconciliationLoading);
    console.log('  - !hasReviewRecords:', !hasReviewRecords);
    console.log('  - reconciliationButtonState !== "generate":', reconciliationButtonState !== 'generate');
    
    console.log('Enter Button Disabled:', enterButtonDisabled);
    console.log('Enter Button Disabled Reasons:');
    console.log('  - isReconciliationButtonDisabled:', isReconciliationButtonDisabled);
    console.log('  - reconciliationLoading:', reconciliationLoading);
    console.log('  - reconciliationButtonState === "locked":', reconciliationButtonState === 'locked');
    console.log('  - state not enter/locked:', reconciliationButtonState !== 'enter' && reconciliationButtonState !== 'locked');
    console.log('=== END API-BASED BUTTON STATE LOGIC ===');

    return {
      showGenerateButton,
      showEnterButton,
      generateButtonDisabled,
      enterButtonDisabled
    };
  }, [reconciliationButtonState, hasReviewRecords, isReconciliationButtonDisabled, reconciliationLoading, data.length]);

  // Pagination calculations
  const totalItems = filteredAndSortedData.length;
  const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = Math.min(startIndex + ITEMS_PER_PAGE, totalItems);
  const currentPageData = filteredAndSortedData.slice(startIndex, endIndex);

  // Reset to first page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Initialize review items state when entering adjustment mode
  const initializeReviewItemsState = () => {
    const initialState: { [key: string]: boolean } = {};
    data.forEach(item => {
      const key = item.GUID || item.CODE;
      const isReviewItem = item.COMMENT === '覆盤';
      initialState[key] = isReviewItem;
    });
    setReviewItemsState(initialState);
    setOriginalReviewState({ ...initialState });
    
    // Set select all checkbox state
    const allChecked = Object.values(initialState).every(checked => checked);
    setSelectAllReviewItems(allChecked);
  };

  // Handle adjust review items button click
  const handleAdjustReviewItems = async () => {
    if (!isAdjustingReviewItems) {
      // Enter adjustment mode
      setIsAdjustingReviewItems(true);
      initializeReviewItemsState();
    } else {
      // Save changes and exit adjustment mode
      setSavingReviewItems(true);
      
      try {
        // Compare current state with original state to find changes
        let changedItems = [];
        
        Object.keys(reviewItemsState).forEach(key => {
          const currentChecked = reviewItemsState[key];
          const originalChecked = originalReviewState[key];
          
          if (currentChecked !== originalChecked) {
            // Find the item to get its GUID
            const item = data.find(d => (d.GUID || d.CODE) === key);
            if (item && item.GUID) {
              changedItems.push({
                GUID: item.GUID,
                COMMENT: currentChecked ? '覆盤' : ''
              });
            }
          }
        });

        if (changedItems.length === 0) {
          // No changes, just exit adjustment mode
          setIsAdjustingReviewItems(false);
          setSavingReviewItems(false);
          return;
        }

        // Call API to update changed items
        const response = await ApiService.updateReport(changedItems);

        if (response.Code === 200) {
          // Update local data state to reflect changes
          const updatedData = [...data].map(item => {
            const key = item.GUID || item.CODE;
            if (reviewItemsState.hasOwnProperty(key)) {
              return {
                ...item,
                COMMENT: reviewItemsState[key] ? '覆盤' : ''
              };
            }
            return item;
          });
          
          // Update parent component's data through callback
          onDataUpdate?.(updatedData);
          
          alert(t('reviewItemsUpdatedSuccessfully'));
          
          setIsAdjustingReviewItems(false);
          
          // Reset review items state to match updated data
          const newReviewState: { [key: string]: boolean } = {};
          updatedData.forEach(item => {
            const key = item.GUID || item.CODE;
            newReviewState[key] = item.COMMENT === '覆盤';
          });
          setReviewItemsState(newReviewState);
          setOriginalReviewState({ ...newReviewState });
          
          // Check if we should trigger reconciliation action after successful save
          // If showEnterButton is true, get reconciliation name and create new reconciliation
          if (buttonState.showEnterButton && reconciliationData && reconciliationData[0] && reconciliationData[0].IC_SN) {
            console.log('=== AUTO GENERATING NEW RECONCILIATION AFTER REVIEW ITEMS UPDATE ===');
            console.log('buttonState.showEnterButton:', buttonState.showEnterButton);
            console.log('IC_SN:', reconciliationData[0].IC_SN);
            
            try {
              // Call API to get reconciliation name
              const response = await ApiService.getReconciliationByIcSn(reconciliationData[0].IC_SN);
              console.log('Get reconciliation by IC_SN response:', response);
              
              if (response.Code === 200 && response.Data && response.Data[0]) {
                const reconciliationName = response.Data[0].IC_NAME;
                console.log('Got reconciliation name:', reconciliationName);
                
                // Call handleCreateReconciliation with the retrieved name
                await handleCreateReconciliation(reconciliationName);
                console.log('Auto reconciliation creation completed');
              } else {
                console.error('Failed to get reconciliation name from API response');
              }
            } catch (error) {
              console.error('Error getting reconciliation name:', error);
            }
          }
        } else {
          alert(t('failedToUpdateReviewItems'));
        }
      } catch (error) {
        console.error('Error updating review items:', error);
        alert(t('failedToUpdateReviewItems'));
      } finally {
        setSavingReviewItems(false);
      }
    }
  };

  // Handle individual review item toggle
  const handleReviewItemToggle = (key: string, checked: boolean) => {
    const newState = { ...reviewItemsState, [key]: checked };
    setReviewItemsState(newState);
    
    // Update select all checkbox state
    const allChecked = Object.values(newState).every(checked => checked);
    const noneChecked = Object.values(newState).every(checked => !checked);
    setSelectAllReviewItems(allChecked);
  };

  // Handle select all review items toggle
  const handleSelectAllReviewItems = (checked: boolean) => {
    const newState: { [key: string]: boolean } = {};
    Object.keys(reviewItemsState).forEach(key => {
      newState[key] = checked;
    });
    setReviewItemsState(newState);
    setSelectAllReviewItems(checked);
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value)) {
      handlePageChange(value);
    }
  };

  const SortableHeader: React.FC<{ field: SortField; children: React.ReactNode }> = ({ field, children }) => (
    <th 
      className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap"
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

  if (data.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="text-center text-gray-500">
          <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-lg">{t('noSummaryData')}</p>
          <p className="text-sm">{t('generateSummaryFirst')}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header Section with Title, Filter, and Button */}
      <div className="py-6 flex items-center justify-between gap-6">
        <div className="flex gap-4">
          {/* Title */}
          <div className="flex items-center">
            <h3 className="text-xl font-semibold text-gray-900">
              {selectedRecordName ? `${selectedRecordName} - ${t('reconciliationSummary')}` : t('reconciliationSummary')}
            </h3>
            <p className="text-sm text-gray-600 ml-2">
              ({totalItems} {t('totalItems')})
            </p>
          </div>
  
          {/* Filter - Search Input */}
          <div className="flex-1 max-w-md relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={t('searchPlaceholder')}
              className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center hover:text-gray-600 transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            )}
          </div>
        </div>

        {/* Reconciliation Action Buttons */}
        <div className="flex items-center gap-3">
          
          {/* Adjust Review Items Button */}
          {data.length > 0 && (
            <button
              onClick={handleAdjustReviewItems}
             disabled={savingReviewItems || (isAdjustingReviewItems && Object.values(reviewItemsState).every(checked => !checked))}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
               savingReviewItems || (isAdjustingReviewItems && Object.values(reviewItemsState).every(checked => !checked))
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : isAdjustingReviewItems
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {savingReviewItems ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : isAdjustingReviewItems ? (
                <Save className="h-5 w-5 mr-2" />
              ) : (
                <Edit className="h-5 w-5 mr-2" />
              )}
              {savingReviewItems 
                ? t('saving')
                : isAdjustingReviewItems 
                  ? t('saveReviewItems') 
                  : t('adjustReviewItems')
              }
            </button>
          )}
          {/* Lock/Unlock Button - Only show when reconciliation data exists */}
          {reconciliationData && reconciliationData[0] && (
            <button
              onClick={onLockToggle}
              disabled={lockToggleLoading}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                lockToggleLoading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : reconciliationData[0].STATE === '鎖定'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-green-600 text-white hover:bg-green-700'
              }`}
            >
              {lockToggleLoading ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : reconciliationData[0].STATE === '鎖定' ? (
                <Lock className="h-5 w-5 mr-2" />
              ) : (
                <Unlock className="h-5 w-5 mr-2" />
              )}
              {lockToggleLoading 
                ? (reconciliationData[0].STATE === '鎖定' ? t('unlocking') : t('locking'))
                : (reconciliationData[0].STATE === '鎖定' ? t('locked') : t('unlocked'))
              }
            </button>
          )}

          {/* Generate Review Sheet Button */}
          {buttonState.showGenerateButton && (
            <button
              onClick={onReconciliationAction}
              disabled={buttonState.generateButtonDisabled}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                buttonState.generateButtonDisabled
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {reconciliationLoading ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Plus className="h-5 w-5 mr-2" />
              )}
              {t('generateReviewSheet')}
            </button>
          )}
          
          {/* Enter Review Sheet Button */}
          {buttonState.showEnterButton && (
            <button
              onClick={onReconciliationAction}
              disabled={buttonState.enterButtonDisabled}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                buttonState.enterButtonDisabled
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : reconciliationButtonState === 'locked'
                    ? 'bg-red-600 text-white hover:bg-red-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {reconciliationLoading ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Play className="h-5 w-5 mr-2" />
              )}
              {reconciliationButtonState === 'locked' ? t('lockedReviewSheet') : t('enterReviewSheet')}
            </button>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="relative overflow-x-auto">
          {/* Info Text and Pagination Controls */}
          <div className="px-3 py-2 bg-gray-50 border-b border-gray-200 flex items-center justify-between text-sm text-gray-600">
            {/* Info Text */}
            <div className="text-sm text-gray-600">
             <div className="flex items-center space-x-4">
               <span>
                 {t('showing')} {totalItems > 0 ? startIndex + 1 : 0} - {endIndex} {t('of')} {totalItems} {t('records')}
               </span>
               {isAdjustingReviewItems && (
                 <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                   已選取: {Object.values(reviewItemsState).filter(checked => checked).length} 項
                 </span>
               )}
             </div>
            </div>
    
            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center space-x-4">
                {/* Previous Page Button */}
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                    currentPage === 1
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  {t('previous')}
                </button>
    
                {/* Page Indicator */}
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="1"
                    max={totalPages}
                    value={currentPage}
                    onChange={handlePageInputChange}
                    className="w-16 px-2 py-1 text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                  <span className="text-sm text-gray-600">/ {totalPages}</span>
                </div>
    
                {/* Next Page Button */}
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`flex items-center px-3 py-2 rounded-lg transition-colors ${
                    currentPage === totalPages
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {t('next')}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
            )}
          </div>
          <div className="max-h-[calc(100vh-180px)] overflow-y-auto">
            <table className="w-full">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  {/* Checkbox column header - only show when adjusting */}
                  {isAdjustingReviewItems && (
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">
                      <input
                        type="checkbox"
                        checked={selectAllReviewItems}
                        onChange={(e) => handleSelectAllReviewItems(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </th>
                  )}
                  <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">{t('index')}</th>
                  {columnSettings.CODE && <SortableHeader field="CODE">{t('drugCode')}</SortableHeader>}
                  {columnSettings.SKDIACODE && <SortableHeader field="SKDIACODE">{t('productCode')}</SortableHeader>}
                  {columnSettings.NAME && <SortableHeader field="NAME">{t('drugName')}</SortableHeader>}
                  {columnSettings.ALIAS && <SortableHeader field="ALIAS">{t('alias')}</SortableHeader>}
                  <SortableHeader field="COMMENT">{t('reviewStatus')}</SortableHeader>
                  {columnSettings.STOCK && <SortableHeader field="STOCK">{t('stockQty')}</SortableHeader>}
                  {columnSettings.COUNT && <SortableHeader field="COUNT">{t('countQty')}</SortableHeader>}
                  {columnSettings.REVIEW && <SortableHeader field="REVIEW">{t('reviewQty')}</SortableHeader>}
                  {columnSettings.stockAmount && <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">{t('stockAmount')}</th>}
                  {columnSettings.finalBalance && <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 whitespace-nowrap">{t('finalBalance')}</th>}
                  {columnSettings.QTY && <SortableHeader field="QTY">{t('usageQty')}</SortableHeader>}
                  {columnSettings.PRICE && <SortableHeader field="PRICE">{t('unitPrice')}</SortableHeader>}
                  {columnSettings.ERROR && <SortableHeader field="ERROR">{t('errorQty')}</SortableHeader>}
                  {columnSettings.ERROR_MONEY && <SortableHeader field="ERROR_MONEY">{t('errorAmount')}</SortableHeader>}
                  {columnSettings.ERROR_PERCENT && <SortableHeader field="ERROR_PERCENT">{t('errorPercentage')}</SortableHeader>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {currentPageData.length === 0 ? (
                  <tr>
                    <td colSpan={isAdjustingReviewItems ? 17 : 16} className="px-4 py-8 text-center text-gray-500">
                      {searchTerm ? t('noSearchResults') : t('noData')}
                    </td>
                  </tr>
                ) : (
                  currentPageData.map((item) => (
                    <tr key={item.index} className="hover:bg-gray-50">
                      {/* Checkbox column - only show when adjusting */}
                      {isAdjustingReviewItems && (
                        <td className="px-4 py-3">
                          <input
                            type="checkbox"
                            checked={reviewItemsState[item.GUID || item.CODE] || false}
                            onChange={(e) => handleReviewItemToggle(item.GUID || item.CODE, e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
                      )}
                      <td className="px-4 py-3 text-sm text-gray-900">{item.index}</td>
                      {columnSettings.CODE && <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{item.CODE}</td>}
                      {columnSettings.SKDIACODE && <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{item.SKDIACODE}</td>}
                      {columnSettings.NAME && <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{item.NAME}</td>}
                      {columnSettings.ALIAS && <td className="px-4 py-3 text-sm text-gray-600">{item.ALIAS}</td>}
                      <td className="px-4 py-3 text-sm text-gray-600">{item.COMMENT === '覆盤' ? 'Y' : '-'}</td>
                      {columnSettings.STOCK && <td className="px-4 py-3 text-sm text-gray-900">{item.QTY != null ? item.QTY.toLocaleString() : ''}</td>}
                      {columnSettings.COUNT && <td className="px-4 py-3 text-sm text-gray-900">{item.COUNT.toLocaleString()}</td>}
                      {columnSettings.REVIEW && <td className="px-4 py-3 text-sm text-gray-900">{item.REVIEW.toLocaleString()}</td>}
                      {columnSettings.stockAmount && <td className="px-4 py-3 text-sm text-gray-900">{item.stockAmount.toLocaleString()}</td>}
                      {columnSettings.finalBalance && <td className="px-4 py-3 text-sm text-gray-900">{item.finalBalance.toLocaleString()}</td>}
                      {columnSettings.QTY && <td className="px-4 py-3 text-sm text-gray-900">{item.consumption != null ? item.consumption.toLocaleString() : ''}</td>}
                      {columnSettings.PRICE && <td className="px-4 py-3 text-sm text-gray-900">{item.PRICE.toLocaleString()}</td>}
                      {columnSettings.ERROR && <td className={`px-4 py-3 text-sm font-medium ${item.ERROR < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {item.ERROR.toLocaleString()}
                      </td>}
                      {columnSettings.ERROR_MONEY && <td className={`px-4 py-3 text-sm font-medium ${item.ERROR_MONEY < 0 ? 'text-red-600' : 'text-green-600'}`}>
                       {item.ERROR_MONEY.toLocaleString()}
                      </td>}
                      {columnSettings.ERROR_PERCENT && <td className={`px-4 py-3 text-sm font-medium ${item.ERROR_PERCENT < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {item.ERROR_PERCENT.toFixed(2)}%
                      </td>}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReconciliationSummaryTable;