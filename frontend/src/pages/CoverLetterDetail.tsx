import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowRight,
  Copy,
  Check,
  Zap,
  Sparkles,
  ChevronRight,
  FileCheck,
} from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';

const COVER_LETTERS: Record<
  string,
  {
    title: string;
    role: string;
    company: string;
    industry: string;
    matchScore: number;
    tone: string;
    body: string[];
    tips: string[];
  }
> = {
  'software-engineer-cover-letter': {
    title: 'Software & DevOps Engineer Cover Letter',
    role: 'Senior Software Engineer',
    company: 'Stripe',
    industry: 'Financial Technology / Distributed Systems',
    matchScore: 98,
    tone: 'Confident & Metric-Driven',
    body: [
      'Dear Engineering Hiring Team,',
      'I am writing to express my strong enthusiasm for the Senior Software Engineer position at Stripe. Having spent the past 4+ years designing resilient distributed systems and optimizing microservices within the .NET and cloud ecosystem, I have long admired Stripe’s relentless focus on developer-first APIs and scalable financial infrastructure.',
      'In my most recent role at VLand Systems, I led the architectural re-engineering of our transaction processing engine using .NET 8, ASP.NET Core, and PostgreSQL. By implementing high-throughput Redis caching layers and optimizing database indexing strategies, I reduced query latency by 45% across all client endpoints. Additionally, I automated our multi-environment deployment pipelines using Docker, Kubernetes, and GitHub Actions, which decreased release cycle times from hours to under 8 minutes with zero downtime.',
      'Prior to that at TIC Solutions, I collaborated in a distributed remote team building event-driven architectures with RabbitMQ and SQL Server, handling millions of asynchronous events per week with 99.98% reliability. I am deeply passionate about Clean Architecture, CQRS patterns, and maintainable, self-documenting code.',
      'Stripe’s mission to increase the GDP of the internet resonates strongly with me. I would be thrilled to bring my background in backend performance tuning, cloud automation, and high-volume API development to your world-class engineering team.',
      'Thank you for your time and consideration. I welcome the opportunity to discuss how my technical expertise can support Stripe’s continued platform expansion.',
      'Sincerely,\nTabriz Latifov',
    ],
    tips: [
      'Focus on measurable latency reductions (% or ms) rather than generic responsibilities.',
      'Highlight automated CI/CD and zero-downtime deployment practices.',
      'Directly mention the company’s mission and developer-first design ethos.',
    ],
  },
  'graduate-cover-letter': {
    title: 'Graduate Strategy & Consulting Cover Letter',
    role: 'Graduate Business Analyst',
    company: 'McKinsey & Company',
    industry: 'Management Consulting',
    matchScore: 97,
    tone: 'Executive & Strategic',
    body: [
      'Dear Recruitment Team,',
      'I am writing to apply for the Graduate Business Analyst role at McKinsey & Company. Having recently graduated with First Class Honours in Economics from the London School of Economics, I am eager to begin my consulting career at a firm renowned for solving the world’s most complex strategic challenges.',
      'During my academic studies, I led a 5-person team for the LSE Case Competition, where we placed 2nd out of 40 international teams by developing an actionable market-entry strategy for a European fintech scaleup. My subsequent internship at Deloitte Digital exposed me to market sizing, executive stakeholder interviews, and data-driven recommendations that directly influenced a £2.4M client transformation engagement.',
      'I am drawn to McKinsey’s culture of apprenticeship, radical truth, and client impact. I believe my quantitative rigor, structured problem-solving approach, and collaborative mindset make me well-suited for the dynamic environment your firm offers.',
      'I would be delighted to discuss my application further.',
      'Yours sincerely,\nDaniel Okonkwo',
    ],
    tips: [
      'Quantify academic and case competition achievements.',
      'Demonstrate top-tier structured communication and structured thinking.',
      'Reference past analytical internship impact.',
    ],
  },
  'internship-cover-letter': {
    title: 'Product & Growth Marketing Cover Letter',
    role: 'Product Marketing Specialist',
    company: 'BrightWave Digital',
    industry: 'Digital Marketing & SaaS',
    matchScore: 96,
    tone: 'Passionate & Growth-Oriented',
    body: [
      'Dear Hiring Manager,',
      'I am writing to apply for the Product Marketing Specialist position at BrightWave Digital. Your agency’s recent work on data-driven social media growth campaigns and SaaS brand repositioning immediately caught my attention.',
      'Over the past two years, I have built proven experience in growth marketing through both client engagements and university initiatives. I grew our university marketing club’s digital audience by 180% in one semester through targeted content calendars and A/B-tested creatives. I have also earned Google’s Digital Marketing Certification and HubSpot’s Inbound Marketing Certification.',
      'I am eager to bring my analytical mindset, creative copy skills, and relentless curiosity to BrightWave Digital’s high-performing marketing team.',
      'Thank you for considering my application. I look forward to connecting with you soon.',
      'Kind regards,\nAlex Turner',
    ],
    tips: [
      'Highlight specific certifications (Google, HubSpot, Meta).',
      'Showcase quantifiable growth percentages (e.g. 180% audience growth).',
    ],
  },
  'administrative-assistant-cover-letter': {
    title: 'Executive Assistant & Operations Cover Letter',
    role: 'Executive Assistant',
    company: 'Sterling & Associates',
    industry: 'Corporate & Legal',
    matchScore: 95,
    tone: 'Professional & Efficient',
    body: [
      'Dear Hiring Manager,',
      'I am excited to apply for the Executive Assistant position at Sterling & Associates. With over 4 years of experience supporting C-suite executives in fast-paced corporate environments, I bring a proven record of operational excellence and proactive scheduling.',
      'In my current role at Vertex Financial Group, I manage calendars for 4 senior partners, coordinate 50+ high-stakes client meetings per month, and maintain a paperless document management system that improved information retrieval times by 60%. I am proficient in Microsoft 365, Google Workspace, SAP, and QuickBooks.',
      'I am impressed by Sterling & Associates’ reputation for client-centered service and look forward to contributing to your administrative success.',
      'Thank you for your time and consideration.',
      'Best regards,\nSophia Martinez',
    ],
    tips: [
      'Mention software tools you have mastered (SAP, Microsoft 365, Google Workspace).',
      'Emphasize discretion, organization, and executive calendar management.',
    ],
  },
  'nursing-cover-letter': {
    title: 'Registered Nurse (BSN) Cover Letter',
    role: 'Registered Nurse',
    company: 'City General Hospital',
    industry: 'Healthcare & Clinical Services',
    matchScore: 99,
    tone: 'Compassionate & Clinical',
    body: [
      'Dear Clinical Hiring Committee,',
      'I am writing to express my strong interest in the Registered Nurse position at City General Hospital. With 4+ years of acute clinical experience specializing in emergency and critical care, I am confident in my ability to deliver compassionate, high-quality patient care to your team.',
      'During my tenure at Metro Regional Hospital, I managed patient loads of 10-12 per shift while maintaining a 98% patient satisfaction rating. I also led the implementation of a standardized handoff protocol that reduced unit communication errors by 35%. I maintain active ACLS, PALS, and BLS certifications.',
      'City General Hospital’s commitment to community wellness and trauma care is inspiring. I would welcome the opportunity to bring my clinical skills and patient empathy to your esteemed nursing department.',
      'Warm regards,\nEmma Richardson, RN, BSN',
    ],
    tips: [
      'List all current clinical licenses and certifications (RN, BSN, ACLS, BLS).',
      'Highlight patient satisfaction metrics and unit protocol improvements.',
    ],
  },
  'teacher-cover-letter': {
    title: 'Secondary Education & Department Lead Cover Letter',
    role: 'Secondary English Teacher',
    company: 'Greenfield Academy',
    industry: 'Secondary Education',
    matchScore: 96,
    tone: 'Inspiring & Pedagogical',
    body: [
      'Dear Principal Thompson,',
      'I am writing to express my keen interest in the Secondary English Teacher position at Greenfield Academy. With 5 years of experience across state and independent schools, I am dedicated to fostering critical thinking and literary appreciation in students of all backgrounds.',
      'At Riverside Comprehensive, I helped raise departmental GCSE English Literature examination results by 15 percentage points over two years through structured reading workshops and differentiated lesson plans. I also founded the student debate society, coaching the team to regional finals.',
      'Greenfield Academy’s focus on academic excellence and character development aligns closely with my teaching philosophy. I look forward to the opportunity to discuss my application with you.',
      'Warm regards,\nOlivia Chen, MA, PGCE',
    ],
    tips: [
      'Highlight examination improvements and extracurricular club leadership.',
      'Mention specialized teaching credentials (PGCE, MA, state licenses).',
    ],
  },
};

