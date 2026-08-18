import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Star,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import LiveScannerWidget from '../components/landing/LiveScannerWidget';
import { useLanguageStore } from '../stores/languageStore';

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
    text: "Türkçe CV'imi İngilizceye çevirip ATS için optimize etti. 2 hafta içinde Dubai'dan iş teklifi aldım. Harika bir araç!",
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
    q: 'Is Vitelo really free to start?',
    a: 'Yes! Creating your CV and viewing a real-time live preview is completely free — no credit card required. You get 1 free clean download, and can upgrade for higher limits starting at $3.99.',
  },
  {
    q: 'How does the AI optimize for ATS systems?',
    a: 'Vitelo uses Gemini AI trained on 50,000+ successful tech and business resumes. It structures bullet points using the Google XYZ formula (Accomplished X, measured by Y, by doing Z) and injects target keywords from real job descriptions.',
  },
  {
    q: 'Can I translate my resume between Azerbaijani, Turkish, and English?',
    a: 'Yes! Our built-in AI Translator converts your experience into fluent executive English, German, Turkish, or Azerbaijani while keeping all technical frameworks (.NET, Docker, React, AWS) intact.',
  },
  {
    q: 'What is the difference between Basic, Pro, and Ultimate plans?',
    a: 'Basic gives you up to 3 CVs + 3 Cover Letters with clean templates. Pro expands to 5 CVs + 5 Cover Letters with Pro templates and 1-Click Job URL tailoring. Ultimate gives you 8 CVs + 8 Cover Letters, AI Multilingual Translation, LinkedIn Profile Optimizer, and Mock Interview simulator.',
  },
];

