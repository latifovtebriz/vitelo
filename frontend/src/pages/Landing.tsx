import { Link } from 'react-router-dom';
import { ArrowRight, Star, ChevronDown, ChevronUp, CheckCircle2, Zap } from 'lucide-react';
import { useState } from 'react';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';

// ── Data ───────────────────────────────────────────────────────────────────────

const STATS = [
  { value: '10,000+', label: 'CVs Created' },
  { value: '4.8★', label: 'Average Rating' },
  { value: '95%', label: 'ATS Pass Rate' },
  { value: '50+', label: 'Countries' },
];

const TESTIMONIALS = [
  {
    name: 'Əli Məmmədov',
    city: 'Baku, AZ',
    role: 'Software Engineer',
    text: 'Vitelo CV-mi Azərbaycan dilindən peşəkar ingilis dilinə çevirdi. London-dakı şirkətdən interview dəvəti gəldi. ATS skoru 91/100!',
    stars: 5,
    initials: 'ÄM',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    name: 'Aysel Huseynova',
    city: 'Istanbul, TR',
    role: 'Marketing Manager',
    text: 'Pro planı aldım. Cover letter o qədər peşəkar yazıldı ki, ilk həftə 3 müsahibəyə çağırıldım. Zety-dən çox daha sürətli!',
    stars: 5,
    initials: 'AH',
    color: 'from-pink-500 to-rose-500',
  },
  {
    name: 'James Okafor',
    city: 'London, UK',
    role: 'Data Analyst',
    text: 'The ATS optimization is incredible. My previous CV had a 43% score. Vitelo brought it to 89%. Got hired at a FTSE 100 company.',
    stars: 5,
    initials: 'JO',
    color: 'from-green-500 to-emerald-500',
  },
  {
    name: 'Sara Al-Rashid',
    city: 'Dubai, UAE',
    role: 'Finance Professional',
    text: 'The Interview Prep feature gave me exactly the questions I was asked. The AI answer suggestions were spot on. Worth every cent!',
    stars: 5,
    initials: 'SA',
    color: 'from-amber-500 to-orange-500',
  },
  {
    name: 'Mehmet Yıldız',
    city: 'Ankara, TR',
    role: 'Project Manager',
    text: 'Türkçe CV\'imi İngilizceye çevirip ATS için optimize etti. 2 hafta içinde Dubai\'dan iş teklifi aldım. Harika bir araç!',
    stars: 5,
    initials: 'MY',
    color: 'from-violet-500 to-purple-500',
  },
  {
    name: 'Nigar Aliyeva',
    city: 'Baku, AZ',
    role: 'HR Specialist',
    text: 'Ultimate plan ilə həm CV, həm Cover Letter, həm də 5 müsahibə sualı aldım. Hamısı 10 dəqiqə ərzində. Tam pul dəyər!',
    stars: 5,
    initials: 'NA',
    color: 'from-teal-500 to-cyan-500',
  },
];

const FAQ_ITEMS = [
  {
    q: 'Is Vitelo really free?',
    a: 'Yes! Creating your CV and viewing a watermarked preview is completely free — no credit card required. You only pay when you want to download the clean, high-resolution PDF. Plans start from just $3.',
  },
  {
    q: 'How does the AI write my CV?',
    a: 'Vitelo uses Google\'s Gemini 1.5 Flash AI model. You fill in your basic information, and the AI transforms it into professional, ATS-optimized bullet points with strong action verbs and quantified achievements. It writes better than most professional CV writers.',
  },
  {
    q: 'What is an ATS score and why does it matter?',
    a: 'An Applicant Tracking System (ATS) is software used by 98% of Fortune 500 companies to automatically filter CVs before a human sees them. Vitelo checks your CV against 40+ ATS criteria and gives you a score from 0-100. A score above 80 means you\'ll pass most ATS filters.',
  },
  {
    q: 'Can it translate my Azerbaijani or Turkish CV to English?',
    a: 'Absolutely! This is one of Vitelo\'s most popular features. Simply fill in the form in Azerbaijani or Turkish, and the AI automatically translates and professionalize everything into polished English. Perfect for applying to international jobs.',
  },
  {
    q: 'How is Vitelo different from Zety or Resume.io?',
    a: 'Vitelo uses cutting-edge AI to actually write your CV content, not just format it. We offer AI-powered ATS scoring, automatic translation from AZ/TR to EN, cover letter generation, and interview prep — all at up to 5x lower prices than Zety. We also support payment from Azerbaijan (Lemon Squeezy).',
  },
];

