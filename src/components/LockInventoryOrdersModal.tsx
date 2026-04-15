import React, { useState, useEffect } from 'react';
import { X, Lock, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { InventoryOrder } from '../types';
import { ApiService } from '../services/api';

interface LockInventoryOrdersModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRecord: string;
  onLockComplete: () => void;
}

const LockInventoryOrdersModal: React.FC<LockInventoryOrdersModalProps> = ({
  isOpen,
  onClose,
  selectedRecord,
  onLockComplete
}) => {
  const { t } = useTranslation();
  const [inventoryOrders, setInventoryOrders] = useState<InventoryOrder[]>([]);
  const [loading, setLoading] = useState(false);
  const [locking, setLocking] = useState(false);

  useEffect(() => {
    if (isOpen && selectedRecord) {
      loadInventoryOrders();
    }
  }, [isOpen, selectedRecord]);

  const loadInventoryOrders = async () => {
    if (!selectedRecord) return;
    
    try {
      setLoading(true);
      console.log('=== LOADING INVENTORY ORDERS FOR LOCKING ===');
      console.log('Selected Record:', selectedRecord);
      
      const response = await ApiService.getFullInventoryBySN(selectedRecord);
      console.log('Full Inventory Response:', response);
      
      if (response.Code === 200 && response.Data && response.Data.records_Ary) {
        // Extract inventory orders from records_Ary[i].creat
        const orders: InventoryOrder[] = [];
        
        response.Data.records_Ary.forEach((record: any) => {
          if (record.creat) {
            const order: InventoryOrder = {
              IC_SN: record.creat.IC_SN || '',
              IC_NAME: record.creat.IC_NAME || '',
              STATE: record.creat.STATE || ''
            };
            
            // Only include orders where STATE != "鎖定"
            if (order.STATE !== '鎖定') {
              orders.push(order);
            }
          }
        });
        
        console.log('Filtered Inventory Orders (non-locked):', orders);
        setInventoryOrders(orders);
      } else {
        console.log('No inventory orders found or invalid response');
        setInventoryOrders([]);
      }
    } catch (error) {
      console.error('Failed to load inventory orders:', error);
      setInventoryOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const handleLockOrders = async () => {
    if (inventoryOrders.length === 0) return;
    
    try {
      setLocking(true);
      console.log('=== LOCKING INVENTORY ORDERS ===');
      console.log('Orders to lock:', inventoryOrders);
      
      // Lock all inventory orders sequentially
      for (const order of inventoryOrders) {
        console.log(`Locking order: ${order.IC_SN}`);
        
        const response = await ApiService.lockInventoryOrder(order.IC_SN);
        console.log(`Lock response for ${order.IC_SN}:`, response);
        
        if (response.Code !== 200) {
          throw new Error(`Failed to lock order ${order.IC_SN}: ${response.Result}`);
        }
      }
      
      console.log('✅ All inventory orders locked successfully');
      
      // Close modal and notify parent component
      onClose();
      onLockComplete();
      
    } catch (error) {
      console.error('Failed to lock inventory orders:', error);
      alert(`Failed to lock inventory orders: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLocking(false);
    }
  };

  const handleClose = () => {
    if (!locking) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-900">{t('lockInventoryOrders')}</h2>
            <button 
              onClick={handleClose} 
              disabled={locking}
              className="text-gray-500 hover:text-gray-700 disabled:opacity-50"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          {selectedRecord && (
            <p className="text-sm text-gray-600 mt-1">{t('selectedRecord')}: {selectedRecord}</p>
          )}
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-8">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
              <p className="text-gray-600">{t('loading')}</p>
            </div>
          ) : inventoryOrders.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Lock className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p className="text-lg">{t('noUnlockedInventoryOrders')}</p>
              <p className="text-sm">{t('allOrdersAlreadyLocked')}</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <Lock className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-yellow-800">
                        {t('lockInventoryOrdersWarning')}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto max-h-96">
                <table className="w-full">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        {t('inventoryOrderNumber')}
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        {t('inventoryOrderName')}
                      </th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                        {t('currentState')}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {inventoryOrders.map((order) => (
                      <tr key={order.IC_SN} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900 font-mono">
                          {order.IC_SN}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {order.IC_NAME}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            order.STATE === '鎖定' 
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {order.STATE}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  {inventoryOrders.length} {t('ordersToLock')}
                </div>
                <div className="flex space-x-3">
                  <button
                    onClick={handleClose}
                    disabled={locking}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={handleLockOrders}
                    disabled={locking || inventoryOrders.length === 0}
                    className={`flex items-center px-6 py-2 rounded-lg transition-colors ${
                      locking || inventoryOrders.length === 0
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {locking ? (
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    ) : (
                      <Lock className="h-5 w-5 mr-2" />
                    )}
                    {locking ? t('locking') : t('lockOrders')}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LockInventoryOrdersModal;