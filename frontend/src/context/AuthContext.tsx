/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../features/tasks/types';
import { STORAGE_KEYS, getXUserId, setXUserId, getApiBaseUrl, setApiBaseUrl } from '../services/api';

interface AuthContextType {
  activeProfile: UserProfile;
  availableProfiles: UserProfile[];
  apiBaseUrl: string;
  selectProfile: (profileId: string) => void;
  updateCustomProfile: (profile: Partial<UserProfile>) => void;
  updateApiBaseUrl: (url: string) => void;
  checkBackendStatus: () => Promise<boolean>;
  backendConnected: boolean;
  isCheckingStatus: boolean;
}

const DEFAULT_PROFILES: UserProfile[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Alex Sterling',
    role: 'Productivity Active',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150',
    statusText: 'Executive Suite Active',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Marcus Vance',
    role: 'Engineering Lead',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150',
    statusText: 'Build Systems Online',
  },
  {
    id: 'uuid-custom-user-spec-profile-id',
    name: 'Custom Developer',
    role: 'Standalone Developer',
    avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=150',
    statusText: 'Direct Database Access',
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeProfile, setActiveProfile] = useState<UserProfile>(DEFAULT_PROFILES[0]);
  const [apiBaseUrl, setApiBaseUrlState] = useState<string>(getApiBaseUrl());
  const [backendConnected, setBackendConnected] = useState<boolean>(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState<boolean>(false);

  // Initialize profile based on getXUserId() header storage
  useEffect(() => {
    const currentId = getXUserId();
    const match = DEFAULT_PROFILES.find((p) => p.id === currentId);
    if (match) {
      setActiveProfile(match);
    } else {
      // Set to custom developer profile and overwrite its ID
      const customProfile = { ...DEFAULT_PROFILES[2], id: currentId };
      setActiveProfile(customProfile);
    }
  }, []);

  const checkBackendStatus = async (): Promise<boolean> => {
    setIsCheckingStatus(true);
    try {
      // Double check backend connectivity by trying to fetch tasks
      // Fetch uses api which has the interceptor injecting the X-User-Id
      const apiModule = await import('../services/api');
      const response = await apiModule.default.get('/api/tasks', { timeout: 2000 });
      setBackendConnected(true);
      setIsCheckingStatus(false);
      return true;
    } catch (e) {
      setBackendConnected(false);
      setIsCheckingStatus(false);
      return false;
    }
  };

  useEffect(() => {
    checkBackendStatus();
    // Run interval status checks every 8 seconds
    const interval = setInterval(checkBackendStatus, 8000);
    return () => clearInterval(interval);
  }, [apiBaseUrl, activeProfile.id]);

  const selectProfile = (profileId: string) => {
    const match = DEFAULT_PROFILES.find((p) => p.id === profileId);
    if (match) {
      setActiveProfile(match);
      setXUserId(match.id);
    }
  };

  const updateCustomProfile = (profile: Partial<UserProfile>) => {
    const updated = { ...activeProfile, ...profile };
    setActiveProfile(updated);
    if (updated.id) {
      setXUserId(updated.id);
    }
  };

  const updateApiBaseUrl = (url: string) => {
    setApiBaseUrl(url);
    setApiBaseUrlState(url);
  };

  return (
    <AuthContext.Provider
      value={{
        activeProfile,
        availableProfiles: DEFAULT_PROFILES,
        apiBaseUrl,
        selectProfile,
        updateCustomProfile,
        updateApiBaseUrl,
        checkBackendStatus,
        backendConnected,
        isCheckingStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