const HOW_IT_WORKS = [
  { icon: '📝', step: '1', title: 'Fill Your Details', desc: 'Enter your experience and skills in any language. Takes under 5 minutes.' },
  { icon: '🤖', step: '2', title: 'AI Optimizes', desc: 'Gemini AI rewrites everything into ATS-ready, professional English.' },
  { icon: '📄', step: '3', title: 'Download & Apply', desc: 'Get a clean PDF. Apply with confidence to top companies worldwide.' },
];

// ── Component ────────────────────────────────────────────────────────────────

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`border rounded-xl transition-all duration-200 ${open ? 'border-blue-200 bg-blue-50/50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-6 py-5 text-left"
      >
        <span className={`text-base font-semibold ${open ? 'text-blue-700' : 'text-slate-800'}`}>{q}</span>
        {open
          ? <ChevronUp className="w-5 h-5 text-blue-500 flex-shrink-0" />
          : <ChevronDown className="w-5 h-5 text-slate-400 flex-shrink-0" />
        }
      </button>
      {open && (
        <div className="px-6 pb-5">
          <p className="text-slate-600 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      <Navbar />

      {/* ── Hero ── */}
      <section className="pt-28 pb-20 px-4 sm:px-6 bg-gradient-to-b from-slate-50 via-blue-50/30 to-white overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.12),rgba(255,255,255,0))]" />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold border border-blue-200">
            <Zap className="w-3.5 h-3.5" />
            AI-Powered · ATS-Optimized · Free to Start
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 leading-tight mb-6">
            Build a{' '}
            <span className="relative">
              <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent">
                job-winning CV
              </span>
              <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 8" fill="none">
                <path d="M0 6 Q75 2 150 5 Q225 8 300 4" stroke="url(#grad)" strokeWidth="2.5" strokeLinecap="round" />
                <defs>
                  <linearGradient id="grad" x1="0" x2="300" y1="0" y2="0" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#2563eb"/><stop offset="1" stopColor="#7c3aed"/>
                  </linearGradient>
                </defs>
              </svg>
            </span>{' '}
            with AI
          </h1>

          <p className="text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Fill in your details — our AI writes, translates, and ATS-optimizes your CV in seconds. Used by 10,000+ job seekers from Baku to London.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/generate" className="group w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-base shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 hover:-translate-y-0.5 transition-all duration-200">
              Create Your CV — It's Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link to="/examples" className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold text-base hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 shadow-sm">
              View CV Examples
            </Link>
          </div>

          <p className="mt-5 text-sm text-slate-400">✓ No credit card · ✓ No sign up needed to preview · ✓ ATS scored instantly</p>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="py-10 border-y border-slate-100 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {STATS.map(stat => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{stat.value}</p>
                <p className="text-sm text-slate-500 font-medium mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it Works ── */}
      <section className="py-20 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">How it works</h2>
            <p className="mt-3 text-lg text-slate-500">From blank page to job-ready CV in 3 steps</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map(step => (
              <div key={step.step} className="relative bg-white rounded-2xl border border-slate-200 p-8 shadow-sm text-center group hover:shadow-md hover:-translate-y-1 transition-all duration-200">
                <div className="text-4xl mb-4">{step.icon}</div>
                <div className="absolute top-4 right-4 w-7 h-7 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">{step.step}</div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Everything you need to land the job</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: '🤖', title: 'AI CV Writing', desc: 'Gemini AI transforms your raw notes into polished, professional bullet points with action verbs.' },
              { icon: '🌐', title: 'AZ / TR → EN Translation', desc: 'Write in Azerbaijani or Turkish. AI automatically translates to professional English.' },
              { icon: '📊', title: 'ATS Score (0–100)', desc: 'Know exactly how your CV performs against Applicant Tracking Systems before applying.' },
              { icon: '✉️', title: 'Cover Letter Generator', desc: 'Personalized cover letter matching your CV to the specific job description. Pro plan.' },
              { icon: '🎤', title: 'Interview Prep', desc: '5 custom interview Q&As generated from your CV and job description. Ultimate plan.' },
              { icon: '💰', title: 'AZ-Friendly Payments', desc: 'Pay in USD via Lemon Squeezy from Azerbaijan. Starts at just $3 per CV.' },
            ].map(f => (
              <div key={f.title} className="border border-slate-200 rounded-2xl p-6 bg-white hover:shadow-md hover:border-blue-200 transition-all duration-200 group">
                <div className="text-3xl mb-3">{f.icon}</div>
                <h3 className="font-bold text-slate-800 mb-1.5 group-hover:text-blue-600 transition-colors">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">What job seekers are saying</h2>
            <p className="mt-3 text-slate-500 text-lg">Real results from real people across the world</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{t.name}</p>
                    <p className="text-xs text-slate-500">{t.role} · {t.city}</p>
                  </div>
                </div>
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-600 text-sm leading-relaxed">"{t.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Pricing ── */}
      <section className="py-20 px-4 sm:px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Simple, transparent pricing</h2>
            <p className="mt-3 text-slate-500 text-lg">Start free. Pay only when you're ready to download your perfect CV.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Basic', price: '$3', period: '/cv', badge: null, color: 'border-slate-200', features: ['High-res PDF, no watermark', 'ATS-optimized CV', 'Gemini AI writing', 'AZ/TR → EN translation'], cta: 'Get Basic' },
              { name: 'Pro', price: '$5.99', period: '/cv', badge: '🔥 Most Popular', color: 'border-blue-500 ring-2 ring-blue-500', features: ['Everything in Basic', 'Custom Cover Letter', 'Tone matching (formal/creative)', 'Priority support'], cta: 'Get Pro' },
              { name: 'Ultimate', price: '$8.99', period: '/cv', badge: '🏆 Best Value', color: 'border-slate-200', features: ['Everything in Pro', '5 Interview Q&As', 'Job match analysis', 'Comprehensive prep guide'], cta: 'Get Ultimate' },
            ].map(plan => (
              <div key={plan.name} className={`relative rounded-2xl border-2 ${plan.color} bg-white p-7 flex flex-col`}>
                {plan.badge && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 whitespace-nowrap px-4 py-1 rounded-full bg-blue-600 text-white text-xs font-bold shadow">
                    {plan.badge}
                  </div>
                )}
                <h3 className="text-xl font-bold text-slate-800 mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                  <span className="text-slate-400 font-medium">{plan.period}</span>
                </div>
                <ul className="space-y-3 flex-1 mb-6">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link to="/generate" className={`w-full text-center py-3 rounded-xl text-sm font-bold transition-all ${plan.badge ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-200' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-20 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900">Frequently asked questions</h2>
            <p className="mt-3 text-slate-500">Everything you need to know about Vitelo</p>
          </div>
          <div className="space-y-3">
            {FAQ_ITEMS.map(item => (
              <FAQItem key={item.q} q={item.q} a={item.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4">Ready to land your dream job?</h2>
          <p className="text-blue-100 text-lg mb-8">Join 10,000+ job seekers who built their CV with Vitelo.</p>
          <Link to="/generate" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-blue-600 font-bold text-base shadow-xl hover:shadow-2xl hover:-translate-y-0.5 transition-all duration-200">
            Create My CV — Free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
