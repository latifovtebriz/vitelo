import { CheckCircle2, AlertCircle, Sparkles, TrendingUp } from 'lucide-react';

interface ATSScoreGaugeProps {
  formData: any;
  onOpenJobMatcher?: () => void;
}

export default function ATSScoreGauge({ formData, onOpenJobMatcher }: ATSScoreGaugeProps) {
  const { personal, experience, education, skills } = formData;

  // Calculate live score checklist
  const hasContact = Boolean(personal.name && personal.email);
  const hasHeadline = Boolean(personal.headline);
  const hasSummary = Boolean(personal.summary && personal.summary.length > 40);
  const hasExperience = Boolean(
    experience.some((e: any) => e.company && e.job_title && e.description && e.description.length > 20)
  );
  const hasEducation = Boolean(
    education.some((ed: any) => ed.institution && ed.degree)
  );
  
  // Count total skills
  const totalSkillsCount =
    skills && typeof skills === 'object'
      ? Object.values(skills).reduce((acc: number, arr: any) => acc + (Array.isArray(arr) ? arr.length : 0), 0)
      : 0;
  const hasEnoughSkills = totalSkillsCount >= 5;

  const hasLinks = Boolean(personal.linkedin || personal.github || personal.portfolio);

  // Check for quantifiable metrics in descriptions (numbers, %, ms, reduced, increased, etc.)
  const allExpDescriptions = experience.map((e: any) => e.description || '').join(' ');
  const hasMetrics = /[\d%+]|\b(reduced|increased|improved|scaled|accelerated|streamlined|optimized|engineered|architected)\b/i.test(
    allExpDescriptions
  );

  // Compute total score
  let score = 0;
  if (hasContact) score += 15;
  if (hasHeadline) score += 10;
  if (hasSummary) score += 15;
  if (hasExperience) score += 20;
  if (hasEducation) score += 10;
  if (hasEnoughSkills) score += 15;
  if (hasLinks) score += 10;
  if (hasMetrics) score += 5;

  // Clamped 0-100
  score = Math.min(Math.max(score, 0), 100);

  const getScoreColor = () => {
    if (score >= 80) return 'text-emerald-600 bg-emerald-50 border-emerald-200';
    if (score >= 50) return 'text-amber-600 bg-amber-50 border-amber-200';
    return 'text-rose-600 bg-rose-50 border-rose-200';
  };

  const getProgressBarColor = () => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 50) return 'bg-amber-500';
    return 'bg-rose-500';
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-blue-600" />
          <h3 className="text-sm font-bold text-slate-900">Live ATS Resume Score</h3>
        </div>
        <div className={`px-3 py-1 rounded-full border text-xs font-black flex items-center gap-1.5 ${getScoreColor()}`}>
          <span>{score}/100</span>
          {score >= 80 && <span>🔥</span>}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${getProgressBarColor()}`}
          style={{ width: `${score}%` }}
        />
      </div>

      {/* Checklist Audit */}
      <div className="space-y-2 pt-1 text-xs">
        <div className="flex items-center justify-between text-slate-700">
          <span className="flex items-center gap-1.5">
            {hasContact ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-slate-300" />
            )}
            Name, Email & Phone
          </span>
          <span className={hasContact ? 'font-bold text-emerald-600' : 'text-slate-400'}>
            {hasContact ? '+15 pts' : '0'}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-700">
          <span className="flex items-center gap-1.5">
            {hasHeadline ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-slate-300" />
            )}
            Job Title Headline
          </span>
          <span className={hasHeadline ? 'font-bold text-emerald-600' : 'text-slate-400'}>
            {hasHeadline ? '+10 pts' : '0'}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-700">
          <span className="flex items-center gap-1.5">
            {hasSummary ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-slate-300" />
            )}
            Professional Summary
          </span>
          <span className={hasSummary ? 'font-bold text-emerald-600' : 'text-slate-400'}>
            {hasSummary ? '+15 pts' : '0'}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-700">
          <span className="flex items-center gap-1.5">
            {hasExperience ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-slate-300" />
            )}
            Experience with descriptions
          </span>
          <span className={hasExperience ? 'font-bold text-emerald-600' : 'text-slate-400'}>
            {hasExperience ? '+20 pts' : '0'}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-700">
          <span className="flex items-center gap-1.5">
            {hasEnoughSkills ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-slate-300" />
            )}
            5+ Categorized Skills ({totalSkillsCount})
          </span>
          <span className={hasEnoughSkills ? 'font-bold text-emerald-600' : 'text-slate-400'}>
            {hasEnoughSkills ? '+15 pts' : '0'}
          </span>
        </div>

        <div className="flex items-center justify-between text-slate-700">
          <span className="flex items-center gap-1.5">
            {hasMetrics ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            ) : (
              <AlertCircle className="w-3.5 h-3.5 text-slate-300" />
            )}
            Action verbs & Measurable Metrics
          </span>
          <span className={hasMetrics ? 'font-bold text-emerald-600' : 'text-slate-400'}>
            {hasMetrics ? '+5 pts' : '0'}
          </span>
        </div>
      </div>

      {/* Match with Job Description Action */}
      {onOpenJobMatcher && (
        <button
          type="button"
          onClick={onOpenJobMatcher}
          className="w-full mt-2 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition-all border border-blue-200 flex items-center justify-center gap-1.5 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" /> Match against Target Job Description
        </button>
      )}
    </div>
  );
}
