import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../lib/api';
import { redirectToCheckout } from '../lib/checkout';
import { useAuthStore } from '../stores/authStore';
import { logger } from '../lib/logger';
import DashboardLayout from '../components/DashboardLayout';
import {
  FileText, PlusCircle, Sparkles, ArrowRight, Star,
  MapPin, Clock, Brain, ClipboardList, DollarSign,
  TrendingUp, CheckCircle2, Loader2, ChevronRight,
  Coins, FileDown, Eye, Target,
} from 'lucide-react';

interface CV {
  id: string; status: string; tier: string | null; ats_score: number | null;
  watermarked_pdf_url: string | null; clean_pdf_url: string | null;
  created_at: string; title: string | null;
}

interface TrackerStats {
  total: number;
  applied: number;
  interview: number;
  offer: number;
}

interface InterviewStats {
  sessions: number;
  avg_score: number;
}

const COURSES = [
  { title: 'Advanced Data Analysis', provider: 'Coursera', category: 'Data Science', rating: 4.8, color: 'from-blue-400 to-blue-600' },
  { title: 'Leadership & Management', provider: 'Udemy', category: 'Business', rating: 4.6, color: 'from-rose-400 to-pink-500' },
  { title: 'Cloud Architecture on AWS', provider: 'AWS', category: 'DevOps', rating: 4.9, color: 'from-orange-400 to-amber-500' },
  { title: 'System Design Masterclass', provider: 'ByteByteGo', category: 'Engineering', rating: 4.8, color: 'from-indigo-400 to-violet-500' },
];

const JOB_MATCHES = [
  { title: 'Senior .NET Developer', company: 'Kapital Bank', location: 'Baku, AZ', posted: '1 day ago', match: 94 },
  { title: 'DevOps Engineer', company: 'PASHA Insurance', location: 'Baku, AZ', posted: '2 days ago', match: 88 },
  { title: 'Software Architect', company: 'Crocusoft', location: 'Baku, AZ', posted: '5 days ago', match: 91 },
];

