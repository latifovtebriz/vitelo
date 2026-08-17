import { useState } from 'react';
import { Sparkles, X, Check, Loader2, ArrowRight, FileText, Wand2 } from 'lucide-react';
import { api } from '../../lib/api';

export type AIAssistMode = 'enhance_bullet' | 'generate_summary' | 'import_cv';

interface AIAssistModalProps {
  isOpen: boolean;
  mode: AIAssistMode;
  contextData: any;
  onClose: () => void;
  onApply: (result: any) => void;
}

export default function AIAssistModal({
  isOpen,
  mode,
  contextData,
  onClose,
  onApply,
}: AIAssistModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedBullets, setGeneratedBullets] = useState<string[]>([]);
  const [generatedSummaries, setGeneratedSummaries] = useState<any[]>([]);
  const [rawCvText, setRawCvText] = useState('');

  if (!isOpen) return null;

  const handleEnhanceBullet = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/cv/ai/enhance-bullet', {
        bullet: contextData.bullet || '',
        job_title: contextData.job_title || '',
        company: contextData.company || '',
      });
      setGeneratedBullets(res.data.bullets || []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to enhance bullet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSummary = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/cv/ai/generate-summary', {
        headline: contextData.headline || '',
        skills: contextData.skills || [],
        experiences: contextData.experiences || [],
      });
      setGeneratedSummaries(res.data.summaries || []);
    } catch (err: any) {
      console.error(err);
      setError('Failed to generate summary options. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleParseResume = async () => {
    if (!rawCvText.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/cv/ai/parse-resume', {
        text: rawCvText,
      });
      onApply(res.data);
      onClose();
    } catch (err: any) {
      console.error(err);
      setError('Failed to parse CV text. Please verify the content.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {mode === 'enhance_bullet' && 'AI Bullet Point Enhancer'}
                {mode === 'generate_summary' && 'AI Summary Generator'}
                {mode === 'import_cv' && 'Import Existing CV / LinkedIn Text'}
              </h3>
              <p className="text-xs text-slate-500">Powered by Gemini 2.0 Flash</p>
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

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold">
              {error}
            </div>
          )}

          {/* MODE: ENHANCE BULLET */}
          {mode === 'enhance_bullet' && (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                <span className="text-slate-400 font-semibold uppercase tracking-wider block text-[10px]">
                  Original Draft:
                </span>
                <p className="text-slate-800 font-medium">
                  {contextData.bullet || 'No bullet text provided yet.'}
                </p>
                {contextData.job_title && (
                  <span className="text-blue-600 block text-[11px] font-semibold">
                    Role: {contextData.job_title} at {contextData.company}
                  </span>
                )}
              </div>

              {generatedBullets.length === 0 ? (
                <div className="text-center py-6 space-y-3">
                  <p className="text-xs text-slate-600">
                    Gemini AI will rewrite your draft into 3 high-impact, Google XYZ-formula bullets with action verbs and metrics.
                  </p>
                  <button
                    type="button"
                    onClick={handleEnhanceBullet}
                    disabled={loading || !contextData.bullet}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wand2 className="w-4 h-4" />}
                    {loading ? 'Polishing with AI...' : 'Generate 3 Enhanced Variations'}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-700 block">
                    Choose your favorite enhanced bullet:
                  </span>
                  {generatedBullets.map((bullet, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        onApply(bullet);
                        onClose();
                      }}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-500 hover:bg-blue-50/40 cursor-pointer transition-all space-y-2 group shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-xs text-slate-800 leading-relaxed font-medium">
                          {bullet}
                        </p>
                        <button
                          type="button"
                          className="shrink-0 p-1.5 rounded-lg bg-blue-600 text-white opacity-80 group-hover:opacity-100 transition-opacity"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MODE: GENERATE SUMMARY */}
          {mode === 'generate_summary' && (
            <div className="space-y-4">
              {generatedSummaries.length === 0 ? (
                <div className="text-center py-6 space-y-3">
                  <p className="text-xs text-slate-600 max-w-md mx-auto">
                    Generate 3 tailored executive summaries tailored to your headline (
                    <strong>{contextData.headline || 'General Engineer'}</strong>) and key skills.
                  </p>
                  <button
                    type="button"
                    onClick={handleGenerateSummary}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {loading ? 'Crafting Summaries...' : 'Generate 3 Tailored Options'}
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-slate-700 block">
                    Select a tailored summary option:
                  </span>
                  {generatedSummaries.map((item, idx) => (
                    <div
                      key={idx}
                      onClick={() => {
                        onApply(item.text);
                        onClose();
                      }}
                      className="p-4 rounded-xl border border-slate-200 bg-white hover:border-blue-500 hover:bg-blue-50/40 cursor-pointer transition-all space-y-2 group shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md">
                          {item.title}
                        </span>
                        <span className="text-[11px] font-semibold text-slate-400 group-hover:text-blue-600 flex items-center gap-1">
                          Apply <ArrowRight className="w-3 h-3" />
                        </span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed">{item.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* MODE: IMPORT CV */}
          {mode === 'import_cv' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-600">
                Paste your existing CV or LinkedIn profile text below. AI will extract your contact details, jobs, education, and skills into the form automatically.
              </p>
              <textarea
                rows={8}
                placeholder="Paste raw CV text here (e.g. John Doe, Software Engineer, Experience: ...)"
                value={rawCvText}
                onChange={(e) => setRawCvText(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-3.5 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={handleParseResume}
                  disabled={loading || !rawCvText.trim()}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                  {loading ? 'Parsing CV with AI...' : 'Parse & Autofill CV Form'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
