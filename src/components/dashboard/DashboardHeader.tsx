import React from 'react';
import { BellIcon, MenuIcon, XIcon } from 'lucide-react';
interface DashboardHeaderProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  title: string;
}
export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  sidebarOpen,
  setSidebarOpen,
  title
}) => {
  return <header className="bg-gray-800 border-b border-gray-700 sticky top-0 z-30">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center">
          <button type="button" className="lg:hidden text-gray-400 hover:text-white focus:outline-none" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <XIcon className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
          </button>
          <h1 className="ml-4 lg:ml-0 text-xl font-bold text-white capitalize">
            {title}
          </h1>
        </div>
        <div className="flex items-center space-x-4">
          <button type="button" className="relative p-1 rounded-full text-gray-400 hover:text-white focus:outline-none">
            <BellIcon className="h-6 w-6" />
            <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-blue-500 ring-2 ring-gray-800"></span>
          </button>
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center">
              <span className="text-sm font-medium">MB</span>
            </div>
            <span className="ml-2 text-sm font-medium hidden md:block">
              GamerTag123
            </span>
          </div>
        </div>
      </div>
    </header>;
};