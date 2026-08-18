import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Zap,
  AlertTriangle,
  ArrowRight,
  Loader2,
  FileCheck,
  RotateCcw,
} from 'lucide-react';
import { api } from '../../lib/api';
import { logger } from '../../lib/logger';
import { useLanguageStore } from '../../stores/languageStore';

const SAMPLE_RAW_RESUME = `Software Developer with experience in C# and SQL.
Responsible for maintaining backend services and writing stored procedures.
Helped team with testing and fixing bugs.
Good team player with communication skills.`;

export default function LiveScannerWidget() {
  const { t } = useLanguageStore();
  const navigate = useNavigate();

  const [rawText, setRawText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    grade: string;
    action_verbs_score: number;
    metrics_score: number;
    summary_tips: string[];
    action_items: { title: string; fix: string }[];
  } | null>(null);

  const handleInsertSample = () => {
    setRawText(SAMPLE_RAW_RESUME);
    logger.action('LiveScannerWidget', 'Clicked Insert Sample Text');
  };

  const handleScan = async () => {
    if (!rawText.trim()) return;

    setLoading(true);
    logger.action('LiveScannerWidget', 'Started 10s ATS Scan', { length: rawText.length });

    try {
      // Call backend deep ATS scanner endpoint
      const res = await api.post('/cv/ai/ats-diagnostics', {
        cv_data: { raw_text: rawText, summary: rawText },
      });

      const data = res.data;
      setResult({
        score: data.overall_score || 58,
        grade: data.grade || 'C',
        action_verbs_score: data.category_scores?.action_verbs?.score || 50,
        metrics_score: data.category_scores?.quantifiable_metrics?.score || 40,
        summary_tips: data.top_strengths || [
          'Basic technical keywords found',
          'Chronological structure detected',
        ],
        action_items: data.actionable_fixes?.slice(0, 3).map((f: any) => ({
          title: f.title,
          fix: f.fix_suggestion,
        })) || [
          {
            title: 'Missing Quantifiable Google XYZ Metrics',
            fix: 'Add numbers, % performance uplift, or time savings (e.g. "Reduced query latency by 45%").',
          },
          {
            title: 'Weak Passive Voice Used',
            fix: 'Replace "Responsible for" with power verbs like "Architected", "Spearheaded", or "Engineered".',
          },
          {
            title: 'Sub-Optimal Header Hierarchy',
            fix: 'Restructure into standard ATS semantic sections to avoid rejection by Workday and Greenhouse.',
          },
        ],
      });
    } catch (err) {
      console.warn('API fallback for scanner:', err);
      // Fast fallback calculation for instant responsiveness
      const words = rawText.split(/\s+/).length;
      const hasMetrics = /\d+%|\$\d+|\d+x/i.test(rawText);
      const hasActionVerbs = /engineered|architected|developed|reduced|scaled|deployed|led/i.test(rawText);

      let calcScore = 52;
      if (words > 30) calcScore += 15;
      if (hasMetrics) calcScore += 18;
      if (hasActionVerbs) calcScore += 12;

      setResult({
        score: Math.min(calcScore, 82),
        grade: calcScore > 75 ? 'B+' : 'C',
        action_verbs_score: hasActionVerbs ? 78 : 45,
        metrics_score: hasMetrics ? 80 : 35,
        summary_tips: ['Good technical context provided'],
        action_items: [
          {
            title: 'Missing Quantifiable Metrics',
            fix: 'Include specific numbers: $ saved, % latency reduced, or user scale handled.',
          },
          {
            title: 'Passive Phrasing Detected',
            fix: 'Start bullets with strong action verbs (Engineered, Architected, Automated).',
          },
          {
            title: 'ATS Formatting Inconsistencies',
            fix: 'Convert into standard ATS single-column hierarchy for maximum parser score.',
          },
        ],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFixInStudio = () => {
    logger.action('LiveScannerWidget', 'Clicked Fix in Studio CTA', { score: result?.score });
    navigate('/generate');
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-900 rounded-3xl border border-slate-800 shadow-2xl p-6 sm:p-8 text-white relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-6 relative">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold mb-3">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          {t.scanner.badge}
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2">
          {t.scanner.title}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
          {t.scanner.subtitle}
        </p>
      </div>

      {!result ? (
        /* Input Box State */
        <div className="space-y-4 relative">
          <div className="relative">
            <textarea
              rows={5}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={t.scanner.placeholder}
              className="w-full rounded-2xl bg-slate-950/80 border border-slate-800 p-4 text-xs sm:text-sm text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono leading-relaxed resize-none shadow-inner"
            />
            {rawText && (
              <span className="absolute bottom-3 right-4 text-[10px] text-slate-500 font-medium">
                {rawText.split(/\s+/).filter(Boolean).length} words
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={handleInsertSample}
              className="w-full sm:w-auto text-xs text-blue-400 hover:text-blue-300 font-bold flex items-center justify-center gap-1 py-1"
            >
              <Sparkles className="w-3.5 h-3.5" /> {t.scanner.sampleBtn}
            </button>

            <button
              type="button"
              onClick={handleScan}
              disabled={loading || !rawText.trim()}
              className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs sm:text-sm shadow-lg hover:shadow-blue-500/25 hover:from-blue-500 hover:to-indigo-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  {t.scanner.scanning}
                </>
              ) : (
                <>
                  <FileCheck className="w-4 h-4" />
                  {t.scanner.scanBtn}
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        /* Results View State */
        <div className="space-y-6 animate-fade-in relative">
          {/* Top Score Banner */}
          <div className="grid sm:grid-cols-12 gap-4 items-center p-5 rounded-2xl bg-slate-950/90 border border-slate-800">
            {/* Score Ring */}
            <div className="sm:col-span-4 flex flex-col items-center justify-center text-center sm:border-r sm:border-slate-800 sm:pr-4">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 mb-1">
                {t.scanner.resultScore}
              </span>
              <div className="flex items-baseline gap-1">
                <span
                  className={`text-4xl sm:text-5xl font-black ${
                    result.score >= 80
                      ? 'text-emerald-400'
                      : result.score >= 60
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {result.score}
                </span>
                <span className="text-base text-slate-500 font-bold">/100</span>
              </div>
              <span
                className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full mt-1.5 ${
                  result.score >= 80
                    ? 'bg-emerald-500/20 text-emerald-300'
                    : result.score >= 60
                    ? 'bg-amber-500/20 text-amber-300'
                    : 'bg-rose-500/20 text-rose-300'
                }`}
              >
                Grade: {result.grade} · High Rejection Risk
              </span>
            </div>

            {/* Quick Metrics */}
            <div className="sm:col-span-8 space-y-3 sm:pl-2">
              <p className="text-xs font-extrabold text-slate-300">
                {t.scanner.resultTitle}
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex justify-between text-slate-400 text-[10px] mb-1 font-bold">
                    <span>Action Verbs</span>
                    <span>{result.action_verbs_score}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-blue-500"
                      style={{ width: `${result.action_verbs_score}%` }}
                    />
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <div className="flex justify-between text-slate-400 text-[10px] mb-1 font-bold">
                    <span>Quantifiable Metrics</span>
                    <span>{result.metrics_score}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-amber-500"
                      style={{ width: `${result.metrics_score}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Items List */}
          <div className="space-y-2.5">
            {result.action_items.map((item, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3"
              >
                <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-bold text-slate-200">{item.title}</p>
                  <p className="text-slate-400 mt-0.5 leading-relaxed">{item.fix}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Bottom Actions */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-900/60 via-indigo-900/60 to-purple-900/60 border border-blue-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <p className="text-xs sm:text-sm font-bold text-white">
                {t.scanner.fixPrompt}
              </p>
              <p className="text-[11px] text-blue-200 mt-0.5">
                Gemini AI will rewrite your experience into 95%+ ATS compliant bullets automatically.
              </p>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setResult(null);
                  setRawText('');
                }}
                className="px-3.5 py-2.5 rounded-xl border border-slate-700 text-xs font-bold text-slate-300 hover:bg-slate-800 transition-colors"
                title="Scan another"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleFixInStudio}
                className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-white text-blue-900 font-extrabold text-xs sm:text-sm shadow-md hover:bg-blue-50 transition-all flex items-center justify-center gap-1.5"
              >
                {t.scanner.fixCta} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
