import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import DashboardLayout from '../components/DashboardLayout';
import {
  FileText, PlusCircle, ExternalLink, Download, Lock as LockIcon,
  Briefcase, Brain, BookOpen, Sparkles, ArrowRight, Star, MapPin, Clock
} from 'lucide-react';

interface CV { id: string; status: string; tier: string | null; ats_score: number | null; watermarked_pdf_url: string | null; clean_pdf_url: string | null; created_at: string; }

const TABS = [
  { key: 'resume', label: 'Resume Building', icon: FileText },
  { key: 'jobs', label: 'Job Search', icon: Briefcase },
  { key: 'interview', label: 'Interview Prep', icon: Brain },
  { key: 'learning', label: 'Learning', icon: BookOpen },
];

const COURSES = [
  { title: 'Advanced Data Analysis', provider: 'Coursera', category: 'IT & Computer Science', rating: 4.8, color: 'from-blue-400 to-blue-600' },
  { title: 'Leadership & Management', provider: 'Udemy', category: 'Business & Management', rating: 4.6, color: 'from-red-400 to-pink-500' },
  { title: 'UX Design Fundamentals', provider: 'Google', category: 'Design', rating: 4.9, color: 'from-green-400 to-emerald-500' },
  { title: 'Digital Marketing Mastery', provider: 'HubSpot', category: 'Marketing', rating: 4.7, color: 'from-purple-400 to-violet-500' },
];

const JOB_MATCHES = [
  { title: 'Frontend Developer', company: 'TechCorp', location: 'Baku, Azerbaijan', posted: '2 days ago' },
  { title: 'UI/UX Designer', company: 'DesignStudio', location: 'Remote', posted: '5 days ago' },
  { title: 'Full Stack Engineer', company: 'StartupAZ', location: 'Baku, Azerbaijan', posted: '1 week ago' },
];

