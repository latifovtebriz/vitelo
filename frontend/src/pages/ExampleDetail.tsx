import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Star,
  Download,
  Copy,
  Check,
  Zap,
  Briefcase,
  GraduationCap,
  Sparkles,
  FileCheck,
  Linkedin,
  Github,
  Globe,
  Mail,
  Phone,
  MapPin,
} from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import { EXAMPLE_PROFILES } from '../data/exampleProfiles';

export default function ExampleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [copied, setCopied] = useState(false);

  const profile = (slug && EXAMPLE_PROFILES[slug]) ? EXAMPLE_PROFILES[slug] : EXAMPLE_PROFILES['software-engineer'];

  const handleCopyText = async () => {
    const textLines = [
      `${profile.personal.name} - ${profile.personal.headline}`,
      `${profile.personal.email} | ${profile.personal.phone} | ${profile.personal.location}`,
      profile.personal.linkedin ? `LinkedIn: ${profile.personal.linkedin}` : '',
      profile.personal.github ? `GitHub: ${profile.personal.github}` : '',
      '',
      'PROFESSIONAL SUMMARY',
      profile.personal.summary,
      '',
      'WORK EXPERIENCE',
      ...profile.experience.map(
        (exp) =>
          `${exp.job_title} | ${exp.company} (${exp.start_date} - ${exp.end_date || 'Present'})\n${exp.description}`
      ),
      '',
      'EDUCATION',
      ...profile.education.map(
        (edu) => `${edu.degree} - ${edu.institution} (${edu.graduation_year || edu.start_date})`
      ),
      '',
      'TECHNICAL SKILLS',
      profile.skills.technical.join(', '),
    ]
      .filter(Boolean)
      .join('\n');

    await navigator.clipboard.writeText(textLines);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Navbar />

      {/* Header Breadcrumb Banner */}
      <section className="pt-24 pb-8 px-4 sm:px-6 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
              <Link to="/examples" className="text-blue-600 hover:underline">
                CV Examples
              </Link>
              <span>/</span>
              <span className="text-slate-400 capitalize">{profile.industry}</span>
              <span>/</span>
              <span className="text-slate-800 font-bold">{profile.title}</span>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {profile.title} CV Example
              </h1>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold shadow-xs">
                <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                ATS Score {profile.ats_score}%
              </span>
            </div>
            <p className="mt-1 text-slate-500 text-xs sm:text-sm">
              Approved by tech recruiters · Optimized with Google XYZ metrics & action verbs
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <button
              onClick={handleCopyText}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-bold text-xs hover:bg-slate-50 transition-colors shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" /> Copied Text!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" /> Copy Text
                </>
              )}
            </button>

            <Link
              to={`/generate?example=${profile.slug}`}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              <Zap className="w-3.5 h-3.5" /> Use This Template in Studio
            </Link>
          </div>
        </div>
      </section>

      {/* Main Content Layout */}
      <section className="py-10 px-4 sm:px-6 flex-1">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-8">
          {/* Left: Rendered Real CV Sheet */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg overflow-hidden">
              {/* CV Top Header */}
              <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-8 text-white">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                  {profile.personal.name}
                </h2>
                <p className="text-blue-300 text-sm font-semibold mt-1">
                  {profile.personal.headline}
                </p>

                <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4 text-xs text-slate-300">
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-blue-400" /> {profile.personal.email}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-blue-400" /> {profile.personal.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-blue-400" /> {profile.personal.location}
                  </span>
                  {profile.personal.linkedin && (
                    <span className="flex items-center gap-1">
                      <Linkedin className="w-3.5 h-3.5 text-blue-400" /> {profile.personal.linkedin}
                    </span>
                  )}
                  {profile.personal.github && (
                    <span className="flex items-center gap-1">
                      <Github className="w-3.5 h-3.5 text-blue-400" /> {profile.personal.github}
                    </span>
                  )}
                </div>
              </div>

              {/* CV Body Sections */}
              <div className="p-8 space-y-8">
                {/* Summary */}
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-blue-600 mb-2 pb-1 border-b border-blue-100 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Professional Summary
                  </h3>
                  <p className="text-sm text-slate-700 leading-relaxed font-normal">
                    {profile.personal.summary}
                  </p>
                </div>

                {/* Experience */}
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-blue-600 mb-4 pb-1 border-b border-blue-100 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" /> Work Experience
                  </h3>

                  <div className="space-y-6">
                    {profile.experience.map((exp, idx) => (
                      <div key={idx} className="relative pl-4 border-l-2 border-slate-200">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                          <h4 className="font-extrabold text-slate-900 text-sm">{exp.job_title}</h4>
                          <span className="text-xs text-slate-500 font-medium">
                            {exp.start_date} – {exp.is_current ? 'Present' : exp.end_date}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-blue-700 mb-2">{exp.company} · {exp.location}</p>
                        <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-line">
                          {exp.description}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Education */}
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-blue-600 mb-4 pb-1 border-b border-blue-100 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5" /> Education
                  </h3>

                  <div className="space-y-4">
                    {profile.education.map((edu, idx) => (
                      <div key={idx} className="flex items-start justify-between">
                        <div>
                          <h4 className="font-extrabold text-slate-900 text-sm">{edu.degree}</h4>
                          <p className="text-xs text-slate-600 font-medium">{edu.institution} · {edu.location}</p>
                          {edu.gpa && <p className="text-xs text-slate-400 mt-0.5">GPA: {edu.gpa}</p>}
                        </div>
                        <span className="text-xs text-slate-500 font-semibold">
                          {edu.graduation_year || edu.start_date}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technical Skills */}
                <div>
                  <h3 className="text-xs font-extrabold uppercase tracking-widest text-blue-600 mb-3 pb-1 border-b border-blue-100">
                    Core Technical Skills & Tools
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.technical.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold shadow-2xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Languages & Certs */}
                <div className="grid sm:grid-cols-2 gap-6 pt-4 border-t border-slate-100">
                  {profile.certifications && profile.certifications.length > 0 && (
                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 mb-2">
                        Certifications
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-700">
                        {profile.certifications.map((c) => (
                          <li key={c} className="flex items-center gap-1.5 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                            {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {profile.languages && profile.languages.length > 0 && (
                    <div>
                      <h4 className="text-xs font-extrabold uppercase tracking-widest text-slate-500 mb-2">
                        Languages
                      </h4>
                      <div className="space-y-1 text-xs text-slate-700 font-medium">
                        {profile.languages.map((l) => (
                          <div key={l.name} className="flex justify-between">
                            <span>{l.name}</span>
                            <span className="text-slate-400">{l.proficiency}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: ATS & Optimization Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            {/* Direct Studio CTA Card */}
            <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-6 text-white shadow-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold mb-3 backdrop-blur-xs">
                <Zap className="w-3.5 h-3.5 text-amber-300" />
                1-Click Load into Studio
              </div>
              <h3 className="text-xl font-extrabold mb-2">Make this CV yours in 60 seconds</h3>
              <p className="text-blue-100 text-xs sm:text-sm mb-6 leading-relaxed">
                Clicking below will pre-load all sections into our Live Split-Screen Studio. Then customize your personal details and let Gemini AI tailor it to your dream job.
              </p>
              <Link
                to={`/generate?example=${profile.slug}`}
                className="w-full py-3.5 rounded-2xl bg-white text-blue-700 font-extrabold text-sm text-center shadow-lg hover:shadow-xl hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
              >
                Customize in AI Studio <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* ATS Score Breakdown */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-extrabold text-slate-900 text-sm">ATS Diagnostic Score</h4>
                <span className="text-lg font-extrabold text-emerald-600">
                  {profile.ats_score}/100
                </span>
              </div>

              <div className="w-full h-2 rounded-full bg-slate-100 mb-6 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                  style={{ width: `${profile.ats_score}%` }}
                />
              </div>

              <div className="space-y-3 text-xs">
                {[
                  { label: 'Action Verbs Usage', val: 'Excellent (100%)', pass: true },
                  { label: 'Google XYZ Metrics Included', val: 'High Impact (95%)', pass: true },
                  { label: 'Keyword Density & Match', val: 'Optimal (98%)', pass: true },
                  { label: 'Header & Section Hierarchy', val: '100% Machine Readable', pass: true },
                ].map((item, i) => (
                  <div key={i} className="flex items-center justify-between text-slate-700">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      {item.label}
                    </span>
                    <span className="font-bold text-slate-900">{item.val}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Action Verbs Pill Box */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h4 className="font-extrabold text-slate-900 text-sm mb-2">
                Power Action Verbs Used
              </h4>
              <p className="text-xs text-slate-500 mb-4">
                These verbs significantly boost recruiter response rates:
              </p>
              <div className="flex flex-wrap gap-1.5">
                {[
                  'Architected',
                  'Engineered',
                  'Spearheaded',
                  'Automated',
                  'Deployed',
                  'Reduced',
                  'Scaled',
                  'Trained',
                  'Optimized',
                  'Led',
                ].map((verb) => (
                  <span
                    key={verb}
                    className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 text-xs font-bold border border-blue-100"
                  >
                    {verb}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Examples Carousel */}
      <section className="py-12 px-4 sm:px-6 bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto">
          <h3 className="text-xl font-extrabold text-slate-900 mb-6">
            Other Popular CV Examples
          </h3>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
            {Object.values(EXAMPLE_PROFILES)
              .filter((p) => p.slug !== profile.slug)
              .slice(0, 3)
              .map((other) => (
                <Link
                  key={other.slug}
                  to={`/examples/${other.slug}`}
                  className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all group flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{other.emoji}</div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-sm group-hover:text-blue-600 transition-colors">
                        {other.title}
                      </h4>
                      <span className="text-xs text-slate-400 font-medium">
                        ATS {other.ats_score}%
                      </span>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
