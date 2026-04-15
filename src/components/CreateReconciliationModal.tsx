import React, { useState } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { User } from '../types';

interface CreateReconciliationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateReconciliation: (name: string) => Promise<void>;
  selectedRecord: string;
  user: User;
  loading: boolean;
}

const CreateReconciliationModal: React.FC<CreateReconciliationModalProps> = ({
  isOpen,
  onClose,
  onCreateReconciliation,
  selectedRecord,
  user,
  loading
}) => {
  const { t } = useTranslation();
  const [reconciliationName, setReconciliationName] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reconciliationName.trim()) {
      alert(t('pleaseEnterReconciliationName'));
      return;
    }

    try {
      await onCreateReconciliation(reconciliationName.trim());
      setReconciliationName(''); // Clear the input after successful creation
      onClose();
    } catch (error) {
      // Error handling is done in the parent component
    }
  };

  const handleClose = () => {
    if (!loading) {
      setReconciliationName('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900">{t('createReconciliationRecord')}</h2>
            <button 
              onClick={handleClose} 
              disabled={loading}
              className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          {selectedRecord && (
            <p className="text-sm text-gray-600 mt-1">{t('selectedRecord')}: {selectedRecord}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <label htmlFor="reconciliationName" className="block text-sm font-medium text-gray-700 mb-2">
              {t('reconciliationRecordName')}
            </label>
            <input
              id="reconciliationName"
              type="text"
              value={reconciliationName}
              onChange={(e) => setReconciliationName(e.target.value)}
              placeholder={t('enterReconciliationNamePlaceholder')}
              disabled={loading}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              required
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('cancel')}
            </button>
            <button
              type="submit"
              disabled={loading || !reconciliationName.trim()}
              className={`flex items-center px-6 py-2 rounded-lg transition-colors ${
                loading || !reconciliationName.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Plus className="h-5 w-5 mr-2" />
              )}
              {loading ? t('creating') : t('create')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateReconciliationModal;