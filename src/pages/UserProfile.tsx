import React, { useState } from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { UserIcon, KeyIcon, CreditCardIcon, BellIcon, SaveIcon } from 'lucide-react';
export const UserProfile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Profile Information</h3>
              <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Display Name
                    </label>
                    <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" defaultValue="GamerTag123" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Email Address
                    </label>
                    <input type="email" className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" defaultValue="gamer@example.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Discord Username
                    </label>
                    <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" defaultValue="GamerTag#1234" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Steam ID
                    </label>
                    <input type="text" className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" defaultValue="STEAM_0:1:12345678" />
                  </div>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center">
                    <SaveIcon className="h-4 w-4 mr-2" />
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Avatar</h3>
              <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center">
                    <div className="h-24 w-24 rounded-full bg-gray-700 flex items-center justify-center">
                      <UserIcon className="h-12 w-12 text-gray-500" />
                    </div>
                    <div className="ml-6">
                      <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium">
                        Upload New Avatar
                      </button>
                      <p className="text-xs text-gray-400 mt-2">
                        JPG, GIF or PNG. Max size 2MB.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>;
      case 'security':
        return <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Change Password</h3>
              <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Current Password
                    </label>
                    <input type="password" className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      New Password
                    </label>
                    <input type="password" className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">
                      Confirm New Password
                    </label>
                    <input type="password" className="w-full bg-gray-900 border border-gray-700 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
                  </div>
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium">
                    Update Password
                  </button>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">
                Two-Factor Authentication
              </h3>
              <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">
                        Protect your account with 2FA
                      </h4>
                      <p className="text-sm text-gray-400 mt-1">
                        Add an extra layer of security to your account by
                        enabling two-factor authentication.
                      </p>
                    </div>
                    <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium">
                      Enable 2FA
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>;
      case 'billing':
        return <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Payment Methods</h3>
              <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-700">
                    <div className="flex items-center">
                      <div className="h-10 w-16 bg-gray-700 rounded flex items-center justify-center">
                        <span className="text-xs font-medium">VISA</span>
                      </div>
                      <div className="ml-4">
                        <p className="font-medium">•••• •••• •••• 4242</p>
                        <p className="text-xs text-gray-400">Expires 12/24</p>
                      </div>
                    </div>
                    <div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-900/20 text-green-400">
                        Default
                      </span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium">
                      Add Payment Method
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium mb-4">Subscription</h3>
              <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-center justify-between pb-4 border-b border-gray-700">
                    <div>
                      <h4 className="font-medium">Premium Plan</h4>
                      <p className="text-sm text-gray-400 mt-1">
                        $19.99 billed monthly
                      </p>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/20 text-blue-400">
                      Active
                    </span>
                  </div>
                  <div className="mt-4 space-y-2">
                    <div className="flex items-center">
                      <div className="h-5 w-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                      </div>
                      <span className="ml-2 text-sm">2 Game Servers</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-5 w-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                      </div>
                      <span className="ml-2 text-sm">Priority Support</span>
                    </div>
                    <div className="flex items-center">
                      <div className="h-5 w-5 rounded-full bg-blue-500/20 flex items-center justify-center">
                        <div className="h-2 w-2 rounded-full bg-blue-400"></div>
                      </div>
                      <span className="ml-2 text-sm">Custom Plugins</span>
                    </div>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <button className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-md text-sm font-medium">
                      Upgrade Plan
                    </button>
                    <button className="border border-gray-700 text-gray-400 hover:text-white px-4 py-2 rounded-md text-sm font-medium">
                      Cancel Subscription
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>;
      case 'notifications':
        return <div>
            <h3 className="text-lg font-medium mb-4">Notification Settings</h3>
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
              <div className="p-6 space-y-6">
                <div>
                  <h4 className="font-medium mb-3">Email Notifications</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Server status updates</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Security alerts</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Billing notifications</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Newsletter and updates</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-3">In-App Notifications</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Player joins/leaves</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Server performance alerts</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Chat mentions</span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium">
                  Save Preferences
                </button>
              </div>
            </div>
          </div>;
      default:
        return null;
    }
  };
  return <DashboardLayout currentPage="settings">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Account Settings</h2>
          <p className="text-gray-400 mt-1">
            Manage your account settings and preferences
          </p>
        </div>
        <div className="flex border-b border-gray-700 mb-6 overflow-x-auto">
          <button className={`
              px-6 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap
              ${activeTab === 'profile' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-300'}
            `} onClick={() => setActiveTab('profile')}>
            <UserIcon className="h-4 w-4 inline mr-2" />
            Profile
          </button>
          <button className={`
              px-6 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap
              ${activeTab === 'security' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-300'}
            `} onClick={() => setActiveTab('security')}>
            <KeyIcon className="h-4 w-4 inline mr-2" />
            Security
          </button>
          <button className={`
              px-6 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap
              ${activeTab === 'billing' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-300'}
            `} onClick={() => setActiveTab('billing')}>
            <CreditCardIcon className="h-4 w-4 inline mr-2" />
            Billing
          </button>
          <button className={`
              px-6 py-3 text-sm font-medium border-b-2 -mb-px whitespace-nowrap
              ${activeTab === 'notifications' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-300'}
            `} onClick={() => setActiveTab('notifications')}>
            <BellIcon className="h-4 w-4 inline mr-2" />
            Notifications
          </button>
        </div>
        {renderTabContent()}
      </div>
    </DashboardLayout>;
};