import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Plus, Pencil, Trash2, X, ClipboardList } from 'lucide-react';

interface JobApp { id: string; company: string; role: string; status: 'Wishlist' | 'Applied' | 'Interview' | 'Offer' | 'Rejected'; date: string; notes: string; }

const COLUMNS: { key: JobApp['status']; label: string; color: string; bg: string; border: string }[] = [
  { key: 'Wishlist', label: 'Wishlist', color: 'text-slate-600', bg: 'bg-slate-50', border: 'border-slate-200' },
  { key: 'Applied', label: 'Applied', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
  { key: 'Interview', label: 'Interview', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  { key: 'Offer', label: 'Offer', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
  { key: 'Rejected', label: 'Rejected', color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
];

export default function JobTracker() {
  const [jobs, setJobs] = useState<JobApp[]>(() => { try { return JSON.parse(localStorage.getItem('vitelo_job_tracker') || '[]'); } catch { return []; } });
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<JobApp | null>(null);
  const [form, setForm] = useState({ company: '', role: '', status: 'Wishlist' as JobApp['status'], notes: '' });

  const save = (u: JobApp[]) => { setJobs(u); localStorage.setItem('vitelo_job_tracker', JSON.stringify(u)); };
  const handleSave = () => {
    if (!form.company || !form.role) return;
    if (editing) save(jobs.map(j => j.id === editing.id ? { ...editing, ...form } : j));
    else save([...jobs, { id: Date.now().toString(), ...form, date: new Date().toISOString().split('T')[0] }]);
    setShowModal(false); setEditing(null); setForm({ company: '', role: '', status: 'Wishlist', notes: '' });
  };
  const openAdd = (status: JobApp['status']) => { setEditing(null); setForm({ company: '', role: '', status, notes: '' }); setShowModal(true); };
  const openEdit = (j: JobApp) => { setEditing(j); setForm({ company: j.company, role: j.role, status: j.status, notes: j.notes }); setShowModal(true); };
  const del = (id: string) => save(jobs.filter(j => j.id !== id));
  const move = (id: string, s: JobApp['status']) => save(jobs.map(j => j.id === id ? { ...j, status: s } : j));

  return (
    <DashboardLayout activeKey="job-tracker">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <ClipboardList className="w-5 h-5 text-blue-500" />
          <h1 className="text-xl font-bold text-slate-900">Board</h1>
          <div className="w-px h-6 bg-slate-200" />
          <span className="text-sm text-slate-400">{jobs.length} applications</span>
        </div>
        <button onClick={() => openAdd('Wishlist')} className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">
          <Plus className="w-4 h-4" /> Add Job
        </button>
      </div>

      {/* Kanban Columns */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(col => {
          const colJobs = jobs.filter(j => j.status === col.key);
          return (
            <div key={col.key} className={`min-w-[230px] max-w-[260px] flex-1 rounded-2xl border ${col.border} ${col.bg}`}>
              <div className="px-4 py-3 border-b border-white/50 flex items-center justify-between">
                <span className={`text-sm font-bold ${col.color}`}>{col.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full">{colJobs.length}</span>
                  <button onClick={() => openAdd(col.key)} className="text-slate-400 hover:text-blue-500"><Plus className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="p-2 space-y-2 min-h-[140px]">
                {colJobs.map(j => (
                  <div key={j.id} className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow group">
                    <div className="flex items-start justify-between mb-1.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center text-white text-[10px] font-bold">{j.company[0]?.toUpperCase()}</div>
                      <div className="opacity-0 group-hover:opacity-100 flex gap-0.5 transition-opacity">
                        <button onClick={() => openEdit(j)} className="p-1 rounded hover:bg-slate-100"><Pencil className="w-3 h-3 text-slate-400" /></button>
                        <button onClick={() => del(j.id)} className="p-1 rounded hover:bg-red-50"><Trash2 className="w-3 h-3 text-red-400" /></button>
                      </div>
                    </div>
                    <p className="text-sm font-bold text-slate-800 truncate">{j.company}</p>
                    <p className="text-xs text-slate-400 truncate mb-2">{j.role}</p>
                    <div className="flex gap-1 flex-wrap">
                      {COLUMNS.filter(c => c.key !== j.status).slice(0, 2).map(c => (
                        <button key={c.key} onClick={() => move(j.id, c.key)} className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${c.bg} ${c.color} hover:opacity-80`}>→ {c.label}</button>
                      ))}
                    </div>
                  </div>
                ))}
                <button onClick={() => openAdd(col.key)} className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-slate-300 text-xs text-slate-400 hover:text-blue-500 hover:border-blue-300 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add Job
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">{editing ? 'Edit' : 'Add'} Application</h3>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-md hover:bg-slate-100"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <input type="text" placeholder="Company Name" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              <input type="text" placeholder="Job Title" value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value as JobApp['status'] })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                {COLUMNS.map(c => <option key={c.key} value={c.key}>{c.label}</option>)}
              </select>
              <textarea placeholder="Notes" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={handleSave} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700">{editing ? 'Save' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
