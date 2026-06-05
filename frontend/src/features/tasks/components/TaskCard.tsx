/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TaskResponse } from '../types';
import { Calendar, Edit3, Trash2, Clock, CheckCircle2, PlayCircle } from 'lucide-react';

interface TaskCardProps {
  task: TaskResponse;
  onEdit: (task: TaskResponse) => void;
  onDelete: (taskId: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onDelete }) => {
  // Map our UI styles to the current task status
  const getStatusStyles = () => {
    switch (task.status) {
      case 'PENDING':
        return {
          banner: 'bg-tertiary/10 text-tertiary border-tertiary/20',
          dot: 'bg-tertiary',
          glowClass: 'status-glow-gold border-l-tertiary',
          label: 'PENDING',
          icon: Clock,
        };
      case 'IN_PROGRESS':
        return {
          banner: 'bg-[#bcc7de]/10 text-[#bcc7de] border-[#bcc7de]/20',
          dot: 'bg-[#bcc7de]',
          glowClass: 'status-glow-cyan border-l-secondary-fixed-dim',
          label: 'IN PROGRESS',
          icon: PlayCircle,
        };
      case 'COMPLETED':
        return {
          banner: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
          dot: 'bg-emerald-500',
          glowClass: 'status-glow-emerald border-l-emerald-500',
          label: 'COMPLETED',
          icon: CheckCircle2,
        };
      default:
        return {
          banner: 'bg-white/10 text-white/70 border-white/20',
          dot: 'bg-white',
          glowClass: 'border-l-white/20',
          label: 'UNKNOWN',
          icon: Clock,
        };
    }
  };

  const status = getStatusStyles();
  const StatusIcon = status.icon;

  // Extract a stable avatar based on description length or title hash for dynamic executive feeling
  const getAvatarUrl = () => {
    const chars = task.title.length;
    if (chars % 3 === 0) {
      return 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=150';
    } else if (chars % 3 === 1) {
      return 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150';
    } else {
      return 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=150';
    }
  };

  // Format date helper
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      className={`glass-panel-elevated p-5 rounded-2xl border-l-4 ${status.glowClass} relative group hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between min-h-[190px] shadow-lg`}
    >
      {/* Top Banner & Hover controls */}
      <div className="flex justify-between items-start mb-3">
        <span
          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 border ${status.banner}`}
        >
          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
          {status.label}
        </span>

        {/* Dynamic actions shown cleanly on hover */}
        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <button
            onClick={() => onEdit(task)}
            title="Edit Task"
            className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-on-surface-variant hover:text-white transition-colors cursor-pointer"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(task.id)}
            title="Delete Task"
            className="p-1.5 bg-error/10 hover:bg-error/20 rounded-lg text-error hover:text-red-400 transition-colors cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Title & Description */}
      <div className="flex-1 mb-4">
        <h5 className="font-display text-[17px] font-semibold text-on-surface leading-snug group-hover:text-primary transition-colors mb-1">
          {task.title}
        </h5>
        <p className="text-on-surface-variant text-xs line-clamp-2 leading-relaxed opacity-80">
          {task.description || 'No description provided.'}
        </p>
      </div>

      {/* Progress visualizer explicitly mapping to status of tasks */}
      {task.status === 'IN_PROGRESS' && (
        <div className="mb-4">
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-secondary-fixed-dim h-full w-[65%]" />
          </div>
          <div className="flex justify-between items-center text-[10px] text-on-surface-variant font-medium mt-1.5 opacity-77">
            <span>Progress Audit</span>
            <span>65% Done</span>
          </div>
        </div>
      )}

      {/* Completed icon checkmark or general items */}
      {task.status === 'COMPLETED' && (
        <div className="flex items-center gap-1 mb-4 text-[11px] text-emerald-400 font-medium italic">
          <span>Success metrics achieved</span>
        </div>
      )}

      {/* Bottom Profile & Dates */}
      <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-auto">
        <div className="flex -space-x-1">
          <img
            src={getAvatarUrl()}
            alt="Assignee"
            className="w-5.5 h-5.5 rounded-full border border-background object-cover"
          />
        </div>
        <div className="flex items-center gap-1 text-[10px] text-on-surface-variant/70 font-semibold uppercase tracking-wider">
          <Calendar className="w-3.5 h-3.5 opacity-80" />
          <span>{formatDate(task.updatedAt || task.createdAt)}</span>
        </div>
      </div>
    </div>
  );
};
