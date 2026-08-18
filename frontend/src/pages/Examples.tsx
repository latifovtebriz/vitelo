import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Search,
  Sparkles,
  FileCheck,
  ChevronRight,
  Zap,
} from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import { EXAMPLE_PROFILES } from '../data/exampleProfiles';
import type { ExampleCVProfile } from '../data/exampleProfiles';

const CATEGORIES = ['All', 'Tech', 'Business', 'Finance', 'Creative'];

export default function Examples() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const profilesList = Object.values(EXAMPLE_PROFILES);

  const filtered = profilesList.filter((ex) => {
    const matchCategory =
      activeCategory === 'All' ||
      ex.industry.toLowerCase() === activeCategory.toLowerCase() ||
      (activeCategory === 'Finance' && ex.slug.includes('financial'));
    const matchSearch =
      ex.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.personal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ex.skills.technical.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-28 pb-14 px-4 sm:px-6 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-bold mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            2026 Battle-Tested & ATS-Certified Resumes
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Professional CV Examples by Industry
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Browse real, recruiter-approved CV examples with 95%+ ATS scores. Pick any example and load it directly into our AI Studio to personalize it with your own experience.
          </p>

          {/* Search Box */}
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by job title, skill (e.g. .NET, React, Kubernetes), or name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base font-medium placeholder:text-slate-400"
            />
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Examples Grid */}
      <section className="py-12 px-4 sm:px-6 flex-1">
        <div className="max-w-7xl mx-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-slate-200/80 p-8 max-w-md mx-auto">
              <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-2xl">
                🔍
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-1">No exact matches found</h3>
              <p className="text-sm text-slate-500 mb-6">
                Try searching for another job title or clear your filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveCategory('All');
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors"
              >
                Reset Search
              </button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((ex: ExampleCVProfile) => (
                <div
                  key={ex.slug}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col overflow-hidden group"
                >
                  {/* Card Header Preview */}
                  <div className="p-6 pb-4 border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-2xl shadow-xs group-hover:scale-110 transition-transform">
                          {ex.emoji}
                        </div>
                        <div>
                          <h3 className="font-extrabold text-slate-900 text-base group-hover:text-blue-600 transition-colors leading-tight">
                            {ex.title}
                          </h3>
                          <p className="text-xs text-slate-500 font-medium">{ex.personal.name}</p>
                        </div>
                      </div>

                      {/* ATS Score */}
                      <span className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold shadow-xs">
                        <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                        {ex.ats_score}%
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                      {ex.personal.summary}
                    </p>
                  </div>

                  {/* Skills Pills */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Key Technologies & Skills
                      </p>
                      <div className="flex flex-wrap gap-1.5 mb-5">
                        {ex.skills.technical.slice(0, 5).map((skill) => (
                          <span
                            key={skill}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200/50"
                          >
                            {skill}
                          </span>
                        ))}
                        {ex.skills.technical.length > 5 && (
                          <span className="px-2 py-1 rounded-lg bg-slate-50 text-slate-400 text-xs font-semibold">
                            +{ex.skills.technical.length - 5} more
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-4 border-t border-slate-100">
                      <Link
                        to={`/examples/${ex.slug}`}
                        className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs text-center hover:bg-slate-50 transition-colors flex items-center justify-center gap-1"
                      >
                        View Full CV <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                      </Link>
                      <Link
                        to={`/generate?example=${ex.slug}`}
                        className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs text-center hover:bg-blue-700 shadow-sm transition-all flex items-center justify-center gap-1.5"
                      >
                        <Zap className="w-3.5 h-3.5" /> Use Template
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* AI Assistant Banner */}
      <section className="py-16 px-4 sm:px-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-xs font-bold mb-4 backdrop-blur-sm">
            <Sparkles className="w-3.5 h-3.5" /> 1-Click Resume Personalization
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold mb-4 tracking-tight">
            Ready to Build Your Winning Resume?
          </h2>
          <p className="text-blue-100 text-sm sm:text-base mb-8 max-w-2xl mx-auto leading-relaxed">
            Choose any template above or start from scratch. Our Gemini AI engine optimizes every bullet point for quantifiable impact, action verbs, and ATS compliance.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/generate"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white text-blue-700 font-extrabold text-base shadow-xl hover:shadow-2xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
            >
              Start Building — Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/checker"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-base border border-white/20 backdrop-blur-sm transition-all flex items-center justify-center gap-2"
            >
              Scan My Existing CV
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
