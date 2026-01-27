import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { GameServers } from './components/GameServers';
import { Features } from './components/Features';
import { Stats } from './components/Stats';
import { CTA } from './components/CTA';
import { Footer } from './components/Footer';
import { DebugInfo } from './components/DebugInfo';
// TODO: Uncomment to enable dashboard development
// import { Dashboard } from './pages/Dashboard';
import { AuthProvider } from './lib/auth';
import { LanguageProvider } from './contexts/LanguageContext';
import { Profile } from './pages/Profile';
import { Humanitz } from './pages/Humanitz';
import { Scum } from './pages/Scum';
import { SteamCallback } from './pages/SteamCallback';
import { SteamLinkCallback } from './pages/SteamLinkCallback';
import { AuthCallback } from './pages/AuthCallback';
// uncomment to see StatsDisplay working with StatsDisplay component render
// import { StatsDisplay } from './components/StatsDisplay/StatsDisplay';
// import { GameStats } from './fixtures/StatsDisplayFixture';

const HomePage = () => {
  const location = useLocation();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    // Handle hash navigation when component mounts or hash changes
    if (location.hash) {
      const hash = location.hash.substring(1); // Remove the #
      setTimeout(() => {
        const element = document.getElementById(hash);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location.hash]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <Hero />
      <GameServers />
      {/* Uncomment with proper imports to see StatsDisplay working */}
      {/* <StatsDisplay stats={GameStats} /> */}
      <Features />
      <Stats />
      <CTA />

      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-6 right-6 bg-gray-800 border border-gray-700 hover:border-lime-400 rounded-full p-3 transition-all duration-300 z-50 ${
          showScrollTop ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        aria-label="Scroll to top"
      >
        <img
          src="/images/logos/Face-18.png"
          alt="Scroll to top"
          className="h-8 w-8 object-contain"
        />
      </button>
    </>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
        <div className="min-h-screen bg-gray-900 text-white">
          <DebugInfo />
          <Routes>
            <Route path="/" element={
              <>
                <Header />
                <HomePage />
                <Footer />
              </>
            } />
            {/* TODO: Uncomment to enable dashboard development */}
            {/* <Route path="/dashboard" element={
              <>
                <Header />
                <Dashboard />
                <Footer />
              </>
            } /> */}
            <Route path="/profile" element={
              <>
                <Header />
                <Profile />
                <Footer />
              </>
            } />
            <Route path="/humanitz" element={<Humanitz />} />
            <Route path="/scum" element={<Scum />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/auth/steam-callback" element={<SteamCallback />} />
            <Route path="/auth/steam-link-callback" element={<SteamLinkCallback />} />
          </Routes>
        </div>
      </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}