export default function Dashboard() {
  const { user, updateCredits } = useAuthStore();
  const [searchParams] = useSearchParams();
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'resume');

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

  return (
    <DashboardLayout activeKey="dashboard">
      {/* Greeting */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Hi {user?.full_name?.split(' ')[0] || 'there'}!</h1>
        <p className="text-slate-400 text-sm mt-1">What's your goal today?</p>
      </div>

      {/* ── Goal Tabs with dashed lines ── */}
      <div className="flex items-center justify-center gap-0 mb-10 overflow-x-auto pb-2">
        {TABS.map((tab, i) => (
          <div key={tab.key} className="flex items-center">
            <button onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all border ${activeTab === tab.key ? 'bg-white text-blue-600 border-blue-200 shadow-sm' : 'bg-transparent text-slate-400 border-transparent hover:text-slate-600'}`}>
              {tab.label}
            </button>
            {i < TABS.length - 1 && <div className="w-8 sm:w-16 border-t-2 border-dashed border-slate-200 mx-1" />}
          </div>
        ))}
      </div>

      {/* ── TAB: Resume Building ── */}
      {activeTab === 'resume' && (
        <div className="grid md:grid-cols-5 gap-6">
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5 text-center">Progress</h3>
            <div className="space-y-4">
              {[
                { label: 'Resume Building', value: cvs.length > 0 ? '100%' : '0%' },
                { label: 'Resume Tailoring', value: '0' },
                { label: 'Cover Letter Crafting', value: '0' },
              ].map(item => (
                <div key={item.label} className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center"><FileText className="w-4 h-4 text-blue-500" /></div>
                  <span className="flex-1 text-sm text-slate-700 font-medium">{item.label}</span>
                  <span className="text-sm font-bold text-slate-800">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="md:col-span-3 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 p-8 flex flex-col">
            {cvs.length === 0 ? (
              <>
                <div className="inline-flex self-start px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold mb-4">Get Started</div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Create your first AI CV</h3>
                <p className="text-sm text-slate-500 flex-1 mb-5">Let Gemini AI write an ATS-optimized CV for you in seconds.</p>
                <Link to="/generate" className="inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm hover:shadow-md transition-all self-start px-6">
                  <Sparkles className="w-4 h-4" /> Create CV — Free
                </Link>
              </>
            ) : (
              <>
                <div className="inline-flex self-start px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold mb-4">Resume complete!</div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Tailor your CV to a specific job</h3>
                <p className="text-sm text-slate-500 mb-4">Paste a job description and AI will customize your CV.</p>
                <textarea rows={3} placeholder="Paste the job description here..." value={tailorDesc} onChange={e => setTailorDesc(e.target.value)} className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 mb-3 resize-none bg-white/80" />
                <button onClick={handleTailor} disabled={tailoring || !tailorDesc.trim()} className="inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm disabled:opacity-50 self-start px-6">
                  {tailoring ? 'Tailoring...' : '✨ Tailor with AI'}
                </button>
                {tailorResult && tailorResult !== 'error' && <p className="text-sm text-green-600 font-semibold mt-3">✅ Tailored CV created!</p>}
              </>
            )}
          </div>
        </div>
      )}

      {/* ── TAB: Job Search ── */}
      {activeTab === 'jobs' && (
        <div className="text-center py-16"><Briefcase className="w-10 h-10 mx-auto text-slate-300 mb-3" /><p className="font-medium text-slate-600">Job search coming soon</p><p className="text-sm text-slate-400 mt-1">We'll match jobs based on your CV & location.</p></div>
      )}

      {/* ── TAB: Interview ── */}
      {activeTab === 'interview' && (
        <div className="max-w-lg mx-auto bg-white rounded-2xl border border-slate-200 p-8">
          <div className="inline-flex px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold mb-4">Sample Interview</div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">Tell us about this dream job</h2>
          <p className="text-sm text-slate-500 mb-6">Enter the job title and company. We'll generate real questions.</p>
          <div className="space-y-4">
            <div><label className="text-sm text-slate-500 mb-1 block">Job Title</label><input type="text" placeholder="e.g. Software Developer" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" /></div>
            <div><label className="text-sm text-slate-500 mb-1 block">Company (Optional)</label><input type="text" placeholder="e.g. Google" className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" /></div>
            <button className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm">Create Interview</button>
          </div>
        </div>
      )}

      {/* ── TAB: Learning ── */}
      {activeTab === 'learning' && (
        <div className="grid md:grid-cols-5 gap-6">
          <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200 p-6">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-5 text-center">Progress</h3>
            {['Upskill', '90 Days Plan', 'Get Promotion', 'Change Careers'].map(l => (
              <div key={l} className="flex items-center gap-4 mb-3"><div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center"><BookOpen className="w-4 h-4 text-slate-400" /></div><span className="flex-1 text-sm text-slate-700">{l}</span><span className="text-sm font-bold text-slate-400">0%</span></div>
            ))}
          </div>
          <div className="md:col-span-3 bg-gradient-to-br from-green-50 to-teal-50 rounded-2xl border border-green-100 p-8">
            <div className="inline-flex px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold mb-4">Upskill</div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Learn in-demand skills. Lead your future</h3>
            <p className="text-sm text-slate-500 mb-5">Access top-rated courses, earn certificates, and grow your career.</p>
            <Link to="/examples" className="inline-flex items-center gap-2 py-3 px-6 rounded-xl bg-white border border-slate-200 text-slate-700 font-bold text-sm hover:shadow-md">Explore courses <ArrowRight className="w-4 h-4" /></Link>
          </div>
        </div>
      )}

      {/* ── Recommended Courses ── */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-800">Recommended courses for you</h2>
          <Link to="/examples" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">Explore more <ArrowRight className="w-3.5 h-3.5" /></Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {COURSES.map(c => (
            <div key={c.title} className="rounded-2xl overflow-hidden bg-white border border-slate-200 hover:shadow-md transition-shadow group cursor-pointer">
              <div className={`h-28 bg-gradient-to-br ${c.color} flex items-end p-3`}>
                <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur text-white text-[10px] font-bold">{c.category}</span>
              </div>
              <div className="p-3">
                <p className="text-[11px] text-slate-400 mb-0.5">{c.provider}</p>
                <p className="text-sm font-semibold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">{c.title}</p>
                <div className="flex items-center gap-1 mt-2">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-xs text-slate-500">{c.rating} reviews</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Your Job Matches ── */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-800">Your job matches</h2>
          <Link to="/account" className="text-sm text-blue-600 hover:text-blue-700">Not right? Update your <span className="font-bold">Profile</span></Link>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {JOB_MATCHES.map(j => (
            <div key={j.title} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow cursor-pointer group">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">{j.company[0]}</div>
                <div className="min-w-0">
                  <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors truncate">{j.title}</p>
                  <p className="text-xs text-slate-500">{j.company}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{j.location}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{j.posted}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Your Cover Letters ── */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-lg font-bold text-slate-800">Your cover letters</h2>
          <Link to="/cover-letter" className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1">Browse examples <ArrowRight className="w-3.5 h-3.5" /></Link>
        </div>
        <div className="bg-white rounded-xl border border-dashed border-slate-200 p-8 text-center">
          <FileText className="w-8 h-8 mx-auto text-slate-300 mb-2" />
          <p className="text-sm font-medium text-slate-600">No cover letters yet</p>
          <p className="text-xs text-slate-400 mt-1 mb-3">Generate one from your CV with AI.</p>
          <Link to="/cover-letter" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"><Sparkles className="w-3.5 h-3.5" /> Create Cover Letter</Link>
        </div>
      </div>

      {/* ── Your CVs ── */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-slate-800">Your CVs</h2>
          <Link to="/generate" className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"><PlusCircle className="w-4 h-4" /> New CV</Link>
        </div>
        {loading ? (
          <div className="animate-pulse space-y-3"><div className="h-20 bg-slate-200 rounded-xl" /></div>
        ) : cvs.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200"><FileText className="w-10 h-10 mx-auto text-slate-300 mb-3" /><p className="font-medium text-slate-600">No CVs yet</p></div>
        ) : (
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {cvs.map(cv => (
              <div key={cv.id} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col">
                <div className="flex justify-between items-start mb-3">
                  <div className="bg-blue-50 text-blue-700 w-9 h-9 rounded-lg flex items-center justify-center"><FileText className="w-4 h-4" /></div>
                  {cv.tier ? <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">{cv.tier.toUpperCase()}</span> : <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 text-slate-500">Draft</span>}
                </div>
                <p className="text-xs text-slate-400 mb-1">{new Date(cv.created_at).toLocaleDateString()}</p>
                <p className="font-semibold text-slate-800 text-sm mb-3">ATS: {cv.ats_score || '—'}/100</p>
                <div className="mt-auto space-y-2">
                  {cv.clean_pdf_url ? (
                    <a href={cv.clean_pdf_url} target="_blank" rel="noreferrer" className="w-full inline-flex justify-center items-center gap-1.5 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold"><Download className="w-3.5 h-3.5" /> Download</a>
                  ) : (
                    <>
                      {cv.watermarked_pdf_url && <a href={cv.watermarked_pdf_url} target="_blank" rel="noreferrer" className="w-full inline-flex justify-center items-center gap-1.5 py-2 rounded-lg border border-slate-200 text-slate-600 text-sm"><ExternalLink className="w-3.5 h-3.5" /> Preview</a>}
                      {(user?.credits || 0) > 0 ? (
                        <Link to={`/generate?unlock=${cv.id}`} className="w-full inline-flex justify-center items-center gap-1.5 py-2 rounded-lg bg-slate-900 text-white text-sm font-semibold"><LockIcon className="w-3.5 h-3.5" /> Unlock</Link>
                      ) : (
                        <button onClick={() => handleCheckout('basic')} className="w-full inline-flex justify-center items-center gap-1.5 py-2 rounded-lg bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm font-semibold"><LockIcon className="w-3.5 h-3.5" /> Buy Credit ($4.99)</button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
