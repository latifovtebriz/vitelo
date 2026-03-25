import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';
import { useState } from 'react';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';

const EXAMPLES = [
  // TECH
  { slug: 'software-engineer', title: 'Software Engineer', industry: 'Tech', emoji: '💻', popular: true },
  { slug: 'frontend-developer', title: 'Frontend Developer', industry: 'Tech', emoji: '🎨', popular: false },
  { slug: 'data-scientist', title: 'Data Scientist', industry: 'Tech', emoji: '📊', popular: true },
  { slug: 'devops-engineer', title: 'DevOps Engineer', industry: 'Tech', emoji: '⚙️', popular: false },
  { slug: 'product-manager', title: 'Product Manager', industry: 'Tech', emoji: '🗺️', popular: true },
  // BUSINESS
  { slug: 'marketing-manager', title: 'Marketing Manager', industry: 'Business', emoji: '📢', popular: false },
  { slug: 'financial-analyst', title: 'Financial Analyst', industry: 'Business', emoji: '📈', popular: true },
  { slug: 'hr-specialist', title: 'HR Specialist', industry: 'Business', emoji: '👥', popular: false },
  { slug: 'sales-representative', title: 'Sales Representative', industry: 'Business', emoji: '🤝', popular: false },
  { slug: 'project-manager', title: 'Project Manager', industry: 'Business', emoji: '📋', popular: true },
  // HEALTHCARE
  { slug: 'registered-nurse', title: 'Registered Nurse', industry: 'Healthcare', emoji: '🏥', popular: false },
  { slug: 'pharmacist', title: 'Pharmacist', industry: 'Healthcare', emoji: '💊', popular: false },
  // EDUCATION
  { slug: 'teacher', title: 'English Teacher', industry: 'Education', emoji: '📚', popular: false },
  { slug: 'academic-researcher', title: 'Academic Researcher', industry: 'Education', emoji: '🔬', popular: false },
  { slug: 'graphic-designer', title: 'Graphic Designer', industry: 'Creative', emoji: '🎭', popular: true },
];

const INDUSTRY_COLORS: Record<string, string> = {
  Tech: 'bg-blue-100 text-blue-700',
  Business: 'bg-purple-100 text-purple-700',
  Healthcare: 'bg-green-100 text-green-700',
  Education: 'bg-amber-100 text-amber-700',
  Creative: 'bg-pink-100 text-pink-700',
};

const CATEGORIES = ['All', 'Tech', 'Business', 'Healthcare', 'Education', 'Creative'];

export default function Examples() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = EXAMPLES.filter(ex => {
    const matchCategory = activeCategory === 'All' || ex.industry === activeCategory;
    const matchSearch = ex.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-14 px-4 sm:px-6 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4">
            Free CV Examples for Every Job Title
          </h1>
          <p className="text-xl text-slate-500 mb-8 max-w-2xl mx-auto">
            Browse professionally written CV examples by industry. Use any as a starting point — our AI will personalize it for you.
          </p>

          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by job title..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            />
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="sticky top-16 z-30 bg-white border-b border-slate-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex gap-2 py-3 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === cat
                    ? 'bg-blue-600 text-white shadow-sm'
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
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <p className="text-4xl mb-4">🔍</p>
              <p className="font-medium">No results found for "{searchQuery}"</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map(ex => (
                <div
                  key={ex.slug}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col"
                >
                  {/* Card visual */}
                  <div className="relative h-36 bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                    {ex.popular && (
                      <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-full bg-amber-400 text-white text-xs font-bold">
                        Popular
                      </div>
                    )}
                    <span className="text-5xl group-hover:scale-110 transition-transform duration-300">{ex.emoji}</span>
                    {/* Mini CV preview lines */}
                    <div className="absolute bottom-3 left-4 right-4 space-y-1 opacity-30">
                      <div className="h-1.5 bg-slate-400 rounded w-3/4"></div>
                      <div className="h-1 bg-slate-400 rounded w-1/2"></div>
                      <div className="h-1 bg-slate-400 rounded w-full"></div>
                    </div>
                  </div>

                  <div className="p-5 flex flex-col flex-1">
                    <span className={`self-start px-2.5 py-0.5 rounded-full text-xs font-semibold mb-2 ${INDUSTRY_COLORS[ex.industry] || 'bg-slate-100 text-slate-600'}`}>
                      {ex.industry}
                    </span>
                    <h3 className="font-bold text-slate-800 mb-4 flex-1">{ex.title} CV</h3>
                    <Link
                      to={`/examples/${ex.slug}`}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-slate-900 text-white text-sm font-semibold hover:bg-slate-800 transition-colors group-hover:bg-blue-600"
                    >
                      View Example <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 px-4 sm:px-6 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">Don't copy — let AI write yours</h2>
          <p className="text-blue-100 mb-6">These are just examples. Vitelo AI writes a personalized CV tailored to your experience in minutes.</p>
          <Link to="/generate" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-blue-700 font-bold hover:shadow-xl transition-all">
            Create My CV — It's Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
