import { useState } from 'react';
import { X, Sparkles, CheckCircle2, AlertTriangle, Loader2, Plus } from 'lucide-react';
import { api } from '../../lib/api';

interface JobMatchDrawerProps {
  isOpen: boolean;
  cvData: any;
  onClose: () => void;
  onAddSkill: (skill: string) => void;
}

export default function JobMatchDrawer({
  isOpen,
  cvData,
  onClose,
  onAddSkill,
}: JobMatchDrawerProps) {
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [matchResult, setMatchResult] = useState<any>(null);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    if (!jobDescription.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/cv/ai/match-job', {
        cv_data: cvData,
        job_description: jobDescription,
      });
      setMatchResult(res.data);
    } catch (err: any) {
      console.error(err);
      setError('Job matching analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col overflow-hidden border-l border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Job Description Matcher</h3>
              <p className="text-[11px] text-slate-500">Scan your CV against any job vacancy</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Paste Target Job Description:
            </label>
            <textarea
              rows={6}
              placeholder="Paste the job requirements, responsibilities, and required skills here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-3 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <button
              type="button"
              onClick={handleAnalyze}
              disabled={loading || !jobDescription.trim()}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? 'Analyzing Keyword Match...' : 'Calculate Job Match & Gaps'}
            </button>
          </div>

          {/* Results */}
          {matchResult && (
            <div className="space-y-4 pt-4 border-t border-slate-200 animate-fade-in">
              {/* Match Score Card */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-600 block">Keyword Compatibility</span>
                  <span className="text-2xl font-black text-blue-700">
                    {matchResult.match_score}% Match
                  </span>
                </div>
                <div className="text-3xl font-black">
                  {matchResult.match_score >= 80 ? '🎯' : matchResult.match_score >= 60 ? '⚡' : '⚠️'}
                </div>
              </div>

              {/* Matched Skills */}
              {matchResult.matched_skills?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    Matched Skills in Your CV ({matchResult.matched_skills.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.matched_skills.map((skill: string) => (
                      <span
                        key={skill}
                        className="px-2.5 py-1 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-medium"
                      >
                        ✓ {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Missing Skills with 1-click Add */}
              {matchResult.missing_skills?.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                    Missing Critical Skills (Click + to Add)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.missing_skills.map((skill: string) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => onAddSkill(skill)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-xs font-semibold transition-all"
                        title="Click to add this skill to your CV"
                      >
                        <Plus className="w-3 h-3 text-amber-700" /> {skill}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Gap Analysis & Strategy */}
              {matchResult.gap_analysis && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1 text-xs">
                  <span className="font-bold text-slate-800 block">Gap Analysis:</span>
                  <p className="text-slate-600 leading-relaxed">{matchResult.gap_analysis}</p>
                </div>
              )}

              {matchResult.recommendation && (
                <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 space-y-1 text-xs">
                  <span className="font-bold text-blue-900 block flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" /> AI Recommendation:
                  </span>
                  <p className="text-blue-800 leading-relaxed">{matchResult.recommendation}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
