import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import {
  Target, FileText, Brain, Sparkles, ArrowRight,
  CheckCircle2, ChevronRight, BookOpen, Lightbulb,
  DollarSign, Linkedin, Mail, Users, TrendingUp,
} from 'lucide-react';

const STEPS = [
  {
    id: 1,
    key: 'master-plan',
    title: 'The Master Plan',
    subtitle: 'Define your target role & company list',
    icon: Target,
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-50',
    textColor: 'text-blue-700',
    borderColor: 'border-blue-200',
    tasks: [
      { id: 't1', label: 'Identify 3 target job titles' },
      { id: 't2', label: 'List 10 target companies' },
      { id: 't3', label: 'Define your must-have criteria (salary, remote, etc.)' },
      { id: 't4', label: 'Set a weekly application goal' },
    ],
    tip: 'Start with a narrow focus. Applying to 100 irrelevant jobs is less effective than 20 targeted applications.',
    link: '/jobs',
    cta: 'Browse Matched Jobs',
  },
  {
    id: 2,
    key: 'brand-yourself',
    title: 'Brand Yourself',
    subtitle: 'Create a standout resume & LinkedIn profile',
    icon: FileText,
    color: 'from-purple-500 to-violet-600',
    bgColor: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-200',
    tasks: [
      { id: 't5', label: 'Generate your AI-powered resume' },
      { id: 't6', label: 'Get an ATS score above 75%' },
      { id: 't7', label: 'Tailor resume to at least 3 job descriptions' },
      { id: 't8', label: 'Generate a cover letter for your top target role' },
    ],
    tip: 'ATS systems filter out 75% of resumes before a human ever sees them. Your resume must pass the machine first.',
    link: '/generate',
    cta: 'Create Your Resume',
  },
  {
    id: 3,
    key: 'get-meetings',
    title: 'Get More Meetings',
    subtitle: 'Optimize networking & outreach',
    icon: Users,
    color: 'from-emerald-500 to-green-600',
    bgColor: 'bg-emerald-50',
    textColor: 'text-emerald-700',
    borderColor: 'border-emerald-200',
    tasks: [
      { id: 't9', label: 'Connect with 5 people at each target company' },
      { id: 't10', label: 'Send 3 cold outreach messages per week' },
      { id: 't11', label: 'Apply to at least 5 jobs this week' },
      { id: 't12', label: 'Track all applications in Job Tracker' },
    ],
    tip: 'Referrals increase your interview chances by 5x. Always try to find an internal contact before applying directly.',
    link: '/job-tracker',
    cta: 'Track Applications',
  },
  {
    id: 4,
    key: 'interview-win',
    title: 'Interview & Win',
    subtitle: 'Practice until confidence becomes natural',
    icon: Brain,
    color: 'from-amber-500 to-orange-500',
    bgColor: 'bg-amber-50',
    textColor: 'text-amber-700',
    borderColor: 'border-amber-200',
    tasks: [
      { id: 't13', label: 'Complete 1 full mock interview session' },
      { id: 't14', label: 'Score 75+ on at least 3 questions' },
      { id: 't15', label: 'Prepare your top 5 STAR method stories' },
      { id: 't16', label: 'Research each company before your interview' },
    ],
    tip: 'The STAR method (Situation, Task, Action, Result) is the gold standard for behavioral questions. Prepare 5 strong stories.',
    link: '/interview-prep',
    cta: 'Start Mock Interview',
  },
  {
    id: 5,
    key: 'close-deal',
    title: 'Close the Deal',
    subtitle: 'Negotiate confidently with data',
    icon: DollarSign,
    color: 'from-rose-500 to-pink-600',
    bgColor: 'bg-rose-50',
    textColor: 'text-rose-700',
    borderColor: 'border-rose-200',
    tasks: [
      { id: 't17', label: 'Research market salary for your role & city' },
      { id: 't18', label: 'Generate a negotiation script' },
      { id: 't19', label: 'Practice your counteroffer conversation' },
      { id: 't20', label: 'Evaluate benefits beyond base salary' },
    ],
    tip: 'Candidates who negotiate earn $5,000–$20,000 more on their first offer. Always negotiate — 85% of employers expect it.',
    link: '/salary-analyzer',
    cta: 'Analyze Your Salary',
  },
];

const RESOURCES = [
  { icon: Linkedin, label: 'LinkedIn Optimization Guide', desc: '12 profile tweaks that get 3x more recruiter views', color: 'text-blue-600 bg-blue-50' },
  { icon: Mail, label: 'Cold Outreach Templates', desc: '5 proven email templates with 40%+ open rates', color: 'text-indigo-600 bg-indigo-50' },
  { icon: TrendingUp, label: 'Salary Negotiation Playbook', desc: 'Step-by-step script to negotiate $10K+ more', color: 'text-emerald-600 bg-emerald-50' },
  { icon: BookOpen, label: 'Interview Cheat Sheet', desc: '50 most common questions with perfect answers', color: 'text-amber-600 bg-amber-50' },
];

