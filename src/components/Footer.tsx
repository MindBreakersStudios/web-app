import { Facebook, Twitter, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTranslation } from '../hooks/useTranslation';
import { useLocation } from 'react-router-dom';

export const Footer = () => {
  const t = useTranslation();
  const location = useLocation();

  // Helper function to handle section navigation
  const handleSectionClick = (sectionId: string) => {
    if (location.pathname !== '/') {
      // If not on home page, navigate to home with hash
      window.location.href = `/#${sectionId}`;
    } else {
      // If already on home page, just scroll
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <img
              src="/images/logos/Logo-35.png"
              alt="MindBreakers Logo"
              className="h-10 mb-4 object-contain"
            />
            <p className="text-gray-400 mb-4">
              {t('footer.description')}
            </p>
            <div className="flex space-x-4">
              <a
                href="#"
                className="text-gray-400 hover:text-blue-400 transition"
              >
                <div className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-blue-400 transition"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-blue-400 transition"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="#"
                className="text-gray-400 hover:text-blue-400 transition"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">{t('footer.quickLinks.title')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-blue-400 transition">
                  {t('footer.quickLinks.home')}
                </Link>
              </li>
              <li>
                <button onClick={() => handleSectionClick('servers')} className="text-gray-400 hover:text-blue-400 transition text-left">
                  {t('footer.quickLinks.servers')}
                </button>
              </li>
              <li>
                <button onClick={() => handleSectionClick('features')} className="text-gray-400 hover:text-blue-400 transition text-left">
                  {t('footer.quickLinks.features')}
                </button>
              </li>
              <li>
                <button onClick={() => handleSectionClick('about')} className="text-gray-400 hover:text-blue-400 transition text-left">
                  {t('footer.quickLinks.aboutUs')}
                </button>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">{t('footer.servers.title')}</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/humanitz" className="text-gray-400 hover:text-blue-400 transition">
                  {t('footer.servers.humanitzServer')}
                </Link>
              </li>
              <li>
                <Link to="/scum" className="text-gray-400 hover:text-blue-400 transition">
                  {t('footer.servers.scumServer')}
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-bold mb-4">{t('footer.legal.title')}</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                  {t('footer.legal.termsOfService')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                  {t('footer.legal.privacyPolicy')}
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-blue-400 transition">
                  {t('footer.legal.refundPolicy')}
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="border-t border-gray-800 mt-12 pt-8 text-center">
          <p className="text-gray-500 flex items-center justify-center">
            <img
              src="/images/logos/Face-18.png"
              alt="MindBreakers"
              className="h-5 w-5 mr-2 opacity-70 object-contain"
            />
            {t('footer.copyright').replace('{year}', new Date().getFullYear().toString())}
          </p>
        </div>
      </div>
    </footer>
  );
};