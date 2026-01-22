import React from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { TrophyIcon, TimerIcon, SkullIcon, TargetIcon, HeartIcon, UserIcon } from 'lucide-react';

export const Dashboard = () => {
  const playerStats = [{
    name: 'Total Playtime',
    value: '124h 35m',
    icon: <TimerIcon className="h-5 w-5" />
  }, {
    name: 'Kill Count',
    value: '1,487',
    icon: <SkullIcon className="h-5 w-5" />
  }, {
    name: 'Accuracy',
    value: '68%',
    icon: <TargetIcon className="h-5 w-5" />
  }, {
    name: 'Survival Rate',
    value: '42%',
    icon: <HeartIcon className="h-5 w-5" />
  }];

  const recentAchievements = [{
    name: 'Sharpshooter',
    description: 'Achieved 50 headshots in a single game session',
    date: '3 days ago',
    icon: <TargetIcon className="h-5 w-5" />,
    rarity: 'Rare'
  }, {
    name: 'Survivalist',
    description: 'Survived for 7 consecutive days in SCUM',
    date: '1 week ago',
    icon: <HeartIcon className="h-5 w-5" />,
    rarity: 'Uncommon'
  }, {
    name: 'Team Player',
    description: 'Helped revive 25 teammates',
    date: '2 weeks ago',
    icon: <UserIcon className="h-5 w-5" />,
    rarity: 'Common'
  }];

  return (
    <DashboardLayout currentPage="dashboard">
      <div className="mb-6 p-4 bg-blue-900/20 border border-blue-800 rounded-md">
        <p className="text-sm text-blue-300">
          <strong>Welcome to your Player Dashboard:</strong> Track your game
          stats, view your achievements, and manage your gaming profile across our platform.
        </p>
      </div>

      {/* Player Stats */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-4">Your Stats</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {playerStats.map((stat) => (
            <div key={stat.name} className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <div className="flex items-center mb-2">
                <div className="bg-blue-500/20 p-2 rounded-full mr-3">
                  {stat.icon}
                </div>
                <p className="text-sm font-medium text-gray-400">{stat.name}</p>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Player Card & Recent Achievements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-1">
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden h-full">
            <div className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className="h-24 w-24 rounded-full bg-gray-700 flex items-center justify-center mb-4">
                  <UserIcon className="h-12 w-12 text-gray-500" />
                </div>
                <h3 className="text-xl font-bold">GamerTag123</h3>
                <p className="text-blue-400 mb-2">Premium Member</p>
                <div className="flex items-center text-sm text-gray-400 mb-4">
                  <span className="flex items-center">
                    <TrophyIcon className="h-4 w-4 mr-1 text-yellow-500" />
                    Level 24
                  </span>
                  <span className="mx-2">•</span>
                  <span>Joined 3 months ago</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: '65%' }}
                  ></div>
                </div>
                <p className="text-xs text-gray-400">
                  3,500 XP needed for Level 25
                </p>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-700 p-2 rounded">
                  <div className="text-lg font-bold">42</div>
                  <div className="text-xs text-gray-400">Friends</div>
                </div>
                <div className="bg-gray-700 p-2 rounded">
                  <div className="text-lg font-bold">18</div>
                  <div className="text-xs text-gray-400">Badges</div>
                </div>
                <div className="bg-gray-700 p-2 rounded">
                  <div className="text-lg font-bold">7</div>
                  <div className="text-xs text-gray-400">Events</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden h-full">
            <div className="px-6 py-4 border-b border-gray-700">
              <h2 className="font-bold">Recent Achievements</h2>
            </div>
            <div className="p-4">
              {recentAchievements.map((achievement, index) => (
                <div 
                  key={achievement.name} 
                  className={`flex items-start p-4 ${index < recentAchievements.length - 1 ? 'border-b border-gray-700' : ''}`}
                >
                  <div className={`
                    p-3 rounded-full mr-4 flex-shrink-0
                    ${achievement.rarity === 'Rare' 
                      ? 'bg-purple-900/20' 
                      : achievement.rarity === 'Uncommon' 
                        ? 'bg-blue-900/20' 
                        : 'bg-gray-700'
                    }
                  `}>
                    {achievement.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium">{achievement.name}</h3>
                      <span className={`
                        inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                        ${achievement.rarity === 'Rare' 
                          ? 'bg-purple-900/20 text-purple-400' 
                          : achievement.rarity === 'Uncommon' 
                            ? 'bg-blue-900/20 text-blue-400' 
                            : 'bg-gray-700 text-gray-400'
                        }
                      `}>
                        {achievement.rarity}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">
                      {achievement.description}
                    </p>
                    <p className="text-xs text-gray-500 mt-2">
                      Unlocked {achievement.date}
                    </p>
                  </div>
                </div>
              ))}
              <div className="mt-4 text-center">
                <button className="text-blue-400 hover:text-blue-300 text-sm font-medium">
                  View All Achievements
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activity & Events */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="font-bold">Recent Activity</h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-start space-x-3 pb-3 border-b border-gray-700">
              <div className="h-8 w-8 rounded-full bg-green-900/20 flex items-center justify-center flex-shrink-0">
                <TrophyIcon className="h-4 w-4 text-green-400" />
              </div>
              <div>
                <p className="text-sm">
                  You achieved level <span className="text-blue-400">24</span> and unlocked new features
                </p>
                <p className="text-xs text-gray-400 mt-1">2 days ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 pb-3 border-b border-gray-700">
              <div className="h-8 w-8 rounded-full bg-purple-900/20 flex items-center justify-center flex-shrink-0">
                <TargetIcon className="h-4 w-4 text-purple-400" />
              </div>
              <div>
                <p className="text-sm">
                  You unlocked the <span className="text-purple-400">Sharpshooter</span> achievement
                </p>
                <p className="text-xs text-gray-400 mt-1">3 days ago</p>
              </div>
            </div>
            <div className="flex items-start space-x-3 pb-3 border-b border-gray-700">
              <div className="h-8 w-8 rounded-full bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                <UserIcon className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="text-sm">
                  <span className="text-blue-400">SurvivalKing</span> added you as a friend
                </p>
                <p className="text-xs text-gray-400 mt-1">5 days ago</p>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="font-bold">Upcoming Events</h2>
          </div>
          <div className="p-4 space-y-4">
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">SCUM PvP Tournament</h3>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-900/20 text-green-400">
                  Registered
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-3">
                Compete in our monthly PvP tournament for exclusive in-game
                rewards and bragging rights.
              </p>
              <div className="flex items-center text-xs text-gray-400">
                <TimerIcon className="h-3 w-3 mr-1" />
                <span>This Saturday at 8:00 PM</span>
              </div>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-medium">SCUM Base Building Contest</h3>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900/20 text-blue-400">
                  Coming Soon
                </span>
              </div>
              <p className="text-sm text-gray-400 mb-3">
                Show off your architectural skills and win prizes for the most
                creative and secure base designs.
              </p>
              <div className="flex items-center text-xs text-gray-400">
                <TimerIcon className="h-3 w-3 mr-1" />
                <span>After server launch - Registration open</span>
              </div>
              <button className="mt-3 w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-medium">
                Get Notified
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};