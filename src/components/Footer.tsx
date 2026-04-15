import React from 'react';
import { useTranslation } from 'react-i18next';

const Footer = () => {
  const { t } = useTranslation();

  return (
    <footer className="fixed bottom-0 w-full bg-white shadow-lg bg-white border-t border-gray-200 z-20">
      <div className="max-w-7xl mx-auto px-1 sm:px-1 lg:px-2 py-1">
        <p className="text-sm text-center text-gray-600">{t('copyright')}</p>
      </div>
    </footer>
  );
};

export default Footer;