import { useState } from 'react';
import { ArrowRightIcon } from 'lucide-react';
import { LoginModal } from './LoginModal';
import { useTranslation } from '../hooks/useTranslation';

export const CTA = () => {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const t = useTranslation();

  return (
    <section className="py-20 bg-gradient-to-b from-gray-800 to-gray-900">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            {t('home.cta.title')}
          </h2>
          <p className="text-xl text-gray-300 mb-10">
            {t('home.cta.description')}
          </p>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-md font-medium text-lg transition flex items-center mx-auto"
            onClick={() => setIsLoginModalOpen(true)}
          >
            {t('home.cta.getStarted')}
            <ArrowRightIcon className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
      />
    </section>
  );
};