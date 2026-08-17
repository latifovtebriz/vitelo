import React, { useState, useEffect } from 'react';
import type { FormEvent } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { api } from '../lib/api';
import {
  Plus,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  X,
  Briefcase,
  Building2,
  Calendar,
  Loader2
} from 'lucide-react';

interface ApplicationResponse {
  id: string;
  column_key: string;
  company: string;
  role: string;
  notes: string | null;
  date: string | null;
  created_at: string;
}

interface ColumnResponse {
  id: string;
  key: string;
  label: string;
  display_order: number;
  applications: ApplicationResponse[];
}

interface TrackerBoardResponse {
  id: string;
  name: string;
  columns: ColumnResponse[];
}

const COLUMN_STYLES: Record<string, { headerBg: string; headerText: string; headerBorder: string; badge: string }> = {
  'Wishlist': { headerBg: 'bg-slate-50', headerText: 'text-slate-800', headerBorder: 'border-slate-200', badge: 'bg-slate-200 text-slate-700' },
  'Applied': { headerBg: 'bg-blue-50', headerText: 'text-blue-800', headerBorder: 'border-blue-200', badge: 'bg-blue-200 text-blue-800' },
  'Interview': { headerBg: 'bg-amber-50', headerText: 'text-amber-800', headerBorder: 'border-amber-200', badge: 'bg-amber-200 text-amber-800' },
  'Offer': { headerBg: 'bg-green-50', headerText: 'text-green-800', headerBorder: 'border-green-200', badge: 'bg-green-200 text-green-800' },
  'Rejected': { headerBg: 'bg-red-50', headerText: 'text-red-800', headerBorder: 'border-red-200', badge: 'bg-red-200 text-red-800' },
};

const DEFAULT_COLUMNS = ['Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected'];

const getColumnStyle = (key: string) => {
  return COLUMN_STYLES[key] || COLUMN_STYLES['Wishlist'];
};

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  application: ApplicationResponse | null;
  columns: string[];
  initialStatus: string;
}

