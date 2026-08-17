import { useState, useEffect, useRef } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { api } from '../lib/api';
import {
  Brain, Sparkles, ChevronRight,
  Check, AlertTriangle, Loader2, MessageSquare, Clock,
  Plus, ArrowRight, Eye, EyeOff, Trophy, Target, Lightbulb,
  RotateCcw,
} from 'lucide-react';

/* ── Types ── */
interface Feedback {
  score: number;
  strengths: string[];
  tips_to_improve: string;
  ideal_answer?: string | null;
}

interface Question {
  id: string;
  question_text: string;
  answer_hint?: string | null;
  display_order: number;
  user_answer?: string | null;
  feedback?: Feedback | null;
}

interface SessionDetail {
  id: string;
  job_title: string;
  company_name?: string | null;
  created_at: string;
  questions: Question[];
}

interface SessionListItem {
  id: string;
  job_title: string;
  company_name?: string | null;
  created_at: string;
  questions_count: number;
}

/* ── Score Color Helper ── */
const scoreColor = (s: number) =>
  s >= 75 ? 'text-emerald-600' : s >= 50 ? 'text-amber-500' : 'text-red-500';
const scoreBg = (s: number) =>
  s >= 75 ? 'bg-emerald-50 border-emerald-200' : s >= 50 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200';
const scoreRing = (s: number) =>
  s >= 75 ? 'stroke-emerald-500' : s >= 50 ? 'stroke-amber-500' : 'stroke-red-500';