const FALLBACK = COVER_LETTERS['software-engineer-cover-letter'];

export default function CoverLetterDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [copied, setCopied] = useState(false);

  const cl = slug && COVER_LETTERS[slug] ? COVER_LETTERS[slug] : FALLBACK;

  const handleCopyText = async () => {
    await navigator.clipboard.writeText(cl.body.join('\n\n'));
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Navbar />

      {/* Header Section */}
      <section className="pt-24 pb-8 px-4 sm:px-6 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
              <Link to="/cover-letter" className="text-indigo-600 hover:underline">
                Cover Letter Examples
              </Link>
              <span>/</span>
              <span className="text-slate-400">{cl.industry}</span>
              <span>/</span>
              <span className="text-slate-800 font-bold">{cl.role}</span>
            </div>

            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{cl.title}</h1>
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-extrabold shadow-xs">
                <FileCheck className="w-3.5 h-3.5 text-emerald-600" />
                {cl.matchScore}% Match
              </span>
            </div>
            <p className="mt-1 text-slate-500 text-xs sm:text-sm">
              Tailored for <span className="font-bold text-slate-800">{cl.role}</span> at{' '}
              <span className="font-bold text-slate-800">{cl.company}</span>
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
                  <Copy className="w-3.5 h-3.5 text-slate-500" /> Copy Letter
                </>
              )}
            </button>

            <Link
              to={`/cover-letter/create?role=${encodeURIComponent(cl.role)}&company=${encodeURIComponent(
                cl.company
              )}`}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-md hover:shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
            >
              <Zap className="w-3.5 h-3.5" /> Customize in AI Studio
            </Link>
          </div>
        </div>
      </section>

      {/* Main Grid */}
      <section className="py-10 px-4 sm:px-6 flex-1">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-12 gap-8">
          {/* Left: Rendered Letter Paper (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/90 shadow-lg overflow-hidden">
              {/* Header Ribbon */}
              <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-8 py-6 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <p className="text-xs text-indigo-300 font-medium">
                    {new Date().toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </p>
                  <p className="text-base font-bold text-white mt-0.5">
                    {cl.company} — {cl.role}
                  </p>
                </div>
                <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-bold bg-white/10 text-indigo-200 border border-white/10">
                  Tone: {cl.tone}
                </span>
              </div>

              {/* Letter Body */}
              <div className="p-8 sm:p-10 space-y-6 font-normal text-slate-800 text-sm sm:text-base leading-relaxed">
                {cl.body.map((paragraph, index) => (
                  <p key={index} className="whitespace-pre-line">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
          </div>

          {/* Right: AI Guidance Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Direct AI Studio Card */}
            <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-700 rounded-3xl p-6 text-white shadow-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold mb-3 backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                AI Personalization
              </div>
              <h3 className="text-xl font-extrabold mb-2">Tailor this for your next job</h3>
              <p className="text-indigo-100 text-xs sm:text-sm mb-6 leading-relaxed">
                Gemini AI will rewrite this letter by analyzing your specific achievements and the target company's job description.
              </p>
              <Link
                to={`/cover-letter/create?role=${encodeURIComponent(cl.role)}&company=${encodeURIComponent(
                  cl.company
                )}`}
                className="w-full py-3.5 rounded-2xl bg-white text-indigo-700 font-extrabold text-sm text-center shadow-lg hover:shadow-xl hover:bg-indigo-50 transition-all flex items-center justify-center gap-2"
              >
                Write My Custom Letter <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Why This Letter Works */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h4 className="font-extrabold text-slate-900 text-sm mb-3">Why This Letter Converts</h4>
              <ul className="space-y-3 text-xs text-slate-600">
                {cl.tips.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2.5">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Other Examples */}
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm">
              <h4 className="font-extrabold text-slate-900 text-sm mb-3">More Examples</h4>
              <div className="space-y-2">
                {Object.entries(COVER_LETTERS)
                  .filter(([s]) => s !== slug)
                  .slice(0, 3)
                  .map(([s, ex]) => (
                    <Link
                      key={s}
                      to={`/cover-letter/${s}`}
                      className="flex items-center justify-between py-2 text-xs font-bold text-slate-700 hover:text-indigo-600 transition-colors"
                    >
                      <span>{ex.role}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </Link>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
