import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Navbar from './components/Navbar';
import Tabs from './components/Tabs';
import LoginFormModal from './components/LoginFormModal';
import Footer from './components/Footer';
import SearchConditionSection from './components/SearchConditionSection';
import FilterSection from './components/FilterSection';
import ButtonSection from './components/ButtonSection';
import ReconciliationSummaryTable from './components/ReconciliationSummaryTable';
import InventoryConfigModal from './components/InventoryConfigModal';
import UnitPriceConfigModal from './components/UnitPriceConfigModal';
import UsageQtyConfigModal from './components/UsageQtyConfigModal';
import AliasConfigModal from './components/AliasConfigModal';
import ReconciliationSettingsModal from './components/ReconciliationSettingsModal';
import ColumnVisibilityModal from './components/ColumnVisibilityModal';
import CreateReconciliationModal from './components/CreateReconciliationModal';
import LockInventoryOrdersModal from './components/LockInventoryOrdersModal';
import { User, MergedRecord, ReconciliationSummaryItem, ColumnVisibilitySettings, ReconciliationButtonState } from './types';
import { ApiService } from './services/api';
import { loadColumnSettings, saveColumnSettings } from './utils/columnSettings';

function App() {
  const { t } = useTranslation();
  const [user, setUser] = useState<User | null>(null);
  
  // Search conditions state
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('00:00:00');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('23:59:59');
  const [selectedRecord, setSelectedRecord] = useState('');
  const [allMergedRecords, setAllMergedRecords] = useState<MergedRecord[]>([]);
  const [filteredMergedRecords, setFilteredMergedRecords] = useState<MergedRecord[]>([]);
  
  // Summary data state
  const [summaryData, setSummaryData] = useState<ReconciliationSummaryItem[]>([]);
  const [summaryRecordName, setSummaryRecordName] = useState<string>(''); // New state for the record name used in summary
  const [loading, setLoading] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);
  const [hasExistingReport, setHasExistingReport] = useState(false); // Track if report already exists
  
  // Reconciliation button state - now based on API response
  const [reconciliationButtonState, setReconciliationButtonState] = useState<ReconciliationButtonState>('disabled');
  const [reconciliationLoading, setReconciliationLoading] = useState(false);
  const [reconciliationData, setReconciliationData] = useState<any>(null); // Store API response data
  const [lockToggleLoading, setLockToggleLoading] = useState(false);
  
  // Column visibility state
  const [columnSettings, setColumnSettings] = useState<ColumnVisibilitySettings>(loadColumnSettings());
  
  // Modal states
  const [isInventoryModalOpen, setIsInventoryModalOpen] = useState(false);
  const [isUnitPriceModalOpen, setIsUnitPriceModalOpen] = useState(false);
  const [isUsageQtyModalOpen, setIsUsageQtyModalOpen] = useState(false);
  const [isAliasModalOpen, setIsAliasModalOpen] = useState(false);
  const [isReconciliationModalOpen, setIsReconciliationModalOpen] = useState(false);
  const [isColumnVisibilityModalOpen, setIsColumnVisibilityModalOpen] = useState(false);
  const [isCreateReconciliationModalOpen, setIsCreateReconciliationModalOpen] = useState(false);
  const [isLockInventoryOrdersModalOpen, setIsLockInventoryOrdersModalOpen] = useState(false);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user_session');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    // Set default dates to today
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const prevMonth = new Date(today); // 複製一份 today
    prevMonth.setMonth(prevMonth.getMonth() - 1); // 往前推一個月
    const startDateStr = prevMonth.toISOString().split('T')[0]; 
    
    setStartDate(startDateStr);
    setEndDate(todayStr);
  }, []);

  useEffect(() => {
    // Fetch all merged records when component mounts
    fetchAllMergedRecords();
  }, []);

  useEffect(() => {
    // Filter merged records when date range changes
    if (allMergedRecords.length > 0 && startDate && endDate) {
      const startDateTime = `${startDate} ${startTime}`;
      const endDateTime = `${endDate} ${endTime}`;
      const filtered = ApiService.filterMergedRecordsByTime(allMergedRecords, startDateTime, endDateTime);
      setFilteredMergedRecords(filtered);
      
      // Reset selected record if it's no longer in the filtered list
      if (selectedRecord && !filtered.find(r => r.INV_SN === selectedRecord)) {
        setSelectedRecord('');
      }
    }
  }, [allMergedRecords, startDate, startTime, endDate, endTime, selectedRecord]);

  const handleLogout = () => {
    sessionStorage.removeItem('user_session');
    setUser(null);
  };

  const fetchAllMergedRecords = async () => {
    try {
      const records = await ApiService.getMergedRecords();
      setAllMergedRecords(records);
    } catch (error) {
      console.error('Failed to fetch all merged records:', error);
      setAllMergedRecords([]);
    }
  };

  const checkReconciliationState = async () => {
    if (!selectedRecord) return;
    
    try {
      console.log('=== CHECKING RECONCILIATION STATE VIA API ===');
      console.log('Selected Record:', selectedRecord);
      
      const response = await ApiService.checkReconciliationState(selectedRecord);
      console.log('API Response Code:', response.Code);
      console.log('API Response Data:', response.Data);
      
      // Store the API response data for later use
      setReconciliationData(response.Data);
      
      if (response.Code === 200) {
        // Check if the state is locked
        const state = response.Data[0]?.STATE;
        console.log('Review State:', state);
        
        if (state === '鎖定') {
          console.log('Setting button state to: locked');
          setReconciliationButtonState('locked');
        } else {
          console.log('Setting button state to: enter');
          setReconciliationButtonState('enter');
        }
      } else if (response.Code === -5) {
        // Need to generate reconciliation record
        console.log('Setting button state to: generate');
        setReconciliationButtonState('generate');
      } else {
        console.log('Setting button state to: disabled (unexpected code)');
        setReconciliationButtonState('disabled');
      }
      console.log('=== END RECONCILIATION STATE CHECK ===');
    } catch (error) {
      console.error('Failed to check reconciliation state:', error);
      setReconciliationButtonState('disabled');
      setReconciliationData(null);
    }
  };

  const checkReconciliationStateForRecord = async (recordSn: string) => {
    if (!recordSn) return;
    
    try {
      console.log('=== CHECKING RECONCILIATION STATE VIA API ===');
      console.log('Selected Record:', recordSn);
      
      const response = await ApiService.checkReconciliationState(recordSn);
      console.log('API Response Code:', response.Code);
      console.log('API Response Data:', response.Data);
      
      // Store the API response data for later use
      setReconciliationData(response.Data);
      
      if (response.Code === 200) {
        // Check if the state is locked
        const state = response.Data[0]?.STATE;
        console.log('Review State:', state);
        
        if (state === '鎖定') {
          console.log('Setting button state to: locked');
          setReconciliationButtonState('locked');
        } else {
          console.log('Setting button state to: enter');
          setReconciliationButtonState('enter');
        }
      } else if (response.Code === -5) {
        // Need to generate reconciliation record
        console.log('Setting button state to: generate');
        setReconciliationButtonState('generate');
      } else {
        console.log('Setting button state to: disabled (unexpected code)');
        setReconciliationButtonState('disabled');
      }
      console.log('=== END RECONCILIATION STATE CHECK ===');
    } catch (error) {
      console.error('Failed to check reconciliation state:', error);
      setReconciliationButtonState('disabled');
      setReconciliationData(null);
    }
  };

  const handleGenerateSummary = async () => {
    if (!selectedRecord) return;
    
    // Show confirmation dialog
    const confirmMessage = hasExistingReport 
      ? 'Are you sure you want to regenerate the summary? This will replace the existing data.'
      : 'Are you sure you want to generate the summary?';
    
    if (!confirm(confirmMessage)) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Use the appropriate API based on whether report exists
      const data = await ApiService.addReportBySN(selectedRecord);
      
      // Update summary data and set to regenerate mode
      setSummaryData(data);
      setHasExistingReport(true);
      
      // After generating summary, check reconciliation state to update button visibility
      await checkReconciliationState();
      
    } catch (error) {
      console.error('Failed to generate summary:', error);
      setSummaryData([]);
      setSummaryRecordName('');
      alert('Failed to generate summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadReport = async () => {
    if (!selectedRecord) return;
    
    try {
      setDownloadLoading(true);
      await ApiService.downloadSummaryReport(selectedRecord);
    } catch (error) {
      console.error('Failed to download report:', error);
      alert('Failed to download report. Please try again.');
    } finally {
      setDownloadLoading(false);
    }
  };

  const handleRecordChange = async (recordSn: string) => {
    setSelectedRecord(recordSn);
    
    if (recordSn) {
      // Get the record name from the current filtered records
      const recordName = filteredMergedRecords.find(r => r.INV_SN === recordSn)?.INV_NAME || '';
      setSummaryRecordName(recordName);
      
      try {
        setLoading(true);
        
        // Auto-load existing report data
        const reportData = await ApiService.getReportBySN(recordSn);
        
        if (reportData.length > 0) {
          // Report exists - populate table and set regenerate mode
          setSummaryData(reportData);
          setHasExistingReport(true);
        } else {
          // No report exists - clear table and set generate mode
          setSummaryData([]);
          setHasExistingReport(false);
        }
        
        // Check reconciliation state after loading report
        await checkReconciliationStateForRecord(recordSn);
        
      } catch (error) {
        console.error('Failed to load existing report:', error);
        setSummaryData([]);
        setHasExistingReport(false);
      } finally {
        setLoading(false);
      }
    } else {
      // Clear everything when no record is selected
      setSummaryData([]);
      setSummaryRecordName('');
      setHasExistingReport(false);
      setReconciliationButtonState('disabled');
      setReconciliationData(null);
    }
  };

  const handleReconciliationAction = async () => {
    if (!selectedRecord) return;
    
    console.log('=== RECONCILIATION ACTION TRIGGERED ===');
    console.log('Current button state:', reconciliationButtonState);
    console.log('Reconciliation data:', reconciliationData);
    
    if (reconciliationButtonState === 'generate') {
      // Open the create reconciliation modal instead of directly calling API
      console.log('Opening create reconciliation modal');
      setIsCreateReconciliationModalOpen(true);
    } else if (reconciliationButtonState === 'enter') {
      // Implement enter reconciliation functionality
      console.log('=== ENTERING REVIEW SHEET ===');
      
      if (reconciliationData && reconciliationData[0] && reconciliationData[0].IC_SN) {
        const icSn = reconciliationData[0].IC_SN;
        console.log('Setting IC_SN in session storage:', icSn);
        
        // Set session item with key "IC_SN" and value from API response
        sessionStorage.setItem('IC_SN', icSn);
        
        // Redirect to inventory page
        console.log('Redirecting to ../inventory/index.html?administrator');
        window.location.href = '../inventory/index.html?administrator';
      } else {
        console.error('IC_SN not found in reconciliation data');
        alert('Unable to enter review sheet: IC_SN not found in response data');
      }
    } else if (reconciliationButtonState === 'locked') {
      // Show locked message
      console.log('Reconciliation is locked');
      alert('This reconciliation record is locked and cannot be modified.');
    }
    console.log('=== END RECONCILIATION ACTION ===');
  };

  const updateButtonStateFromResponse = (response: any) => {
    console.log('=== UPDATING BUTTON STATE FROM API RESPONSE ===');
    console.log('Response Code:', response.Code);
    console.log('Response Data:', response.Data);
    
    // Store the API response data for later use
    setReconciliationData(response.Data);
    
    if (response.Code === 200) {
      // Check if the state is locked
      const state = response.Data[0]?.STATE;
      console.log('Review State:', state);
      
      if (state === '鎖定') {
        console.log('Setting button state to: locked');
        setReconciliationButtonState('locked');
      } else {
        console.log('Setting button state to: enter');
        setReconciliationButtonState('enter');
      }
    } else if (response.Code === -5) {
      // Need to generate reconciliation record
      console.log('Setting button state to: generate');
      setReconciliationButtonState('generate');
    } else {
      console.log('Setting button state to: disabled (unexpected code)');
      setReconciliationButtonState('disabled');
    }
    console.log('=== END BUTTON STATE UPDATE ===');
  };

  const handleCreateReconciliation = async (reconciliationName: string) => {
    if (!selectedRecord || !user) return;
    
    try {
      setReconciliationLoading(true);
      console.log('=== CREATING RECONCILIATION RECORD ===');
      console.log('Selected Record:', selectedRecord);
      console.log('User Name:', user.Name);
      console.log('Reconciliation Name:', reconciliationName);
      
      const response = await ApiService.generateReconciliationWithName(selectedRecord, user.Name, reconciliationName);
      console.log('Create Reconciliation API Response:', response);
      
      // Handle different response codes
      await handleReconciliationResponse(response);
      
      console.log('=== END RECONCILIATION CREATION ===');
    } catch (error) {
      // Network error: Catch and log with console.error
      console.error('🌐 Network error during reconciliation creation:', error);
      alert(t('failedToCreateReconciliationRecord'));
    } finally {
      setReconciliationLoading(false);
    }
  };

  const handleReconciliationResponse = async (response: any) => {
    if (response.Code === 200) {
      // Success: Use response data to re-evaluate and update button display logic
      console.log('✅ Reconciliation created successfully');
      alert(t('reconciliationRecordCreatedSuccessfully'));
      
      // 🔧 FIX: After successful creation, refresh the reconciliation state to get updated IC_SN
      console.log('🔄 Refreshing reconciliation state to get updated IC_SN...');
      await checkReconciliationState();
      
    } else if (response.Code === -200 && response.Result && response.Result.includes('沒有鎖定')) {
      // Need to lock inventory orders first
      console.log('🔒 Need to lock inventory orders first');
      setIsLockInventoryOrdersModalOpen(true);
      
    } else {
      // Other API error: Just show alert with response.Result content
      console.log('❌ API returned error code:', response.Code);
      alert(response.Result || 'Failed to create reconciliation record');
    }
  };

  const handleLockComplete = async () => {
    console.log('=== LOCK COMPLETE - RETRYING RECONCILIATION ===');
    
    if (!selectedRecord || !user) return;
    
    try {
      setReconciliationLoading(true);
      
      // Re-call the reconciliation generation API after locking
      const response = await ApiService.generateReconciliation(selectedRecord);
      console.log('Reconciliation API Response after locking:', response);
      
      // Handle the response (should be Code 200 now)
      await handleReconciliationResponse(response);
      
    } catch (error) {
      console.error('Failed to generate reconciliation after locking:', error);
      alert(t('failedToCreateReconciliationRecord'));
    } finally {
      setReconciliationLoading(false);
    }
  };

  const handleLockToggle = async () => {
    if (!reconciliationData || !reconciliationData[0] || !reconciliationData[0].IC_SN) {
      console.error('No IC_SN found in reconciliation data');
      return;
    }

    const icSn = reconciliationData[0].IC_SN;
    const currentState = reconciliationData[0].STATE;
    const isCurrentlyLocked = currentState === '鎖定';

    try {
      setLockToggleLoading(true);
      console.log(`=== ${isCurrentlyLocked ? 'UNLOCKING' : 'LOCKING'} INVENTORY ORDER ===`);
      console.log('IC_SN:', icSn);
      console.log('Current State:', currentState);

      let response;
      if (isCurrentlyLocked) {
        // Unlock the inventory order
        response = await ApiService.unlockInventoryOrder(icSn);
      } else {
        // Lock the inventory order
        response = await ApiService.lockInventoryOrder(icSn);
      }

      console.log('Lock/Unlock API Response:', response);

      if (response.Code === 200) {
        console.log(`✅ Inventory order ${isCurrentlyLocked ? 'unlocked' : 'locked'} successfully`);
        
        // Re-check reconciliation state to get updated STATE
        await checkReconciliationState();
        
      } else {
        throw new Error(response.Result || `Failed to ${isCurrentlyLocked ? 'unlock' : 'lock'} inventory order`);
      }

    } catch (error) {
      console.error(`Failed to ${isCurrentlyLocked ? 'unlock' : 'lock'} inventory order:`, error);
      alert(`Failed to ${isCurrentlyLocked ? 'unlock' : 'lock'} inventory order: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLockToggleLoading(false);
    }
  };

  const handleColumnSettingsChange = (newSettings: ColumnVisibilitySettings) => {
    setColumnSettings(newSettings);
    saveColumnSettings(newSettings);
  };

  const isReconciliationButtonDisabled = () => {
    return reconciliationButtonState === 'disabled' || 
           reconciliationLoading ||
           !selectedRecord;
  };

  if (!user) {
    return <LoginFormModal onLoginSuccess={setUser} />;
  }

  return (
    <div className="min-h-screen">
      <Navbar user={user} onLogout={handleLogout} />
      <Tabs />

      <main className="px-4 sm:px-6 lg:px-8 py-8 mb-10">
        <ButtonSection
          onInventorySettings={() => setIsInventoryModalOpen(true)}
          onUnitPriceSettings={() => setIsUnitPriceModalOpen(true)}
          onUsageQtySettings={() => setIsUsageQtyModalOpen(true)}
          onAliasSettings={() => setIsAliasModalOpen(true)}
          onReconciliationSettings={() => setIsReconciliationModalOpen(true)}
          onColumnDisplaySettings={() => setIsColumnVisibilityModalOpen(true)}
          onGenerateSummary={handleGenerateSummary}
          onDownloadReport={handleDownloadReport}
          isGenerateDisabled={!selectedRecord || loading}
          isDownloadDisabled={!selectedRecord}
        />
        
        <SearchConditionSection
          startDate={startDate}
          startTime={startTime}
          endDate={endDate}
          endTime={endTime}
          onStartDateChange={setStartDate}
          onStartTimeChange={setStartTime}
          onEndDateChange={setEndDate}
          onEndTimeChange={setEndTime}
        />

        <FilterSection
          selectedRecord={selectedRecord}
          mergedRecords={filteredMergedRecords}
          onRecordChange={handleRecordChange}
          onDownloadReport={handleDownloadReport}
          isDownloadDisabled={!selectedRecord || !hasExistingReport}
          isDownloadLoading={downloadLoading}
          onGenerateSummary={handleGenerateSummary}
          isGenerateDisabled={!selectedRecord || loading}
          hasExistingReport={hasExistingReport}
        />

        {loading ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">{t('loading')}</p>
            </div>
          </div>
        ) : (
          <ReconciliationSummaryTable 
            data={summaryData} 
            selectedRecordName={summaryRecordName}
            columnSettings={columnSettings}
            onReconciliationAction={handleReconciliationAction}
            reconciliationButtonState={reconciliationButtonState}
            isReconciliationButtonDisabled={isReconciliationButtonDisabled()}
            reconciliationLoading={reconciliationLoading}
            onLockToggle={handleLockToggle}
            lockToggleLoading={lockToggleLoading}
            reconciliationData={reconciliationData}
            onDataUpdate={setSummaryData}
            handleCreateReconciliation={handleCreateReconciliation}
          />
        )}
      </main>

      {/* Modals */}
      <InventoryConfigModal
        isOpen={isInventoryModalOpen}
        onClose={() => setIsInventoryModalOpen(false)}
        selectedRecord={selectedRecord}
      />
      
      <UnitPriceConfigModal
        isOpen={isUnitPriceModalOpen}
        onClose={() => setIsUnitPriceModalOpen(false)}
        selectedRecord={selectedRecord}
      />

      <UsageQtyConfigModal
        isOpen={isUsageQtyModalOpen}
        onClose={() => setIsUsageQtyModalOpen(false)}
        selectedRecord={selectedRecord}
      />

      <AliasConfigModal
        isOpen={isAliasModalOpen}
        onClose={() => setIsAliasModalOpen(false)}
        selectedRecord={selectedRecord}
      />
      
      <ReconciliationSettingsModal
        isOpen={isReconciliationModalOpen}
        onClose={() => setIsReconciliationModalOpen(false)}
        selectedRecord={selectedRecord}
      />

      <ColumnVisibilityModal
        isOpen={isColumnVisibilityModalOpen}
        onClose={() => setIsColumnVisibilityModalOpen(false)}
        columnSettings={columnSettings}
        onSettingsChange={handleColumnSettingsChange}
      />

      <CreateReconciliationModal
        isOpen={isCreateReconciliationModalOpen}
        onClose={() => setIsCreateReconciliationModalOpen(false)}
        onCreateReconciliation={handleCreateReconciliation}
        selectedRecord={selectedRecord}
        user={user}
        loading={reconciliationLoading}
      />

      <LockInventoryOrdersModal
        isOpen={isLockInventoryOrdersModalOpen}
        onClose={() => setIsLockInventoryOrdersModalOpen(false)}
        selectedRecord={selectedRecord}
        onLockComplete={handleLockComplete}
      />

      <Footer />
    </div>
  );
}

export default App;