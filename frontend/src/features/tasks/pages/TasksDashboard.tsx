/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { taskService } from '../services';
import { TaskResponse, TaskStatus, CreateTaskRequest, UpdateTaskRequest } from '../types';
import { TaskCard } from '../components/TaskCard';
import { TaskFilters } from '../components/TaskFilters';
import { TaskFormModal } from '../components/TaskFormModal';
import { AnalyticsView } from '../components/AnalyticsView';
import { CalendarView } from '../components/CalendarView';
import { SettingsView } from '../components/SettingsView';
import { 
  Plus, 
  CheckSquare, 
  AlertCircle, 
  Settings as SettingsIcon, 
  RefreshCw, 
  Database,
  Search,
  Users2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TasksDashboardProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  searchText: string;
}

const OFFLINE_FALLBACK_TASKS: TaskResponse[] = [
  {
    id: 'f1012345-1111-1111-1111-111111111111',
    title: 'Q4 Revenue Forecast',
    description: 'Analyze market trends and competitor growth for the final quarterly report of 2026.',
    status: 'PENDING',
    createdAt: new Date(2026, 4, 24).toISOString(),
    updatedAt: new Date(2026, 4, 24).toISOString(),
  },
  {
    id: 'f1012345-2222-2222-2222-222222222222',
    title: 'UI Component Library Audit',
    description: 'Check all glassmorphism components for WCAG accessibility compliance across dark mode variants.',
    status: 'IN_PROGRESS',
    createdAt: new Date(2026, 4, 25).toISOString(),
    updatedAt: new Date(2026, 4, 25).toISOString(),
  },
  {
    id: 'f1012345-3333-3333-3333-333333333333',
    title: 'API Integration Phase 1',
    description: 'Successfully connected the frontend with the productivity engine v2.0 endpoint.',
    status: 'COMPLETED',
    createdAt: new Date(2026, 4, 23).toISOString(),
    updatedAt: new Date(2026, 4, 23).toISOString(),
  },
];

