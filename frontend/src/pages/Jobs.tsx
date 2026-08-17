import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import {
  Search, MapPin, Clock, Heart, Briefcase, Filter,
  Building2, Globe, Users, ChevronRight, Sparkles,
  CheckCircle2, AlertCircle, X, SlidersHorizontal,
} from 'lucide-react';

/* ── Sample job data (replace with real API when available) ── */
const ALL_JOBS = [
  {
    id: '1', title: 'Senior .NET Developer', company: 'Kapital Bank', location: 'Baku, Azerbaijan',
    type: 'Full-time', level: 'Senior', remote: false, posted: '1 day ago', salary: '$3,000–$4,500/mo',
    match: 94, tags: ['C#', '.NET Core', 'SQL Server', 'Microservices'],
    description: 'We are looking for a Senior .NET Developer to lead the development of our core banking platform. You will design scalable APIs, mentor junior developers, and drive architectural decisions in a fast-paced Agile environment.',
  },
  {
    id: '2', title: 'DevOps Engineer', company: 'PASHA Insurance', location: 'Baku, Azerbaijan',
    type: 'Full-time', level: 'Mid-Level', remote: false, posted: '2 days ago', salary: '$2,500–$3,800/mo',
    match: 88, tags: ['Docker', 'Kubernetes', 'Azure DevOps', 'Terraform', 'CI/CD'],
    description: 'Join our DevOps team to build and maintain our cloud infrastructure. You will manage CI/CD pipelines, container orchestration, and implement IaC best practices across Azure and hybrid environments.',
  },
  {
    id: '3', title: 'Full Stack Engineer (React + Node)', company: 'Skolyn', location: 'Remote',
    type: 'Full-time', level: 'Mid-Level', remote: true, posted: '3 days ago', salary: '$4,000–$6,000/mo',
    match: 76, tags: ['React.js', 'TypeScript', 'Node.js', 'PostgreSQL'],
    description: 'Skolyn is a fast-growing EdTech startup. We need a Full Stack Engineer to own features end-to-end — from designing the API to building responsive React UIs and optimizing database queries.',
  },
  {
    id: '4', title: 'Software Architect', company: 'Crocusoft', location: 'Baku, Azerbaijan',
    type: 'Full-time', level: 'Lead', remote: false, posted: '5 days ago', salary: '$5,000–$7,000/mo',
    match: 91, tags: ['Clean Architecture', 'CQRS', 'Microservices', 'RabbitMQ', 'DDD'],
    description: 'We are seeking a Software Architect to define and drive the technical vision of our product. You will establish coding standards, perform code reviews, and work directly with engineering leadership on system design.',
  },
  {
    id: '5', title: 'Backend Engineer (Python/FastAPI)', company: 'TechStartup AZ', location: 'Remote',
    type: 'Contract', level: 'Mid-Level', remote: true, posted: '1 week ago', salary: '$3,500–$5,000/mo',
    match: 63, tags: ['Python', 'FastAPI', 'PostgreSQL', 'Redis', 'AWS'],
    description: 'Looking for a Python/FastAPI backend engineer to build high-performance REST APIs for our SaaS platform. Experience with async programming and cloud deployment is a must.',
  },
  {
    id: '6', title: 'Cloud Infrastructure Engineer', company: 'VLand Systems', location: 'Hybrid — Sumgayit',
    type: 'Full-time', level: 'Senior', remote: false, posted: '1 week ago', salary: '$3,000–$4,200/mo',
    match: 82, tags: ['Azure', 'Terraform', 'Ansible', 'Linux', 'Monitoring'],
    description: 'VLand Systems is expanding its cloud team. You will be responsible for designing, provisioning, and maintaining cloud infrastructure across Azure environments with a focus on reliability and observability.',
  },
];

const JOB_TYPES = ['Full-time', 'Contract', 'Part-time', 'Freelance'];
const SENIORITY = ['Junior', 'Mid-Level', 'Senior', 'Lead'];

/* ── Match score color ── */
const matchColor = (m: number) =>
  m >= 85 ? 'text-emerald-600 bg-emerald-50 border-emerald-200' :
  m >= 70 ? 'text-blue-600 bg-blue-50 border-blue-200' :
             'text-amber-600 bg-amber-50 border-amber-200';

const matchLabel = (m: number) =>
  m >= 85 ? 'Great Match' : m >= 70 ? 'Good Match' : 'Partial Match';

