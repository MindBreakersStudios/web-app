import React from 'react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import {
  UsersIcon, ChevronRightIcon,
  SwordIcon, ShieldCheckIcon, CloudSunIcon, ClockIcon,
  ThermometerIcon, SkullIcon, SignalIcon,
} from 'lucide-react';

// ── Hardcoded HumanitZ server details ───────────────────────────────────────

const SERVER = {
  name: 'MindBreakers | HumanitZ LATAM',
  description: 'Servidor PvP survival con whitelist activa',
  status: 'online' as const,
  mode: 'PvP',
  maxPlayers: 32,
  whitelist: true,
  zombieMultiplier: '2x',
};

// ── Hardcoded live details (to be moved to Supabase later) ──────────────────

const LIVE_DETAILS = [
  { icon: <UsersIcon className="h-5 w-5" />, label: 'Online Players', value: '—', color: 'text-green-400' },
  { icon: <SkullIcon className="h-5 w-5" />, label: 'Zombies', value: '—', color: 'text-red-400' },
  { icon: <ThermometerIcon className="h-5 w-5" />, label: 'Season', value: '—', color: 'text-amber-400' },
  { icon: <CloudSunIcon className="h-5 w-5" />, label: 'Weather', value: '—', color: 'text-cyan-400' },
  { icon: <ClockIcon className="h-5 w-5" />, label: 'Time', value: '—', color: 'text-purple-400' },
];

// ── Features ────────────────────────────────────────────────────────────────

const FEATURES = [
  { label: 'PvP Enabled', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
  { label: 'Whitelist Active', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20' },
  { label: 'Zombies x2', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
];

// ── Component ────────────────────────────────────────────────────────────────

export const ServerManagement = () => {
  return (
    <DashboardLayout currentPage="servers">
      {/* Server Header Banner */}
      <div className="relative h-48 rounded-xl mb-6 overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: 'url(/images/humanitz/title.jpg)' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-900/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />

        {/* Watermark logo */}
        <img
          src="/images/humanitz/Humanitz-logo.jpg"
          alt=""
          className="absolute right-4 top-4 h-16 w-auto rounded-lg opacity-30"
        />

        <div className="absolute inset-0 p-6 flex flex-col justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-500/20 text-green-400 border border-green-500/30 backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full mr-1.5 bg-green-400 animate-pulse" />
              Online
            </span>
            <span className="inline-flex items-center text-xs text-gray-300 bg-gray-800/60 backdrop-blur-sm px-2.5 py-0.5 rounded border border-gray-700/50">
              <img src="/images/humanitz/Humanitz-icon.webp" alt="" className="w-4 h-4 rounded mr-1.5" />
              HumanitZ
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{SERVER.name}</h1>
            <p className="text-gray-300 text-sm mt-1">{SERVER.description}</p>
          </div>
        </div>
      </div>

      {/* Feature pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {FEATURES.map((f) => (
          <span
            key={f.label}
            className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border ${f.bg} ${f.color}`}
          >
            <ChevronRightIcon className="h-3 w-3 mr-1" />
            {f.label}
          </span>
        ))}
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main details (2/3) */}
        <div className="lg:col-span-2">
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700 flex items-center">
              <img src="/images/humanitz/Humanitz-icon.webp" alt="" className="w-6 h-6 rounded mr-3" />
              <h2 className="font-bold">Server Details</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <InfoCard
                  icon={<SignalIcon className="h-5 w-5 text-green-400" />}
                  label="Status"
                  value="Online"
                  valueColor="text-green-400"
                />
                <InfoCard
                  icon={<SwordIcon className="h-5 w-5 text-red-400" />}
                  label="Game Mode"
                  value={SERVER.mode}
                  valueColor="text-red-400"
                />
                <InfoCard
                  icon={<UsersIcon className="h-5 w-5 text-blue-400" />}
                  label="Max Players"
                  value={String(SERVER.maxPlayers)}
                  valueColor="text-blue-400"
                />
                <InfoCard
                  icon={<ShieldCheckIcon className="h-5 w-5 text-emerald-400" />}
                  label="Whitelist"
                  value="Active"
                  valueColor="text-emerald-400"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar — Live Details (1/3) */}
        <div>
          <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700 flex items-center justify-between">
              <h2 className="font-bold">Live Status</h2>
              <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            </div>
            <div className="p-4 space-y-1">
              {LIVE_DETAILS.map((item) => (
                <div key={item.label} className="flex items-center justify-between py-2.5 px-2 rounded-lg hover:bg-gray-700/30 transition-colors">
                  <div className="flex items-center">
                    <span className={`mr-3 ${item.color}`}>{item.icon}</span>
                    <span className="text-sm text-gray-400">{item.label}</span>
                  </div>
                  <span className={`text-sm font-semibold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

// ── Sub-components ───────────────────────────────────────────────────────────

function InfoCard({
  icon,
  label,
  value,
  valueColor = 'text-white',
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <div className="bg-gray-900/50 rounded-lg border border-gray-700/50 p-4 flex items-center">
      <div className="p-2.5 bg-gray-800 rounded-lg border border-gray-700 mr-4">
        {icon}
      </div>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wider">{label}</p>
        <p className={`text-lg font-bold ${valueColor}`}>{value}</p>
      </div>
    </div>
  );
}
