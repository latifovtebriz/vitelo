import { Link, useParams } from 'react-router-dom';
import { ArrowRight, CheckCircle2, Star, Download } from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';

// ── Hardcoded example CV data ─────────────────────────────────────────────────
const EXAMPLE_CVS: Record<string, any> = {
  'software-engineer': {
    title: 'Software Engineer',
    industry: 'Tech',
    ats_score: 94,
    personal: {
      name: 'Alex Johnson',
      email: 'alex.johnson@email.com',
      phone: '+1 (555) 234-5678',
      location: 'San Francisco, CA',
      linkedin: 'linkedin.com/in/alexjohnson',
    },
    summary:
      'Results-driven Software Engineer with 5+ years of experience designing and implementing scalable distributed systems. Led backend development at two Series B startups, reducing API latency by 40% and cutting infrastructure costs by $180K annually. Proficient in Python, Go, and cloud-native architectures.',
    experience: [
      {
        title: 'Senior Software Engineer',
        company: 'TechFlow Inc.',
        period: 'Jan 2022 – Present',
        bullets: [
          'Architected and deployed a microservices platform serving 2M+ daily active users with 99.97% uptime.',
          'Led a team of 6 engineers to migrate legacy monolith to Kubernetes, reducing deployment time by 70%.',
          'Implemented ML-powered recommendation engine that increased user engagement by 35%.',
        ],
      },
      {
        title: 'Software Engineer',
        company: 'DataStream Ltd.',
        period: 'Mar 2020 – Dec 2021',
        bullets: [
          'Built real-time data pipeline processing 500K events/day using Apache Kafka and Spark.',
          'Reduced API response time from 850ms to 120ms through caching strategies and query optimization.',
          'Delivered RESTful APIs consumed by 3 mobile apps with 400K+ combined downloads.',
        ],
      },
    ],
    education: [
      {
        degree: 'B.Sc. Computer Science',
        institution: 'University of California, Berkeley',
        year: '2020',
        gpa: '3.8',
      },
    ],
    skills: {
      technical: ['Python', 'Go', 'TypeScript', 'React', 'PostgreSQL', 'Redis', 'Kubernetes', 'AWS', 'Docker'],
      soft: ['Leadership', 'Problem Solving', 'Agile/Scrum', 'Technical Mentoring'],
      languages: ['English (Native)', 'Spanish (B2)'],
    },
    certifications: ['AWS Certified Solutions Architect', 'Google Cloud Professional Developer'],
  },
  'frontend-developer': {
    title: 'Frontend Developer',
    industry: 'Tech',
    ats_score: 91,
    personal: { name: 'Maria Chen', email: 'maria.chen@email.com', phone: '+44 7700 900123', location: 'London, UK', linkedin: 'linkedin.com/in/mariachen' },
    summary: 'Creative Frontend Developer with 4 years specializing in React and performance optimization. Reduced Core Web Vitals scores by 60% at two fintech companies. Strong eye for UX and accessibility.',
    experience: [
      { title: 'Frontend Developer', company: 'FinanceApp UK', period: '2022 – Present', bullets: ['Built reusable component library reducing dev time by 40%.', 'Improved Lighthouse performance score from 54 to 97.', 'Integrated real-time trading charts using WebSocket and D3.js.'] },
      { title: 'Junior Frontend Dev', company: 'WebStudio London', period: '2020 – 2022', bullets: ['Delivered 12+ responsive websites for SME clients.', 'Introduced accessibility testing (WCAG 2.1 AA) across all projects.'] },
    ],
    education: [{ degree: 'B.Sc. Computer Science', institution: 'Imperial College London', year: '2020', gpa: null }],
    skills: { technical: ['React', 'TypeScript', 'Next.js', 'TailwindCSS', 'GraphQL', 'Figma', 'Jest'], soft: ['Attention to Detail', 'UX Thinking', 'Collaboration'], languages: ['English (Native)', 'Mandarin (Native)'] },
    certifications: ['Meta React Developer', 'Google UX Design Certificate'],
  },
  'data-scientist': {
    title: 'Data Scientist',
    industry: 'Tech',
    ats_score: 96,
    personal: { name: 'Dr. Farrukh Tashkentov', email: 'farrukh.t@email.com', phone: '+49 176 12345678', location: 'Berlin, DE', linkedin: 'linkedin.com/in/farrukhdata' },
    summary: 'Data Scientist with a PhD in Statistics and 6 years of industry experience. Built ML models deployed in production at scale, including a fraud detection system saving €2.4M annually.',
    experience: [
      { title: 'Senior Data Scientist', company: 'N26 Bank', period: '2021 – Present', bullets: ['Developed real-time fraud detection model (XGBoost) with 99.2% precision.', 'Reduced false positives by 62% through feature engineering and threshold calibration.', 'Built automated MLOps pipeline using MLflow and Airflow.'] },
      { title: 'Data Scientist', company: 'Zalando SE', period: '2019 – 2021', bullets: ['Recommendation engine improving CTR by 28%.', 'A/B tested 15+ experiments using Bayesian statistics.'] },
    ],
    education: [{ degree: 'PhD Statistics', institution: 'Humboldt University Berlin', year: '2019', gpa: 'Summa Cum Laude' }],
    skills: { technical: ['Python', 'R', 'SQL', 'TensorFlow', 'Scikit-learn', 'Spark', 'Tableau', 'AWS SageMaker'], soft: ['Statistical Thinking', 'Storytelling', 'Research'], languages: ['English (C1)', 'German (B2)', 'Russian (Native)'] },
    certifications: ['AWS Machine Learning Specialty', 'Databricks Certified'],
  },
};

