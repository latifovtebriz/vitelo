import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { api } from '../lib/api';
import {
  DollarSign, TrendingUp, Sparkles, Loader2, Copy, Check,
  ChevronDown, ChevronUp, Lightbulb, Target, BarChart3,
  Globe, Briefcase, Award, MessageSquare,
} from 'lucide-react';

/* ── Types ── */
interface SalaryRange {
  currency: string;
  minimum: number;
  median: number;
  maximum: number;
  percentile_25: number;
  percentile_75: number;
}

interface SalaryBenchmark {
  region: string;
  salary_range: SalaryRange;
  demand_level: string;
  growth_outlook: string;
}

interface SalaryResult {
  job_title: string;
  location: string;
  seniority: string;
  benchmarks: SalaryBenchmark[];
  market_insights: string[];
  top_paying_skills: string[];
}

interface NegotiationScript {
  scenario: string;
  opening_line: string;
  key_arguments: string[];
  counter_offer_strategy: string;
  closing_line: string;
}

interface NegotiationResult {
  overall_strategy: string;
  scripts: NegotiationScript[];
  email_template: string;
  tips: string[];
}

/* ── Format currency ── */
const fmt = (n: number, cur: string) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: cur, maximumFractionDigits: 0 }).format(n);

/* ── Badge colors ── */
const demandBadge = (d: string) => {
  if (d.toLowerCase().includes('high')) return 'bg-emerald-100 text-emerald-700';
  if (d.toLowerCase().includes('low')) return 'bg-red-100 text-red-700';
  return 'bg-amber-100 text-amber-700';
};

const growthBadge = (g: string) => {
  if (g.toLowerCase().includes('growing')) return 'bg-blue-100 text-blue-700';
  if (g.toLowerCase().includes('declining')) return 'bg-red-100 text-red-700';
  return 'bg-slate-100 text-slate-700';
};

/* ── Popular Locations ── */
const LOCATIONS = ['Baku, Azerbaijan', 'Remote / Global', 'New York, USA', 'London, UK', 'Berlin, Germany', 'Dubai, UAE', 'Singapore', 'Toronto, Canada'];
const CURRENCIES = ['USD', 'EUR', 'GBP', 'AZN', 'CAD', 'AED'];

