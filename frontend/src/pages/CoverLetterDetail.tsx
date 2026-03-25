import { Link, useParams } from 'react-router-dom';
import { ArrowRight, Download as DownloadIcon } from 'lucide-react';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';

const COVER_LETTERS: Record<string, { title: string; role: string; company: string; body: string[] }> = {
  'nursing-cover-letter': {
    title: 'Nursing Cover Letter', role: 'Registered Nurse', company: 'City General Hospital',
    body: [
      'Dear Hiring Manager,\n\nI am writing to express my strong interest in the Registered Nurse position at City General Hospital. With 4 years of clinical experience specializing in emergency and critical care, I am confident I can make a meaningful contribution to your team.',
      'During my tenure at Metro Regional Hospital, I managed a patient load of 12+ per shift while maintaining a 98% patient satisfaction rating. I led the implementation of a new patient handoff protocol that reduced communication errors by 35%. My certifications in Advanced Cardiac Life Support (ACLS) and Pediatric Advanced Life Support (PALS) have equipped me to handle high-pressure situations with confidence.',
      'I am particularly drawn to City General Hospital\'s commitment to community health initiatives and your recently expanded trauma center. I would welcome the opportunity to bring my skills in patient assessment, care plan development, and interdisciplinary collaboration to your award-winning nursing team.\n\nThank you for considering my application. I look forward to discussing how I can contribute to the exceptional patient care your hospital is known for.\n\nSincerely,\nEmma Richardson, RN, BSN'
    ],
  },
  'administrative-assistant-cover-letter': {
    title: 'Administrative Assistant Cover Letter', role: 'Administrative Assistant', company: 'Sterling & Associates',
    body: [
      'Dear Hiring Manager,\n\nI am excited to apply for the Administrative Assistant position at Sterling & Associates. With over 3 years of experience supporting C-suite executives in fast-paced corporate environments, I bring a proven track record of operational excellence.',
      'In my current role at Vertex Financial Group, I manage calendars for 4 senior partners, coordinate 50+ client meetings per month, and maintain a paperless document management system that improved retrieval times by 60%. I am proficient in Microsoft 365, Google Workspace, SAP, and have intermediate proficiency in QuickBooks for expense reporting.',
      'I am impressed by Sterling & Associates\' reputation for client-centered service and collaborative culture. I am confident that my organizational skills, attention to detail, and proactive approach would make me a valuable addition to your administrative team.\n\nThank you for your time and consideration.\n\nBest regards,\nSophia Martinez'
    ],
  },
  'internship-cover-letter': {
    title: 'Internship Cover Letter', role: 'Marketing Intern', company: 'BrightWave Digital',
    body: [
      'Dear Hiring Manager,\n\nI am a second-year Marketing student at the University of Edinburgh, writing to apply for the Summer Marketing Internship at BrightWave Digital. Your agency\'s work on data-driven social media campaigns immediately caught my attention.',
      'Although early in my career, I have built meaningful experience through university projects and freelance work. I grew our university marketing club\'s Instagram following by 180% in one semester using content calendars and A/B-tested captions. I also completed Google\'s Digital Marketing Certificate and HubSpot\'s Content Marketing Certification to deepen my technical knowledge.',
      'I am eager to learn from BrightWave Digital\'s industry-leading team and apply my academic knowledge, creativity, and work ethic to contribute to your clients\' success.\n\nThank you for considering my application.\n\nKind regards,\nAlex Turner'
    ],
  },
  'graduate-cover-letter': {
    title: 'Graduate Cover Letter', role: 'Graduate Analyst', company: 'McKinsey & Company',
    body: [
      'Dear Recruitment Team,\n\nI am writing to apply for the Graduate Business Analyst role at McKinsey & Company. Having recently graduated with First Class Honours in Economics from the London School of Economics, I am eager to begin my consulting career at a firm renowned for solving the world\'s most complex business challenges.',
      'During my studies, I led a 5-person team for the LSE Case Competition, where we placed 2nd out of 40 teams by developing a go-to-market strategy for a fintech startup. My internship at Deloitte Digital exposed me to market sizing, stakeholder interviews, and data-driven recommendations that directly influenced a £2M client engagement.',
      'I am drawn to McKinsey\'s emphasis on impact and personal growth. I believe my analytical mindset, collaboration skills, and genuine curiosity make me well-suited for the rigorous and rewarding environment your firm offers.\n\nI would be delighted to discuss my application further.\n\nYours sincerely,\nDaniel Okonkwo'
    ],
  },
  'teacher-cover-letter': {
    title: 'Teacher Cover Letter', role: 'Secondary English Teacher', company: 'Greenfield Academy',
    body: [
      'Dear Principal Thompson,\n\nI am writing to express my keen interest in the Secondary English Teacher position at Greenfield Academy. With 5 years of experience in both state and independent schools, I have a passion for making literature accessible and inspiring critical thinking in young minds.',
      'At Riverside Comprehensive, I raised GCSE English Literature results by 15 percentage points over two years through differentiated instruction and a student-led reading program. I introduced creative writing workshops that increased student engagement scores by 40% in departmental surveys. I am also an experienced form tutor and have led the school\'s debating society to regional competition finals.',
      'Greenfield Academy\'s mission of fostering intellectual curiosity aligns perfectly with my teaching philosophy. I would welcome the chance to contribute to your English department\'s outstanding reputation.\n\nThank you for considering my application.\n\nWarm regards,\nOlivia Chen, MA, PGCE'
    ],
  },
  'software-engineer-cover-letter': {
    title: 'Software Engineer Cover Letter', role: 'Backend Software Engineer', company: 'Stripe',
    body: [
      'Dear Engineering Hiring Team,\n\nI am excited to apply for the Backend Software Engineer position at Stripe. With 4 years of experience building high-throughput payment systems and distributed APIs, I am drawn to Stripe\'s mission of increasing the GDP of the internet.',
      'At my current company, I architected a real-time transaction processing pipeline handling 50K events/second using Go, Kafka, and PostgreSQL. I reduced payment settlement latency by 40% and contributed to an open-source idempotency library with 500+ GitHub stars. I hold an AWS Certified Solutions Architect certification and have extensive experience with Kubernetes, Docker, and CI/CD pipelines.',
      'I am particularly impressed by Stripe\'s developer-first culture and commitment to API design excellence. I believe my background in fintech infrastructure and my passion for clean, well-tested code make me a strong fit for your team.\n\nI look forward to the opportunity to discuss how I can contribute to Stripe\'s growth.\n\nBest regards,\nJames Park'
    ],
  },
};

