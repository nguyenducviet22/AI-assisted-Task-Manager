/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TaskResponse } from '../types';
import { BarChart3, PieChart, CheckCircle2, ListTodo, TrendingUp } from 'lucide-react';

interface AnalyticsViewProps {
  tasks: TaskResponse[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ tasks }) => {
  const total = tasks.length;
  const pending = tasks.filter((t) => t.status === 'PENDING').length;
  const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const completed = tasks.filter((t) => t.status === 'COMPLETED').length;

  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Pie chart calculation helper
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const completedStroke = (completed / (total || 1)) * circumference;
  const inProgressStroke = (inProgress / (total || 1)) * circumference;
  const pendingStroke = (pending / (total || 1)) * circumference;

  return (
    <div className="space-y-6">
      {/* Overview Analytics Banner cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-primary/10 rounded-xl text-primary">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Completion Rate
            </p>
            <h4 className="text-2xl font-bold font-display mt-0.5 text-on-surface">
              {completionPercentage}%
            </h4>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-tertiary/10 rounded-xl text-tertiary">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Total Managed
            </p>
            <h4 className="text-2xl font-bold font-display mt-0.5 text-on-surface">{total}</h4>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-[#bcc7de]/10 rounded-xl text-[#bcc7de]">
            <ListTodo className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">
              Work In Progress
            </p>
            <h4 className="text-2xl font-bold font-display mt-0.5 text-on-surface">{inProgress}</h4>
          </div>
        </div>
      </div>

      {/* Main Charts Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Breakdown Bar chart */}
        <div className="glass-panel p-6 rounded-2xl">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-primary" />
            <h4 className="font-display font-semibold text-on-surface text-base">
              Performance Distribution
            </h4>
          </div>

          <div className="space-y-5">
            {/* Pending representation */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-on-surface mb-1">
                <span className="flex items-center gap-1.5 text-tertiary">
                  <span className="w-2.5 h-2.5 rounded-full bg-tertiary" /> PENDING
                </span>
                <span>
                  {pending} tasks ({total > 0 ? Math.round((pending / total) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="bg-tertiary h-full transition-all duration-500 ease-out"
                  style={{ width: `${total > 0 ? (pending / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* In Progress */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-on-surface mb-1">
                <span className="flex items-center gap-1.5 text-[#bcc7de]">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#bcc7de]" /> IN_PROGRESS
                </span>
                <span>
                  {inProgress} tasks ({total > 0 ? Math.round((inProgress / total) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="bg-[#bcc7de] h-full transition-all duration-500 ease-out"
                  style={{ width: `${total > 0 ? (inProgress / total) * 100 : 0}%` }}
                />
              </div>
            </div>

            {/* Completed */}
            <div>
              <div className="flex justify-between items-center text-xs font-semibold text-on-surface mb-1">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> COMPLETED
                </span>
                <span>
                  {completed} tasks ({total > 0 ? Math.round((completed / total) * 100) : 0}%)
                </span>
              </div>
              <div className="w-full h-3 bg-white/5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full transition-all duration-500 ease-out"
                  style={{ width: `${total > 0 ? (completed / total) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Vector Donut Summary */}
        <div className="glass-panel p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-2">
              <PieChart className="w-5 h-5 text-primary" />
              <h4 className="font-display font-semibold text-on-surface text-base">Allocation</h4>
            </div>
            <p className="text-xs text-on-surface-variant opacity-80 leading-relaxed mb-4">
              Real-time resource allocation diagram grouped by workflow nodes.
            </p>

            {/* Detailed legend notes */}
            <div className="grid grid-cols-2 gap-3 text-[11px] font-semibold">
              <div className="flex items-center gap-1.5 text-on-surface-variant">
                <span className="w-2 h-2 rounded-full bg-tertiary" />
                <span>Pending Tasks</span>
              </div>
              <div className="flex items-center gap-1.5 text-on-surface-variant">
                <span className="w-2 h-2 rounded-full bg-[#bcc7de]" />
                <span>In Progress</span>
              </div>
              <div className="flex items-center gap-1.5 text-on-surface-variant">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Completed</span>
              </div>
              <div className="flex items-center gap-1.5 text-primary mt-1">
                <span>{total} Total Tasks</span>
              </div>
            </div>
          </div>

          {/* SVG Pie Representation */}
          <div className="relative w-40 h-40 flex items-center justify-center">
            {total > 0 ? (
              <svg className="w-full h-full transform -rotate-90">
                {/* Background base track */}
                <circle cx="80" cy="80" r={radius} fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />

                {/* Combined segments representing tasks cleanly */}
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke="var(--color-tertiary)"
                  strokeWidth="12"
                  strokeDasharray={`${pendingStroke} ${circumference}`}
                  strokeDashoffset={0}
                  className="transition-all duration-500"
                />
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke="var(--color-secondary-fixed-dim)"
                  strokeWidth="12"
                  strokeDasharray={`${inProgressStroke} ${circumference}`}
                  strokeDashoffset={-pendingStroke}
                  className="transition-all duration-500"
                />
                <circle
                  cx="80"
                  cy="80"
                  r={radius}
                  fill="transparent"
                  stroke="var(--color-surface-tint)"
                  strokeWidth="12"
                  strokeDasharray={`${completedStroke} ${circumference}`}
                  strokeDashoffset={-(pendingStroke + inProgressStroke)}
                  className="transition-all duration-500"
                />
              </svg>
            ) : (
              <div className="w-24 h-24 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] text-on-surface-variant">
                No Task Data
              </div>
            )}

            {/* Inner text overlay */}
            <div className="absolute inset-x-0 text-center pointer-events-none mt-1">
              <span className="text-xl font-display font-bold text-on-surface">
                {completionPercentage}%
              </span>
              <p className="text-[9px] uppercase tracking-wider text-on-surface-variant/70">
                Done Rate
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
