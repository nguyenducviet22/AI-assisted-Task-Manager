/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { CreateTaskRequest, TaskResponse, UpdateTaskRequest, TaskStatus } from '../types';
import { Modal } from '../../../components/common/Modal';

interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: TaskResponse | null;
  onSubmit: (data: CreateTaskRequest | UpdateTaskRequest) => void;
  isSaving: boolean;
}

export const TaskFormModal: React.FC<TaskFormModalProps> = ({
  isOpen,
  onClose,
  taskToEdit,
  onSubmit,
  isSaving,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('PENDING');

  // Load fields when editing a task
  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setDescription(taskToEdit.description || '');
      setStatus(taskToEdit.status);
    } else {
      // Clear inputs for new task additions
      setTitle('');
      setDescription('');
      setStatus('PENDING');
    }
  }, [taskToEdit, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (taskToEdit) {
      // Update payload matching UpdateTaskRequest
      onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
        status,
      } as UpdateTaskRequest);
    } else {
      // Creation payload matching CreateTaskRequest
      onSubmit({
        title: title.trim(),
        description: description.trim() || undefined,
      } as CreateTaskRequest);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={taskToEdit ? 'Edit Executive Task' : 'Create New Task'}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title Input */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-on-surface-variant flex items-center justify-between">
            <span>Task Title *</span>
            <span className="text-[10px] font-normal opacity-50">{title.length}/255</span>
          </label>
          <input
            type="text"
            required
            maxLength={255}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Audit WCAG accessibility elements"
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all focus:bg-black/40 text-on-surface"
          />
        </div>

        {/* Description TextArea Input */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-on-surface-variant flex items-center justify-between">
            <span>Scope Description</span>
            <span className="text-[10px] font-normal opacity-50">{description.length}/2000</span>
          </label>
          <textarea
            maxLength={2000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Specify instructions and requirements..."
            rows={3}
            className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all focus:bg-black/40 text-on-surface resize-none"
          />
        </div>

        {/* Status Dropdown Select - Only visible if editing an existing task, as per OpenAPI request shapes */}
        {taskToEdit && (
          <div className="space-y-1">
            <label className="text-xs font-semibold text-on-surface-variant">Active Task Status</label>
            <div className="relative">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3 focus:border-primary focus:ring-1 focus:ring-primary outline-none text-sm transition-all appearance-none text-on-surface"
              >
                <option value="PENDING" className="bg-background text-on-background">
                  PENDING
                </option>
                <option value="IN_PROGRESS" className="bg-background text-on-background">
                  IN_PROGRESS
                </option>
                <option value="COMPLETED" className="bg-background text-on-background">
                  COMPLETED
                </option>
              </select>
            </div>
          </div>
        )}

        {/* Buttons Controls */}
        <div className="pt-4 flex gap-3">
          <button
            type="button"
            disabled={isSaving}
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 disabled:opacity-50 text-xs font-bold font-display cursor-pointer transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving || !title.trim()}
            className="flex-1 bg-primary disabled:opacity-50 text-on-primary-fixed px-4 py-2.5 rounded-xl font-bold font-display text-xs hover:shadow-[0_0_20px_rgba(211,187,255,0.4)] transition-all cursor-pointer"
          >
            {isSaving ? 'Processing...' : taskToEdit ? 'Save Changes' : 'Create Task'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
