/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TaskStatus } from '../types';

interface TaskFiltersProps {
  activeStatusFilter: 'ALL' | TaskStatus;
  setActiveStatusFilter: (filter: 'ALL' | TaskStatus) => void;
  sortBy: 'DATE_ASC' | 'DATE_DESC' | 'TITLE_ASC';
  setSortBy: (sort: 'DATE_ASC' | 'DATE_DESC' | 'TITLE_ASC') => void;
}

export const TaskFilters: React.FC<TaskFiltersProps> = ({
  activeStatusFilter,
  setActiveStatusFilter,
  sortBy,
  setSortBy,
}) => {
  const filterOptions: { id: 'ALL' | TaskStatus; label: string }[] = [
    { id: 'ALL', label: 'All Tasks' },
    { id: 'PENDING', label: 'Pending' },
    { id: 'IN_PROGRESS', label: 'In Progress' },
    { id: 'COMPLETED', label: 'Completed' },
  ];

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-white/5">
      {/* State Filter Pills */}
      <div className="flex flex-wrap gap-2">
        {filterOptions.map((opt) => (
          <button
            key={opt.id}
            onClick={() => setActiveStatusFilter(opt.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all cursor-pointer ${
              activeStatusFilter === opt.id
                ? 'bg-primary text-on-primary-fixed shadow-[0_0_12px_rgba(211,187,255,0.3)]'
                : 'glass-panel text-on-surface-variant hover:text-white hover:bg-white/10'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Sorting Select Component */}
      <div className="flex items-center gap-2">
        <label className="text-[11px] font-bold text-on-surface-variant/80 uppercase tracking-widest">
          Sort-By:
        </label>
        <select
          value={sortBy}
          onChange={(e: any) => setSortBy(e.target.value)}
          className="bg-black/20 border border-white/10 text-xs text-on-surface rounded-xl px-3 py-1.5 focus:outline-none focus:border-primary transition-all select-none font-medium"
        >
          <option value="DATE_DESC" className="bg-background text-on-background">
            Newest First
          </option>
          <option value="DATE_ASC" className="bg-background text-on-background">
            Oldest First
          </option>
          <option value="TITLE_ASC" className="bg-background text-on-background">
            Alphabetic A-Z
          </option>
        </select>
      </div>
    </div>
  );
};