export default function InterviewPrep() {
  /* ── State ── */
  const [sessions, setSessions] = useState<SessionListItem[]>([]);
  const [activeSession, setActiveSession] = useState<SessionDetail | null>(null);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');

  // Form
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [seniority, setSeniority] = useState('Mid-Level');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  /* ── Load sessions ── */
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/interview/sessions');
        setSessions(res.data);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  /* ── Create Session ── */
  const handleCreate = async () => {
    if (!jobTitle.trim()) return;
    setCreating(true);
    try {
      const res = await api.post('/interview/sessions', {
        job_title: jobTitle.trim(),
        company_name: company.trim() || null,
        seniority,
      });
      setActiveSession(res.data);
      setCurrentQIdx(0);
      setUserAnswer('');
      setShowHint(false);
      setSessions(prev => [
        { id: res.data.id, job_title: res.data.job_title, company_name: res.data.company_name, created_at: res.data.created_at, questions_count: res.data.questions.length },
        ...prev
      ]);
    } catch (e) { console.error(e); }
    finally { setCreating(false); }
  };

  /* ── Load existing session ── */
  const loadSession = async (id: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/interview/sessions/${id}`);
      setActiveSession(res.data);
      // Go to first unanswered question
      const firstUnanswered = res.data.questions.findIndex((q: Question) => !q.feedback);
      setCurrentQIdx(firstUnanswered >= 0 ? firstUnanswered : res.data.questions.length - 1);
      setUserAnswer('');
      setShowHint(false);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  /* ── Submit Answer ── */
  const handleSubmit = async () => {
    if (!activeSession || !userAnswer.trim()) return;
    const q = activeSession.questions[currentQIdx];
    setSubmitting(true);
    try {
      const res = await api.post(`/interview/questions/${q.id}/answer`, {
        user_answer: userAnswer.trim(),
      });
      // Update local state
      const updatedQuestions = [...activeSession.questions];
      updatedQuestions[currentQIdx] = {
        ...updatedQuestions[currentQIdx],
        user_answer: userAnswer.trim(),
        feedback: res.data,
      };
      setActiveSession({ ...activeSession, questions: updatedQuestions });
    } catch (e) { console.error(e); }
    finally { setSubmitting(false); }
  };

  /* ── Next Question ── */
  const nextQuestion = () => {
    if (!activeSession) return;
    if (currentQIdx < activeSession.questions.length - 1) {
      setCurrentQIdx(currentQIdx + 1);
      setUserAnswer('');
      setShowHint(false);
    }
  };

  /* ── Back to Setup ── */
  const backToSetup = () => {
    setActiveSession(null);
    setCurrentQIdx(0);
    setUserAnswer('');
    setShowHint(false);
  };

  /* ── Current question helpers ── */
  const currentQ = activeSession?.questions[currentQIdx];
  const hasFeedback = !!currentQ?.feedback;
  const isComplete = activeSession && activeSession.questions.every(q => q.feedback);
  const avgScore = activeSession
    ? Math.round(
        activeSession.questions.reduce((sum, q) => sum + (q.feedback?.score || 0), 0) /
        Math.max(activeSession.questions.filter(q => q.feedback).length, 1)
      )
    : 0;

  /* ── SVG Ring for score ── */
  const ScoreRing = ({ score, size = 100 }: { score: number; size?: number }) => {
    const r = (size - 10) / 2;
    const circ = 2 * Math.PI * r;
    const offset = circ - (score / 100) * circ;
    return (
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#e2e8f0" strokeWidth="6" />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" className={scoreRing(score)}
            strokeWidth="6" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease-out' }} />
        </svg>
        <span className={`absolute text-2xl font-extrabold ${scoreColor(score)}`}>{score}</span>
      </div>
    );
  };

  /* ── RENDER ── */
  return (
    <DashboardLayout activeKey="interview">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">AI Interview Simulator</h1>
            <p className="text-xs text-slate-400">Practice with AI-generated questions & get instant feedback</p>
          </div>
        </div>
        {activeSession && (
          <button onClick={backToSetup}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">
            <RotateCcw className="w-3.5 h-3.5" /> New Session
          </button>
        )}
      </div>

      {/* ════════════ SETUP SCREEN ════════════ */}
      {!activeSession && (
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Left: Past Sessions */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-3">Past Sessions</h3>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 rounded-xl bg-slate-100 animate-pulse" />
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-8 text-center">
                <MessageSquare className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-400">No interview sessions yet</p>
                <p className="text-xs text-slate-300 mt-1">Create your first one →</p>
              </div>
            ) : (
              sessions.map(s => (
                <button key={s.id} onClick={() => loadSession(s.id)}
                  className="w-full text-left bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md hover:border-blue-200 transition-all group">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0">
                      <p className="font-bold text-sm text-slate-800 truncate">{s.job_title}</p>
                      {s.company_name && <p className="text-xs text-slate-400 truncate">{s.company_name}</p>}
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors flex-shrink-0 mt-0.5" />
                  </div>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><MessageSquare className="w-3 h-3" />{s.questions_count} questions</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(s.created_at).toLocaleDateString()}</span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Right: Create New Session */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
            <div className="inline-flex px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold mb-5">
              New Interview
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">Create Mock Interview</h2>
            <p className="text-sm text-slate-500 mb-6">Enter the target role and we'll generate 5 tailored interview questions covering technical, behavioral, and architectural topics.</p>

            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-500 mb-1.5 block">Job Title *</label>
                <input type="text" placeholder="e.g. Senior Software Engineer" value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none" />
              </div>
              <div>
                <label className="text-sm text-slate-500 mb-1.5 block">Company (optional)</label>
                <input type="text" placeholder="e.g. Google, Amazon, Microsoft" value={company}
                  onChange={e => setCompany(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none" />
              </div>
              <div>
                <label className="text-sm text-slate-500 mb-1.5 block">Seniority Level</label>
                <select value={seniority} onChange={e => setSeniority(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none bg-white">
                  {['Junior', 'Mid-Level', 'Senior', 'Lead', 'Principal'].map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <button onClick={handleCreate} disabled={creating || !jobTitle.trim()}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {creating ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Generating Questions...</>
                ) : (
                  <><Sparkles className="w-4 h-4" /> Generate Interview Questions</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════ Q&A SIMULATOR ════════════ */}
      {activeSession && currentQ && !isComplete && (
        <div className="max-w-3xl mx-auto">
          {/* Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-400">Question {currentQIdx + 1} of {activeSession.questions.length}</span>
              <span className="text-xs text-slate-400">{activeSession.job_title}{activeSession.company_name ? ` at ${activeSession.company_name}` : ''}</span>
            </div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${((currentQIdx + 1) / activeSession.questions.length) * 100}%` }} />
            </div>
            {/* Question dots */}
            <div className="flex items-center gap-1.5 mt-3">
              {activeSession.questions.map((q, i) => (
                <div key={q.id}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    i === currentQIdx ? 'bg-indigo-500 scale-125' :
                    q.feedback ? 'bg-emerald-400' : 'bg-slate-200'
                  }`} />
              ))}
            </div>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 mb-4">
            <div className="flex items-start gap-3 mb-6">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Target className="w-4 h-4 text-indigo-600" />
              </div>
              <p className="text-lg font-semibold text-slate-800 leading-relaxed">{currentQ.question_text}</p>
            </div>

            {/* Hint Toggle */}
            {currentQ.answer_hint && (
              <button onClick={() => setShowHint(!showHint)}
                className="flex items-center gap-2 text-xs font-semibold text-indigo-500 hover:text-indigo-700 mb-4 transition-colors">
                {showHint ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showHint ? 'Hide Hint' : 'Show Hint'}
              </button>
            )}
            {showHint && currentQ.answer_hint && (
              <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4 mb-4 text-sm text-indigo-700">
                <Lightbulb className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                {currentQ.answer_hint}
              </div>
            )}

            {/* Answer input */}
            {!hasFeedback && (
              <>
                <textarea ref={textareaRef} value={userAnswer} onChange={e => setUserAnswer(e.target.value)}
                  placeholder="Type your answer here... Be specific, use the STAR method for behavioral questions, and include metrics where possible."
                  rows={5}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-indigo-400 focus:outline-none resize-y min-h-[120px]" />
                <button onClick={handleSubmit} disabled={submitting || !userAnswer.trim()}
                  className="mt-4 px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2">
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Evaluating...</>
                  ) : (
                    <><Sparkles className="w-4 h-4" /> Submit & Get Feedback</>
                  )}
                </button>
              </>
            )}

            {/* User's answer (after submission) */}
            {hasFeedback && currentQ.user_answer && (
              <div className="bg-slate-50 rounded-xl p-4 mb-4 border border-slate-100">
                <p className="text-xs font-bold text-slate-400 mb-1.5">Your Answer</p>
                <p className="text-sm text-slate-700 whitespace-pre-wrap">{currentQ.user_answer}</p>
              </div>
            )}
          </div>

          {/* Feedback Panel */}
          {hasFeedback && currentQ.feedback && (
            <div className={`rounded-2xl border p-6 mb-4 ${scoreBg(currentQ.feedback.score)}`}>
              <div className="flex items-center gap-6 mb-5">
                <ScoreRing score={currentQ.feedback.score} />
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-1">AI Score</p>
                  <p className={`text-3xl font-extrabold ${scoreColor(currentQ.feedback.score)}`}>
                    {currentQ.feedback.score}/100
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {currentQ.feedback.score >= 75 ? 'Excellent answer!' : currentQ.feedback.score >= 50 ? 'Good, but room to improve' : 'Needs significant improvement'}
                  </p>
                </div>
              </div>

              {/* Strengths */}
              {currentQ.feedback.strengths.length > 0 && (
                <div className="mb-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-2">Strengths</p>
                  <div className="space-y-1.5">
                    {currentQ.feedback.strengths.map((s, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        <p className="text-sm text-slate-700">{s}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tips */}
              {currentQ.feedback.tips_to_improve && (
                <div className="mb-4">
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-2">How to Improve</p>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-slate-700">{currentQ.feedback.tips_to_improve}</p>
                  </div>
                </div>
              )}

              {/* Ideal Answer */}
              {currentQ.feedback.ideal_answer && (
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">Model Answer</p>
                  <div className="bg-white rounded-xl border border-indigo-100 p-4">
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{currentQ.feedback.ideal_answer}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Next button */}
          {hasFeedback && currentQIdx < activeSession.questions.length - 1 && (
            <button onClick={nextQuestion}
              className="w-full py-3.5 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-all flex items-center justify-center gap-2">
              Next Question <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* ════════════ COMPLETION SUMMARY ════════════ */}
      {activeSession && isComplete && (
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center mx-auto mb-5">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Interview Complete!</h2>
            <p className="text-sm text-slate-500 mb-6">
              {activeSession.job_title}{activeSession.company_name ? ` at ${activeSession.company_name}` : ''}
            </p>

            <ScoreRing score={avgScore} size={130} />
            <p className="text-xs text-slate-400 mt-3 mb-6">Average Score</p>

            {/* Per-question scores */}
            <div className="space-y-3 text-left mb-6">
              {activeSession.questions.map((q, i) => (
                <div key={q.id} className="flex items-center gap-3 bg-slate-50 rounded-xl p-3">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs font-bold flex-shrink-0">
                    Q{i + 1}
                  </div>
                  <p className="text-sm text-slate-700 flex-1 truncate">{q.question_text}</p>
                  <span className={`text-sm font-extrabold ${scoreColor(q.feedback?.score || 0)}`}>
                    {q.feedback?.score || 0}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button onClick={backToSetup}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                <Plus className="w-4 h-4" /> New Interview
              </button>
              <button onClick={backToSetup}
                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-sm font-bold hover:shadow-lg transition-all flex items-center justify-center gap-2">
                <RotateCcw className="w-4 h-4" /> Practice Again
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