export default function Jobs() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [selectedJob, setSelectedJob] = useState(ALL_JOBS[0]);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [activeTypes, setActiveTypes] = useState<string[]>([]);
  const [activeLevels, setActiveLevels] = useState<string[]>([]);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  /* ── Filter logic ── */
  const filtered = useMemo(() => {
    return ALL_JOBS.filter(job => {
      const q = query.toLowerCase();
      const loc = location.toLowerCase();
      if (q && !job.title.toLowerCase().includes(q) && !job.company.toLowerCase().includes(q) && !job.tags.some(t => t.toLowerCase().includes(q))) return false;
      if (loc && !job.location.toLowerCase().includes(loc)) return false;
      if (remoteOnly && !job.remote) return false;
      if (activeTypes.length && !activeTypes.includes(job.type)) return false;
      if (activeLevels.length && !activeLevels.includes(job.level)) return false;
      return true;
    });
  }, [query, location, remoteOnly, activeTypes, activeLevels]);

  const toggleSave = (id: string) =>
    setSavedJobs(prev => prev.includes(id) ? prev.filter(j => j !== id) : [...prev, id]);

  const toggleFilter = <T extends string>(list: T[], setList: (v: T[]) => void, val: T) =>
    setList(list.includes(val) ? list.filter(x => x !== val) : [...list, val]);

  return (
    <DashboardLayout activeKey="jobs">

      {/* ── Header ── */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 mb-1">Job Matches</h1>
        <p className="text-sm text-slate-400">Jobs matched to your CV and skills — ranked by compatibility</p>
      </div>

      {/* ── Search bar ── */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Job title, company, or skill"
            value={query} onChange={e => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
        </div>
        <div className="relative flex-1 max-w-[240px]">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Location" value={location}
            onChange={e => setLocation(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-colors ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
          <SlidersHorizontal className="w-4 h-4" /> Filters
          {(activeTypes.length + activeLevels.length + (remoteOnly ? 1 : 0)) > 0 && (
            <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
              {activeTypes.length + activeLevels.length + (remoteOnly ? 1 : 0)}
            </span>
          )}
        </button>
      </div>

      {/* ── Filter Panel ── */}
      {showFilters && (
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 flex flex-wrap items-center gap-4">
          <div>
            <p className="text-xs font-bold text-slate-400 mb-1.5">Type</p>
            <div className="flex gap-2 flex-wrap">
              {JOB_TYPES.map(t => (
                <button key={t} onClick={() => toggleFilter(activeTypes, setActiveTypes, t)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${activeTypes.includes(t) ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div className="w-px h-8 bg-slate-100" />
          <div>
            <p className="text-xs font-bold text-slate-400 mb-1.5">Seniority</p>
            <div className="flex gap-2 flex-wrap">
              {SENIORITY.map(s => (
                <button key={s} onClick={() => toggleFilter(activeLevels, setActiveLevels, s)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${activeLevels.includes(s) ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div className="w-px h-8 bg-slate-100" />
          <button onClick={() => setRemoteOnly(!remoteOnly)}
            className={`flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${remoteOnly ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
            <Globe className="w-3.5 h-3.5" /> Remote Only
          </button>
          {(activeTypes.length + activeLevels.length + (remoteOnly ? 1 : 0)) > 0 && (
            <button onClick={() => { setActiveTypes([]); setActiveLevels([]); setRemoteOnly(false); }}
              className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 ml-auto">
              <X className="w-3.5 h-3.5" /> Clear all
            </button>
          )}
        </div>
      )}

      {/* ── Match banner ── */}
      <div className="flex items-center gap-2 mb-5 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
        <Sparkles className="w-4 h-4 text-blue-500" />
        <p className="text-sm text-slate-700">
          Showing <span className="font-bold text-blue-700">{filtered.length}</span> jobs matched to your profile — ranked by compatibility
        </p>
      </div>

      {/* ── Job list + Detail ── */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
          <Search className="w-8 h-8 text-slate-300 mx-auto mb-3" />
          <p className="font-medium text-slate-600">No jobs found</p>
          <p className="text-sm text-slate-400 mt-1">Try adjusting your search or filters</p>
        </div>
      ) : (
        <div className="grid lg:grid-cols-5 gap-6">

          {/* ── Left: job cards ── */}
          <div className="lg:col-span-2 space-y-3">
            {filtered
              .sort((a, b) => b.match - a.match)
              .map(job => (
                <button key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedJob.id === job.id
                      ? 'border-blue-300 bg-blue-50/60 shadow-sm'
                      : 'border-slate-200 bg-white hover:shadow-sm hover:border-slate-300'
                  }`}>
                  <div className="flex items-start gap-3">
                    {/* Company Avatar */}
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center text-indigo-700 font-extrabold text-sm flex-shrink-0">
                      {job.company[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <p className="font-bold text-sm text-slate-800 truncate">{job.title}</p>
                        {/* Match score */}
                        <span className={`flex-shrink-0 text-[10px] font-extrabold px-2 py-0.5 rounded-lg border ${matchColor(job.match)}`}>
                          {job.match}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-500">{job.company}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                        <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{job.location}</span>
                        <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{job.posted}</span>
                      </div>
                      {/* Tags */}
                      <div className="flex flex-wrap gap-1 mt-2">
                        {job.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                            {tag}
                          </span>
                        ))}
                        {job.tags.length > 3 && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-400">
                            +{job.tags.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Save button */}
                  <div className="flex justify-end mt-2">
                    <button onClick={e => { e.stopPropagation(); toggleSave(job.id); }}
                      className={`p-1.5 rounded-lg transition-colors ${savedJobs.includes(job.id) ? 'text-red-500' : 'text-slate-300 hover:text-red-400'}`}>
                      <Heart className={`w-4 h-4 ${savedJobs.includes(job.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </button>
              ))}
          </div>

          {/* ── Right: Job detail ── */}
          {selectedJob && (
            <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm sticky top-20 self-start">
              {/* Header */}
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-200 flex items-center justify-center text-indigo-700 font-extrabold text-xl flex-shrink-0">
                    {selectedJob.company[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-extrabold text-slate-900">{selectedJob.title}</h2>
                    <p className="text-sm text-slate-500">{selectedJob.company}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{selectedJob.location}</span>
                      <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{selectedJob.type}</span>
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{selectedJob.level}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{selectedJob.posted}</span>
                    </div>
                  </div>
                  {/* Match score */}
                  <div className={`flex-shrink-0 text-center px-4 py-2 rounded-xl border ${matchColor(selectedJob.match)}`}>
                    <p className="text-xl font-extrabold leading-none">{selectedJob.match}%</p>
                    <p className="text-[10px] font-bold mt-0.5">{matchLabel(selectedJob.match)}</p>
                  </div>
                </div>

                {/* Salary */}
                {selectedJob.salary && (
                  <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-sm font-bold">
                    💰 {selectedJob.salary}
                  </div>
                )}
              </div>

              {/* CTA buttons */}
              <div className="px-6 py-4 border-b border-slate-100 flex gap-3">
                <button
                  onClick={() => navigate(`/generate?job=${encodeURIComponent(selectedJob.description)}`)}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold hover:shadow-md transition-all flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" /> Tailor My Resume
                </button>
                <button
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                  <Briefcase className="w-4 h-4" /> Apply Now
                </button>
                <button onClick={() => toggleSave(selectedJob.id)}
                  className={`p-2.5 rounded-xl border transition-colors ${savedJobs.includes(selectedJob.id) ? 'border-red-200 bg-red-50 text-red-500' : 'border-slate-200 text-slate-400 hover:text-red-400'}`}>
                  <Heart className={`w-5 h-5 ${savedJobs.includes(selectedJob.id) ? 'fill-current' : ''}`} />
                </button>
              </div>

              {/* Matched Skills */}
              <div className="px-6 py-4 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-400 mb-2.5">SKILL MATCH</p>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.tags.map(tag => (
                    <span key={tag}
                      className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {tag}
                    </span>
                  ))}
                  {selectedJob.match < 90 && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700">
                      <AlertCircle className="w-3.5 h-3.5" /> + more required
                    </span>
                  )}
                </div>
              </div>

              {/* Job Description */}
              <div className="px-6 py-4">
                <p className="text-xs font-bold text-slate-400 mb-2.5">JOB DESCRIPTION</p>
                <p className="text-sm text-slate-600 leading-relaxed">{selectedJob.description}</p>

                {/* Tailor prompt */}
                <div className="mt-5 p-4 bg-blue-50 rounded-xl border border-blue-100 flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-blue-500 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-blue-800">Boost your match score</p>
                    <p className="text-xs text-blue-600 mt-0.5">Tailor your resume to this job description — AI will highlight matching skills and optimize your bullet points.</p>
                    <button onClick={() => navigate(`/generate?job=${encodeURIComponent(selectedJob.description)}`)}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800">
                      Tailor Now <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
