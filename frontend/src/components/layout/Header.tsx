/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Menu, Search, Bell, Radio, User } from 'lucide-react';

interface HeaderProps {
  currentTab: string;
  setIsOpenOnMobile: (open: boolean) => void;
  searchText: string;
  setSearchText: (text: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setIsOpenOnMobile,
  searchText,
  setSearchText,
}) => {
  const { backendConnected, isCheckingStatus } = useAuth();

  const getHeaderTitle = () => {
    switch (currentTab) {
      case 'dashboard':
        return 'Dashboard Overview';
      case 'tasks':
        return 'Tasks Workspace';
      case 'calendar':
        return 'Calendar Forecast';
      case 'analytics':
        return 'Productivity Analytics';
      case 'settings':
        return 'System Configuration';
      default:
        return 'TaskFlow Suite';
    }
  };

  return (
    <header className="sticky top-0 z-40 flex justify-between items-center w-full px-6 md:px-10 py-3 bg-background/80 backdrop-blur-md border-b border-white/10 h-16">
      {/* Title & Burger Trigger */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsOpenOnMobile(true)}
          className="md:hidden text-primary p-1.5 rounded-lg border border-white/10 hover:bg-white/10 active:scale-95 transition-transform cursor-pointer"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h2 className="text-xl font-display font-semibold text-primary">{getHeaderTitle()}</h2>
      </div>

      {/* Dynamic Filter / Connection State Section */}
      <div className="flex items-center gap-4">
        {/* Search tasks... input available on Dashboard/Tasks pages */}
        {(currentTab === 'dashboard' || currentTab === 'tasks') && (
          <div className="relative hidden sm:block w-64">
            <input
              type="text"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="Search tasks..."
              className="w-full bg-black/20 border border-white/10 rounded-full py-1.5 pl-10 pr-4 text-xs focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary text-on-background transition-all placeholder:text-on-surface-variant/50"
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant/60 w-4 h-4" />
          </div>
        )}

        {/* Live connections block */}
        <div className="flex items-center gap-3">
          {/* Connection status badge */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${
              backendConnected
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                backendConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'
              } ${isCheckingStatus ? 'animate-spin border-t-transparent' : ''}`}
            />
            <span>{backendConnected ? 'API Connected' : 'Offline / Error'}</span>
          </div>

          {/* Quick Toolbar icons */}
          <button className="p-2 text-on-surface-variant hover:text-white hover:bg-white/5 rounded-full transition-colors cursor-pointer relative">
            <Bell className="w-4.5 h-4.5" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary rounded-full" />
          </button>
          <button className="p-2 text-on-surface-variant hover:text-white hover:bg-white/5 rounded-full transition-colors cursor-pointer hidden sm:block">
            <Radio className="w-4.5 h-4.5" />
          </button>
          <button className="p-2 text-primary hover:text-white hover:bg-white/5 rounded-full transition-colors cursor-pointer border border-white/10">
            <User className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </header>
  );
};
