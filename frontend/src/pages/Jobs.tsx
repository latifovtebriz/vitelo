import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import DashboardLayout from '../components/DashboardLayout';
import {
  Search, MapPin, Clock, Heart, Briefcase,
  Globe, Users, Sparkles,
  CheckCircle2, AlertCircle, X, SlidersHorizontal,
  FileText, Check, Plus, ArrowRight,
} from 'lucide-react';

/* ── Curated fallback jobs ── */
const ALL_JOBS = [
  {
    id: '1', title: 'Senior .NET Developer', company: 'Kapital Bank', location: 'Baku, Azerbaijan',
    type: 'Full-time', level: 'Senior', remote: false, posted: '1 day ago', salary: '$3,000–$4,500/mo',
    match: 94, tags: ['C#', '.NET Core', 'SQL Server', 'Microservices', 'Docker'],
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
    match: 76, tags: ['React.js', 'TypeScript', 'Node.js', 'PostgreSQL', 'TailwindCSS'],
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
    match: 85, tags: ['Python', 'FastAPI', 'PostgreSQL', 'Redis', 'AWS'],
    description: 'Looking for a Python/FastAPI backend engineer to build high-performance REST APIs for our SaaS platform. Experience with async programming and cloud deployment is a must.',
  },
  {
    id: '6', title: 'Cloud Infrastructure Engineer', company: 'VLand Systems', location: 'Hybrid — Sumgayit',
    type: 'Full-time', level: 'Senior', remote: false, posted: '1 week ago', salary: '$3,000–$4,200/mo',
    match: 82, tags: ['Azure', 'Terraform', 'Ansible', 'Linux', 'Monitoring'],
    description: 'VLand Systems is expanding its cloud team. You will be responsible for designing, provisioning, and maintaining cloud infrastructure across Azure environments with a focus on reliability and observability.',
  },
  {
    id: '7', title: 'Lead Frontend Engineer (Vue/React)', company: 'ABB Bank', location: 'Baku, Azerbaijan',
    type: 'Full-time', level: 'Lead', remote: false, posted: '3 days ago', salary: '$4,500–$6,500/mo',
    match: 89, tags: ['React', 'TypeScript', 'Next.js', 'Redux', 'Microfrontends'],
    description: 'Lead our digital banking web engineering squad. Responsible for performance optimization, design system governance, and modern web security best practices.',
  }
];

const JOB_TYPES = ['Full-time', 'Contract', 'Part-time', 'Freelance'];
const SENIORITY = ['Junior', 'Mid-Level', 'Senior', 'Lead'];

const matchColor = (m: number) =>
  m >= 85 ? 'text-emerald-600 bg-emerald-50 border-emerald-200' :
  m >= 70 ? 'text-blue-600 bg-blue-50 border-blue-200' :
             'text-amber-600 bg-amber-50 border-amber-200';

const matchLabel = (m: number) =>
  m >= 85 ? 'Great Match' : m >= 70 ? 'Good Match' : 'Partial Match';

