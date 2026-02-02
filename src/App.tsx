import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { GameServers } from './components/GameServers';
import { Features } from './components/Features';
import { Stats } from './components/Stats';
import { CTA } from './components/CTA';
import { Footer } from './components/Footer';
import { DebugInfo } from './components/DebugInfo';
import { MindBreakerBot } from './components/MindBreakerBot';
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

  return (
    <>
      <Helmet>
        <title>MindBreakers - Experiencia en Gaming</title>
        <meta name="description" content="MindBreakers - Experiencia en gaming. Servidores de juegos survival con comunidad activa desde 2020. HumanitZ, SCUM y más." />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://mindbreakers.net/" />
        <meta property="og:title" content="MindBreakers - Experiencia en Gaming" />
        <meta property="og:description" content="MindBreakers - Experiencia en gaming. Servidores de juegos survival con comunidad activa desde 2020." />
        <meta property="og:image" content="https://mindbreakers.net/images/logos/Logo-35.png" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:url" content="https://mindbreakers.net/" />
        <meta name="twitter:title" content="MindBreakers - Experiencia en Gaming" />
        <meta name="twitter:description" content="MindBreakers - Experiencia en gaming. Servidores de juegos survival con comunidad activa desde 2020." />
        <meta name="twitter:image" content="https://mindbreakers.net/images/logos/Logo-35.png" />
      </Helmet>
      <Hero />
      <GameServers />
      {/* Uncomment with proper imports to see StatsDisplay working */}
      {/* <StatsDisplay stats={GameStats} /> */}
      <Features />
      <Stats />
      <CTA />
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
          <MindBreakerBot />
        </div>
      </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}