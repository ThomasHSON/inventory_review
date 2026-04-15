import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { ApiService } from '../services/api';
import { User } from '../types';

interface LoginFormModalProps {
  onLoginSuccess: (user: User) => void;
}

const LoginFormModal: React.FC<LoginFormModalProps> = ({ onLoginSuccess }) => {
  const { t } = useTranslation();
  const [id, setId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    document.body.classList.add('modal-open');
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await ApiService.login(id, password);
      if (response.Code === 200) {
        sessionStorage.setItem('user_session', JSON.stringify(response.Data));
        onLoginSuccess(response.Data);
      } else {
        setError(response.Result);
      }
    } catch (err) {
      setError(t('loginError'));
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-[#F8F9FF] flex items-center justify-center">
      <div className="w-full max-w-md p-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-2 text-gray-900">{t('inventoryMerge')}</h2>
        </div>
        <div className="bg-white rounded-lg p-8 w-full max-w-md">
          <form onSubmit={handleLogin} className="space-y-6 bg-white rounded-2xl shadow-sm">
            <div>
              <label htmlFor="id" className="block text-base font-medium text-gray-700 mb-1">
                {t('userId')}
              </label>
              <input
                id="id"
                type="text"
                value={id}
                onChange={(e) => setId(e.target.value)}
                className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                required
                placeholder={t('login_id')}
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-base font-medium text-gray-700 mb-1">
                {t('password')}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-150 ease-in-out"
                required
                placeholder={t('login_password')}
              />
            </div>
            {error && (
              <div className="text-red-600 text-base">{error}</div>
            )}
            <button
              type="submit"
              className="block w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-150 ease-in-out font-medium text-lg mt-2"
            >
              {t('login')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginFormModal;