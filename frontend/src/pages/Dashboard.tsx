import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import DashboardLayout from '../components/DashboardLayout';
import {
  FileText, PlusCircle, ExternalLink, Download, Lock as LockIcon,
  Briefcase, Brain, BookOpen, Sparkles, Plus, Pencil, Trash2, X, ArrowRight, ClipboardList
} from 'lucide-react';

// ── Types ──
interface CV { id: string; status: string; tier: string | null; ats_score: number | null; watermarked_pdf_url: string | null; clean_pdf_url: string | null; created_at: string; }
interface JobApp { id: string; company: string; role: string; status: 'Wishlist' | 'Applied' | 'Interview' | 'Offer' | 'Rejected'; date: string; notes: string; }

const JOB_COLUMNS: { key: JobApp['status']; label: string; color: string; bg: string }[] = [
  { key: 'Wishlist', label: 'Wishlist', color: 'text-slate-600', bg: 'bg-slate-50' },
  { key: 'Applied', label: 'Applied', color: 'text-blue-600', bg: 'bg-blue-50' },
  { key: 'Interview', label: 'Interview', color: 'text-amber-600', bg: 'bg-amber-50' },
  { key: 'Offer', label: 'Offer', color: 'text-green-600', bg: 'bg-green-50' },
  { key: 'Rejected', label: 'Rejected', color: 'text-red-600', bg: 'bg-red-50' },
];

const TABS = [
  { key: 'resume', label: 'Resume Building', icon: FileText },
  { key: 'jobs', label: 'Job Search', icon: Briefcase },
  { key: 'interview', label: 'Interview Prep', icon: Brain },
  { key: 'learning', label: 'Learning', icon: BookOpen },
];