export default function Landing() {
  const { t } = useLanguageStore();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900 flex flex-col">
      <Navbar />

      {/* ── HERO SECTION ── */}
      <section className="relative pt-32 pb-16 sm:pb-20 px-4 sm:px-6 lg:px-8 overflow-hidden bg-gradient-to-b from-slate-50/80 via-white to-slate-50/50">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          {/* Trust Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50/90 border border-blue-200/80 text-blue-700 text-xs sm:text-sm font-extrabold mb-6 shadow-xs animate-fade-in">
            <Sparkles className="w-4 h-4 text-blue-600" />
            {t.hero.badge}
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.1] mb-6">
            {t.hero.titleStart}{' '}
            <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {t.hero.titleHighlight}
            </span>{' '}
            {t.hero.titleEnd}
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-slate-600 max-w-3xl mx-auto mb-9 leading-relaxed font-normal">
            {t.hero.subtitle}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 mb-8">
            <Link
              to="/generate"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-base shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 hover:from-blue-700 hover:to-indigo-700 transition-all hover:-translate-y-0.5"
            >
              {t.hero.ctaPrimary} <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/examples"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-4 rounded-2xl border border-slate-200 bg-white text-slate-700 font-bold text-base hover:bg-slate-50 hover:border-slate-300 transition-all shadow-xs"
            >
              {t.hero.ctaSecondary}
            </Link>
          </div>

          <p className="text-xs text-slate-400 font-medium">{t.hero.trustBadge}</p>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-14 pt-10 border-t border-slate-200/80">
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs">
              <p className="text-2xl sm:text-3xl font-black text-slate-900">10,000+</p>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">{t.hero.statCvs}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs">
              <p className="text-2xl sm:text-3xl font-black text-amber-500 flex items-center justify-center gap-1">
                4.8 <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
              </p>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">{t.hero.statRating}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs">
              <p className="text-2xl sm:text-3xl font-black text-emerald-600">95%+</p>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">{t.hero.statPass}</p>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-2xs">
              <p className="text-2xl sm:text-3xl font-black text-blue-600">50+</p>
              <p className="text-xs text-slate-500 font-semibold mt-0.5">{t.hero.statCountries}</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── 10-SECOND LIVE ATS SCANNER WIDGET ── */}
      <section className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8 bg-slate-950 relative">
        <div className="max-w-5xl mx-auto">
          <LiveScannerWidget />
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50/60 border-y border-slate-200/80">
        <div className="max-w-5xl mx-auto text-center">
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-widest bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            {t.howItWorks.tag}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3 mb-3">
            {t.howItWorks.title}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto mb-14">
            {t.howItWorks.subtitle}
          </p>

          <div className="grid md:grid-cols-3 gap-8 text-left">
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden">
              <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 font-black text-lg flex items-center justify-center mb-4">
                1
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg mb-2">
                {t.howItWorks.step1Title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t.howItWorks.step1Desc}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden">
              <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 font-black text-lg flex items-center justify-center mb-4">
                2
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg mb-2">
                {t.howItWorks.step2Title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t.howItWorks.step2Desc}
              </p>
            </div>

            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm relative overflow-hidden">
              <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 font-black text-lg flex items-center justify-center mb-4">
                3
              </div>
              <h3 className="font-extrabold text-slate-900 text-lg mb-2">
                {t.howItWorks.step3Title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {t.howItWorks.step3Desc}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── PRICING SECTION ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white" id="pricing">
        <div className="max-w-6xl mx-auto text-center">
          <span className="text-xs font-extrabold text-indigo-600 uppercase tracking-widest bg-indigo-50 px-3 py-1 rounded-full border border-indigo-200">
            {t.pricing.tag}
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight mt-3 mb-3">
            {t.pricing.title}
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto mb-14">
            {t.pricing.subtitle} · <span className="font-bold text-blue-600">{t.pricing.payAsYouGo}</span>
          </p>

          <div className="grid md:grid-cols-3 gap-8 text-left items-stretch">
            {/* Basic Plan */}
            <div className="p-8 rounded-3xl border border-slate-200 bg-slate-50/50 flex flex-col justify-between hover:shadow-lg transition-shadow">
              <div>
                <h3 className="font-extrabold text-slate-900 text-xl">{t.pricing.basicTitle}</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">{t.pricing.basicDesc}</p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-black text-slate-900">{t.pricing.basicPrice}</span>
                  <span className="text-xs text-slate-500 font-semibold">/ package</span>
                </div>
                <div className="px-3 py-1 rounded-lg bg-slate-200/80 text-slate-700 text-xs font-bold mb-6 inline-block">
                  {t.pricing.basicLimit}
                </div>

                <ul className="space-y-3 text-xs sm:text-sm text-slate-700 mb-8">
                  {t.pricing.basicFeatures.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                to="/dashboard-pricing"
                className="w-full py-3.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 font-bold text-sm text-center transition-colors shadow-2xs"
              >
                {t.pricing.basicCta}
              </Link>
            </div>

            {/* Pro Plan (Most Popular) */}
            <div className="p-8 rounded-3xl border-2 border-blue-600 bg-white shadow-xl flex flex-col justify-between relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-extrabold shadow-md">
                ⭐ MOST POPULAR
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-xl">{t.pricing.proTitle}</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">{t.pricing.proDesc}</p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-black text-blue-600">{t.pricing.proPrice}</span>
                  <span className="text-xs text-slate-500 font-semibold">/ package</span>
                </div>
                <div className="px-3 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold mb-6 inline-block">
                  {t.pricing.proLimit}
                </div>

                <ul className="space-y-3 text-xs sm:text-sm text-slate-700 mb-8">
                  {t.pricing.proFeatures.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                to="/dashboard-pricing"
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-extrabold text-sm text-center shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
              >
                {t.pricing.proCta}
              </Link>
            </div>

            {/* Ultimate Plan */}
            <div className="p-8 rounded-3xl border border-purple-200 bg-gradient-to-b from-purple-50/30 to-white flex flex-col justify-between hover:shadow-lg transition-shadow">
              <div>
                <h3 className="font-extrabold text-slate-900 text-xl">{t.pricing.ultimateTitle}</h3>
                <p className="text-xs text-slate-500 mt-1 mb-4">{t.pricing.ultimateDesc}</p>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-black text-purple-700">
                    {t.pricing.ultimatePrice}
                  </span>
                  <span className="text-xs text-slate-500 font-semibold">/ package</span>
                </div>
                <div className="px-3 py-1 rounded-lg bg-purple-100 text-purple-800 text-xs font-bold mb-6 inline-block">
                  {t.pricing.ultimateLimit}
                </div>

                <ul className="space-y-3 text-xs sm:text-sm text-slate-700 mb-8">
                  {t.pricing.ultimateFeatures.map((f, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-purple-600 flex-shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                to="/dashboard-pricing"
                className="w-full py-3.5 rounded-xl bg-slate-900 text-white font-bold text-sm text-center hover:bg-slate-800 transition-colors shadow-2xs"
              >
                {t.pricing.ultimateCta}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 border-t border-slate-200">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold text-slate-900">What Job Seekers Say</h2>
            <p className="text-slate-500 text-sm mt-2">Real feedback from job seekers across the globe</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, idx) => (
              <div key={idx} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between">
                <div className="flex gap-1 text-amber-400 mb-3">
                  {Array(t.stars)
                    .fill(0)
                    .map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400" />
                    ))}
                </div>
                <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed mb-6 flex-1">
                  "{t.text}"
                </p>
                <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.color} text-white font-bold text-xs flex items-center justify-center shadow-xs`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">{t.name}</p>
                    <p className="text-[11px] text-slate-400">{t.role} · {t.city}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-200">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-extrabold text-slate-900 text-center mb-10">
            Frequently Asked Questions
          </h2>

          <div className="space-y-3">
            {FAQ_ITEMS.map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50/50"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-5 text-left font-bold text-sm text-slate-900 flex items-center justify-between gap-4 hover:bg-slate-100/50 transition-colors"
                >
                  <span>{item.q}</span>
                  {openFaq === idx ? (
                    <ChevronUp className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                </button>
                {openFaq === idx && (
                  <div className="p-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-white">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