export default function JobSearchMethod() {
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(new Set());
  const [activeStep, setActiveStep] = useState<number | null>(null);

  const totalTasks = STEPS.reduce((sum, s) => sum + s.tasks.length, 0);
  const completedCount = completedTasks.size;
  const progressPct = Math.round((completedCount / totalTasks) * 100);

  const stepProgress = (step: typeof STEPS[0]) => {
    const done = step.tasks.filter(t => completedTasks.has(t.id)).length;
    return { done, total: step.tasks.length, pct: Math.round((done / step.tasks.length) * 100) };
  };

  const toggleTask = (taskId: string) => {
    setCompletedTasks(prev => {
      const next = new Set(prev);
      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }
      return next;
    });
  };

  return (
    <DashboardLayout activeKey="job-method">

      {/* ── Hero Banner ── */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="absolute rounded-full border border-white"
              style={{ width: 60 + i * 80, height: 60 + i * 80, top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
          ))}
        </div>
        <div className="relative">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="text-sm font-bold text-white/80">5-Step Job Search Method</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold mb-2">Build A Winning Job Search</h1>
          <p className="text-white/75 text-sm max-w-xl mb-6">
            Follow this proven 5-step framework used by candidates who land offers 3x faster. Complete each step to unlock your full career potential.
          </p>

          {/* Overall progress */}
          <div className="bg-white/10 rounded-2xl p-4 inline-block min-w-[280px]">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold">Overall Progress</span>
              <span className="text-xl font-extrabold">{progressPct}%</span>
            </div>
            <div className="h-2.5 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }} />
            </div>
            <p className="text-white/60 text-xs mt-1.5">{completedCount} of {totalTasks} tasks completed</p>
          </div>
        </div>
      </div>

      {/* ── Steps Grid ── */}
      <div className="grid lg:grid-cols-3 gap-6 mb-10">

        {/* Left: step list */}
        <div className="lg:col-span-1 space-y-2">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Your Roadmap</p>
          {STEPS.map(step => {
            const prog = stepProgress(step);
            const isActive = activeStep === step.id;
            const isDone = prog.done === prog.total;

            return (
              <button key={step.id} onClick={() => setActiveStep(isActive ? null : step.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  isActive ? `${step.borderColor} ${step.bgColor} shadow-sm` : 'border-slate-200 bg-white hover:shadow-sm'
                }`}>
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center flex-shrink-0`}>
                    {isDone
                      ? <CheckCircle2 className="w-5 h-5 text-white" />
                      : <step.icon className="w-4 h-4 text-white" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className={`text-sm font-bold ${isActive ? step.textColor : 'text-slate-800'}`}>{step.title}</p>
                      <span className="text-xs text-slate-400">{prog.done}/{prog.total}</span>
                    </div>
                    {/* Mini progress bar */}
                    <div className="mt-1.5 h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full bg-gradient-to-r ${step.color} rounded-full transition-all duration-300`}
                        style={{ width: `${prog.pct}%` }} />
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform ${isActive ? 'rotate-90' : ''} ${isActive ? step.textColor : 'text-slate-300'}`} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Right: step detail */}
        <div className="lg:col-span-2">
          {activeStep === null ? (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 h-full flex flex-col items-center justify-center p-12 text-center">
              <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                <Target className="w-7 h-7 text-slate-400" />
              </div>
              <h3 className="font-bold text-slate-700 mb-1">Select a step to get started</h3>
              <p className="text-sm text-slate-400">Click any step on the left to view tasks, tips, and tools</p>
            </div>
          ) : (
            (() => {
              const step = STEPS.find(s => s.id === activeStep)!;
              const prog = stepProgress(step);
              return (
                <div className={`bg-white rounded-2xl border ${step.borderColor} shadow-sm overflow-hidden`}>
                  {/* Step header */}
                  <div className={`bg-gradient-to-r ${step.color} p-6 text-white`}>
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/20 text-xs font-bold mb-3">
                          Step {step.id} of {STEPS.length}
                        </div>
                        <h2 className="text-xl font-extrabold mb-1">{step.title}</h2>
                        <p className="text-white/80 text-sm">{step.subtitle}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-extrabold">{prog.pct}%</p>
                        <p className="text-white/70 text-xs">{prog.done}/{prog.total} done</p>
                      </div>
                    </div>
                    <div className="mt-4 h-1.5 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white rounded-full transition-all duration-500"
                        style={{ width: `${prog.pct}%` }} />
                    </div>
                  </div>

                  <div className="p-6 space-y-5">
                    {/* Tasks */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Tasks to Complete</p>
                      <div className="space-y-2">
                        {step.tasks.map(task => {
                          const done = completedTasks.has(task.id);
                          return (
                            <button key={task.id} onClick={() => toggleTask(task.id)}
                              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                                done ? `${step.bgColor} ${step.borderColor}` : 'border-slate-100 hover:bg-slate-50'
                              }`}>
                              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${
                                done ? 'bg-current border-current' : 'border-slate-300'
                              } ${done ? step.textColor : ''}`}>
                                {done && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                              </div>
                              <span className={`text-sm font-medium ${done ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                                {task.label}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Tip */}
                    <div className={`${step.bgColor} rounded-xl p-4 border ${step.borderColor}`}>
                      <div className="flex items-start gap-2.5">
                        <Lightbulb className={`w-4 h-4 ${step.textColor} flex-shrink-0 mt-0.5`} />
                        <div>
                          <p className={`text-xs font-bold ${step.textColor} mb-1`}>Pro Tip</p>
                          <p className="text-sm text-slate-700">{step.tip}</p>
                        </div>
                      </div>
                    </div>

                    {/* CTA */}
                    <Link to={step.link}
                      className={`w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r ${step.color} text-white font-bold text-sm hover:shadow-md transition-all`}>
                      <Sparkles className="w-4 h-4" /> {step.cta} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })()
          )}
        </div>
      </div>

      {/* ── Resources Section ── */}
      <div>
        <h2 className="text-base font-bold text-slate-800 mb-4">Career Resources</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {RESOURCES.map(r => (
            <div key={r.label} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-shadow cursor-pointer group">
              <div className={`w-9 h-9 rounded-xl ${r.color} flex items-center justify-center mb-3`}>
                <r.icon className="w-4 h-4" />
              </div>
              <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors leading-snug">{r.label}</p>
              <p className="text-xs text-slate-400 mt-1">{r.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