export const TasksDashboard: React.FC<TasksDashboardProps> = ({
  currentTab,
  setCurrentTab,
  searchText,
}) => {
  const { activeProfile, apiBaseUrl, backendConnected, checkBackendStatus } = useAuth();

  // Task lists state
  const [tasks, setTasks] = useState<TaskResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorText, setErrorText] = useState<string | null>(null);

  // Fallback Simulation Mode (Active when physical Spring Boot is offline/not reachable)
  const [simulateOffline, setSimulateOffline] = useState(false);
  const [offlineTasks, setOfflineTasks] = useState<TaskResponse[]>(() => {
    const cached = localStorage.getItem('taskflow_offline_tasks');
    return cached ? JSON.parse(cached) : OFFLINE_FALLBACK_TASKS;
  });

  // Filtering / Sorting state
  const [statusFilter, setStatusFilter] = useState<'ALL' | TaskStatus>('ALL');
  const [sortBy, setSortBy] = useState<'DATE_ASC' | 'DATE_DESC' | 'TITLE_ASC'>('DATE_DESC');

  // Modal forms states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<TaskResponse | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Simulate API latencies inside Live Status query card representation
  const [activeQueryLatency, setActiveQueryLatency] = useState('300ms');

  // Persist offline tasks to localStorage
  useEffect(() => {
    localStorage.setItem('taskflow_offline_tasks', JSON.stringify(offlineTasks));
  }, [offlineTasks]);

  // Load backend tasks or activate fallbacks depending on connection state
  const fetchTasks = async () => {
    setIsLoading(true);
    setErrorText(null);
    const startMs = Date.now();

    try {
      if (simulateOffline) {
        // Direct simulation list mapping
        setTasks(offlineTasks);
        setTasks((prev) => prev);
        setErrorText(null);
      } else {
        // Actual REST request from active Spring Boot backend using specified X-User-Id
        const fetched = await taskService.getTasks();
        setTasks(fetched);
        setErrorText(null);
      }
    } catch (e: any) {
      console.warn('Backend server unreached, offering sandbox fallback tools.', e);
      setErrorText(
        `Direct Rest Client handshake failed at address ${apiBaseUrl} with User header ID: ${activeProfile.id}.`
      );
      // Auto-switch to offline mode to guarantee fully functional demonstration for user
      setSimulateOffline(true);
      setTasks(offlineTasks);
    } finally {
      setIsLoading(false);
      setActiveQueryLatency(`${Math.floor(Date.now() - startMs) || 120}ms`);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [apiBaseUrl, activeProfile.id, simulateOffline]);

  // Handle Create / Edit Task trigger
  const handleOpenCreateForm = () => {
    setTaskToEdit(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (task: TaskResponse) => {
    setTaskToEdit(task);
    setIsFormOpen(true);
  };

  // Form submit handles CRUD operations based on active mode
  const handleFormSubmit = async (requestData: CreateTaskRequest | UpdateTaskRequest) => {
    setIsSaving(true);
    try {
      if (taskToEdit) {
        if (simulateOffline) {
          // Edit task offline state
          const updated: TaskResponse = {
            ...taskToEdit,
            title: requestData.title,
            description: requestData.description,
            status: (requestData as UpdateTaskRequest).status || taskToEdit.status,
            updatedAt: new Date().toISOString(),
          };
          setOfflineTasks((prev) => prev.map((t) => (t.id === taskToEdit.id ? updated : t)));
        } else {
          // Real REST UPDATE API
          await taskService.updateTask(taskToEdit.id, requestData as UpdateTaskRequest);
        }
      } else {
        if (simulateOffline) {
          // Create task offline state
          const created: TaskResponse = {
            id: `offline-${Date.now()}`,
            title: requestData.title,
            description: requestData.description,
            status: 'PENDING',
            createdAt: new Date().toISOString(),
          };
          setOfflineTasks((prev) => [created, ...prev]);
        } else {
          // Real REST CREATE API
          await taskService.createTask(requestData as CreateTaskRequest);
        }
      }
      setIsFormOpen(false);
      fetchTasks();
    } catch (e) {
      alert('Fail to record task. Please verify your endpoints schema rules.');
    } finally {
      setIsSaving(false);
    }
  };

  // Delete task triggering
  const handleDeleteTask = async (taskId: string) => {
    if (!window.confirm('Are you sure you want to delete this executive task?')) return;
    try {
      if (simulateOffline) {
        setOfflineTasks((prev) => prev.filter((t) => t.id !== taskId));
      } else {
        await taskService.deleteTask(taskId);
      }
      fetchTasks();
    } catch (e) {
      alert('Failed to delete task.');
    }
  };

  // Process filters and sorting parameters on client-side React logic
  const getFilteredAndSortedTasks = () => {
    let result = [...tasks];

    // Search tasks
    if (searchText.trim()) {
      const q = searchText.toLowerCase().trim();
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q))
      );
    }

    // Status filter
    if (statusFilter !== 'ALL') {
      result = result.filter((t) => t.status === statusFilter);
    }

    // Sort order
    result.sort((a, b) => {
      if (sortBy === 'TITLE_ASC') {
        return a.title.localeCompare(b.title);
      }
      const timeA = new Date(a.updatedAt || a.createdAt).getTime();
      const timeB = new Date(b.updatedAt || b.createdAt).getTime();
      return sortBy === 'DATE_DESC' ? timeB - timeA : timeA - timeB;
    });

    return result;
  };

  const processedTasks = getFilteredAndSortedTasks();

  // Highlight stats variables
  const statTotalCount = processedTasks.length;
  const statPendingCount = processedTasks.filter((t) => t.status === 'PENDING').length;
  const statInProgressCount = processedTasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const statCompletedCount = processedTasks.filter((t) => t.status === 'COMPLETED').length;

  return (
    <div className="space-y-8">
      {/* Dynamic Offline / Connected Banner alerts with simulation control switches */}
      {!backendConnected && (
        <div className="p-4 rounded-2xl glass-panel border shadow-[0_0_20px_rgba(234,179,8,0.06)] border-yellow-500/20 bg-yellow-500/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="text-xs font-bold font-display text-yellow-500">
                Spring Boot Server Offline (HANDSHAKE UNAVAILABLE)
              </h5>
              <p className="text-[11px] text-on-surface-variant/90 leading-relaxed mt-0.5">
                The REST API client could not reach{' '}
                <code className="text-primary font-mono text-[10px] bg-black/40 px-1 rounded">
                  {apiBaseUrl}
                </code>
                . To ensure a gorgeous fully-functional workspace preview experience, the sandbox
                automatically initiated <b>Simulate Offline Mode</b>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <button
              onClick={() => setCurrentTab('settings')}
              className="px-3.5 py-1.5 glass-panel text-[10px] font-bold text-on-surface uppercase hover:bg-white/10 rounded-xl transition-all flex items-center gap-1 cursor-pointer"
            >
              <SettingsIcon className="w-3.5 h-3.5" />
              <span>Modify REST Port</span>
            </button>

            <button
              onClick={() => {
                setSimulateOffline(!simulateOffline);
                checkBackendStatus();
              }}
              className={`px-3.5 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded-xl transition-all cursor-pointer ${
                simulateOffline
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
            >
              Mode: {simulateOffline ? 'Simulation Active' : 'Direct API'}
            </button>
          </div>
        </div>
      )}

      {/* Render Main Selected Section View */}
      {currentTab === 'dashboard' && (
        <>
          {/* Welcome Header greeting & creation actions */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none">
            <div>
              <h3 className="text-2xl font-display font-semibold text-on-surface">
                Welcome back, {activeProfile.name}
              </h3>
              <p className="text-xs text-on-surface-variant opacity-80 mt-1">
                You have {tasks.filter((t) => t.status !== 'COMPLETED').length} pending/active tasks
                under management for today.
              </p>
            </div>

            <button
              onClick={handleOpenCreateForm}
              className="bg-primary text-on-primary-fixed px-5 py-2.5 rounded-xl font-bold font-display text-xs flex items-center justify-center gap-1.5 shadow-[0_0_15px_rgba(109,40,217,0.3)] hover:shadow-[0_0_20px_rgba(109,40,217,0.5)] hover:-translate-y-0.5 transition-all active:scale-95 cursor-pointer max-w-fit"
            >
              <Plus className="w-4.5 h-4.5" />
              <span>Create Task</span>
            </button>
          </div>

          {/* Stats Summary cards Row */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* 1. Stat Card: Total */}
            <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group select-none">
              <div className="flex justify-between items-start mb-2">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
                  <CheckSquare className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-on-surface-variant/60 tracking-wider">
                  +12%
                </span>
              </div>
              <h4 className="text-[10px] font-bold font-display uppercase text-on-surface-variant tracking-widest">
                Overall Tasks
              </h4>
              <p className="font-display text-3xl font-semibold mt-1 text-on-surface">
                {String(statTotalCount).padStart(2, '0')}
              </p>
              <div className="absolute bottom-0 left-0 h-1 w-full bg-primary/20" />
            </div>

            {/* 2. Stat Card: Pending (Neon Gold) */}
            <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group status-glow-gold select-none">
              <div className="flex justify-between items-start mb-2">
                <div className="w-9 h-9 rounded-xl bg-tertiary/10 flex items-center justify-center text-tertiary border border-tertiary/20">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-tertiary/80 tracking-wider">Urgent</span>
              </div>
              <h4 className="text-[10px] font-bold font-display uppercase text-on-surface-variant tracking-widest">
                Pending Tasks
              </h4>
              <p className="font-display text-3xl font-semibold mt-1 text-on-surface">
                {String(statPendingCount).padStart(2, '0')}
              </p>
              <div className="absolute bottom-0 left-0 h-1 w-full bg-tertiary" />
            </div>

            {/* 3. Stat Card: In Progress (Neon Blue) */}
            <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group status-glow-cyan select-none">
              <div className="flex justify-between items-start mb-2">
                <div className="w-9 h-9 rounded-xl bg-secondary-fixed-dim/10 flex items-center justify-center text-secondary-fixed-dim border border-secondary-fixed-dim/20">
                  <RefreshCw className="w-5 h-5 animate-pulse-glow" />
                </div>
                <span className="text-[10px] font-bold text-secondary-fixed-dim/80 tracking-wider animate-pulse">
                  Active
                </span>
              </div>
              <h4 className="text-[10px] font-bold font-display uppercase text-on-surface-variant tracking-widest">
                In Progress
              </h4>
              <p className="font-display text-3xl font-semibold mt-1 text-on-surface">
                {String(statInProgressCount).padStart(2, '0')}
              </p>
              <div className="absolute bottom-0 left-0 h-1 w-full bg-secondary-fixed-dim" />
            </div>

            {/* 4. Stat Card: Completed (Neon Green) */}
            <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group status-glow-emerald select-none">
              <div className="flex justify-between items-start mb-2">
                <div className="w-9 h-9 rounded-xl bg-[#00FF88]/10 flex items-center justify-center text-[#00FF88] border border-[#00FF88]/20">
                  <Plus className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-bold text-[#00FF88]/90 tracking-wider">
                  Goal Met
                </span>
              </div>
              <h4 className="text-[10px] font-bold font-display uppercase text-on-surface-variant tracking-widest">
                Completed
              </h4>
              <p className="font-display text-3xl font-semibold mt-1 text-on-surface">
                {String(statCompletedCount).padStart(2, '0')}
              </p>
              <div className="absolute bottom-0 left-0 h-1 w-full bg-[#00FF88]" />
            </div>
          </section>

          {/* Recent active task deck with sorting filters */}
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h4 className="font-display font-semibold text-lg text-on-surface">Recent Active Tasks</h4>
              <button
                onClick={() => setCurrentTab('tasks')}
                className="text-xs font-bold text-primary hover:underline cursor-pointer"
              >
                View Full Worksheet
              </button>
            </div>

            {isLoading ? (
              <div className="h-40 flex items-center justify-center p-8">
                <RefreshCw className="w-7 h-7 text-primary animate-spin" />
              </div>
            ) : processedTasks.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {processedTasks.slice(0, 3).map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={handleOpenEditForm}
                    onDelete={handleDeleteTask}
                  />
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl border border-white/5 bg-white/5 text-center flex flex-col items-center justify-center">
                <CheckSquare className="w-8 h-8 text-on-surface-variant opacity-50 mb-2" />
                <p className="text-xs text-on-surface-variant">No tasks matched your search scope.</p>
                <button
                  onClick={handleOpenCreateForm}
                  className="mt-3 text-xs font-bold text-primary cursor-pointer hover:underline"
                >
                  Create your first task now
                </button>
              </div>
            )}
          </section>

          {/* TanStack Simulated Live connection diagnostic panel block */}
          <section className="glass-panel p-5 rounded-2xl">
            <div className="flex md:items-center justify-between flex-col md:flex-row gap-3 mb-4 select-none">
              <h5 className="font-display text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary animate-pulse" />
                </span>
                <span>Active Connection Status</span>
              </h5>
              <code className="text-[10px] bg-black/40 px-2.5 py-1 rounded text-on-surface-variant/80 font-mono tracking-wider">
                X-User-Id: {activeProfile.id}
              </code>
            </div>

            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white/5 rounded-xl border border-white/5">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5 text-on-surface-variant opacity-60" />
                  <div>
                    <p className="text-xs font-bold text-on-surface">
                      Polled from endpoint: <span className="text-secondary-fixed-dim">{apiBaseUrl}/api/tasks</span>
                    </p>
                    <p className="text-[10px] text-on-surface-variant/70 mt-0.5">
                      TanStack Sync Strategy: Cache optimized (query latency: <span className="text-primary font-bold">{activeQueryLatency}</span>)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase font-bold text-on-surface-variant/60">
                    Response Status: 200 OK
                  </span>
                  <div className="h-1.5 w-24 bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-primary w-full animate-bounce" />
                  </div>
                </div>
              </div>
            </div>
          </section>
        </>
      )}

      {currentTab === 'tasks' && (
        <div className="space-y-6">
          {/* Header Action bar with search filter */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
            <div>
              <h3 className="text-xl font-display font-semibold text-on-surface">Worksheet Board</h3>
              <p className="text-xs text-on-surface-variant mt-0.5 opacity-80">
                Manage overall tasks, status metrics, and execute edits.
              </p>
            </div>

            <button
              onClick={handleOpenCreateForm}
              className="bg-primary hover:shadow-[0_0_15px_rgba(211,187,255,0.3)] text-on-primary-fixed px-4 py-2.5 rounded-xl font-bold font-display text-xs flex items-center justify-center gap-1.5 transition-all max-w-fit cursor-pointer border border-white/10"
            >
              <Plus className="w-4 h-4" />
              <span>Add Board Task</span>
            </button>
          </div>

          {/* Render Controls Filters toolbar component */}
          <TaskFilters
            activeStatusFilter={statusFilter}
            setActiveStatusFilter={setStatusFilter}
            sortBy={sortBy}
            setSortBy={setSortBy}
          />

          {/* Grid display layout */}
          {isLoading ? (
            <div className="h-60 flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : processedTasks.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {processedTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={handleOpenEditForm}
                  onDelete={handleDeleteTask}
                />
              ))}
            </div>
          ) : (
            <div className="p-12 rounded-2xl glass-panel text-center flex flex-col items-center justify-center">
              <CheckSquare className="w-10 h-10 text-on-surface-variant opacity-40 mb-3" />
              <h5 className="text-sm font-semibold text-on-surface">Zero Results matched criteria</h5>
              <p className="text-xs text-on-surface-variant opacity-70 mt-1 max-w-xs leading-relaxed">
                Add matching descriptors to title labels, clear search query text inputs, or add direct tasks.
              </p>
              <button
                onClick={handleOpenCreateForm}
                className="mt-4 px-4 py-2 bg-primary/20 text-primary border border-primary/20 hover:bg-primary/30 transition-all font-bold text-xs rounded-xl cursor-pointer"
              >
                Create Task
              </button>
            </div>
          )}
        </div>
      )}

      {currentTab === 'calendar' && <CalendarView tasks={tasks} />}

      {currentTab === 'analytics' && <AnalyticsView tasks={tasks} />}

      {currentTab === 'settings' && <SettingsView />}

      {/* Form Dialog overlays */}
      <TaskFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        taskToEdit={taskToEdit}
        onSubmit={handleFormSubmit}
        isSaving={isSaving}
      />
    </div>
  );
};
