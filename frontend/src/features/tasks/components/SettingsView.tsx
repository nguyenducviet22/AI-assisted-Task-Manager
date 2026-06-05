/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { Settings, ShieldAlert, CheckCircle2, CloudLightning, Database, AlertCircle, RefreshCw } from 'lucide-react';

export const SettingsView: React.FC = () => {
  const {
    activeProfile,
    availableProfiles,
    selectProfile,
    updateCustomProfile,
    apiBaseUrl,
    updateApiBaseUrl,
    backendConnected,
    checkBackendStatus,
    isCheckingStatus,
  } = useAuth();

  const [baseUrlInput, setBaseUrlInput] = useState(apiBaseUrl);
  const [customUserId, setCustomUserId] = useState(activeProfile.id);
  const [customName, setCustomName] = useState(activeProfile.name);
  const [connectionFeedback, setConnectionFeedback] = useState<'success' | 'failed' | null>(null);

  const handleSaveEndpoint = (e: React.FormEvent) => {
    e.preventDefault();
    updateApiBaseUrl(baseUrlInput.trim());
    setConnectionFeedback(null);
  };

  const handleUpdateCustomProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateCustomProfile({
      id: customUserId.trim(),
      name: customName.trim(),
    });
  };

  const handleVerifyConnection = async () => {
    const isConn = await checkBackendStatus();
    setConnectionFeedback(isConn ? 'success' : 'failed');
    setTimeout(() => setConnectionFeedback(null), 4000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Profile Selector */}
      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="w-5 h-5 text-primary" />
          <h4 className="font-display font-semibold text-on-surface">Switch Workflow Profile</h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {availableProfiles.map((profile) => {
            const isSelected = activeProfile.id === profile.id || 
              (profile.id === 'uuid-custom-user-spec-profile-id' && !availableProfiles.some(p => p.id === activeProfile.id));

            return (
              <button
                key={profile.id}
                onClick={() => selectProfile(profile.id)}
                className={`flex items-start gap-3 p-4 rounded-xl text-left border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-primary-container/10 border-primary shadow-[0_0_12px_rgba(109,40,217,0.15)] text-white'
                    : 'bg-white/5 border-white/5 text-on-surface-variant hover:border-white/10'
                }`}
              >
                <img
                  src={profile.avatarUrl}
                  alt={profile.name}
                  className="w-10 h-10 rounded-full border border-white/10 object-cover mt-0.5"
                />
                <div className="overflow-hidden">
                  <h5 className="text-xs font-bold font-display truncate">{profile.name}</h5>
                  <p className="text-[10px] opacity-70 mt-0.5 truncate">{profile.role}</p>
                  <p className="text-[9px] opacity-50 mt-1 truncate italic">{profile.statusText}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 2. REST API Integration Config */}
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-primary" />
            <h4 className="font-display font-semibold text-on-surface">REST API Connection</h4>
          </div>
          <p className="text-xs text-on-surface-variant mb-6 opacity-80 leading-relaxed">
            Configure where the frontend makes REST calls. The Spring Boot backend runs on{' '}
            <code className="text-primary font-mono text-[10px] bg-black/30 px-1 py-0.5 rounded">
              http://localhost:8080
            </code>{' '}
            by default.
          </p>

          <form onSubmit={handleSaveEndpoint} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant">Server Endpoint URL</label>
              <input
                type="text"
                value={baseUrlInput}
                onChange={(e) => setBaseUrlInput(e.target.value)}
                placeholder="http://localhost:8080"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-xs transition-all text-on-surface font-mono"
              />
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                className="px-4 py-2 bg-primary hover:shadow-[0_0_15px_rgba(211,187,255,0.3)] text-on-primary-fixed text-xs font-bold rounded-xl transition-all cursor-pointer"
              >
                Apply Endpoint
              </button>

              <button
                type="button"
                onClick={handleVerifyConnection}
                disabled={isCheckingStatus}
                className="px-4 py-2 glass-panel border border-white/10 hover:bg-white/10 items-center justify-center flex gap-1.5 text-xs text-on-surface font-semibold rounded-xl transition-colors cursor-pointer"
              >
                {isCheckingStatus ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <CloudLightning className="w-3.5 h-3.5" />
                )}
                <span>Verify Live Status</span>
              </button>
            </div>
          </form>

          {/* Verification feedback box */}
          {connectionFeedback && (
            <div
              className={`mt-4 p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-medium transition-all ${
                connectionFeedback === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
              }`}
            >
              {connectionFeedback === 'success' ? (
                <>
                  <CheckCircle2 className="w-4.5 h-4.5 flex-shrink-0" />
                  <span>REST handshake succeeded! Server reachable at {apiBaseUrl}.</span>
                </>
              ) : (
                <>
                  <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
                  <span>Unable to link. Make sure your local Spring Boot service is active on that endpoint.</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* 3. Custom X-User-Id Security Configuration */}
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-4">
            <ShieldAlert className="w-5 h-5 text-primary" />
            <h4 className="font-display font-semibold text-on-surface">Header Authen (X-User-Id)</h4>
          </div>
          <p className="text-xs text-on-surface-variant mb-6 opacity-80 leading-relaxed">
            The Spring Boot API validates ownership using the{' '}
            <code className="text-primary font-mono text-[10px] bg-black/30 px-1 py-0.5 rounded">
              X-User-Id
            </code>{' '}
            header on every transaction. Modify this value to match your backend users' databases.
          </p>

          <form onSubmit={handleUpdateCustomProfile} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant">Profile Name</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="Developer Custom Name"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 focus:border-primary outline-none text-xs text-on-surface font-semibold"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-on-surface-variant">X-User-Id Header (UUID)</label>
              <input
                type="text"
                value={customUserId}
                onChange={(e) => setCustomUserId(e.target.value)}
                placeholder="11111111-1111-1111-1111-111111111111"
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2.5 focus:border-primary outline-none text-xs text-on-surface font-mono"
              />
            </div>

            <button
              type="submit"
              className="px-4 py-2 bg-primary hover:shadow-[0_0_15px_rgba(211,187,255,0.3)] text-on-primary-fixed text-xs font-bold rounded-xl transition-all cursor-pointer"
            >
              Update X-User-Id Header
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
