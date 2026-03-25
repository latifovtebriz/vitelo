import { Link } from 'react-router-dom';
import { ArrowRight, FileText, Sparkles } from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';

const TEMPLATES = [
  { id: 'professional', name: 'Professional', desc: 'Perfect for finance, law, and corporate industries. Formal tone with structured paragraphs.', emoji: '👔', color: 'from-slate-700 to-slate-900' },
  { id: 'modern', name: 'Modern', desc: 'Clean and concise. Ideal for tech startups, SaaS, and engineering roles.', emoji: '💻', color: 'from-blue-500 to-indigo-600' },
  { id: 'simple', name: 'Simple', desc: 'Minimal formatting, straight to the point. Works for any industry.', emoji: '📄', color: 'from-slate-300 to-slate-400' },
  { id: 'creative', name: 'Creative', desc: 'Bold and expressive. Great for design, marketing, and media roles.', emoji: '🎨', color: 'from-pink-500 to-rose-500' },
];

const EXAMPLES = [
  { slug: 'nursing-cover-letter', title: 'Nursing Cover Letter', industry: 'Healthcare' },
  { slug: 'administrative-assistant-cover-letter', title: 'Administrative Assistant Cover Letter', industry: 'Business' },
  { slug: 'internship-cover-letter', title: 'Internship Cover Letter', industry: 'General' },
  { slug: 'graduate-cover-letter', title: 'Graduate Cover Letter', industry: 'General' },
  { slug: 'teacher-cover-letter', title: 'Teacher Cover Letter', industry: 'Education' },
  { slug: 'software-engineer-cover-letter', title: 'Software Engineer Cover Letter', industry: 'Tech' },
];

export default function CoverLetterExamples() {
  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* Hero */}
      <section className="pt-28 pb-16 px-4 sm:px-6 bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 mb-6 rounded-full bg-indigo-100 text-indigo-700 text-sm font-semibold border border-indigo-200">
            <FileText className="w-3.5 h-3.5" />
            AI-Powered Cover Letters
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 mb-4">
            Free Cover Letter Examples & Templates
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Browse professionally written cover letters by industry. Our AI personalizes it to match your CV and the job.
          </p>
        </div>
      </section>

      {/* Main Content — Two columns */}
      <section className="py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12">

            {/* LEFT — Templates */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Cover Letter Templates</h2>
              <p className="text-slate-500 mb-6">Choose a style — our AI fills in the rest.</p>
              <div className="grid sm:grid-cols-2 gap-5">
                {TEMPLATES.map(t => (
                  <div key={t.id} className="group rounded-2xl border border-slate-200 overflow-hidden bg-white hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 flex flex-col">
                    <div className={`h-32 bg-gradient-to-br ${t.color} flex items-center justify-center`}>
                      <span className="text-5xl group-hover:scale-110 transition-transform duration-300">{t.emoji}</span>
                    </div>
                    <div className="p-5 flex flex-col flex-1">
                      <h3 className="font-bold text-slate-800 mb-1">{t.name}</h3>
                      <p className="text-sm text-slate-500 leading-relaxed flex-1 mb-4">{t.desc}</p>
                      <Link to="/generate" className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold hover:from-blue-700 hover:to-indigo-700 transition-all">
                        <Sparkles className="w-3.5 h-3.5" /> Use Template
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT — Examples */}
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">Cover Letter Examples</h2>
              <p className="text-slate-500 mb-6">See real examples before generating yours.</p>
              <div className="space-y-3">
                {EXAMPLES.map(ex => (
                  <Link
                    key={ex.slug}
                    to={`/cover-letter/${ex.slug}`}
                    className="group flex items-center justify-between p-5 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 flex-shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-800 group-hover:text-blue-600 transition-colors">{ex.title}</p>
                        <p className="text-xs text-slate-400">{ex.industry}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-4 sm:px-6 bg-gradient-to-r from-indigo-600 to-violet-600">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold text-white mb-3">Generate your personalized cover letter</h2>
          <p className="text-indigo-100 mb-6">Our AI matches your CV data to the job description automatically.</p>
          <Link to="/generate" className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-white text-indigo-700 font-bold hover:shadow-xl transition-all">
            Generate My Cover Letter <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