const JobModal: React.FC<JobModalProps> = ({ isOpen, onClose, onSave, application, columns, initialStatus }) => {
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    status: initialStatus || columns[0] || 'Wishlist',
    date: '',
    notes: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (application) {
      setFormData({
        company: application.company,
        role: application.role,
        status: application.column_key,
        date: application.date || '',
        notes: application.notes || '',
      });
    } else {
      setFormData({
        company: '',
        role: '',
        status: initialStatus || columns[0] || 'Wishlist',
        date: '',
        notes: '',
      });
    }
  }, [application, initialStatus, columns, isOpen]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        company: formData.company,
        role: formData.role,
        status: formData.status,
        date: formData.date ? formData.date : null,
        notes: formData.notes ? formData.notes : null,
      };

      if (application) {
        await api.put(`/tracker/applications/${application.id}`, payload);
      } else {
        await api.post(`/tracker/applications`, payload);
      }
      onSave();
      onClose();
    } catch (error) {
      console.error('Failed to save application', error);
      // Would ideally show a toast error here
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-auto bg-black/50 backdrop-blur-sm transition-opacity">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl m-4">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
        <h2 className="mb-6 text-xl font-semibold text-slate-800">
          {application ? 'Edit Application' : 'Add New Job'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Company *</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Building2 className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                required
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                className="block w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="e.g. Acme Corp"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Role *</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Briefcase className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                required
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                className="block w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="e.g. Senior Frontend Engineer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="block w-full rounded-lg border border-slate-300 py-2 pl-3 pr-8 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {columns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-slate-700">Date</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Calendar className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="block w-full rounded-lg border border-slate-300 py-2 pl-10 pr-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">Notes</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="block w-full rounded-lg border border-slate-300 p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Any details about the application, interviewers, or next steps..."
            />
          </div>

          <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {application ? 'Save Changes' : 'Add Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default function JobTracker() {
  const [boardData, setBoardData] = useState<TrackerBoardResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<ApplicationResponse | null>(null);
  const [targetColumn, setTargetColumn] = useState<string>('Wishlist');

  const fetchBoard = async () => {
    try {
      const response = await api.get('/tracker/');
      setBoardData(response.data);
    } catch (error) {
      console.error('Error fetching tracker board:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBoard();
  }, []);

  const handleAddClick = (colKey: string) => {
    setEditingApp(null);
    setTargetColumn(colKey);
    setModalOpen(true);
  };

  const handleEditClick = (app: ApplicationResponse) => {
    setEditingApp(app);
    setModalOpen(true);
  };

  const handleDelete = async (appId: string) => {
    if (!window.confirm('Are you sure you want to delete this job application?')) return;
    try {
      // Optimistic update
      setBoardData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          columns: prev.columns.map((col) => ({
            ...col,
            applications: col.applications.filter((a) => a.id !== appId),
          })),
        };
      });
      await api.delete(`/tracker/applications/${appId}`);
    } catch (error) {
      console.error('Failed to delete application', error);
      fetchBoard(); // Revert on failure
    }
  };

  const handleMove = async (app: ApplicationResponse, direction: 'left' | 'right') => {
    if (!boardData) return;
    const columns = boardData.columns;
    const currentIndex = columns.findIndex((col) => col.key === app.column_key);
    if (currentIndex === -1) return;

    let targetIndex = currentIndex;
    if (direction === 'left' && currentIndex > 0) targetIndex = currentIndex - 1;
    if (direction === 'right' && currentIndex < columns.length - 1) targetIndex = currentIndex + 1;

    if (targetIndex === currentIndex) return;

    const targetKey = columns[targetIndex].key;

    // Optimistic UI update
    setBoardData((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        columns: prev.columns.map((col) => {
          if (col.key === app.column_key) {
            return { ...col, applications: col.applications.filter((a) => a.id !== app.id) };
          }
          if (col.key === targetKey) {
            return { ...col, applications: [...col.applications, { ...app, column_key: targetKey }] };
          }
          return col;
        }),
      };
    });

    try {
      await api.patch(`/tracker/applications/${app.id}/move`, { target_status: targetKey });
    } catch (error) {
      console.error('Failed to move application', error);
      fetchBoard(); // Revert on failure
    }
  };

  const totalApplications = boardData
    ? boardData.columns.reduce((sum, col) => sum + col.applications.length, 0)
    : 0;

  const getInitials = (company: string) => {
    return company ? company.substring(0, 2).toUpperCase() : '??';
  };

  return (
    <DashboardLayout activeKey="job-tracker">
      <div className="flex h-full flex-col p-6">
        {/* Header */}
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Job Tracker</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your job applications across different stages. You have {totalApplications} total applications.
            </p>
          </div>
          <button
            onClick={() => handleAddClick('Wishlist')}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="h-4 w-4" />
            Add Application
          </button>
        </div>

        {/* Board */}
        <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
          <div className="inline-flex h-full min-h-[500px] items-start gap-6">
            {isLoading
              ? // Skeletons
                DEFAULT_COLUMNS.map((_col, idx) => (
                  <div key={idx} className="w-[320px] flex-shrink-0 rounded-xl bg-slate-50/50 p-4 border border-slate-100 flex flex-col h-full">
                    <div className="mb-4 flex items-center justify-between pb-2 border-b border-slate-200">
                      <div className="h-5 w-24 rounded bg-slate-200 animate-pulse"></div>
                      <div className="h-5 w-8 rounded-full bg-slate-200 animate-pulse"></div>
                    </div>
                    <div className="space-y-3">
                      {[1, 2].map((cardIdx) => (
                        <div key={cardIdx} className="h-28 w-full rounded-lg bg-white shadow-sm border border-slate-100 p-4">
                          <div className="flex gap-3">
                            <div className="h-10 w-10 rounded-lg bg-slate-200 animate-pulse"></div>
                            <div className="flex-1 space-y-2 py-1">
                              <div className="h-4 w-3/4 rounded bg-slate-200 animate-pulse"></div>
                              <div className="h-3 w-1/2 rounded bg-slate-200 animate-pulse"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              : boardData?.columns.map((column, index) => {
                  const style = getColumnStyle(column.key);
                  const isFirst = index === 0;
                  const isLast = index === boardData.columns.length - 1;

                  return (
                    <div
                      key={column.id}
                      className={`flex w-[320px] flex-shrink-0 flex-col rounded-xl border border-slate-200/60 bg-slate-50/50 max-h-full`}
                    >
                      {/* Column Header */}
                      <div className={`flex items-center justify-between rounded-t-xl border-b px-4 py-3 ${style.headerBg} ${style.headerBorder}`}>
                        <h3 className={`font-semibold ${style.headerText}`}>{column.label}</h3>
                        <span className={`inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-medium ${style.badge}`}>
                          {column.applications.length}
                        </span>
                      </div>

                      {/* Column Content */}
                      <div className="flex-1 overflow-y-auto p-3 custom-scrollbar space-y-3 min-h-[150px]">
                        {column.applications.length === 0 ? (
                          <button
                            onClick={() => handleAddClick(column.key)}
                            className="flex w-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-slate-300 bg-transparent py-8 text-slate-500 hover:border-indigo-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all group"
                          >
                            <Plus className="mb-2 h-6 w-6 text-slate-400 group-hover:text-indigo-500" />
                            <span className="text-sm font-medium">Add Job</span>
                          </button>
                        ) : (
                          column.applications.map((app) => (
                            <div
                              key={app.id}
                              className="group relative flex flex-col rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-indigo-300 hover:shadow-md"
                            >
                              {/* Hover actions (Top right) */}
                              <div className="absolute right-2 top-2 flex opacity-0 transition-opacity group-hover:opacity-100 bg-white/90 rounded-md backdrop-blur-sm p-1 shadow-sm border border-slate-100">
                                <button
                                  onClick={() => handleEditClick(app)}
                                  className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDelete(app.id)}
                                  className="rounded p-1.5 text-slate-400 hover:bg-slate-100 hover:text-red-600 transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>

                              <div className="flex items-start gap-3">
                                {/* Avatar */}
                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-sm font-bold text-indigo-700">
                                  {getInitials(app.company)}
                                </div>
                                <div className="flex-1 min-w-0 pr-8">
                                  <h4 className="truncate font-semibold text-slate-900" title={app.company}>
                                    {app.company}
                                  </h4>
                                  <p className="truncate text-sm text-slate-600" title={app.role}>
                                    {app.role}
                                  </p>
                                </div>
                              </div>

                              {/* Footer details */}
                              <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
                                <div className="flex items-center text-xs text-slate-500">
                                  {app.date ? (
                                    <>
                                      <Calendar className="mr-1.5 h-3.5 w-3.5" />
                                      {new Date(app.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                    </>
                                  ) : (
                                    <span className="text-slate-400 italic">No date</span>
                                  )}
                                </div>

                                {/* Move actions */}
                                <div className="flex items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                  <button
                                    onClick={() => handleMove(app, 'left')}
                                    disabled={isFirst}
                                    className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
                                    title="Move left"
                                  >
                                    <ChevronLeft className="h-4 w-4" />
                                  </button>
                                  <button
                                    onClick={() => handleMove(app, 'right')}
                                    disabled={isLast}
                                    className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-indigo-600 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-colors"
                                    title="Move right"
                                  >
                                    <ChevronRight className="h-4 w-4" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>

                      {/* Add Job Button at bottom of column */}
                      <div className="p-3 border-t border-slate-200/50 bg-slate-50/50 rounded-b-xl">
                        <button
                          onClick={() => handleAddClick(column.key)}
                          className="flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-200/50 hover:text-slate-900 transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                          Add Job
                        </button>
                      </div>
                    </div>
                  );
                })}
          </div>
        </div>
      </div>

      <JobModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={fetchBoard}
        application={editingApp}
        columns={boardData?.columns.map(c => c.key) || DEFAULT_COLUMNS}
        initialStatus={targetColumn}
      />
    </DashboardLayout>
  );
}
