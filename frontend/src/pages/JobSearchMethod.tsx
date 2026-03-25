import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { FileText, Search, Target, Brain, Sparkles, ArrowRight, CheckCircle2, BookOpen } from 'lucide-react';

const METHODS = [
  { title: 'The Master Plan', desc: 'Identify your targets and build a strategic approach to land your dream role.', icon: Target, color: 'from-blue-400 to-blue-600' },
  { title: 'Brand Yourself', desc: 'Craft a winning resume and cover letter that highlights your unique value.', icon: FileText, color: 'from-purple-400 to-violet-600' },
  { title: 'Get More Meetings', desc: 'Optimize your networking and application strategy to increase responses.', icon: Search, color: 'from-green-400 to-emerald-600' },
  { title: 'Interview and Win', desc: 'Master common questions and practice with AI-generated interview scenarios.', icon: Brain, color: 'from-amber-400 to-orange-600' },
  { title: 'Close the Deal', desc: 'Negotiate offers confidently with data-driven salary insights.', icon: Sparkles, color: 'from-red-400 to-pink-600' },
];

const FEATURES = [
  { title: 'AI CV Builder', desc: 'Generate ATS-optimized resumes in seconds with Gemini AI. Choose from professional templates.', link: '/generate', cta: 'Create CV' },
  { title: 'ATS Score Checker', desc: 'Get your resume scored by our AI and receive specific tips to improve your ATS match rate.', link: '/checker', cta: 'Check Score' },
  { title: 'Resume Tailoring', desc: 'Paste any job description and let AI rephrase your CV to match perfectly.', link: '/dashboard', cta: 'Tailor Resume' },
  { title: 'Cover Letter Generator', desc: 'Auto-generate personalized cover letters based on your CV and the target job.', link: '/cover-letter', cta: 'Generate Letter' },
  { title: 'Interview Prep', desc: 'Practice with role-specific questions generated from real interview databases.', link: '/interview-prep', cta: 'Start Prep' },
  { title: 'Salary Analyzer', desc: 'Research market salaries for your role and location before negotiating offers.', link: '/salary-analyzer', cta: 'Analyze Salary' },
];

export default function JobSearchMethod() {
  return (
    <DashboardLayout activeKey="job-method">
      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl p-8 mb-10 text-white">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center"><BookOpen className="w-4 h-4" /></div>
          <span className="text-sm font-bold text-white/80">Job Search Method</span>
        </div>
        <h1 className="text-2xl font-bold mb-2">Build A Winning Job Search Strategy</h1>
        <p className="text-white/80 text-sm max-w-xl">Once you've identified your job targets, the next step is to create a set of core messages that can be used across all of your communications. Your resume is a great place to start.</p>
      </div>

      {/* Progress circle + Steps */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 flex flex-col items-center justify-center">
          <div className="w-24 h-24 rounded-full border-4 border-blue-200 flex items-center justify-center mb-3">
            <span className="text-2xl font-bold text-blue-600">0%</span>
          </div>
          <p className="text-sm font-semibold text-slate-800">Your Progress</p>
          <Link to="/generate" className="mt-4 px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-bold hover:shadow-md">Explore</Link>
        </div>

        <div className="md:col-span-2 space-y-3">
          {METHODS.map((m, i) => (
            <div key={m.title} className="flex items-start gap-4 bg-white rounded-xl border border-slate-200 p-4 hover:shadow-sm transition-shadow cursor-pointer group">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold flex-shrink-0">{i + 1}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{m.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{m.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors flex-shrink-0 mt-1" />
            </div>
          ))}
        </div>
      </div>

      {/* Coach promo */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl border border-slate-200 p-6 mb-10 flex items-center gap-6">
        <div className="flex -space-x-3">
          {['bg-blue-400', 'bg-green-400', 'bg-purple-400'].map((c, i) => (
            <div key={i} className={`w-10 h-10 rounded-full ${c} border-2 border-white flex items-center justify-center text-white text-xs font-bold`}>{['A', 'B', 'C'][i]}</div>
          ))}
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-slate-800">You are 78% more likely to achieve your goals working with a coach</p>
          <p className="text-xs text-slate-500 mt-0.5">Engage a professional coach and get results!</p>
        </div>
        <Link to="/dashboard-pricing" className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors whitespace-nowrap">Book a Coach</Link>
      </div>

      {/* Vitelo features promo */}
      <h2 className="text-lg font-bold text-slate-800 mb-5">Our Tools for Your Job Search</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map(f => (
          <div key={f.title} className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow group flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-green-500" />
              <h3 className="font-bold text-sm text-slate-800 group-hover:text-blue-600 transition-colors">{f.title}</h3>
            </div>
            <p className="text-xs text-slate-500 flex-1 mb-3">{f.desc}</p>
            <Link to={f.link} className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">{f.cta} <ArrowRight className="w-3 h-3" /></Link>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