// Fallback for unknown slugs
const FALLBACK = EXAMPLE_CVS['software-engineer'];

export default function ExampleDetail() {
  const { slug } = useParams<{ slug: string }>();
  const cv = (slug && EXAMPLE_CVS[slug]) ? EXAMPLE_CVS[slug] : FALLBACK;

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* Page header */}
      <section className="pt-24 pb-8 px-4 sm:px-6 bg-gradient-to-b from-slate-50 to-white border-b">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Link to="/examples" className="text-sm text-blue-600 hover:underline">← CV Examples</Link>
              <span className="text-slate-300">/</span>
              <span className="text-sm text-slate-500">{cv.title}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{cv.title} CV Example</h1>
            <p className="mt-1 text-slate-500 text-sm">Professionally written · ATS Score: <span className="font-bold text-green-600">{cv.ats_score}/100</span></p>
          </div>

          {/* Side CTAs */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link to="/generate" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm shadow hover:shadow-md hover:-translate-y-0.5 transition-all">
              Use as Template <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/checker" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-700 font-semibold text-sm hover:border-slate-300 hover:bg-slate-50 transition-all">
              Check My CV Score
            </Link>
          </div>
        </div>
      </section>

      {/* CV Preview */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-8">

            {/* CV Document */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                {/* CV Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-8 text-white">
                  <h2 className="text-2xl font-bold">{cv.personal.name}</h2>
                  <p className="text-blue-100 text-sm mt-1">{cv.title}</p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-blue-100">
                    <span>✉ {cv.personal.email}</span>
                    <span>✆ {cv.personal.phone}</span>
                    <span>⌖ {cv.personal.location}</span>
                    <span>in {cv.personal.linkedin}</span>
                  </div>
                </div>

                <div className="px-8 py-6 space-y-7">
                  {/* Summary */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-blue-600 border-b border-slate-200 pb-2 mb-3">Professional Summary</h3>
                    <p className="text-slate-700 text-sm leading-relaxed">{cv.summary}</p>
                  </div>

                  {/* Experience */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-blue-600 border-b border-slate-200 pb-2 mb-4">Experience</h3>
                    <div className="space-y-5">
                      {cv.experience.map((job: any, i: number) => (
                        <div key={i}>
                          <div className="flex justify-between items-baseline">
                            <p className="font-bold text-slate-800">{job.title}</p>
                            <span className="text-xs text-slate-400 whitespace-nowrap ml-2">{job.period}</span>
                          </div>
                          <p className="text-sm text-blue-600 font-semibold mb-2">{job.company}</p>
                          <ul className="space-y-1.5">
                            {job.bullets.map((b: string, j: number) => (
                              <li key={j} className="text-sm text-slate-600 pl-3 relative before:absolute before:left-0 before:top-1.5 before:w-1 before:h-1 before:bg-blue-400 before:rounded-full">
                                {b}
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Education */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-blue-600 border-b border-slate-200 pb-2 mb-3">Education</h3>
                    {cv.education.map((edu: any, i: number) => (
                      <div key={i} className="flex justify-between">
                        <div>
                          <p className="font-bold text-slate-800 text-sm">{edu.degree}</p>
                          <p className="text-sm text-slate-500">{edu.institution}{edu.gpa ? ` · GPA: ${edu.gpa}` : ''}</p>
                        </div>
                        <span className="text-xs text-slate-400">{edu.year}</span>
                      </div>
                    ))}
                  </div>

                  {/* Skills */}
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-widest text-blue-600 border-b border-slate-200 pb-2 mb-3">Skills</h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-semibold mb-1.5">Technical</p>
                        <div className="flex flex-wrap gap-1.5">
                          {cv.skills.technical.map((s: string) => (
                            <span key={s} className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium border border-slate-200">{s}</span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-semibold mb-1.5">Languages</p>
                        <div className="flex flex-wrap gap-1.5">
                          {cv.skills.languages.map((l: string) => (
                            <span key={l} className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium border border-blue-100">{l}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Certifications */}
                  {cv.certifications && (
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-widest text-blue-600 border-b border-slate-200 pb-2 mb-3">Certifications</h3>
                      <div className="flex flex-wrap gap-2">
                        {cv.certifications.map((c: string) => (
                          <span key={c} className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-medium border border-indigo-100">{c}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              {/* ATS Score */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h3 className="font-bold text-slate-800 mb-4">ATS Analysis</h3>
                <div className="flex items-center justify-center mb-4">
                  <div className="relative w-24 h-24">
                    <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#e5e7eb" strokeWidth="3"/>
                      <circle cx="18" cy="18" r="15.9" fill="none" stroke="#22c55e" strokeWidth="3" strokeDasharray={`${cv.ats_score} ${100 - cv.ats_score}`} strokeLinecap="round"/>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-2xl font-extrabold text-green-600">{cv.ats_score}</span>
                      <span className="text-xs text-slate-400">/100</span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  {['Action verbs used', 'Keyword density', 'Format compatibility', 'Length optimal', 'Contact info complete'].map(check => (
                    <div key={check} className="flex items-center gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                      {check}
                    </div>
                  ))}
                </div>
              </div>

              {/* Rating */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="flex gap-0.5 mb-2">
                  {Array(5).fill(0).map((_, i) => <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />)}
                </div>
                <p className="text-sm text-slate-600 italic">"This template got me 3 interviews in one week!"</p>
                <p className="text-xs text-slate-400 mt-2">— Verified Vitelo User</p>
              </div>

              {/* CTAs */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
                <h3 className="font-bold mb-2">Build yours with AI</h3>
                <p className="text-blue-100 text-sm mb-4">Our AI writes a personalized version based on your actual experience.</p>
                <Link to="/generate" className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-blue-700 font-bold text-sm hover:bg-blue-50 transition-colors">
                  <Download className="w-4 h-4" />
                  Create My CV — Free
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related Examples */}
      <section className="py-12 px-4 sm:px-6 bg-slate-50 border-t">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-xl font-bold text-slate-800 mb-6">Related CV Examples</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {Object.entries(EXAMPLE_CVS)
              .filter(([s]) => s !== slug)
              .slice(0, 3)
              .map(([s, ex]: [string, any]) => (
                <Link key={s} to={`/examples/${s}`} className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md hover:border-blue-200 transition-all group flex items-center justify-between">
                  <span className="font-semibold text-slate-800 text-sm group-hover:text-blue-600">{ex.title}</span>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-500 transition-colors" />
                </Link>
              ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