const FALLBACK = COVER_LETTERS['software-engineer-cover-letter'];

export default function CoverLetterDetail() {
  const { slug } = useParams<{ slug: string }>();
  const cl = (slug && COVER_LETTERS[slug]) ? COVER_LETTERS[slug] : FALLBACK;

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* Header */}
      <section className="pt-24 pb-8 px-4 sm:px-6 bg-gradient-to-b from-indigo-50 to-white border-b">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <Link to="/cover-letter" className="text-sm text-indigo-600 hover:underline">← Cover Letter Examples</Link>
            <span className="text-slate-300">/</span>
            <span className="text-sm text-slate-500">{cl.role}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">{cl.title}</h1>
          <p className="mt-1 text-slate-500 text-sm">Applying for: <span className="font-semibold text-slate-700">{cl.role}</span> at <span className="font-semibold text-slate-700">{cl.company}</span></p>
        </div>
      </section>

      {/* Letter + Sidebar */}
      <section className="py-12 px-4 sm:px-6">
        <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-8">

          {/* Letter */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-8 py-5">
                <p className="text-white text-sm font-medium">{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="text-indigo-100 text-sm mt-1">{cl.company} — {cl.role}</p>
              </div>
              <div className="px-8 py-8 space-y-5">
                {cl.body.map((para, i) => (
                  <p key={i} className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">{para}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-6 text-white">
              <h3 className="font-bold mb-2">Write yours with AI</h3>
              <p className="text-indigo-100 text-sm mb-4">Our AI creates a personalized cover letter matching your CV to the job description.</p>
              <Link to="/generate" className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-white text-indigo-700 font-bold text-sm hover:bg-indigo-50 transition-colors">
                <DownloadIcon className="w-4 h-4" /> Generate My Cover Letter
              </Link>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-bold text-slate-800 mb-3">Want a better result?</h3>
              <p className="text-sm text-slate-500 mb-4">Start by building an ATS-optimized CV. Then our AI uses it to craft your cover letter.</p>
              <Link to="/checker" className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition-colors">
                Check My CV First <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
              <h3 className="font-bold text-slate-800 mb-3">More examples</h3>
              <div className="space-y-2">
                {Object.entries(COVER_LETTERS).filter(([s]) => s !== slug).slice(0, 3).map(([s, ex]) => (
                  <Link key={s} to={`/cover-letter/${s}`} className="flex items-center justify-between py-2 text-sm text-slate-600 hover:text-blue-600 transition-colors">
                    {ex.title} <ArrowRight className="w-3.5 h-3.5" />
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
