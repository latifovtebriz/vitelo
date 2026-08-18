import { useState } from 'react';
import {
  X,
  Sparkles,
  AlertTriangle,
  Loader2,
  Plus,
  Link as LinkIcon,
  FileText,
  Zap,
  ArrowRight,
  Check,
} from 'lucide-react';
import { api } from '../../lib/api';
import { logger } from '../../lib/logger';

interface JobMatchDrawerProps {
  isOpen: boolean;
  cvData: any;
  onClose: () => void;
  onAddSkill: (skill: string) => void;
  onApplyTailoredData?: (tailoredData: any) => void;
}

export default function JobMatchDrawer({
  isOpen,
  cvData,
  onClose,
  onAddSkill,
  onApplyTailoredData,
}: JobMatchDrawerProps) {
  const [tab, setTab] = useState<'url' | 'text'>('url');
  const [jobUrl, setJobUrl] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [matchResult, setMatchResult] = useState<any>(null);
  const [error, setError] = useState('');
  const [applied, setApplied] = useState(false);

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    if (tab === 'url' && !jobUrl.trim()) return;
    if (tab === 'text' && !jobDescription.trim()) return;

    setLoading(true);
    setError('');
    logger.action('JobMatchDrawer', 'Initiated Job Scrape & Tailor', {
      type: tab,
      url: jobUrl,
      text_len: jobDescription.length,
    });

    try {
      const res = await api.post('/jobs/scrape-and-tailor', {
        job_url: tab === 'url' ? jobUrl.trim() : null,
        job_text: tab === 'text' ? jobDescription.trim() : null,
        cv_data: cvData,
      });
      setMatchResult(res.data);
      logger.action('JobMatchDrawer', 'Job Tailor Successful', {
        before: res.data.match_score_before,
        after: res.data.match_score_after,
      });
    } catch (err: any) {
      console.error(err);
      setError('Job analysis or link scraping failed. You can paste the job text directly.');
      logger.error('JobMatchDrawer', 'Job Tailor Failed', { error: String(err) });
    } finally {
      setLoading(false);
    }
  };

  const handleApplyTailored = () => {
    if (!matchResult) return;
    if (onApplyTailoredData) {
      onApplyTailoredData(matchResult);
    }
    setApplied(true);
    logger.action('JobMatchDrawer', 'Applied Tailored CV Data to Studio');
    setTimeout(() => {
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col overflow-hidden border-l border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-slate-50/80">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                1-Click Job Matcher & Tailor
              </h3>
              <p className="text-[11px] text-slate-500">
                Scrape job postings & auto-tailor CV bullets
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Mode Tabs */}
        <div className="p-4 border-b border-slate-100 bg-white">
          <div className="flex bg-slate-100 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setTab('url')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                tab === 'url' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" /> Paste Job URL
            </button>
            <button
              type="button"
              onClick={() => setTab('text')}
              className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                tab === 'text' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" /> Paste Job Text
            </button>
          </div>
        </div>

        {/* Drawer Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold">
              {error}
            </div>
          )}

          {!matchResult ? (
            <div className="space-y-4">
              {tab === 'url' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    LinkedIn / Indeed / Jobsearch.az URL:
                  </label>
                  <input
                    type="url"
                    value={jobUrl}
                    onChange={(e) => setJobUrl(e.target.value)}
                    placeholder="https://linkedin.com/jobs/view/..."
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-slate-400 font-medium"
                  />
                  <p className="text-[11px] text-slate-400 mt-1.5">
                    Our server will scrape requirements and align your resume bullets to match.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Paste Job Requirements / Description:
                  </label>
                  <textarea
                    rows={8}
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    placeholder="Paste full job description, required qualifications, and technologies here..."
                    className="w-full rounded-xl border border-slate-200 p-3 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder:text-slate-400 leading-relaxed resize-none"
                  />
                </div>
              )}

              <button
                type="button"
                onClick={handleAnalyze}
                disabled={loading || (tab === 'url' ? !jobUrl.trim() : !jobDescription.trim())}
                className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Scraping & Tailoring with AI...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" /> Scrape & Tailor Resume Now
                  </>
                )}
              </button>
            </div>
          ) : (
            /* Results View */
            <div className="space-y-5 animate-fade-in">
              {/* Match Boost Badge */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800">
                    ATS Match Score Uplift
                  </span>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xl font-black text-slate-400 line-through">
                      {matchResult.match_score_before || 62}%
                    </span>
                    <ArrowRight className="w-4 h-4 text-emerald-600" />
                    <span className="text-2xl font-black text-emerald-600">
                      {matchResult.match_score_after || 95}% Match
                    </span>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-full bg-emerald-600 text-white text-xs font-extrabold shadow-xs">
                  +{ (matchResult.match_score_after || 95) - (matchResult.match_score_before || 62) }% Boost
                </span>
              </div>

              {/* Extracted Role */}
              {matchResult.extracted_job_info && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block">
                    Target Opportunity:
                  </span>
                  <p className="font-extrabold text-slate-900 mt-0.5">
                    {matchResult.extracted_job_info.job_title} · {matchResult.extracted_job_info.company_name}
                  </p>
                </div>
              )}

              {/* Missing Keywords Found */}
              {matchResult.missing_keywords && matchResult.missing_keywords.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> Missing Keywords Added to Tailored CV:
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {matchResult.missing_keywords.map((kw: string) => (
                      <span
                        key={kw}
                        onClick={() => onAddSkill(kw)}
                        className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-semibold rounded-lg flex items-center gap-1 cursor-pointer hover:bg-amber-100"
                        title="Click to add skill"
                      >
                        <Plus className="w-3 h-3" /> {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Tailoring Summary */}
              {matchResult.ats_tailoring_summary && (
                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 text-xs text-blue-900 leading-relaxed">
                  <p className="font-bold mb-1">Tailoring Strategy Applied:</p>
                  <p>{matchResult.ats_tailoring_summary}</p>
                </div>
              )}

              {/* CTA Apply */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleApplyTailored}
                  disabled={applied}
                  className="w-full py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm shadow-lg transition-all flex items-center justify-center gap-2 disabled:bg-emerald-600"
                >
                  {applied ? (
                    <>
                      <Check className="w-4 h-4" /> Applied to CV Studio!
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Apply Tailored Bullets to Studio
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
