/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { TasksDashboard } from './features/tasks/pages/TasksDashboard';

export default function App() {
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchText, setSearchText] = useState('');

  return (
    <AuthProvider>
      <div className="min-h-screen bg-background text-on-background flex">
        {/* Navigation Sidebar Drawer */}
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          isOpenOnMobile={isMobileMenuOpen}
          setIsOpenOnMobile={setIsMobileMenuOpen}
        />

        {/* Core Layout Panel */}
        <div className="flex-1 md:ml-64 flex flex-col min-h-screen overflow-x-hidden">
          {/* Universal Header bar */}
          <Header
            currentTab={currentTab}
            setIsOpenOnMobile={setIsMobileMenuOpen}
            searchText={searchText}
            setSearchText={setSearchText}
          />

          {/* Core Body Container */}
          <main className="flex-1 p-6 md:p-10 max-w-7xl w-full mx-auto pb-16">
            <TasksDashboard
              currentTab={currentTab}
              setCurrentTab={setCurrentTab}
              searchText={searchText}
            />
          </main>
        </div>
      </div>
    </AuthProvider>
  );
}
