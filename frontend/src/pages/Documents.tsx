import { useEffect, useState, useRef } from 'react';
import { Link, useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import DashboardLayout from '../components/DashboardLayout';
import {
  FileText, Plus, Download, ExternalLink, Sparkles,
  Trash2, Pencil, Check, X, MoreHorizontal, Copy,
  FileDown, Eye, Clock, Star, ChevronRight, Loader2,
} from 'lucide-react';

interface CV {
  id: string;
  status: string;
  tier: string | null;
  ats_score: number | null;
  watermarked_pdf_url: string | null;
  clean_pdf_url: string | null;
  created_at: string;
  title: string | null;
  template: string | null;
}

/* ── ATS score badge ── */
const atsBadge = (score: number) => {
  if (score >= 80) return { bg: 'bg-emerald-100 text-emerald-700', label: 'Excellent' };
  if (score >= 60) return { bg: 'bg-amber-100 text-amber-700', label: 'Good' };
  return { bg: 'bg-red-100 text-red-700', label: 'Needs Work' };
};

/* ── Tier badge ── */
const tierBadge: Record<string, string> = {
  basic: 'bg-slate-100 text-slate-600',
  pro: 'bg-blue-100 text-blue-700',
  ultimate: 'bg-purple-100 text-purple-700',
};

/* ── Context Menu ── */
function ContextMenu({
  cv, onRename, onDelete, onDuplicate, onClose,
}: {
  cv: CV;
  onRename: () => void;
  onDelete: () => void;
  onDuplicate: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div ref={ref}
      className="absolute right-0 top-8 z-50 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 overflow-hidden">
      <button onClick={() => { onRename(); onClose(); }}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
        <Pencil className="w-3.5 h-3.5 text-slate-400" /> Rename
      </button>
      {cv.clean_pdf_url && (
        <a href={cv.clean_pdf_url} target="_blank" rel="noreferrer"
          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors" onClick={onClose}>
          <FileDown className="w-3.5 h-3.5 text-slate-400" /> Download PDF
        </a>
      )}
      {cv.watermarked_pdf_url && !cv.clean_pdf_url && (
        <a href={cv.watermarked_pdf_url} target="_blank" rel="noreferrer"
          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors" onClick={onClose}>
          <Eye className="w-3.5 h-3.5 text-slate-400" /> Preview
        </a>
      )}
      <button onClick={() => { onDuplicate(); onClose(); }}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors">
        <Copy className="w-3.5 h-3.5 text-slate-400" /> Duplicate
      </button>
      <div className="my-1 border-t border-slate-100" />
      <button onClick={() => { onDelete(); onClose(); }}
        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
        <Trash2 className="w-3.5 h-3.5" /> Delete
      </button>
    </div>
  );
}

export default function Documents() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'covers' ? 'covers' : 'resumes');
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);

  /* Rename state */
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [renameLoading, setRenameLoading] = useState(false);

  /* Delete state */
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  /* Context menu */
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  /* ── Load CVs ── */
  useEffect(() => {
    api.get('/cv/')
      .then(res => setCvs(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  /* ── Rename ── */
  const startRename = (cv: CV) => {
    setRenamingId(cv.id);
    setRenameValue(cv.title || 'My Resume');
  };

  const confirmRename = async (id: string) => {
    if (!renameValue.trim()) return;
    setRenameLoading(true);
    try {
      const res = await api.patch(`/cv/${id}/title`, { title: renameValue.trim() });
      setCvs(prev => prev.map(c => c.id === id ? { ...c, title: res.data.title } : c));
    } catch (e) { console.error(e); }
    finally { setRenameLoading(false); setRenamingId(null); }
  };

  /* ── Delete ── */
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await api.delete(`/cv/${id}`);
      setCvs(prev => prev.filter(c => c.id !== id));
    } catch (e) { console.error(e); }
    finally { setDeletingId(null); setDeleteConfirm(null); }
  };

  /* ── Duplicate (clone via generate with same data — simplified: just show toast) ── */
  const handleDuplicate = (cv: CV) => {
    alert(`Duplicate feature: navigate to /generate with CV ${cv.id} pre-filled. (Coming soon)`);
  };

  const totalCount = cvs.length;
  const unlockedCount = cvs.filter(c => c.clean_pdf_url).length;

  return (
    <DashboardLayout activeKey="documents">

      {/* ── Header ── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Documents</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {totalCount} resume{totalCount !== 1 ? 's' : ''} · {unlockedCount} unlocked
          </p>
        </div>
        <Link to="/generate"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold hover:shadow-md transition-all">
          <Plus className="w-4 h-4" /> Create New Resume
        </Link>
      </div>

      {/* ── Promo Banner ── */}
      <div className="flex items-center gap-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-2xl p-5 mb-8">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-800">Tailor your resume to any job in seconds</p>
          <p className="text-xs text-slate-500 mt-0.5">Paste a job description and AI will optimize your resume for that exact role</p>
        </div>
        <Link to="/generate"
          className="px-4 py-2 rounded-xl bg-white border border-blue-200 text-sm font-bold text-blue-700 hover:bg-blue-50 transition-colors whitespace-nowrap flex items-center gap-1.5">
          Start Now <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* ── Tabs ── */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit mb-8">
        {[
          { key: 'resumes', label: 'Resumes', count: cvs.length },
          { key: 'covers', label: 'Cover Letters', count: 0 },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}>
            {tab.label}
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${
              activeTab === tab.key ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-500'
            }`}>{tab.count}</span>
          </button>
        ))}
      </div>

      {/* ── RESUMES TAB ── */}
      {activeTab === 'resumes' && (
        <>
          {loading ? (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
              {[1, 2, 3].map(i => (
                <div key={i} className="h-64 rounded-2xl bg-slate-100 animate-pulse" />
              ))}
            </div>
          ) : cvs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-slate-200">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
                <FileText className="w-8 h-8 text-slate-300" />
              </div>
              <h3 className="text-lg font-bold text-slate-700 mb-1">No resumes yet</h3>
              <p className="text-sm text-slate-400 mb-6">Create your first AI-powered, ATS-optimized resume</p>
              <Link to="/generate"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold hover:shadow-md transition-all">
                <Sparkles className="w-4 h-4" /> Create My First Resume
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
              {cvs.map(cv => {
                const ats = cv.ats_score ? atsBadge(cv.ats_score) : null;
                const isRenaming = renamingId === cv.id;
                const isDeleting = deletingId === cv.id;

                return (
                  <div key={cv.id}
                    className="group bg-white rounded-2xl border border-slate-200 hover:shadow-md hover:border-slate-300 transition-all flex flex-col overflow-hidden">

                    {/* CV Thumbnail */}
                    <div className="relative h-44 bg-gradient-to-br from-slate-50 to-slate-100 border-b border-slate-100 flex items-center justify-center">
                      {/* Template Preview Placeholder */}
                      <div className="w-28 h-36 bg-white rounded-lg shadow-md border border-slate-200 flex flex-col p-2 gap-1">
                        <div className="h-3 bg-blue-200 rounded w-3/4" />
                        <div className="h-1.5 bg-slate-200 rounded w-1/2" />
                        <div className="mt-1.5 space-y-1">
                          <div className="h-1 bg-slate-100 rounded w-full" />
                          <div className="h-1 bg-slate-100 rounded w-5/6" />
                          <div className="h-1 bg-slate-100 rounded w-4/6" />
                        </div>
                        <div className="mt-1.5 space-y-1">
                          <div className="h-1 bg-slate-100 rounded w-full" />
                          <div className="h-1 bg-slate-100 rounded w-3/4" />
                        </div>
                      </div>

                      {/* Tier badge */}
                      {cv.tier && (
                        <span className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-md capitalize ${tierBadge[cv.tier] || 'bg-slate-100 text-slate-600'}`}>
                          {cv.tier}
                        </span>
                      )}

                      {/* ATS Score */}
                      {ats && cv.ats_score && (
                        <div className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-lg ${ats.bg} text-xs font-bold`}>
                          <Star className="w-3 h-3" /> {cv.ats_score}% ATS
                        </div>
                      )}

                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity rounded-t-2xl flex items-center justify-center gap-2">
                        {cv.clean_pdf_url && (
                          <a href={cv.clean_pdf_url} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white shadow-md text-xs font-bold text-slate-700 hover:bg-blue-50 transition-colors">
                            <Download className="w-3.5 h-3.5" /> Download
                          </a>
                        )}
                        {cv.watermarked_pdf_url && (
                          <a href={cv.watermarked_pdf_url} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white shadow-md text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors">
                            <Eye className="w-3.5 h-3.5" /> Preview
                          </a>
                        )}
                      </div>
                    </div>

                    {/* CV Info */}
                    <div className="p-4 flex-1 flex flex-col">
                      {/* Title + Menu */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          {isRenaming ? (
                            <div className="flex items-center gap-1">
                              <input
                                autoFocus
                                value={renameValue}
                                onChange={e => setRenameValue(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') confirmRename(cv.id); if (e.key === 'Escape') setRenamingId(null); }}
                                className="flex-1 text-sm font-bold border border-blue-300 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-0"
                              />
                              <button onClick={() => confirmRename(cv.id)} disabled={renameLoading}
                                className="p-1.5 rounded-lg bg-blue-600 text-white hover:bg-blue-700">
                                {renameLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                              </button>
                              <button onClick={() => setRenamingId(null)} className="p-1.5 rounded-lg hover:bg-slate-100">
                                <X className="w-3.5 h-3.5 text-slate-400" />
                              </button>
                            </div>
                          ) : (
                            <h3 className="font-bold text-sm text-slate-800 truncate">
                              {cv.title || 'My Resume'}
                            </h3>
                          )}
                        </div>

                        {/* 3-dot menu */}
                        {!isRenaming && (
                          <div className="relative flex-shrink-0">
                            <button onClick={() => setOpenMenu(openMenu === cv.id ? null : cv.id)}
                              className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors">
                              <MoreHorizontal className="w-4 h-4 text-slate-400" />
                            </button>
                            {openMenu === cv.id && (
                              <ContextMenu
                                cv={cv}
                                onRename={() => startRename(cv)}
                                onDelete={() => setDeleteConfirm(cv.id)}
                                onDuplicate={() => handleDuplicate(cv)}
                                onClose={() => setOpenMenu(null)}
                              />
                            )}
                          </div>
                        )}
                      </div>

                      {/* Meta */}
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-3">
                        <Clock className="w-3 h-3" />
                        {new Date(cv.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        {cv.template && (
                          <><span className="mx-1">·</span><span className="capitalize">{cv.template}</span></>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2 mt-auto">
                        <Link to={`/generate?cv_id=${cv.id}`}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors">
                          <Pencil className="w-3.5 h-3.5" /> Edit
                        </Link>
                        {cv.clean_pdf_url ? (
                          <a href={cv.clean_pdf_url} target="_blank" rel="noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors">
                            <FileDown className="w-3.5 h-3.5" /> Download
                          </a>
                        ) : cv.watermarked_pdf_url ? (
                          <a href={cv.watermarked_pdf_url} target="_blank" rel="noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-600 text-white text-xs font-bold hover:bg-slate-700 transition-colors">
                            <ExternalLink className="w-3.5 h-3.5" /> Preview
                          </a>
                        ) : (
                          <Link to="/dashboard-pricing"
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold hover:shadow-md transition-all">
                            <Sparkles className="w-3.5 h-3.5" /> Unlock
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Create New Card */}
              <Link to="/generate"
                className="flex flex-col items-center justify-center h-full min-h-[280px] rounded-2xl border-2 border-dashed border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all group">
                <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-blue-100 flex items-center justify-center mb-3 transition-colors">
                  <Plus className="w-6 h-6 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </div>
                <p className="text-sm font-bold text-slate-500 group-hover:text-blue-600 transition-colors">New Resume</p>
                <p className="text-xs text-slate-300 mt-1">AI-powered & ATS-optimized</p>
              </Link>
            </div>
          )}
        </>
      )}

      {/* ── COVER LETTERS TAB ── */}
      {activeTab === 'covers' && (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-2xl border border-dashed border-slate-200">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-5">
            <FileText className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-700 mb-1">No cover letters yet</h3>
          <p className="text-sm text-slate-400 mb-6">Generate a personalized cover letter from your resume with AI</p>
          <Link to="/cover-letter"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold hover:shadow-md transition-all">
            <Sparkles className="w-4 h-4" /> Create Cover Letter
          </Link>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setDeleteConfirm(null)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-base font-bold text-slate-800 text-center mb-1">Delete Resume?</h3>
            <p className="text-sm text-slate-500 text-center mb-5">
              This will permanently delete this resume and all associated data. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)} disabled={!!deletingId}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-2">
                {deletingId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
