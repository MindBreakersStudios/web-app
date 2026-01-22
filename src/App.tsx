import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { GameServers } from './components/GameServers';
import { Features } from './components/Features';
import { Stats } from './components/Stats';
import { CTA } from './components/CTA';
import { Footer } from './components/Footer';
import { DebugInfo } from './components/DebugInfo';
import { Dashboard } from './pages/Dashboard';
import { AuthProvider } from './lib/auth';
import { LanguageProvider } from './contexts/LanguageContext';
import { Profile } from './pages/Profile';
import { Humanitz } from './pages/Humanitz';
import { Scum } from './pages/Scum';
import { SteamCallback } from './pages/SteamCallback';
import { SteamLinkCallback } from './pages/SteamLinkCallback';
import { AuthCallback } from './pages/AuthCallback';

const HomePage = () => (
  <>
    <Hero />
    <GameServers />
    <Features />
    <Stats />
    <CTA />
  </>
);

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
            <Route path="/dashboard" element={
              <>
                <Header />
                <Dashboard />
                <Footer />
              </>
            } />
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