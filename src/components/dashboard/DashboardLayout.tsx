import React from 'react';
import { DashboardHeader } from './DashboardHeader';

interface DashboardLayoutProps {
  children: React.ReactNode;
  currentPage: string;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  children,
  currentPage
}) => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans selection:bg-blue-500/30">
      <DashboardHeader currentPage={currentPage} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
};
