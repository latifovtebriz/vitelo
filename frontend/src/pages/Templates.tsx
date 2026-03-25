import { Link } from 'react-router-dom';
import { ArrowRight, Star as StarIcon } from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';

const TEMPLATES = [
  {
    id: 'modern-blue',
    name: 'Modern Blue',
    badge: 'Free',
    ats: '98',
    emoji: '🔷',
    description: 'Clean, professional layout with a blue accent header. Perfect for tech roles.',
    bg: 'from-blue-500 to-cyan-400',
  },
  {
    id: 'professional',
    name: 'Professional',
    badge: 'Free',
    ats: '96',
    emoji: '📊',
    description: 'Classic two-column design favored by recruiters in finance and consulting.',
    bg: 'from-slate-700 to-slate-900',
  },
  {
    id: 'minimal',
    name: 'Minimal',
    badge: 'Free',
    ats: '99',
    emoji: '⬜',
    description: 'Ultra-clean single-column layout. Maximum ATS compatibility.',
    bg: 'from-slate-200 to-slate-300',
    textLight: false,
  },
  {
    id: 'executive',
    name: 'Executive',
    badge: 'Free',
    ats: '95',
    emoji: '👔',
    description: 'Bold, commanding design for senior professionals and C-suite positions.',
    bg: 'from-indigo-700 to-violet-800',
  },
  {
    id: 'creative',
    name: 'Creative',
    badge: 'Free',
    ats: '91',
    emoji: '🎨',
    description: 'Stylish accent bars. Great for designers, marketers, and creatives.',
    bg: 'from-pink-500 to-rose-500',
  },
  {
    id: 'ats-pure',
    name: 'ATS Pure',
    badge: '⚡ Recommended',
    ats: '100',
    emoji: '🎯',
    description: 'Plain text format optimized for maximum ATS parsing. Zero risk of rejection.',
    bg: 'from-green-500 to-emerald-600',
    hot: true,
  },
];

export default function Templates() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-14 px-4 sm:px-6 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4">
            Professional CV Templates
          </h1>
          <p className="text-xl text-slate-500 mb-8 max-w-2xl mx-auto">
            Every template is ATS-tested and professionally designed. Pick one — our AI does the rest.
          </p>
          <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
            <span className="flex items-center gap-1.5">✓ All free to use</span>
            <span className="flex items-center gap-1.5">✓ ATS-scored</span>
            <span className="flex items-center gap-1.5">✓ Mobile-responsive PDF</span>
          </div>
        </div>
      </section>

      {/* Templates Grid */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {TEMPLATES.map(t => (
              <div
                key={t.id}
                className="group rounded-2xl border border-slate-200 overflow-hidden bg-white hover:shadow-xl hover:-translate-y-1 transition-all duration-200 flex flex-col"
              >
                {/* Thumbnail */}
                <div className={`relative h-52 bg-gradient-to-br ${t.bg} flex items-center justify-center`}>
                  {t.hot && (
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-white text-xs font-bold">
                      ⚡ Best for ATS
                    </div>
                  )}
                  <div className="text-7xl opacity-80 group-hover:scale-110 transition-transform duration-300">
                    {t.emoji}
                  </div>
                  {/* Preview lines */}
                  <div className="absolute bottom-4 left-6 right-6 space-y-1.5 opacity-40">
                    <div className="h-2 bg-white/70 rounded w-3/4"></div>
                    <div className="h-1.5 bg-white/50 rounded w-1/2"></div>
                    <div className="h-1.5 bg-white/50 rounded w-5/6"></div>
                  </div>
                </div>

                {/* Info */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-bold text-slate-800">{t.name}</h3>
                    <div className="flex gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${t.hot ? 'bg-green-100 text-green-700' : 'bg-blue-50 text-blue-600'}`}>
                        {t.badge}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 mb-3">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                      ATS Score: {t.ats}+
                    </span>
                    <div className="flex gap-0.5">
                      {Array(5).fill(0).map((_, i) => (
                        <StarIcon key={i} className="w-3 h-3 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                  </div>

                  <p className="text-sm text-slate-500 leading-relaxed flex-1 mb-5">{t.description}</p>

                  <Link
                    to="/generate"
                    className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold shadow hover:shadow-md hover:from-blue-700 hover:to-indigo-700 transition-all"
                  >
                    Use This Template <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 bg-slate-50 border-t">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Not sure which to pick?</h2>
          <p className="text-slate-500 mb-6">Let our AI recommend the best template based on your job industry automatically.</p>
          <Link to="/generate" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold hover:bg-slate-800 transition-colors">
            Let AI Decide <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
