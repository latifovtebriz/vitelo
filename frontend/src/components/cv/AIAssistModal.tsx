import { useState } from 'react';
import {
  Sparkles,
  X,
  Check,
  Loader2,
  ArrowRight,
  FileText,
  Wand2,
  Globe,
  Linkedin,
  Copy,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../../lib/api';

export type AIAssistMode =
  | 'enhance_bullet'
  | 'generate_summary'
  | 'import_cv'
  | 'translate_cv'
  | 'linkedin_optimizer';

interface AIAssistModalProps {
  isOpen: boolean;
  mode: AIAssistMode;
  contextData: any;
  onClose: () => void;
  onApply: (result: any) => void;
}

const TARGET_LANGUAGES = [
  { code: 'en', label: 'English (US/UK)', flag: '🇬🇧' },
  { code: 'az', label: 'Azərbaycan dili', flag: '🇦🇿' },
  { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  { code: 'de', label: 'Deutsch (German)', flag: '🇩🇪' },
  { code: 'ru', label: 'Русский (Russian)', flag: '🇷🇺' },
];

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

  // Translation State
  const [selectedLang, setSelectedLang] = useState('en');
  const [translatedCv, setTranslatedCv] = useState<any>(null);

  // LinkedIn State
  const [linkedinData, setLinkedinData] = useState<any>(null);
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedItem(id);
    setTimeout(() => setCopiedItem(null), 2500);
  };

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

  const handleTranslateCv = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/cv/ai/translate', {
        cv_data: contextData.cv_data || {},
        target_language: selectedLang,
      });
      setTranslatedCv(res.data.translated_cv);
    } catch (err: any) {
      console.error(err);
      setError('Failed to translate CV. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateLinkedIn = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/cv/ai/linkedin-optimize', {
        cv_data: contextData.cv_data || {},
      });
      setLinkedinData(res.data);
    } catch (err: any) {
      console.error(err);
      setError('Failed to generate LinkedIn optimization. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
              {mode === 'translate_cv' ? (
                <Globe className="w-4 h-4" />
              ) : mode === 'linkedin_optimizer' ? (
                <Linkedin className="w-4 h-4 text-blue-600" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {mode === 'enhance_bullet' && 'AI Bullet Point Enhancer'}
                {mode === 'generate_summary' && 'AI Summary Generator'}
                {mode === 'import_cv' && 'Import Existing CV / LinkedIn Text'}
                {mode === 'translate_cv' && 'AI Multi-Language CV Translator'}
                {mode === 'linkedin_optimizer' && 'AI LinkedIn Profile Optimizer'}
              </h3>
              <p className="text-xs text-slate-500">Powered by Gemini 2.0 Flash</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200 text-xs font-semibold">
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

          {/* MODE: TRANSLATE CV */}
          {mode === 'translate_cv' && (
            <div className="space-y-5">
              {!translatedCv ? (
                <>
                  <p className="text-xs text-slate-600">
                    Translate your entire CV into another language. AI preserves all technical keywords, company names, metrics, and degrees while translating bullet points and summaries into fluent professional vocabulary.
                  </p>

                  <div>
                    <label className="text-xs font-bold text-slate-700 block mb-2">
                      Choose Target Language:
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {TARGET_LANGUAGES.map((lang) => (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => setSelectedLang(lang.code)}
                          className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 transition-all ${
                            selectedLang === lang.code
                              ? 'border-blue-600 bg-blue-50/80 text-blue-700 shadow-xs ring-1 ring-blue-600'
                              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="text-base">{lang.flag}</span>
                          <span>{lang.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleTranslateCv}
                      disabled={loading}
                      className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl text-xs font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Globe className="w-4 h-4" />
                      )}
                      {loading ? 'Translating entire CV...' : 'Translate CV in 1-Click'}
                    </button>
                  </div>
                </>
              ) : (
                <div className="space-y-4">
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      CV translated to{' '}
                      {TARGET_LANGUAGES.find((l) => l.code === selectedLang)?.label}!
                    </div>
                    <button
                      type="button"
                      onClick={() => setTranslatedCv(null)}
                      className="text-xs underline font-semibold"
                    >
                      Choose another
                    </button>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2 max-h-60 overflow-y-auto">
                    <p className="font-bold text-slate-900">
                      Headline: {translatedCv.personal?.headline || translatedCv.summary}
                    </p>
                    <p className="text-slate-600">{translatedCv.summary}</p>
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onApply(translatedCv);
                        onClose();
                      }}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center gap-1.5"
                    >
                      <Check className="w-4 h-4" /> Apply Translated CV to Form
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* MODE: LINKEDIN OPTIMIZER */}
          {mode === 'linkedin_optimizer' && (
            <div className="space-y-5">
              {!linkedinData ? (
                <div className="text-center py-6 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
                    <Linkedin className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 mb-1">
                      Turn your CV into a high-visibility LinkedIn Profile
                    </h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                      AI will analyze your experience and generate 3 compelling headlines, an impactful About/Summary narrative, and skill endorsements.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleGenerateLinkedIn}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all disabled:opacity-50"
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    {loading ? 'Optimizing for LinkedIn...' : 'Generate LinkedIn Profile Pack'}
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Headlines */}
                  <div>
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2.5">
                      1. High-Click LinkedIn Headlines
                    </h4>
                    <div className="space-y-2">
                      {linkedinData.headlines?.map((h: any, idx: number) => (
                        <div
                          key={idx}
                          className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 transition-all flex items-start justify-between gap-3"
                        >
                          <div>
                            <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md mb-1 inline-block">
                              {h.label}
                            </span>
                            <p className="text-xs text-slate-800 font-medium">{h.text}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleCopy(h.text, `hl-${idx}`)}
                            className="shrink-0 p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                            title="Copy Headline"
                          >
                            {copiedItem === `hl-${idx}` ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* About Section */}
                  {linkedinData.about_section && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                          2. Compelling "About" Summary
                        </h4>
                        <button
                          type="button"
                          onClick={() =>
                            handleCopy(
                              `${linkedinData.about_section.hook}\n\n${linkedinData.about_section.body}\n\n🎯 Key Highlights:\n${linkedinData.about_section.top_achievements?.map((a: string) => `• ${a}`).join('\n')}\n\n🛠 Core Stack: ${linkedinData.about_section.core_technologies?.join(', ')}\n\n${linkedinData.about_section.call_to_action}`,
                              'about-sec'
                            )
                          }
                          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:underline"
                        >
                          {copiedItem === 'about-sec' ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          Copy Full About Section
                        </button>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-2 leading-relaxed">
                        <p className="font-bold text-slate-900">
                          {linkedinData.about_section.hook}
                        </p>
                        <p>{linkedinData.about_section.body}</p>
                        {linkedinData.about_section.top_achievements && (
                          <div className="space-y-1 pl-2 border-l-2 border-blue-400 my-2">
                            {linkedinData.about_section.top_achievements.map(
                              (ach: string, i: number) => (
                                <p key={i}>• {ach}</p>
                              )
                            )}
                          </div>
                        )}
                        <p className="font-semibold text-blue-700">
                          {linkedinData.about_section.call_to_action}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Skill Endorsements */}
                  {linkedinData.top_skill_endorsements && (
                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
                        3. Recommended Skills for Endorsements
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {linkedinData.top_skill_endorsements.map((skill: string) => (
                          <span
                            key={skill}
                            className="px-2.5 py-1 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold"
                          >
                            #{skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
