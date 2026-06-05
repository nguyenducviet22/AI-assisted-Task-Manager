/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { TaskResponse } from '../types';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, ToggleLeft } from 'lucide-react';

interface CalendarViewProps {
  tasks: TaskResponse[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  const monthNames = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];

  // Logic to calculate days in month & grid starts
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
    setSelectedDay(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
    setSelectedDay(null);
  };

  // Extract tasks belonging to a specific date of month
  const getTasksForDay = (day: number): TaskResponse[] => {
    return tasks.filter((task) => {
      const taskDate = new Date(task.updatedAt || task.createdAt);
      return (
        taskDate.getDate() === day &&
        taskDate.getMonth() === currentMonth &&
        taskDate.getFullYear() === currentYear
      );
    });
  };

  const getStatusColorClass = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-tertiary';
      case 'IN_PROGRESS':
        return 'bg-secondary-fixed-dim';
      case 'COMPLETED':
        return 'bg-emerald-400';
      default:
        return 'bg-white';
    }
  };

  const activeDayTasks = selectedDay ? getTasksForDay(selectedDay) : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Calendar Grid card */}
      <div className="glass-panel p-6 rounded-2xl lg:col-span-2">
        {/* Navigation Head */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-primary" />
            <h4 className="font-display font-semibold text-on-surface">
              {monthNames[currentMonth]} {currentYear}
            </h4>
          </div>
          <div className="flex gap-2">
            <button
              onClick={prevMonth}
              className="p-1 px-2 border border-white/10 hover:bg-white/10 rounded-lg text-on-surface-variant hover:text-white transition-all duration-200 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={nextMonth}
              className="p-1 px-2 border border-white/10 hover:bg-white/10 rounded-lg text-on-surface-variant hover:text-white transition-all duration-200 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of week text header */}
        <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-4">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Days numbers grids */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty padded offset */}
          {Array.from({ length: firstDayOfMonth }).map((_, index) => (
            <div key={`offset-${index}`} className="aspect-square opacity-0 pointer-events-none" />
          ))}

          {/* Real days list */}
          {Array.from({ length: daysInMonth }).map((_, index) => {
            const dayNum = index + 1;
            const dayTasks = getTasksForDay(dayNum);
            const isSelected = selectedDay === dayNum;
            const isToday =
              dayNum === new Date().getDate() &&
              currentMonth === new Date().getMonth() &&
              currentYear === new Date().getFullYear();

            return (
              <button
                key={`day-${dayNum}`}
                onClick={() => setSelectedDay(dayNum)}
                className={`aspect-square rounded-xl p-1.5 flex flex-col justify-between transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-primary-container/40 text-primary border border-primary/50 font-bold'
                    : isToday
                      ? 'bg-white/10 text-white font-bold border border-white/20'
                      : 'hover:bg-white/5 border border-transparent text-on-surface-variant'
                }`}
              >
                <span className="text-xs">{dayNum}</span>

                {/* Dots representation for associated day tasks */}
                {dayTasks.length > 0 && (
                  <div className="flex gap-1 justify-center w-full pb-1">
                    {dayTasks.slice(0, 3).map((task) => (
                      <span
                        key={task.id}
                        className={`w-1.5 h-1.5 rounded-full ${getStatusColorClass(task.status)}`}
                        title={task.title}
                      />
                    ))}
                    {dayTasks.length > 3 && (
                      <span className="text-[7px] text-white opacity-60">+</span>
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day task board summary list panel */}
      <div className="glass-panel p-6 rounded-2xl flex flex-col">
        <h4 className="font-display font-semibold text-on-surface border-b border-white/5 pb-3 mb-4 text-sm flex items-center justify-between">
          <span>Workflow Focus</span>
          <span className="text-xs text-on-surface-variant opacity-70">
            {selectedDay ? `${monthNames[currentMonth]} ${selectedDay}` : 'Select a date'}
          </span>
        </h4>

        <div className="flex-1 overflow-y-auto max-h-[340px] space-y-3">
          {activeDayTasks.length > 0 ? (
            activeDayTasks.map((task) => (
              <div
                key={task.id}
                className="p-3 bg-white/5 rounded-xl border border-white/5 flex flex-col hover:border-white/10 transition-colors"
              >
                <div className="flex justify-between items-center mb-1">
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      task.status === 'PENDING'
                        ? 'bg-tertiary/10 text-tertiary'
                        : task.status === 'IN_PROGRESS'
                          ? 'bg-[#bcc7de]/10 text-[#bcc7de]'
                          : 'bg-emerald-500/10 text-emerald-400'
                    }`}
                  >
                    {task.status}
                  </span>
                </div>
                <h5 className="text-xs font-semibold text-on-surface line-clamp-1">{task.title}</h5>
                {task.description && (
                  <p className="text-[10px] text-on-surface-variant line-clamp-1 opacity-70 mt-0.5">
                    {task.description}
                  </p>
                )}
              </div>
            ))
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-6 text-center opacity-70">
              <Clock className="w-8 h-8 text-on-surface-variant mb-2 opacity-50" />
              <p className="text-xs text-on-surface-variant">No tasks active on this day.</p>
              <p className="text-[10px] text-on-surface-variant/60 mt-1">
                Select another day to audit workflows.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