export default function Dashboard() {
  const { user, updateCredits } = useAuthStore();
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);
  const [trackerStats, setTrackerStats] = useState<TrackerStats>({ total: 0, applied: 0, interview: 0, offer: 0 });
  const [interviewStats, setInterviewStats] = useState<InterviewStats>({ sessions: 0, avg_score: 0 });
  const [credits, setCredits] = useState(0);
  const [tailorDesc, setTailorDesc] = useState('');
  const [tailoring, setTailoring] = useState(false);
  const [tailorResult, setTailorResult] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [creditsRes, cvsRes, trackerRes, interviewRes] = await Promise.allSettled([
          api.get('/billing/credits'),
          api.get('/cv/'),
          api.get('/tracker/'),
          api.get('/interview/sessions'),
        ]);

        if (creditsRes.status === 'fulfilled') {
          const c = creditsRes.value.data.credits;
          setCredits(c);
          updateCredits(c);
        }
        if (cvsRes.status === 'fulfilled') setCvs(cvsRes.value.data);

        if (trackerRes.status === 'fulfilled') {
          const board = trackerRes.value.data;
          const allApps = (board.columns || []).flatMap((col: any) => col.applications || []);
          const applied = allApps.filter((a: any) => a.column_key === 'Applied').length;
          const interview = allApps.filter((a: any) => a.column_key === 'Interview').length;
          const offer = allApps.filter((a: any) => a.column_key === 'Offer').length;
          setTrackerStats({ total: allApps.length, applied, interview, offer });
        }

        if (interviewRes.status === 'fulfilled') {
          const sessions = interviewRes.value.data;
          setInterviewStats({ sessions: sessions.length, avg_score: 0 });
        }
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, [updateCredits]);

  const handleTailor = async () => {
    if (!tailorDesc.trim() || cvs.length === 0) return;
    logger.action('Dashboard', 'Triggered Resume Tailor with AI', { cv_id: cvs[0]?.id });
    setTailoring(true); setTailorResult(null);
    try {
      const res = await api.post(`/cv/tailor/${cvs[0].id}`, { job_description: tailorDesc });
      setTailorResult(res.data.cv_id);
    } catch { setTailorResult('error'); }
    finally { setTailoring(false); }
  };

  const bestCV = cvs[0];
  const firstName = user?.full_name?.split(' ')[0] || 'there';
  const timeOfDay = new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening';

  return (
    <DashboardLayout activeKey="dashboard">

      {/* ── Greeting ── */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900">
            Good {timeOfDay}, {firstName}! 👋
          </h1>
          <p className="text-slate-400 text-sm mt-1">Here's your career dashboard overview.</p>
        </div>
        <Link to="/generate"
          className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold hover:shadow-md transition-all">
          <Sparkles className="w-4 h-4" /> Create New Resume
        </Link>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          {
            label: 'Resumes', value: loading ? '—' : cvs.length,
            sub: `${cvs.filter(c => c.clean_pdf_url).length} unlocked`,
            icon: FileText, color: 'bg-blue-50 text-blue-600', href: '/documents',
          },
          {
            label: 'Job Applications', value: loading ? '—' : trackerStats.total,
            sub: `${trackerStats.interview} in interview`,
            icon: ClipboardList, color: 'bg-indigo-50 text-indigo-600', href: '/job-tracker',
          },
          {
            label: 'Interview Sessions', value: loading ? '—' : interviewStats.sessions,
            sub: interviewStats.avg_score ? `Avg score ${interviewStats.avg_score}` : 'Practice now',
            icon: Brain, color: 'bg-purple-50 text-purple-600', href: '/interview-prep',
          },
          {
            label: 'Credits', value: loading ? '—' : credits,
            sub: 'Available to use',
            icon: Coins, color: 'bg-emerald-50 text-emerald-600', href: '/dashboard-pricing',
          },
        ].map(stat => (
          <Link key={stat.label} to={stat.href}
            className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-md hover:border-slate-300 transition-all group">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl ${stat.color} flex items-center justify-center flex-shrink-0`}>
                <stat.icon className="w-4 h-4" />
              </div>
              <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{stat.value}</p>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">{stat.label}</p>
            <p className="text-xs text-slate-400 mt-0.5">{stat.sub}</p>
          </Link>
        ))}
      </div>

      {/* ── Main content grid ── */}
      <div className="grid lg:grid-cols-3 gap-6 mb-8">

        {/* ── Resume & Tailor ── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Resume card */}
          <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-50 rounded-2xl border border-blue-100 p-6">
            {cvs.length === 0 ? (
              <div>
                <div className="inline-flex px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold mb-4">
                  Get Started
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-1">Create your first AI Resume</h3>
                <p className="text-sm text-slate-500 mb-5">Let Gemini AI generate an ATS-optimized resume for you in under 2 minutes.</p>
                <Link to="/generate"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm hover:shadow-md transition-all">
                  <Sparkles className="w-4 h-4" /> Create Resume — Free
                </Link>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="inline-flex px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                    Resume Ready ✓
                  </div>
                  <Link to="/documents" className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
                    View All <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-14 h-18 rounded-lg bg-white shadow border border-slate-100 flex items-center justify-center flex-shrink-0 p-2">
                    <FileText className="w-6 h-6 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-800">{bestCV.title || 'My Resume'}</p>
                    <p className="text-xs text-slate-400">Created {new Date(bestCV.created_at).toLocaleDateString()}</p>
                    {bestCV.ats_score && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="h-1.5 w-24 rounded-full bg-slate-100 overflow-hidden">
                          <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500 transition-all"
                            style={{ width: `${bestCV.ats_score}%` }} />
                        </div>
                        <span className="text-xs font-bold text-emerald-600">{bestCV.ats_score}% ATS</span>
                      </div>
                    )}
                  </div>
                  <div className="ml-auto flex gap-2">
                    {bestCV.clean_pdf_url ? (
                      <a href={bestCV.clean_pdf_url} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700">
                        <FileDown className="w-3.5 h-3.5" /> Download
                      </a>
                    ) : bestCV.watermarked_pdf_url ? (
                      <a href={bestCV.watermarked_pdf_url} target="_blank" rel="noreferrer"
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50">
                        <Eye className="w-3.5 h-3.5" /> Preview
                      </a>
                    ) : null}
                  </div>
                </div>
                <div className="border-t border-blue-100 pt-4">
                  <p className="text-sm font-semibold text-slate-700 mb-2">Tailor to a job description</p>
                  <textarea rows={2} placeholder="Paste job description here..."
                    value={tailorDesc} onChange={e => setTailorDesc(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none bg-white/80 mb-2" />
                  <button onClick={handleTailor} disabled={tailoring || !tailorDesc.trim()}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold disabled:opacity-50 hover:shadow-md transition-all">
                    {tailoring ? <><Loader2 className="w-4 h-4 animate-spin" /> Tailoring...</> : <><Sparkles className="w-4 h-4" /> Tailor with AI</>}
                  </button>
                  {tailorResult && tailorResult !== 'error' && (
                    <p className="text-sm text-emerald-600 font-semibold mt-2 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Tailored CV created!{' '}
                      <Link to="/documents" className="underline">View in Documents</Link>
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              { to: '/interview-prep', icon: Brain, label: 'Practice Interview', sub: 'AI mock questions', color: 'hover:border-purple-200 hover:bg-purple-50/30' },
              { to: '/salary-analyzer', icon: DollarSign, label: 'Check Your Salary', sub: 'Market benchmarks', color: 'hover:border-emerald-200 hover:bg-emerald-50/30' },
              { to: '/job-tracker', icon: Target, label: 'Track Applications', sub: `${trackerStats.total} tracked`, color: 'hover:border-blue-200 hover:bg-blue-50/30' },
            ].map(action => (
              <Link key={action.to} to={action.to}
                className={`bg-white rounded-xl border border-slate-200 p-4 transition-all group ${action.color}`}>
                <action.icon className="w-5 h-5 text-slate-400 group-hover:text-slate-600 mb-2 transition-colors" />
                <p className="text-sm font-bold text-slate-800">{action.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{action.sub}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Right column ── */}
        <div className="space-y-5">

          {/* Job Tracker mini */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                <ClipboardList className="w-4 h-4 text-indigo-500" /> Job Tracker
              </h3>
              <Link to="/job-tracker" className="text-xs font-semibold text-blue-600 hover:text-blue-800">Open Board →</Link>
            </div>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map(i => <div key={i} className="h-8 rounded-lg bg-slate-100 animate-pulse" />)}
              </div>
            ) : trackerStats.total === 0 ? (
              <div className="text-center py-4">
                <p className="text-xs text-slate-400">No applications tracked yet</p>
                <Link to="/job-tracker" className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-blue-600">
                  <PlusCircle className="w-3.5 h-3.5" /> Add First Job
                </Link>
              </div>
            ) : (
              <div className="space-y-2.5">
                {[
                  { label: 'Applied', count: trackerStats.applied, color: 'bg-blue-100 text-blue-700' },
                  { label: 'Interview', count: trackerStats.interview, color: 'bg-amber-100 text-amber-700' },
                  { label: 'Offer', count: trackerStats.offer, color: 'bg-emerald-100 text-emerald-700' },
                ].map(s => (
                  <div key={s.label} className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">{s.label}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full bg-blue-400"
                          style={{ width: trackerStats.total ? `${(s.count / trackerStats.total) * 100}%` : '0%' }} />
                      </div>
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${s.color}`}>{s.count}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Credits / Upgrade */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-5 text-white">
            <div className="flex items-center justify-between mb-3">
              <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
                <Coins className="w-4 h-4 text-amber-300" />
              </div>
              <span className="text-2xl font-extrabold">{credits}</span>
            </div>
            <p className="text-xs text-slate-300 mb-1">Available credits</p>
            <p className="text-[11px] text-slate-400 mb-4">Use credits to download CVs & unlock premium features</p>
            <div className="flex gap-2">
              <button onClick={() => redirectToCheckout('pro', user?.email)}
                className="flex-1 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs font-bold hover:shadow-md transition-all flex items-center justify-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Get Credits
              </button>
              <Link to="/dashboard-pricing"
                className="flex-1 py-2 rounded-lg bg-white/10 text-white text-xs font-bold hover:bg-white/20 transition-all flex items-center justify-center gap-1">
                View Plans <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </div>

          {/* ATS Score mini */}
          {bestCV?.ats_score && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-sm text-slate-800 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-emerald-500" /> ATS Score
                </h3>
                <span className={`text-sm font-extrabold ${bestCV.ats_score >= 80 ? 'text-emerald-600' : bestCV.ats_score >= 60 ? 'text-amber-600' : 'text-red-500'}`}>
                  {bestCV.ats_score}/100
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${bestCV.ats_score >= 80 ? 'bg-gradient-to-r from-emerald-400 to-teal-500' : bestCV.ats_score >= 60 ? 'bg-gradient-to-r from-amber-400 to-orange-400' : 'bg-red-400'}`}
                  style={{ width: `${bestCV.ats_score}%` }} />
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {bestCV.ats_score >= 80 ? '🎉 Excellent! Most ATS systems will shortlist this resume.' :
                 bestCV.ats_score >= 60 ? '⚡ Good score. A few improvements can boost it further.' :
                 '⚠️ Needs improvement. Add more keywords and metrics.'}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Job Matches ── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-800">Recommended Jobs</h2>
          <Link to="/jobs" className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
            View All <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {JOB_MATCHES.map(j => (
            <Link key={j.title} to="/jobs"
              className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md hover:border-blue-200 transition-all group">
              <div className="flex items-start gap-3 mb-3">
                <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 font-extrabold text-sm flex-shrink-0">
                  {j.company[0]}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 truncate transition-colors">{j.title}</p>
                  <p className="text-xs text-slate-500">{j.company}</p>
                </div>
                <span className={`flex-shrink-0 text-[10px] font-extrabold px-1.5 py-0.5 rounded ${j.match >= 85 ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'}`}>
                  {j.match}%
                </span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{j.location}</span>
                <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{j.posted}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Courses ── */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-800">Recommended Courses</h2>
          <Link to="/examples" className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1">
            Explore <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {COURSES.map(c => (
            <div key={c.title} className="rounded-2xl overflow-hidden bg-white border border-slate-200 hover:shadow-md transition-shadow group cursor-pointer">
              <div className={`h-24 bg-gradient-to-br ${c.color} flex items-end p-3`}>
                <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur text-white text-[10px] font-bold">
                  {c.category}
                </span>
              </div>
              <div className="p-3">
                <p className="text-[11px] text-slate-400 mb-0.5">{c.provider}</p>
                <p className="text-sm font-semibold text-slate-800 leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">{c.title}</p>
                <div className="flex items-center gap-1 mt-2">
                  <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                  <span className="text-xs text-slate-500">{c.rating}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