export default function SalaryAnalyzer() {
  const [activeTab, setActiveTab] = useState<'analyze' | 'negotiate'>('analyze');

  /* ── Analysis State ── */
  const [aJobTitle, setAJobTitle] = useState('');
  const [aLocation, setALocation] = useState('');
  const [aSeniority, setASeniority] = useState('Mid-Level');
  const [aYears, setAYears] = useState('');
  const [aCurrency, setACurrency] = useState('USD');
  const [aLoading, setALoading] = useState(false);
  const [aResult, setAResult] = useState<SalaryResult | null>(null);

  /* ── Negotiation State ── */
  const [nJobTitle, setNJobTitle] = useState('');
  const [nCompany, setNCompany] = useState('');
  const [nCurrent, setNCurrent] = useState('');
  const [nDesired, setNDesired] = useState('');
  const [nCurrency, setNCurrency] = useState('USD');
  const [nContext, setNContext] = useState('New Job Offer');
  const [nStrengths, setNStrengths] = useState('');
  const [nLoading, setNLoading] = useState(false);
  const [nResult, setNResult] = useState<NegotiationResult | null>(null);
  const [expandedScript, setExpandedScript] = useState<number | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);

  /* ── Handlers ── */
  const handleAnalyze = async () => {
    if (!aJobTitle.trim()) return;
    setALoading(true); setAResult(null);
    try {
      const res = await api.post('/salary/analyze', {
        job_title: aJobTitle.trim(),
        location: aLocation.trim() || 'Global',
        seniority: aSeniority,
        years_experience: aYears ? parseInt(aYears) : undefined,
        currency: aCurrency,
      });
      setAResult(res.data);
    } catch (e) { console.error(e); }
    finally { setALoading(false); }
  };

  const handleNegotiate = async () => {
    if (!nJobTitle.trim() || !nCurrent || !nDesired) return;
    setNLoading(true); setNResult(null);
    try {
      const res = await api.post('/salary/negotiate', {
        job_title: nJobTitle.trim(),
        company_name: nCompany.trim() || undefined,
        current_offer: parseFloat(nCurrent),
        desired_salary: parseFloat(nDesired),
        currency: nCurrency,
        context: nContext,
        your_strengths: nStrengths ? nStrengths.split(',').map(s => s.trim()).filter(Boolean) : undefined,
      });
      setNResult(res.data);
      setExpandedScript(0);
    } catch (e) { console.error(e); }
    finally { setNLoading(false); }
  };

  const copyEmail = async () => {
    if (nResult?.email_template) {
      await navigator.clipboard.writeText(nResult.email_template);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  /* ── Salary Bar Component ── */
  const SalaryBar = ({ range }: { range: SalaryRange }) => {
    const max = range.maximum;
    const pct = (v: number) => `${Math.max(5, (v / max) * 100)}%`;

    return (
      <div className="space-y-2">
        <div className="relative h-8 bg-slate-100 rounded-full overflow-hidden">
          {/* Full range (min to max) */}
          <div className="absolute inset-y-0 bg-blue-100 rounded-full"
            style={{ left: pct(range.minimum), width: `calc(${pct(range.maximum)} - ${pct(range.minimum)})` }} />
          {/* IQR range (25th to 75th) */}
          <div className="absolute inset-y-0 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"
            style={{ left: pct(range.percentile_25), width: `calc(${pct(range.percentile_75)} - ${pct(range.percentile_25)})` }} />
          {/* Median marker */}
          <div className="absolute inset-y-0 w-0.5 bg-white" style={{ left: pct(range.median) }} />
        </div>
        <div className="flex justify-between text-xs text-slate-400">
          <span>{fmt(range.minimum, range.currency)}</span>
          <span className="font-bold text-indigo-600">{fmt(range.median, range.currency)} median</span>
          <span>{fmt(range.maximum, range.currency)}</span>
        </div>
      </div>
    );
  };

  return (
    <DashboardLayout activeKey="salary">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
          <DollarSign className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-900">Salary Analyzer</h1>
          <p className="text-xs text-slate-400">Market research & negotiation coaching powered by AI</p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit mb-8">
        {[
          { key: 'analyze' as const, label: 'Salary Analysis', icon: BarChart3 },
          { key: 'negotiate' as const, label: 'Negotiation Coach', icon: MessageSquare },
        ].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-white text-slate-800 shadow-sm'
                : 'text-slate-500 hover:text-slate-700'
            }`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* ════════════ TAB 1: SALARY ANALYSIS ════════════ */}
      {activeTab === 'analyze' && (
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 mb-4">Market Salary Research</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-500 mb-1.5 block">Job Title *</label>
                <input type="text" placeholder="e.g. Software Engineer" value={aJobTitle}
                  onChange={e => setAJobTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none" />
              </div>

              <div>
                <label className="text-sm text-slate-500 mb-1.5 block">Location</label>
                <input type="text" placeholder="City, Country or Remote" value={aLocation}
                  onChange={e => setALocation(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none" />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {LOCATIONS.slice(0, 4).map(loc => (
                    <button key={loc} onClick={() => setALocation(loc)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-colors ${
                        aLocation === loc ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'border-slate-200 text-slate-400 hover:text-slate-600'
                      }`}>
                      {loc.split(',')[0]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-500 mb-1.5 block">Seniority</label>
                  <select value={aSeniority} onChange={e => setASeniority(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none bg-white">
                    {['Junior', 'Mid-Level', 'Senior', 'Lead', 'Principal'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-500 mb-1.5 block">Currency</label>
                  <select value={aCurrency} onChange={e => setACurrency(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none bg-white">
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm text-slate-500 mb-1.5 block">Years of Experience</label>
                <input type="number" placeholder="e.g. 5" value={aYears}
                  onChange={e => setAYears(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-emerald-400 focus:outline-none" />
              </div>

              <button onClick={handleAnalyze} disabled={aLoading || !aJobTitle.trim()}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-bold text-sm hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {aLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing Market...</> : <><Sparkles className="w-4 h-4" /> Analyze Market Salary</>}
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-5">
            {!aResult && !aLoading && (
              <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-12 text-center">
                <TrendingUp className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-400">Enter a job title and location to see market salary data</p>
              </div>
            )}

            {aLoading && (
              <div className="space-y-4">
                {[1, 2].map(i => <div key={i} className="h-40 rounded-2xl bg-slate-100 animate-pulse" />)}
              </div>
            )}

            {aResult && (
              <>
                {/* Benchmarks */}
                {aResult.benchmarks.map((b, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-slate-400" />
                        <h4 className="font-bold text-slate-800">{b.region}</h4>
                      </div>
                      <div className="flex gap-2">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${demandBadge(b.demand_level)}`}>
                          {b.demand_level} Demand
                        </span>
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-lg ${growthBadge(b.growth_outlook)}`}>
                          {b.growth_outlook}
                        </span>
                      </div>
                    </div>
                    <SalaryBar range={b.salary_range} />
                    <div className="grid grid-cols-3 gap-3 mt-4">
                      <div className="bg-slate-50 rounded-xl p-3 text-center">
                        <p className="text-xs text-slate-400 mb-0.5">25th Percentile</p>
                        <p className="text-sm font-bold text-slate-700">{fmt(b.salary_range.percentile_25, b.salary_range.currency)}</p>
                      </div>
                      <div className="bg-indigo-50 rounded-xl p-3 text-center border border-indigo-100">
                        <p className="text-xs text-indigo-500 mb-0.5">Median</p>
                        <p className="text-sm font-extrabold text-indigo-700">{fmt(b.salary_range.median, b.salary_range.currency)}</p>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 text-center">
                        <p className="text-xs text-slate-400 mb-0.5">75th Percentile</p>
                        <p className="text-sm font-bold text-slate-700">{fmt(b.salary_range.percentile_75, b.salary_range.currency)}</p>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Market Insights */}
                {aResult.market_insights.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500" /> Market Insights
                    </h4>
                    <div className="space-y-2">
                      {aResult.market_insights.map((ins, i) => (
                        <div key={i} className="flex items-start gap-2.5 bg-amber-50 rounded-xl p-3 border border-amber-100">
                          <TrendingUp className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-slate-700">{ins}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Top Paying Skills */}
                {aResult.top_paying_skills.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-500" /> Top Paying Skills
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {aResult.top_paying_skills.map((skill, i) => (
                        <span key={i} className="px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ════════════ TAB 2: NEGOTIATION COACH ════════════ */}
      {activeTab === 'negotiate' && (
        <div className="grid lg:grid-cols-5 gap-6">
          {/* Form */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-800 mb-4">Negotiation Details</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-slate-500 mb-1.5 block">Job Title *</label>
                <input type="text" placeholder="e.g. DevOps Engineer" value={nJobTitle}
                  onChange={e => setNJobTitle(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none" />
              </div>
              <div>
                <label className="text-sm text-slate-500 mb-1.5 block">Company</label>
                <input type="text" placeholder="e.g. Amazon" value={nCompany}
                  onChange={e => setNCompany(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-500 mb-1.5 block">Current Offer *</label>
                  <input type="number" placeholder="75000" value={nCurrent}
                    onChange={e => setNCurrent(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none" />
                </div>
                <div>
                  <label className="text-sm text-slate-500 mb-1.5 block">Desired Salary *</label>
                  <input type="number" placeholder="90000" value={nDesired}
                    onChange={e => setNDesired(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-slate-500 mb-1.5 block">Currency</label>
                  <select value={nCurrency} onChange={e => setNCurrency(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none bg-white">
                    {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-500 mb-1.5 block">Context</label>
                  <select value={nContext} onChange={e => setNContext(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 px-3 py-3 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none bg-white">
                    {['New Job Offer', 'Promotion', 'Annual Review'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-500 mb-1.5 block">Your Key Strengths (comma-separated)</label>
                <input type="text" placeholder="e.g. Kubernetes, team leadership, AWS certification" value={nStrengths}
                  onChange={e => setNStrengths(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-teal-400 focus:outline-none" />
              </div>

              <button onClick={handleNegotiate} disabled={nLoading || !nJobTitle.trim() || !nCurrent || !nDesired}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold text-sm hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                {nLoading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating Strategy...</> : <><Sparkles className="w-4 h-4" /> Generate Strategy</>}
              </button>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3 space-y-5">
            {!nResult && !nLoading && (
              <div className="bg-slate-50 rounded-2xl border border-dashed border-slate-200 p-12 text-center">
                <MessageSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-400">Fill in the details to get personalized negotiation scripts</p>
              </div>
            )}

            {nLoading && (
              <div className="space-y-4">
                {[1, 2, 3].map(i => <div key={i} className="h-24 rounded-2xl bg-slate-100 animate-pulse" />)}
              </div>
            )}

            {nResult && (
              <>
                {/* Overall Strategy */}
                <div className="bg-gradient-to-r from-teal-50 to-emerald-50 rounded-2xl border border-teal-200 p-6">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-teal-600" />
                    <h4 className="font-bold text-teal-800">Overall Strategy</h4>
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed">{nResult.overall_strategy}</p>
                </div>

                {/* Scripts */}
                {nResult.scripts.map((script, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <button onClick={() => setExpandedScript(expandedScript === i ? null : i)}
                      className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-teal-100 flex items-center justify-center text-teal-600 text-xs font-bold">
                          {i + 1}
                        </div>
                        <span className="font-bold text-sm text-slate-800">{script.scenario}</span>
                      </div>
                      {expandedScript === i ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </button>
                    {expandedScript === i && (
                      <div className="px-6 pb-6 space-y-4 border-t border-slate-100 pt-4">
                        {/* Opening */}
                        <div className="bg-blue-50 border-l-4 border-blue-400 rounded-r-xl p-4">
                          <p className="text-xs font-bold text-blue-600 mb-1">Opening Line</p>
                          <p className="text-sm text-slate-700 italic">"{script.opening_line}"</p>
                        </div>
                        {/* Arguments */}
                        <div>
                          <p className="text-xs font-bold text-slate-500 mb-2">Key Arguments</p>
                          <div className="space-y-1.5">
                            {script.key_arguments.map((arg, j) => (
                              <div key={j} className="flex items-start gap-2">
                                <span className="w-5 h-5 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 text-[10px] font-bold flex-shrink-0 mt-0.5">
                                  {j + 1}
                                </span>
                                <p className="text-sm text-slate-700">{arg}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Counter */}
                        <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                          <p className="text-xs font-bold text-amber-600 mb-1">If They Push Back</p>
                          <p className="text-sm text-slate-700">{script.counter_offer_strategy}</p>
                        </div>
                        {/* Closing */}
                        <div className="bg-emerald-50 border-l-4 border-emerald-400 rounded-r-xl p-4">
                          <p className="text-xs font-bold text-emerald-600 mb-1">Closing Line</p>
                          <p className="text-sm text-slate-700 italic">"{script.closing_line}"</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Email Template */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-slate-800 flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-slate-400" /> Email Template
                    </h4>
                    <button onClick={copyEmail}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
                      {copiedEmail ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                    </button>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                    <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">{nResult.email_template}</pre>
                  </div>
                </div>

                {/* Tips */}
                {nResult.tips.length > 0 && (
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4 text-amber-500" /> Pro Tips
                    </h4>
                    <div className="space-y-2">
                      {nResult.tips.map((tip, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <span className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center text-amber-700 text-[10px] font-bold flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <p className="text-sm text-slate-700">{tip}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
