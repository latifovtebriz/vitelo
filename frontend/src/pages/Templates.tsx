import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  Star,
  CheckCircle2,
  Sparkles,
  Palette,
  Eye,
  X,
  Layers,
  FileCheck,
} from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';

interface TemplateItem {
  id: 'modern' | 'minimal' | 'executive' | 'compact';
  name: string;
  badge: string;
  category: 'tech' | 'executive' | 'creative' | 'minimal' | 'finance';
  ats: number;
  layout: string;
  description: string;
  bestFor: string[];
  features: string[];
  defaultColor: string;
  previewBg: string;
}

const TEMPLATES: TemplateItem[] = [
  {
    id: 'modern',
    name: 'Berlin Modern',
    badge: '🔥 Most Popular',
    category: 'tech',
    ats: 99,
    layout: 'Single Column with Accent Header',
    description:
      'Engineered for maximum ATS parsing while providing a modern, polished visual hierarchy. Features clean accent separators and high-impact metric badges.',
    bestFor: ['Software Engineers', 'DevOps & Cloud', 'Product Managers', 'Data Scientists'],
    features: ['100% ATS Safe', 'Keyword Highlighting', 'Custom Palette Support', 'Compact Bullet Spacing'],
    defaultColor: '#2563eb',
    previewBg: 'from-blue-600 to-indigo-700',
  },
  {
    id: 'minimal',
    name: 'Tokyo Minimalist',
    badge: '⚡ 100% ATS Pure',
    category: 'minimal',
    ats: 100,
    layout: 'Ultra-Clean Streamlined Column',
    description:
      'Zero-noise, pure typography layout favored by Fortune 500 recruiters and enterprise applicant tracking systems (Workday, Greenhouse, Taleo).',
    bestFor: ['Academic & Research', 'Software Architects', 'Corporate Counsel', 'Senior Engineering'],
    features: ['Zero Graphics / Clean Text', 'Highest Machine Readability', 'Maximum Content Density', 'High Print Contrast'],
    defaultColor: '#0f172a',
    previewBg: 'from-slate-700 to-slate-900',
  },
  {
    id: 'executive',
    name: 'Zurich Executive',
    badge: '👔 C-Suite & Leadership',
    category: 'executive',
    ats: 98,
    layout: 'Two-Column Strategic Grid',
    description:
      'Commanding two-column layout highlighting executive summaries, key career achievements, board roles, and high-level core competencies in a dedicated sidebar.',
    bestFor: ['VPs & Directors', 'Management Consultants', 'Finance Leaders', 'Chief Technology Officers'],
    features: ['Executive Summary Box', 'Sidebar Competencies Grid', 'Strategic Metric Cards', 'Sophisticated Typography'],
    defaultColor: '#4f46e5',
    previewBg: 'from-indigo-600 to-violet-800',
  },
  {
    id: 'compact',
    name: 'London Finance & Strategy',
    badge: '📈 Data & Quantitative',
    category: 'finance',
    ats: 99,
    layout: 'High-Density Metric Focused',
    description:
      'Designed specifically for quantitative roles where dense metrics, deal values, and technical stack lists need to fit cleanly onto a single authoritative page.',
    bestFor: ['Investment Bankers', 'Quantitative Analysts', 'Fintech Engineers', 'Operations Leads'],
    features: ['1-Page Dense Fit', 'Metric & $ Highlights', 'Technical Stack Grid', 'Standard Institutional Font'],
    defaultColor: '#059669',
    previewBg: 'from-emerald-600 to-teal-800',
  },
];

const PALETTE_SWATCHES = [
  { name: 'Electric Blue', hex: '#2563eb', bg: 'bg-blue-600' },
  { name: 'Emerald Green', hex: '#059669', bg: 'bg-emerald-600' },
  { name: 'Indigo Violet', hex: '#4f46e5', bg: 'bg-indigo-600' },
  { name: 'Slate Onyx', hex: '#0f172a', bg: 'bg-slate-900' },
  { name: 'Crimson Rose', hex: '#e11d48', bg: 'bg-rose-600' },
  { name: 'Amber Gold', hex: '#d97706', bg: 'bg-amber-600' },
];

const CATEGORIES = [
  { id: 'all', label: 'All Templates' },
  { id: 'tech', label: 'Tech & Engineering' },
  { id: 'executive', label: 'Executive & Leadership' },
  { id: 'finance', label: 'Finance & Strategy' },
  { id: 'minimal', label: 'Minimal & Pure ATS' },
];

