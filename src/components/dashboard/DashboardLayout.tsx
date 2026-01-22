import React, { useState } from 'react';
import { LayoutDashboardIcon, UsersIcon, SettingsIcon, LogOutIcon, TrophyIcon, GamepadIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardHeader } from './DashboardHeader';
import { useTranslation } from '../../hooks/useTranslation';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPage: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  currentPage
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const t = useTranslation();

  const navigationItems = [{
    name: t('dashboard.navigation.dashboard'),
    key: 'dashboard',
    icon: <LayoutDashboardIcon className="h-5 w-5" />,
    href: '/dashboard'
  }, {
    name: t('dashboard.navigation.leaderboards'),
    key: 'leaderboards',
    icon: <TrophyIcon className="h-5 w-5" />,
    href: '/dashboard/leaderboards'
  }, {
    name: t('dashboard.navigation.community'),
    key: 'community',
    icon: <UsersIcon className="h-5 w-5" />,
    href: '/dashboard/community'
  }, {
    name: t('dashboard.navigation.settings'),
    key: 'settings',
    icon: <SettingsIcon className="h-5 w-5" />,
    href: '/dashboard/settings'
  }];

  return (
    <div className="min-h-screen bg-gray-900 text-white flex">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden" 
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-0 left-0 bottom-0 w-64 bg-gray-800 border-r border-gray-700 z-50
        transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-center h-16 border-b border-gray-700 px-4">
          <Link to="/">
            <img src="/Logo-35.png" alt="MindBreakers Logo" className="h-8" />
          </Link>
        </div>

        <div className="py-4">
          <div className="px-4 py-3">
            <div className="flex items-center">
              <div className="h-9 w-9 rounded-full bg-gray-700 flex items-center justify-center">
                <span className="text-sm font-medium">GT</span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">GamerTag123</p>
                <p className="text-xs text-blue-400">{t('dashboard.sidebar.premiumMember')}</p>
              </div>
            </div>
          </div>

          <nav className="mt-4 px-4 space-y-1">
            {navigationItems.map((item) => {
              const isActive = currentPage === item.key;
              return (
                <Link
                  key={item.key}
                  to={item.href}
                  className={`
                    flex items-center px-4 py-3 rounded-md text-sm font-medium transition
                    ${isActive 
                      ? 'bg-blue-600 text-white' 
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                    }
                  `}
                >
                  <span className={`mr-3 ${isActive ? 'text-white' : 'text-gray-400'}`}>
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="mt-6 px-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center mb-3">
                <GamepadIcon className="h-5 w-5 text-blue-400 mr-2" />
                <h3 className="font-medium text-sm">{t('dashboard.sidebar.gameStats')}</h3>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">{t('dashboard.sidebar.level')}</span>
                  <span>24</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-1.5">
                  <div 
                    className="bg-blue-500 h-1.5 rounded-full" 
                    style={{ width: '65%' }}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">{t('dashboard.sidebar.totalKills')}</span>
                  <span>1,487</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">{t('dashboard.sidebar.playtime')}</span>
                  <span>124h 35m</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 px-4">
            <div className="border-t border-gray-700 pt-4">
              <Link 
                to="/" 
                className="flex items-center px-4 py-3 rounded-md text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white transition"
              >
                <LogOutIcon className="mr-3 h-5 w-5 text-gray-400" />
                {t('dashboard.sidebar.backToHome')}
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          title={currentPage} 
        />
        <main className="flex-1 overflow-y-auto bg-gray-900 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};