export default function Jobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState(ALL_JOBS);
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [selectedJob, setSelectedJob] = useState(ALL_JOBS[0]);
  const [savedJobs, setSavedJobs] = useState<string[]>([]);
  const [activeTypes, setActiveTypes] = useState<string[]>([]);
  const [activeLevels, setActiveLevels] = useState<string[]>([]);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [addedToTracker, setAddedToTracker] = useState<string | null>(null);

  // Load from backend API if reachable
  useEffect(() => {
    api.get('/jobs/')
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setJobs(res.data);
          setSelectedJob(res.data[0]);
        }
      })
      .catch(() => {
        // Keeps fallback ALL_JOBS
      });
  }, []);

  /* ── Filter logic ── */
  const filtered = useMemo(() => {
    return jobs.filter(job => {
      const q = query.toLowerCase();
      const loc = location.toLowerCase();
      if (q && !job.title.toLowerCase().includes(q) && !job.company.toLowerCase().includes(q) && !job.tags.some(t => t.toLowerCase().includes(q))) return false;
      if (loc && !job.location.toLowerCase().includes(loc)) return false;
      if (remoteOnly && !job.remote) return false;
      if (activeTypes.length && !activeTypes.includes(job.type)) return false;
      if (activeLevels.length && !activeLevels.includes(job.level)) return false;
      return true;
    });
  }, [jobs, query, location, remoteOnly, activeTypes, activeLevels]);

  const toggleSave = async (id: string) => {
    const isSaved = savedJobs.includes(id);
    setSavedJobs(prev => isSaved ? prev.filter(j => j !== id) : [...prev, id]);
    try {
      if (isSaved) {
        await api.delete(`/jobs/save/${id}`);
      } else {
        await api.post(`/jobs/save/${id}`);
      }
    } catch {
      // Local state already updated
    }
  };

  const handleAddToTracker = async (job: typeof ALL_JOBS[0], columnKey: string = 'Applied') => {
    try {
      await api.post('/jobs/apply-to-tracker', {
        job_title: job.title,
        company_name: job.company,
        column_key: columnKey,
        notes: `Salary: ${job.salary} • Location: ${job.location}`,
      });
      setAddedToTracker(job.id);
      setTimeout(() => setAddedToTracker(null), 3000);
    } catch {
      setAddedToTracker(job.id);
      setTimeout(() => setAddedToTracker(null), 3000);
    }
  };

  const toggleFilter = <T extends string>(list: T[], setList: (v: T[]) => void, val: T) =>
    setList(list.includes(val) ? list.filter(x => x !== val) : [...list, val]);

  return (
    <DashboardLayout activeKey="jobs">

      {/* ── Header ── */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 mb-1">Job Marketplace & Matches</h1>
          <p className="text-sm text-slate-400">Curated opportunities matched to your CV skills and salary expectations</p>
        </div>
        <button
          onClick={() => navigate('/checker')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold hover:bg-blue-100 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" /> Check ATS Match For Any Job
        </button>
      </div>

      {/* ── Search bar ── */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Job title, company, or skill (e.g. React, .NET, DevOps)"
            value={query} onChange={e => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none bg-white" />
        </div>
        <div className="relative flex-1 max-w-[240px]">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Location" value={location}
            onChange={e => setLocation(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none bg-white" />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition-colors ${showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-slate-200 text-slate-600 hover:bg-slate-50 bg-white'}`}>
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
        <div className="bg-white rounded-xl border border-slate-200 p-4 mb-4 flex flex-wrap items-center gap-4 animate-in fade-in duration-200">
          <div>
            <p className="text-xs font-bold text-slate-400 mb-1.5">Contract Type</p>
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
      <div className="flex items-center justify-between mb-5 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <p className="text-sm text-slate-700">
            Showing <span className="font-bold text-blue-700">{filtered.length}</span> positions ranked by CV compatibility
          </p>
        </div>
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
                <div key={job.id}
                  onClick={() => setSelectedJob(job)}
                  className={`w-full text-left p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedJob.id === job.id
                      ? 'border-blue-400 bg-blue-50/50 shadow-sm ring-1 ring-blue-100'
                      : 'border-slate-200 bg-white hover:shadow-sm hover:border-slate-300'
                  }`}>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-blue-100 flex items-center justify-center text-indigo-700 font-extrabold text-sm flex-shrink-0">
                      {job.company[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1">
                        <p className="font-bold text-sm text-slate-800 truncate">{job.title}</p>
                        <span className={`flex-shrink-0 text-[10px] font-extrabold px-2 py-0.5 rounded-lg border ${matchColor(job.match)}`}>
                          {job.match}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 font-medium">{job.company}</p>
                      <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400">
                        <span className="flex items-center gap-0.5"><MapPin className="w-3 h-3" />{job.location}</span>
                        <span className="flex items-center gap-0.5"><Clock className="w-3 h-3" />{job.posted}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {job.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-500">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-100/80">
                    <span className="text-[11px] font-bold text-emerald-600">{job.salary}</span>
                    <button
                      onClick={e => { e.stopPropagation(); toggleSave(job.id); }}
                      className={`p-1 rounded-lg transition-colors ${savedJobs.includes(job.id) ? 'text-rose-500' : 'text-slate-300 hover:text-rose-400'}`}
                    >
                      <Heart className={`w-4 h-4 ${savedJobs.includes(job.id) ? 'fill-current' : ''}`} />
                    </button>
                  </div>
                </div>
              ))}
          </div>

          {/* ── Right: Job detail ── */}
          {selectedJob && (
            <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm sticky top-20 self-start overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-100 to-blue-200 flex items-center justify-center text-indigo-700 font-extrabold text-xl flex-shrink-0">
                    {selectedJob.company[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h2 className="text-lg font-extrabold text-slate-900">{selectedJob.title}</h2>
                    <p className="text-sm text-slate-500 font-semibold">{selectedJob.company}</p>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{selectedJob.location}</span>
                      <span className="flex items-center gap-1"><Briefcase className="w-3.5 h-3.5" />{selectedJob.type}</span>
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />{selectedJob.level}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{selectedJob.posted}</span>
                    </div>
                  </div>
                  <div className={`flex-shrink-0 text-center px-4 py-2 rounded-xl border ${matchColor(selectedJob.match)}`}>
                    <p className="text-xl font-extrabold leading-none">{selectedJob.match}%</p>
                    <p className="text-[10px] font-bold mt-0.5">{matchLabel(selectedJob.match)}</p>
                  </div>
                </div>

                {selectedJob.salary && (
                  <div className="mt-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold">
                    💰 Offered Range: {selectedJob.salary}
                  </div>
                )}
              </div>

              {/* 1-Click Action Bar */}
              <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap gap-2.5">
                <button
                  onClick={() => navigate(`/generate?job=${encodeURIComponent(selectedJob.description)}`)}
                  className="flex-1 min-w-[140px] py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Tailor Resume
                </button>

                <button
                  onClick={() => navigate(`/cover-letter/create?company=${encodeURIComponent(selectedJob.company)}&role=${encodeURIComponent(selectedJob.title)}`)}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <FileText className="w-3.5 h-3.5 text-blue-600" /> Write Cover Letter
                </button>

                <button
                  onClick={() => handleAddToTracker(selectedJob, 'Applied')}
                  disabled={addedToTracker === selectedJob.id}
                  className="py-2.5 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  {addedToTracker === selectedJob.id ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" /> In Job Tracker!
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5 text-slate-500" /> Add to Tracker
                    </>
                  )}
                </button>
              </div>

              {/* Matched Skills */}
              <div className="px-6 py-4 border-b border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Target Skills & Tech Stack</p>
                <div className="flex flex-wrap gap-2">
                  {selectedJob.tags.map(tag => (
                    <span key={tag}
                      className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700">
                      <CheckCircle2 className="w-3.5 h-3.5" /> {tag}
                    </span>
                  ))}
                  {selectedJob.match < 90 && (
                    <span className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200 text-amber-700">
                      <AlertCircle className="w-3.5 h-3.5" /> Additional skills recommended
                    </span>
                  )}
                </div>
              </div>

              {/* Job Description */}
              <div className="px-6 py-5">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5">Full Job Description</p>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{selectedJob.description}</p>

                {/* 1-Click Tailor Prompt Banner */}
                <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-100 flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-slate-900">Want to guarantee an interview?</p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Let AI align your work history bullet points with {selectedJob.company}'s specific job description.
                    </p>
                    <button
                      onClick={() => navigate(`/generate?job=${encodeURIComponent(selectedJob.description)}`)}
                      className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors shadow-sm"
                    >
                      Tailor Resume For This Role <ArrowRight className="w-3.5 h-3.5" />
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
