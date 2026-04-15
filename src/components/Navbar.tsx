import React from 'react';
import { Layers, Globe, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { User } from '../types';

interface NavbarProps {
  user: User;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onLogout }) => {
  const { t, i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'zh' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <nav className="bg-transparent py-4 md:py-6 lg:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <a
              href="../frontpage"
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <span className="sr-only">Home</span>
              <Layers className="w-7 h-7" />
            </a>
            <div>
              <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-2">
                {t('inventoryMerge')}
              </h1>
              <p className="text-gray-600 text-base">
                {user.Name} - {user.Employer}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button 
              onClick={toggleLanguage}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
            >
              <Globe className="w-5 h-5 text-gray-600" />
              <span className="hidden sm:inline ml-2 text-base text-gray-700">
                {i18n.language === 'en' ? 'English' : '繁體中文'}
              </span>
            </button>
            <button 
              onClick={onLogout}
              className="px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:inline ml-2 text-base">{t('logout')}</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;