export default function Dashboard() {
  const { user, updateCredits } = useAuthStore();
  const [searchParams] = useSearchParams();
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'resume');

  // Job Tracker (localStorage)
  const [jobs, setJobs] = useState<JobApp[]>(() => {
    try { return JSON.parse(localStorage.getItem('vitelo_job_tracker') || '[]'); } catch { return []; }
  });
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApp | null>(null);
  const [jobForm, setJobForm] = useState({ company: '', role: '', status: 'Wishlist' as JobApp['status'], notes: '' });

  // Tailor
  const [tailorDesc, setTailorDesc] = useState('');
  const [tailoring, setTailoring] = useState(false);
  const [tailorResult, setTailorResult] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [creditsRes, cvsRes] = await Promise.all([api.get('/billing/credits'), api.get('/cv/')]);
        updateCredits(creditsRes.data.credits);
        setCvs(cvsRes.data);
      } catch (err) { console.error('Dashboard load failed', err); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [updateCredits]);

  // Job tracker helpers
  const saveJobs = (updated: JobApp[]) => { setJobs(updated); localStorage.setItem('vitelo_job_tracker', JSON.stringify(updated)); };
  const handleSaveJob = () => {
    if (!jobForm.company || !jobForm.role) return;
    if (editingJob) {
      saveJobs(jobs.map(j => j.id === editingJob.id ? { ...editingJob, ...jobForm } : j));
    } else {
      saveJobs([...jobs, { id: Date.now().toString(), ...jobForm, date: new Date().toISOString().split('T')[0] }]);
    }
    setShowJobModal(false); setEditingJob(null); setJobForm({ company: '', role: '', status: 'Wishlist', notes: '' });
  };
  const handleEditJob = (j: JobApp) => { setEditingJob(j); setJobForm({ company: j.company, role: j.role, status: j.status, notes: j.notes }); setShowJobModal(true); };
  const handleDeleteJob = (id: string) => saveJobs(jobs.filter(j => j.id !== id));
  const moveJob = (id: string, newStatus: JobApp['status']) => { saveJobs(jobs.map(j => j.id === id ? { ...j, status: newStatus } : j)); };

  // Tailor CV
  const handleTailor = async () => {
    if (!tailorDesc.trim() || cvs.length === 0) return;
    setTailoring(true); setTailorResult(null);
    try {
      const res = await api.post(`/cv/tailor/${cvs[0].id}`, { job_description: tailorDesc });
      setTailorResult(res.data.cv_id);
    } catch { setTailorResult('error'); }
    finally { setTailoring(false); }
  };


  const handleCheckout = async (tier: string) => {
    try { const res = await api.get(`/billing/checkout/${tier}`); window.location.href = res.data.checkout_url; } catch { alert('Checkout failed'); }
  };

  const sidebarActiveKey = activeTab === 'jobs' ? 'job-tracker' : activeTab === 'interview' ? 'interview' : activeTab === 'learning' ? 'learning' : 'dashboard';

  return (
    <DashboardLayout activeKey={sidebarActiveKey}>
      {/* Greeting */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Hi {user?.full_name?.split(' ')[0] || 'there'}!</h1>
        <p className="text-slate-400 text-sm mt-1">What's your goal today?</p>
      </div>

      {/* ── Goal Tabs with connecting lines (Resume.io style) ── */}
      <div className="flex items-center justify-center gap-0 mb-10 overflow-x-auto pb-2">
        {TABS.map((tab, i) => (
          <div key={tab.key} className="flex items-center">
            <button
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${
                activeTab === tab.key
                  ? 'bg-white text-blue-600 border-blue-200 shadow-sm'
                  : 'bg-transparent text-slate-400 border-transparent hover:text-slate-600'
              }`}
            >
              {tab.label}
            </button>
            {/* Dashed connector line */}
            {i < TABS.length - 1 && (
              <div className="w-8 sm:w-16 border-t-2 border-dashed border-slate-200 mx-1" />
            )}
          </div>
        ))}
      </div>

      {/* ── TAB: Resume Building ── */}
      {activeTab === 'resume' && (
        <div className="grid md:grid-cols-5 gap-6">
          {/* Progress panel - left */}
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5 text-center">Progress</h3>
            <div className="space-y-4">
              {[
                { icon: FileText, label: 'Resume Building', value: cvs.length > 0 ? '100%' : '0%', pct: cvs.length > 0 ? 100 : 0 },
                { icon: Sparkles, label: 'Resume Tailoring', value: cvs.filter(c => c.tier).length.toString(), pct: 0 },
                { icon: ArrowRight, label: 'Cover Letter Crafting', value: '0', pct: 0 },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                    <item.icon className="w-4 h-4 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-slate-700 font-medium">{item.label}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-800">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Motivational card - right */}
          <div className="md:col-span-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-8 flex flex-col">
            {cvs.length === 0 ? (
              <>
                <div className="inline-flex self-start px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold mb-4">Get Started</div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Create your first AI CV</h3>
                <p className="text-sm text-slate-500 flex-1 mb-5">Nice work. Your new resume will literally open doors. Now let's use AI to tailor it for any job...</p>
                <Link to="/generate" className="inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm hover:shadow-md transition-all self-start px-6">
                  <Sparkles className="w-4 h-4" /> Create CV — Free
                </Link>
              </>
            ) : (
              <>
                <div className="inline-flex self-start px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold mb-4">Resume complete!</div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Tailor your CV to a specific job</h3>
                <p className="text-sm text-slate-500 mb-4">Paste a job description and AI will rephrase your CV to match.</p>
                <textarea rows={3} placeholder="Paste the job description here..." value={tailorDesc} onChange={e => setTailorDesc(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 mb-3 resize-none bg-white/80" />
                <button onClick={handleTailor} disabled={tailoring || !tailorDesc.trim()}
                  className="inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm hover:shadow-md disabled:opacity-50 transition-all self-start px-6">
                  {tailoring ? 'Tailoring...' : '✨ Tailor with AI'}
                </button>
                {tailorResult && tailorResult !== 'error' && <p className="text-sm text-green-600 font-semibold mt-3">✅ Tailored CV created! Check below.</p>}
                {tailorResult === 'error' && <p className="text-sm text-red-500 mt-3">Failed — try again.</p>}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: Job Search (Kanban Board) ── */}
      {activeTab === 'jobs' && (
        <div>
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <ClipboardList className="w-5 h-5 text-blue-500" />
              <h2 className="text-lg font-bold text-slate-800">Board</h2>
            </div>
            <button onClick={() => { setEditingJob(null); setJobForm({ company: '', role: '', status: 'Wishlist', notes: '' }); setShowJobModal(true); }}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
              <Plus className="w-4 h-4" /> Add Job
            </button>
          </div>

          {/* Kanban columns */}
          <div className="flex gap-4 overflow-x-auto pb-4">
            {JOB_COLUMNS.map(col => {
              const columnJobs = jobs.filter(j => j.status === col.key);
              return (
                <div key={col.key} className={`min-w-[220px] max-w-[260px] flex-1 ${col.bg} rounded-2xl border border-slate-200/50`}>
                  {/* Column header */}
                  <div className="px-4 py-3 border-b border-slate-200/50 flex items-center justify-between">
                    <span className={`text-sm font-bold ${col.color}`}>{col.label}</span>
                    <span className="text-xs font-bold text-slate-400 bg-white px-2 py-0.5 rounded-full">{columnJobs.length}</span>
                  </div>

                  {/* Cards */}
                  <div className="p-2 space-y-2 min-h-[120px]">
                    {columnJobs.map(j => (
                      <div key={j.id} className="bg-white rounded-xl p-3 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow group">
                        <div className="flex items-start justify-between mb-1">
                          <div className="w-7 h-7 rounded-lg bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {j.company[0]?.toUpperCase()}
                          </div>
                          <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                            <button onClick={() => handleEditJob(j)} className="p-1 rounded hover:bg-slate-100"><Pencil className="w-3 h-3 text-slate-400" /></button>
                            <button onClick={() => handleDeleteJob(j.id)} className="p-1 rounded hover:bg-red-50"><Trash2 className="w-3 h-3 text-red-400" /></button>
                          </div>
                        </div>
                        <p className="text-sm font-bold text-slate-800 truncate">{j.company}</p>
                        <p className="text-xs text-slate-400 truncate mb-2">{j.role}</p>

                        {/* Move buttons */}
                        <div className="flex gap-1 flex-wrap">
                          {JOB_COLUMNS.filter(c => c.key !== j.status).slice(0, 2).map(c => (
                            <button key={c.key} onClick={() => moveJob(j.id, c.key)}
                              className={`text-[10px] font-semibold px-2 py-1 rounded-md ${c.bg} ${c.color} hover:opacity-80`}>
                              → {c.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* Add job button */}
                    <button onClick={() => { setEditingJob(null); setJobForm({ ...jobForm, status: col.key }); setShowJobModal(true); }}
                      className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-dashed border-slate-300 text-xs text-slate-400 hover:text-blue-500 hover:border-blue-300 transition-colors">
                      <Plus className="w-3.5 h-3.5" /> Add Job
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── TAB: Interview Prep ── */}
      {activeTab === 'interview' && (
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <div className="inline-flex px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold mb-4">Sample Interview</div>
            <h2 className="text-xl font-bold text-slate-800 mb-2">Tell us about this dream job</h2>
            <p className="text-sm text-slate-500 mb-6">Enter the job title and company. We'll use these to generate real questions from our database.</p>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-500 mb-1 block">Job Title</label>
                <input type="text" placeholder="e.g. Software Developer" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
              </div>
              <div>
                <label className="text-sm text-slate-500 mb-1 block">Desired Company (Optional)</label>
                <input type="text" placeholder="e.g. Amazon, Google" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
              </div>
              <button className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm hover:shadow-md transition-all">
                Create Interview
              </button>
            </div>
          </div>

          {/* Preview card */}
          <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border border-slate-200 p-8 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-4 shadow-sm">
              <Brain className="w-10 h-10 text-blue-400" />
            </div>
            <p className="text-lg font-bold text-slate-700 mb-1">Job title</p>
            <p className="text-sm text-slate-400">Software Engineer</p>
          </div>
        </div>
      )}

      {/* ── TAB: Learning ── */}
      {activeTab === 'learning' && (
        <div>
          <div className="grid md:grid-cols-5 gap-6 mb-8">
            {/* Left progress */}
            <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5 text-center">Progress</h3>
              <div className="space-y-4">
                {[
                  { label: 'Upskill', value: '0%' },
                  { label: '90 Days Plan', value: '0%' },
                  { label: 'Get Promotion', value: '0%' },
                  { label: 'Change Careers', value: '0%' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-4">
                    <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-4 h-4 text-slate-400" />
                    </div>
                    <span className="flex-1 text-sm text-slate-700 font-medium">{item.label}</span>
                    <span className="text-sm font-bold text-slate-400">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right motivational */}
            <div className="md:col-span-3 bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl border border-green-100 p-8">
              <div className="inline-flex px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold mb-4">Upskill</div>
              <h3 className="text-xl font-bold text-slate-800 mb-2">Learn in-demand skills. Lead your future</h3>
              <p className="text-sm text-slate-500 mb-5">Access top-rated courses, earn certificates, and gain the confidence to grow your career on your terms.</p>
              <Link to="/examples" className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:shadow-md transition-all">
                Explore courses <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Resource cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { title: 'How to Write a CV', desc: 'Step-by-step guide for beginners.', link: '/examples', emoji: '📝' },
              { title: 'ATS Optimization Tips', desc: 'Beat the robot recruiters.', link: '/checker', emoji: '🤖' },
              { title: 'Interview Secrets', desc: 'Common questions & ideal answers.', link: '/examples', emoji: '🎤' },
            ].map(card => (
              <Link key={card.title} to={card.link} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all group">
                <p className="text-2xl mb-2">{card.emoji}</p>
                <h4 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">{card.title}</h4>
                <p className="text-xs text-slate-400 mt-1">{card.desc}</p>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ── CV List (always visible below tabs) ── */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">Your CVs</h2>
          <Link to="/generate" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
            <PlusCircle className="w-4 h-4" /> New CV
          </Link>
        </div>
        {loading ? (
          <div className="animate-pulse space-y-3">
            <div className="h-20 bg-slate-200 rounded-xl" /><div className="h-20 bg-slate-200 rounded-xl" />
          </div>
        ) : cvs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200">
            <FileText className="w-10 h-10 mx-auto text-slate-300 mb-3" />
            <p className="font-medium text-slate-600">No CVs yet</p>
            <p className="text-sm text-slate-400 mt-1">Create your first AI CV for free.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {cvs.map(cv => (
              <div key={cv.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <div className="bg-blue-50 text-blue-700 w-9 h-9 rounded-lg flex items-center justify-center"><FileText className="w-4 h-4" /></div>
                  {cv.tier ? (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">{cv.tier.toUpperCase()}</span>
                  ) : (
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500">Draft</span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mb-1">{new Date(cv.created_at).toLocaleDateString()}</p>
                <p className="font-semibold text-slate-800 text-sm mb-3">ATS: {cv.ats_score || '—'}/100</p>
                <div className="mt-auto space-y-2">
                  {cv.clean_pdf_url ? (
                    <a href={cv.clean_pdf_url} target="_blank" rel="noreferrer" className="w-full inline-flex justify-center items-center gap-1.5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
                      <Download className="w-3.5 h-3.5" /> Download
                    </a>
                  ) : (
                    <>
                      {cv.watermarked_pdf_url && (
                        <a href={cv.watermarked_pdf_url} target="_blank" rel="noreferrer" className="w-full inline-flex justify-center items-center gap-1.5 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm font-medium hover:bg-slate-50 transition-colors">
                          <ExternalLink className="w-3.5 h-3.5" /> Preview
                        </a>
                      )}
                      {(user?.credits || 0) > 0 ? (
                        <Link to={`/generate?unlock=${cv.id}`} className="w-full inline-flex justify-center items-center gap-1.5 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors">
                          <LockIcon className="w-3.5 h-3.5" /> Unlock
                        </Link>
                      ) : (
                        <button onClick={() => handleCheckout('basic')} className="w-full inline-flex justify-center items-center gap-1.5 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold hover:from-green-600 hover:to-emerald-700 transition-colors">
                          <LockIcon className="w-3.5 h-3.5" /> Buy Credit ($3)
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Job Tracker Modal ── */}
      {showJobModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowJobModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">{editingJob ? 'Edit Application' : 'Add Application'}</h3>
              <button onClick={() => setShowJobModal(false)} className="p-1.5 rounded-md hover:bg-slate-100"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <input type="text" placeholder="Company Name" value={jobForm.company} onChange={e => setJobForm({ ...jobForm, company: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              <input type="text" placeholder="Job Title" value={jobForm.role} onChange={e => setJobForm({ ...jobForm, role: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              <select value={jobForm.status} onChange={e => setJobForm({ ...jobForm, status: e.target.value as JobApp['status'] })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="Wishlist">Wishlist</option><option value="Applied">Applied</option><option value="Interview">Interview</option><option value="Offer">Offer</option><option value="Rejected">Rejected</option>
              </select>
              <textarea placeholder="Notes (optional)" rows={2} value={jobForm.notes} onChange={e => setJobForm({ ...jobForm, notes: e.target.value })} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowJobModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={handleSaveJob} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700">{editingJob ? 'Save Changes' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
