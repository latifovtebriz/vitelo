import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import {
  FileText, PlusCircle, ExternalLink, Download, Lock as LockIcon,
  Briefcase, Brain, BookOpen, Sparkles, Plus, Pencil, Trash2, X, ArrowRight, CheckCircle2
} from 'lucide-react';

// ── Types ──
interface CV { id: string; status: string; tier: string | null; ats_score: number | null; watermarked_pdf_url: string | null; clean_pdf_url: string | null; created_at: string; }
interface JobApp { id: string; company: string; role: string; status: 'Applied' | 'Interview' | 'Offer' | 'Rejected'; date: string; notes: string; }

const STATUS_COLORS: Record<string, string> = { Applied: 'bg-blue-100 text-blue-700', Interview: 'bg-amber-100 text-amber-700', Offer: 'bg-green-100 text-green-700', Rejected: 'bg-red-100 text-red-700' };
const TABS = [
  { key: 'resume', label: 'Resume Building', icon: FileText },
  { key: 'jobs', label: 'Job Search', icon: Briefcase },
  { key: 'interview', label: 'Interview Prep', icon: Brain },
  { key: 'learning', label: 'Learning', icon: BookOpen },
];

export default function Dashboard() {
  const { user, updateCredits } = useAuthStore();
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('resume');

  // Job Tracker (localStorage)
  const [jobs, setJobs] = useState<JobApp[]>(() => {
    try { return JSON.parse(localStorage.getItem('vitelo_job_tracker') || '[]'); } catch { return []; }
  });
  const [showJobModal, setShowJobModal] = useState(false);
  const [editingJob, setEditingJob] = useState<JobApp | null>(null);
  const [jobForm, setJobForm] = useState({ company: '', role: '', status: 'Applied' as JobApp['status'], notes: '' });

  // Target Role (localStorage)
  const [targetRole, setTargetRole] = useState(() => localStorage.getItem('vitelo_target_role') || '');

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
    setShowJobModal(false); setEditingJob(null); setJobForm({ company: '', role: '', status: 'Applied', notes: '' });
  };
  const handleEditJob = (j: JobApp) => { setEditingJob(j); setJobForm({ company: j.company, role: j.role, status: j.status, notes: j.notes }); setShowJobModal(true); };
  const handleDeleteJob = (id: string) => saveJobs(jobs.filter(j => j.id !== id));

  // Target Role save
  const handleTargetRoleSave = (val: string) => { setTargetRole(val); localStorage.setItem('vitelo_target_role', val); };

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

  // Profile completion
  const profileCompletion = [cvs.length > 0, cvs.some(c => c.clean_pdf_url), !!targetRole, (user?.credits || 0) > 0].filter(Boolean).length * 25;

  const unlockedCount = cvs.filter(c => c.clean_pdf_url).length;
  const bestAts = cvs.reduce((best, c) => Math.max(best, c.ats_score || 0), 0);

  const handleCheckout = async (tier: string) => {
    try { const res = await api.get(`/billing/checkout/${tier}`); window.location.href = res.data.checkout_url; } catch { alert('Checkout failed'); }
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <Navbar />

      <main className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">

          {/* Greeting */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-slate-900">Hi {user?.full_name?.split(' ')[0] || 'there'}!</h1>
            <p className="text-slate-500">What's your goal today?</p>
          </div>

          <div className="grid lg:grid-cols-4 gap-6">

            {/* ── Main Content (3 cols) ── */}
            <div className="lg:col-span-3 space-y-6">

              {/* Goal Tabs */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
                {TABS.map(tab => (
                  <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${activeTab === tab.key ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'}`}>
                    <tab.icon className="w-4 h-4" /> {tab.label}
                  </button>
                ))}
              </div>

              {/* ── TAB: Resume Building ── */}
              {activeTab === 'resume' && (
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Progress */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400">Progress</h3>
                    <div className="space-y-3">
                      {[
                        { label: 'Resumes Created', value: cvs.length },
                        { label: 'CVs Unlocked', value: unlockedCount },
                        { label: 'Best ATS Score', value: bestAts > 0 ? `${bestAts}/100` : '—' },
                      ].map(item => (
                        <div key={item.label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                          <span className="text-sm text-slate-600">{item.label}</span>
                          <span className="font-bold text-slate-800">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  {/* Right card */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-6 flex flex-col">
                    {cvs.length === 0 ? (
                      <>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Create your first AI CV</h3>
                        <p className="text-sm text-slate-500 flex-1 mb-4">Let Gemini AI write a professional, ATS-optimized CV for you in seconds.</p>
                        <Link to="/generate" className="inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm hover:shadow-md transition-all">
                          <Sparkles className="w-4 h-4" /> Create CV — Free
                        </Link>
                      </>
                    ) : (
                      <>
                        <h3 className="text-lg font-bold text-slate-800 mb-2">Tailor your CV to a job</h3>
                        <p className="text-sm text-slate-500 mb-3">Paste a job description and AI will rephrase your CV to match.</p>
                        <textarea rows={3} placeholder="Paste the job description here..." value={tailorDesc} onChange={e => setTailorDesc(e.target.value)} className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3 resize-none" />
                        <button onClick={handleTailor} disabled={tailoring || !tailorDesc.trim()} className="inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm hover:shadow-md disabled:opacity-50 transition-all">
                          {tailoring ? 'Tailoring...' : '✨ Tailor with AI'}
                        </button>
                        {tailorResult && tailorResult !== 'error' && <p className="text-sm text-green-600 font-semibold mt-2">✅ Tailored CV created! Check below.</p>}
                        {tailorResult === 'error' && <p className="text-sm text-red-500 mt-2">Failed — try again.</p>}
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* ── TAB: Job Search ── */}
              {activeTab === 'jobs' && (
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-800">Job Applications ({jobs.length})</h3>
                    <button onClick={() => { setEditingJob(null); setJobForm({ company: '', role: '', status: 'Applied', notes: '' }); setShowJobModal(true); }}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition-colors">
                      <Plus className="w-4 h-4" /> Add Application
                    </button>
                  </div>
                  {jobs.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <Briefcase className="w-10 h-10 mx-auto mb-3 text-slate-300" />
                      <p className="font-medium">Start tracking your job applications to stay organized.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead><tr className="border-b border-slate-100 text-left">
                          <th className="pb-3 text-xs font-semibold text-slate-400 uppercase">Company</th>
                          <th className="pb-3 text-xs font-semibold text-slate-400 uppercase">Role</th>
                          <th className="pb-3 text-xs font-semibold text-slate-400 uppercase">Status</th>
                          <th className="pb-3 text-xs font-semibold text-slate-400 uppercase">Date</th>
                          <th className="pb-3 text-xs font-semibold text-slate-400 uppercase">Actions</th>
                        </tr></thead>
                        <tbody>
                          {jobs.map(j => (
                            <tr key={j.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                              <td className="py-3 font-medium text-slate-800">{j.company}</td>
                              <td className="py-3 text-slate-600">{j.role}</td>
                              <td className="py-3"><span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${STATUS_COLORS[j.status]}`}>{j.status}</span></td>
                              <td className="py-3 text-slate-400">{j.date}</td>
                              <td className="py-3 flex gap-2">
                                <button onClick={() => handleEditJob(j)} className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-600"><Pencil className="w-3.5 h-3.5" /></button>
                                <button onClick={() => handleDeleteJob(j.id)} className="p-1.5 rounded-md hover:bg-red-50 text-slate-400 hover:text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}

              {/* ── TAB: Interview Prep ── */}
              {activeTab === 'interview' && (
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Progress</h3>
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-slate-600">Interview Preps Generated</span>
                      <span className="font-bold text-slate-800">{cvs.filter(c => c.tier === 'ultimate').length}</span>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-2xl border border-violet-100 p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Practice with AI</h3>
                    <p className="text-sm text-slate-500 mb-4">Get 5 custom interview questions based on your CV and target job. Available with the Ultimate plan.</p>
                    <Link to="/generate" className="inline-flex items-center gap-2 py-2.5 px-5 rounded-xl bg-violet-600 text-white text-sm font-bold hover:bg-violet-700 transition-colors">
                      Generate Interview Questions <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              )}

              {/* ── TAB: Learning ── */}
              {activeTab === 'learning' && (
                <div className="space-y-6">
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-100 p-8 text-center">
                    <p className="text-3xl mb-3">📚</p>
                    <h3 className="text-lg font-bold text-slate-800 mb-2">Coming Soon — Career Courses & Upskilling</h3>
                    <p className="text-sm text-slate-500">We're building curated learning paths to help you land your dream job.</p>
                  </div>
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

              {/* ── CV List ── */}
              <div className="mt-8">
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
            </div>

            {/* ── Sidebar (1 col) ── */}
            <div className="hidden lg:block space-y-5">
              {/* Career Profile */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex flex-col items-center mb-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white text-xl font-bold mb-3">
                    {user?.full_name?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <p className="font-bold text-slate-800">{user?.full_name || 'User'}</p>
                  <p className="text-xs text-slate-400">{user?.email}</p>
                </div>

                {/* Target Role */}
                <div className="mb-4">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1.5">Target Role</label>
                  <input type="text" placeholder="e.g. Frontend Developer" value={targetRole} onChange={e => handleTargetRoleSave(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                {/* Profile completion */}
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-semibold text-slate-500">Profile</span>
                    <span className="text-xs font-bold text-blue-600">{profileCompletion}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full transition-all duration-500" style={{ width: `${profileCompletion}%` }} />
                  </div>
                  <div className="mt-2 space-y-1">
                    {[
                      { done: cvs.length > 0, label: 'Create a CV', pct: '+25%' },
                      { done: cvs.some(c => c.clean_pdf_url), label: 'Unlock a CV', pct: '+25%' },
                      { done: !!targetRole, label: 'Set target role', pct: '+25%' },
                      { done: (user?.credits || 0) > 0, label: 'Have credits', pct: '+25%' },
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-2 text-xs">
                        {item.done ? <CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> : <span className="text-green-600 font-bold">{item.pct}</span>}
                        <span className={item.done ? 'text-slate-400 line-through' : 'text-slate-600'}>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick links */}
                <div className="space-y-1.5 pt-4 border-t border-slate-100">
                  {[
                    { label: 'My CVs', href: '#' },
                    { label: 'ATS Checker', href: '/checker' },
                    { label: 'Pricing', href: '/pricing' },
                    { label: 'Account', href: '/account' },
                  ].map(link => (
                    <Link key={link.label} to={link.href} className="flex items-center justify-between py-1.5 text-sm text-slate-600 hover:text-blue-600 transition-colors">
                      {link.label} <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  ))}
                </div>
              </div>

              {/* Credits card */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-5 text-center">
                <p className="text-3xl font-extrabold text-amber-600 mb-1">{user?.credits || 0}</p>
                <p className="text-xs text-amber-700 font-semibold mb-3">Credits Available</p>
                <Link to="/pricing" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 text-white text-sm font-bold hover:bg-amber-600 transition-colors">
                  Buy Credits
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* ── Job Tracker Modal ── */}
      {showJobModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowJobModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800">{editingJob ? 'Edit Application' : 'Add Application'}</h3>
              <button onClick={() => setShowJobModal(false)} className="p-1.5 rounded-md hover:bg-slate-100"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-3">
              <input type="text" placeholder="Company Name" value={jobForm.company} onChange={e => setJobForm({ ...jobForm, company: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              <input type="text" placeholder="Job Title" value={jobForm.role} onChange={e => setJobForm({ ...jobForm, role: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" />
              <select value={jobForm.status} onChange={e => setJobForm({ ...jobForm, status: e.target.value as JobApp['status'] })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">
                <option value="Applied">Applied</option><option value="Interview">Interview</option><option value="Offer">Offer</option><option value="Rejected">Rejected</option>
              </select>
              <textarea placeholder="Notes (optional)" rows={2} value={jobForm.notes} onChange={e => setJobForm({ ...jobForm, notes: e.target.value })} className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none resize-none" />
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={() => setShowJobModal(false)} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
              <button onClick={handleSaveJob} className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700">{editingJob ? 'Save Changes' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