export default function Templates() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [selectedColors, setSelectedColors] = useState<Record<string, string>>({
    modern: '#2563eb',
    minimal: '#0f172a',
    executive: '#4f46e5',
    compact: '#059669',
  });
  const [previewTemplate, setPreviewTemplate] = useState<TemplateItem | null>(null);

  const filteredTemplates = TEMPLATES.filter((t) => {
    if (activeCategory === 'all') return true;
    return t.category === activeCategory;
  });

  const handleColorPick = (templateId: string, hex: string) => {
    setSelectedColors((prev) => ({ ...prev, [templateId]: hex }));
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="pt-28 pb-14 px-4 sm:px-6 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200/80">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/60 text-blue-700 text-xs font-bold mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Recruiter-Approved & ATS-Certified Templates
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight mb-4">
            Professional CV Templates
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 mb-8 max-w-2xl mx-auto leading-relaxed">
            Every template is tested against top ATS software (Workday, Greenhouse, Taleo, Lever) to guarantee a 95%+ pass rate. Pick your favorite and let Gemini AI tailor it in seconds.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> 100% ATS Compliant
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Live Custom Palettes & Fonts
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" /> High-Resolution Vector PDF
            </span>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <div className="sticky top-16 z-30 bg-white/95 backdrop-blur border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center gap-2 py-3 overflow-x-auto scrollbar-hide">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex-shrink-0 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  activeCategory === cat.id
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Templates Showcase Grid */}
      <section className="py-12 px-4 sm:px-6 flex-1">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 lg:grid-cols-2 gap-8">
            {filteredTemplates.map((t) => {
              const activeColor = selectedColors[t.id] || t.defaultColor;

              return (
                <div
                  key={t.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden flex flex-col group"
                >
                  {/* Card Visual Preview Header */}
                  <div className="relative h-64 sm:h-72 bg-gradient-to-br from-slate-100 to-slate-200 p-6 flex items-center justify-center overflow-hidden border-b border-slate-100">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]" />

                    {/* Badge */}
                    <div className="absolute top-4 left-4 z-10">
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-white/95 backdrop-blur text-slate-800 shadow-sm border border-slate-200/60">
                        {t.badge}
                      </span>
                    </div>

                    {/* ATS Gauge Badge */}
                    <div className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-xs font-extrabold shadow-sm">
                      <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                      ATS {t.ats}%
                    </div>

                    {/* Miniature Interactive CV Sheet Rendering */}
                    <div className="relative w-56 sm:w-64 bg-white rounded-xl shadow-2xl border border-slate-300/80 p-4 transform group-hover:scale-105 transition-transform duration-300 flex flex-col gap-2">
                      {/* Header bar */}
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-extrabold text-sm shadow"
                          style={{ backgroundColor: activeColor }}
                        >
                          TL
                        </div>
                        <div className="flex-1 space-y-1">
                          <div
                            className="h-3 rounded font-bold text-[11px] leading-none flex items-center"
                            style={{ color: activeColor }}
                          >
                            TABRIZ LATIFOV
                          </div>
                          <div className="h-2 bg-slate-300 rounded w-2/3"></div>
                        </div>
                      </div>

                      {/* Accent divider line */}
                      <div
                        className="h-1 rounded-full w-full my-0.5"
                        style={{ backgroundColor: activeColor }}
                      />

                      {/* Content representation */}
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                          <div
                            className="text-[9px] font-extrabold uppercase tracking-wider"
                            style={{ color: activeColor }}
                          >
                            Experience
                          </div>
                          <div className="h-1.5 bg-slate-200 rounded w-1/4"></div>
                        </div>
                        <div className="space-y-1 pl-1 border-l-2 border-slate-200">
                          <div className="h-2 bg-slate-400 rounded w-3/4"></div>
                          <div className="h-1.5 bg-slate-200 rounded w-full"></div>
                          <div className="h-1.5 bg-slate-200 rounded w-5/6"></div>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div
                          className="text-[9px] font-extrabold uppercase tracking-wider"
                          style={{ color: activeColor }}
                        >
                          Core Skills
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {['C#', '.NET', 'PostgreSQL', 'Docker', 'AWS'].map((skill) => (
                            <span
                              key={skill}
                              className="text-[8px] font-semibold px-1.5 py-0.5 rounded text-white shadow-xs"
                              style={{ backgroundColor: activeColor }}
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Full Preview Hover Button */}
                    <button
                      onClick={() => setPreviewTemplate(t)}
                      className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-sm font-bold backdrop-blur-xs"
                    >
                      <Eye className="w-5 h-5" /> Quick Preview
                    </button>
                  </div>

                  {/* Template Meta & Details */}
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-xl font-bold text-slate-900">{t.name}</h3>
                      <div className="flex items-center gap-1 text-xs text-amber-500 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        5.0 (4.9k)
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 mb-4 leading-relaxed">{t.description}</p>

                    {/* Best For Tags */}
                    <div className="mb-4">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                        Recommended For
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {t.bestFor.map((role) => (
                          <span
                            key={role}
                            className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-medium"
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Color Swatches */}
                    <div className="mb-6 pt-3 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                        <Palette className="w-3.5 h-3.5 text-slate-400" /> Palette:
                      </div>
                      <div className="flex items-center gap-1.5">
                        {PALETTE_SWATCHES.map((swatch) => (
                          <button
                            key={swatch.hex}
                            onClick={() => handleColorPick(t.id, swatch.hex)}
                            title={swatch.name}
                            className={`w-5 h-5 rounded-full transition-transform ${
                              activeColor === swatch.hex
                                ? 'scale-125 ring-2 ring-offset-2 ring-slate-900'
                                : 'hover:scale-110 opacity-80 hover:opacity-100'
                            }`}
                            style={{ backgroundColor: swatch.hex }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <Link
                      to={`/generate?template=${t.id}&color=${encodeURIComponent(activeColor)}`}
                      className="mt-auto w-full inline-flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all group-hover:translate-y-[-1px]"
                    >
                      Use This Template <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Quick Preview Modal */}
      {previewTemplate && (
        <div
          className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          onClick={() => setPreviewTemplate(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewTemplate(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700">
                {previewTemplate.badge}
              </span>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                ATS Pass Rate: {previewTemplate.ats}%
              </span>
            </div>

            <h2 className="text-2xl font-extrabold text-slate-900 mb-2">{previewTemplate.name}</h2>
            <p className="text-slate-600 text-sm mb-6">{previewTemplate.description}</p>

            <div className="space-y-3 mb-8 bg-slate-50 p-4 rounded-2xl border border-slate-200">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Key Features</p>
              {previewTemplate.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                  {f}
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setPreviewTemplate(null)}
                className="flex-1 py-3 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50"
              >
                Close Preview
              </button>
              <Link
                to={`/generate?template=${previewTemplate.id}&color=${encodeURIComponent(
                  selectedColors[previewTemplate.id] || previewTemplate.defaultColor
                )}`}
                className="flex-1 py-3 rounded-xl bg-blue-600 text-white text-sm font-bold text-center hover:bg-blue-700 shadow-md flex items-center justify-center gap-2"
              >
                Start Editing in Studio <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Trust & Guarantee Section */}
      <section className="py-16 px-4 sm:px-6 bg-white border-t border-slate-200">
        <div className="max-w-4xl mx-auto text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-4">
            <Layers className="w-6 h-6" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-3">
            Why Vitelo Templates Beat Other CV Builders
          </h2>
          <p className="text-slate-600 text-sm sm:text-base max-w-xl mx-auto mb-10">
            Many builders use tables, text boxes, and complex graphics that crash ATS parsers. Vitelo structures every section with clean semantic HTML and standard CSS, guaranteeing your CV reaches human hiring managers.
          </p>

          <div className="grid sm:grid-cols-3 gap-6 text-left">
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <p className="text-base font-bold text-slate-900 mb-1">Standard Header Hierarchy</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Uses standard H1-H3 tagging and date formats that parse cleanly in Workday, Greenhouse, and Taleo.
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <p className="text-base font-bold text-slate-900 mb-1">Action-Verb Bullet Optimization</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pre-formatted spacing and typography to highlight Google XYZ metric structures (Accomplished X, measured by Y, by doing Z).
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200">
              <p className="text-base font-bold text-slate-900 mb-1">Pixel-Perfect Vector PDF</p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Selectable, searchable text on all devices without blurry rasterization or corrupted character encodings.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
