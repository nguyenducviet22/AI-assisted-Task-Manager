/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, CheckSquare, Calendar, BarChart3, Settings } from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isOpenOnMobile: boolean;
  setIsOpenOnMobile: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  isOpenOnMobile,
  setIsOpenOnMobile,
}) => {
  const { activeProfile } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'tasks', label: 'Tasks', icon: CheckSquare },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleTabClick = (tabId: string) => {
    setCurrentTab(tabId);
    setIsOpenOnMobile(false);
  };

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isOpenOnMobile && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpenOnMobile(false)}
        />
      )}

      {/* Sidebar Shell */}
      <aside
        className={`h-screen w-64 fixed left-0 top-0 bg-white/5 backdrop-blur-xl border-r border-white/10 flex flex-col p-6 gap-6 z-45 transition-transform duration-300 md:translate-x-0 ${
          isOpenOnMobile ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="mb-4">
          <h1 className="font-display text-3xl font-bold tracking-tight text-primary">TaskFlow</h1>
          <p className="text-xs text-on-surface-variant font-medium opacity-70 mt-1 uppercase tracking-widest">
            Executive Suite
          </p>
        </div>

        {/* Navigation Section */}
        <nav className="flex-1 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleTabClick(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-primary-container text-on-primary-container font-bold shadow-[0_0_15px_rgba(109,40,217,0.25)]'
                    : 'text-on-surface-variant hover:text-on-surface hover:bg-white/10'
                }`}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* User Card */}
        <div className="mt-auto glass-panel p-4 rounded-2xl flex items-center gap-3 overflow-hidden">
          <img
            src={activeProfile.avatarUrl}
            alt={activeProfile.name}
            className="w-10 h-10 rounded-full border border-white/20 object-cover"
          />
          <div className="overflow-hidden">
            <p className="text-sm font-semibold truncate text-on-surface">{activeProfile.name}</p>
            <p className="text-[11px] text-on-surface-variant truncate opacity-63 mt-0.5">
              {activeProfile.role}
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};
