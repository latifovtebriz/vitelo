import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  FileText,
  Sparkles,
  Zap,
  CheckCircle2,
  ChevronRight,
  Search,
} from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';

const TEMPLATES = [
  {
    id: 'professional',
    name: 'Executive & Corporate',
    tone: 'Professional',
    desc: 'Formal, structured hierarchy emphasizing leadership, ROI metrics, and strategic alignment with enterprise company goals.',
    emoji: '👔',
    color: 'from-slate-800 to-slate-900',
    border: 'border-slate-300',
  },
  {
    id: 'modern',
    name: 'Tech & Engineering',
    tone: 'Confident',
    desc: 'Direct, impactful, and metric-dense. Perfect for software engineers, DevOps, and cloud architects highlighting technical stacks.',
    emoji: '💻',
    color: 'from-blue-600 to-indigo-700',
    border: 'border-blue-200',
  },
  {
    id: 'simple',
    name: 'Clean & Minimal',
    tone: 'Professional',
    desc: 'Concise 3-paragraph format focusing on core competencies and culture fit. Zero filler words.',
    emoji: '📄',
    color: 'from-emerald-600 to-teal-700',
    border: 'border-emerald-200',
  },
  {
    id: 'creative',
    name: 'Creative & Storytelling',
    tone: 'Passionate',
    desc: 'Engaging, human narrative highlighting product vision, creative problem solving, and design philosophy.',
    emoji: '🎨',
    color: 'from-purple-600 to-pink-600',
    border: 'border-purple-200',
  },
];

const EXAMPLES = [
  {
    slug: 'software-engineer-cover-letter',
    title: 'Software & DevOps Engineer',
    industry: 'Tech & Engineering',
    role: 'Senior Software Engineer',
    company: 'Stripe',
    score: 98,
    highlight: 'Scaled microservices to 50K req/sec, cut latency by 40%',
  },
  {
    slug: 'graduate-cover-letter',
    title: 'Management Consulting & Strategy',
    industry: 'Business & Consulting',
    role: 'Graduate Business Analyst',
    company: 'McKinsey & Company',
    score: 97,
    highlight: 'LSE Economics First Class Honours, Deloitte Digital internship',
  },
  {
    slug: 'internship-cover-letter',
    title: 'Growth & Product Marketing',
    industry: 'Marketing & Media',
    role: 'Product Marketing Specialist',
    company: 'BrightWave Digital',
    score: 96,
    highlight: '180% social growth, Google & HubSpot Certified',
  },
  {
    slug: 'administrative-assistant-cover-letter',
    title: 'Executive Assistant & Operations',
    industry: 'Corporate & Finance',
    role: 'Executive Assistant',
    company: 'Sterling & Associates',
    score: 95,
    highlight: 'C-suite calendar management, 60% faster document workflow',
  },
  {
    slug: 'nursing-cover-letter',
    title: 'Clinical & Healthcare Professional',
    industry: 'Healthcare',
    role: 'Registered Nurse (BSN)',
    company: 'City General Hospital',
    score: 99,
    highlight: '4+ years emergency care, 98% patient satisfaction rate',
  },
  {
    slug: 'teacher-cover-letter',
    title: 'Education & Academic Leadership',
    industry: 'Education',
    role: 'Secondary Department Lead',
    company: 'Greenfield Academy',
    score: 96,
    highlight: 'MA PGCE, raised department literature scores by 15%',
  },
];

export default function CoverLetterExamples() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredExamples = EXAMPLES.filter(
    (ex) =>
      ex.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.industry.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-28 pb-16 px-4 sm:px-6 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 mb-4 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200/60 shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            AI-Tailored & Recruiter-Approved Cover Letters
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Cover Letter Examples & AI Studio
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
            Browse high-conversion cover letters crafted for Fortune 500 applications. Use any template or generate a custom letter matched directly to your CV and target job in 60 seconds.
          </p>

          {/* Search Box */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by role, company, or industry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white shadow-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-medium"
            />
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <section className="py-14 px-4 sm:px-6 flex-1">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-12 gap-10">
            {/* LEFT — Templates / Styles (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Tone & Layout Styles</h2>
                <p className="text-slate-500 text-sm">
                  Choose a writing tone and style for your AI generator.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {TEMPLATES.map((t) => (
                  <div
                    key={t.id}
                    className="group rounded-3xl border border-slate-200/90 overflow-hidden bg-white shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col"
                  >
                    <div className={`h-24 bg-gradient-to-br ${t.color} flex items-center justify-center`}>
                      <span className="text-4xl group-hover:scale-110 transition-transform duration-300">
                        {t.emoji}
                      </span>
                    </div>
                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="font-bold text-slate-900 text-sm mb-1">{t.name}</h3>
                      <p className="text-xs text-slate-500 leading-relaxed flex-1 mb-4">{t.desc}</p>
                      <Link
                        to={`/cover-letter/create?tone=${t.tone}`}
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold shadow-xs hover:shadow-md transition-all"
                      >
                        <Zap className="w-3.5 h-3.5" /> Write with AI
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — Real Industry Examples (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 mb-1">Real Cover Letter Examples</h2>
                <p className="text-slate-500 text-sm">
                  Real examples formatted for maximum recruiter response rates.
                </p>
              </div>

              <div className="space-y-3">
                {filteredExamples.map((ex) => (
                  <Link
                    key={ex.slug}
                    to={`/cover-letter/${ex.slug}`}
                    className="group flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-slate-200/90 bg-white hover:border-indigo-300 hover:shadow-md transition-all duration-200 gap-3"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0 group-hover:scale-105 transition-transform">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-extrabold text-slate-900 text-sm sm:text-base group-hover:text-indigo-600 transition-colors">
                            {ex.title}
                          </p>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-extrabold border border-emerald-200">
                            {ex.score}% Match
                          </span>
                        </div>
                        <p className="text-xs text-indigo-600 font-semibold mb-1">
                          {ex.role} at {ex.company}
                        </p>
                        <p className="text-xs text-slate-500 line-clamp-1">{ex.highlight}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <span className="text-xs font-bold text-indigo-600 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        Read Letter
                      </span>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-600 group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="py-16 px-4 sm:px-6 bg-gradient-to-r from-indigo-600 via-purple-600 to-blue-700 text-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-3 tracking-tight">
            Generate Your Personalized Cover Letter
          </h2>
          <p className="text-indigo-100 text-sm sm:text-base mb-8 max-w-xl mx-auto leading-relaxed">
            Our AI analyzes your CV achievements and tailors the letter directly to the hiring manager and company mission in seconds.
          </p>
          <Link
            to="/cover-letter/create"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-white text-indigo-700 font-extrabold text-base shadow-xl hover:shadow-2xl hover:bg-indigo-50 transition-all"
          >
            Open AI Cover Letter Studio <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
