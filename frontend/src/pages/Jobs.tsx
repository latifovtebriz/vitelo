import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Search, MapPin, Clock, Heart, Briefcase, Filter } from 'lucide-react';

const SAMPLE_JOBS = [
  { id: '1', title: 'Frontend Developer', company: 'PASHA Insurance World', location: 'Baku, Baku Economic Zone, Azerbaijan', posted: '13 days ago' },
  { id: '2', title: 'Full Stack Engineer', company: 'VLand Systems', location: 'Sumgayit, Absheron - Khizi, Azerbaijan', posted: '5 days ago' },
  { id: '3', title: 'UI/UX Designer', company: 'ABB', location: 'Baku, Azerbaijan', posted: '3 days ago' },
  { id: '4', title: 'Backend Developer', company: 'Kapital Bank', location: 'Baku, Azerbaijan', posted: '1 day ago' },
];

export default function Jobs() {
  const [query, setQuery] = useState('');
  const [location, setLocation] = useState('');
  const [selectedJob, setSelectedJob] = useState(SAMPLE_JOBS[0]);
  const [activeTab, setActiveTab] = useState('recommended');

  return (
    <DashboardLayout activeKey="jobs">
      {/* Search bar */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Job title or company" value={query} onChange={e => setQuery(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
        </div>
        <div className="relative flex-1">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Location" value={location} onChange={e => setLocation(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
        </div>
        <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-sm hover:shadow-md transition-all whitespace-nowrap">Find Jobs</button>
      </div>

      {/* Tabs + filters */}
      <div className="flex items-center justify-between mb-4 border-b border-slate-200">
        <div className="flex gap-6">
          {[{ key: 'recommended', label: 'Recommended Jobs', count: 6 }, { key: 'search', label: 'Search', count: 10 }].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)} className={`pb-3 text-sm font-semibold border-b-2 transition-all ${activeTab === tab.key ? 'text-blue-600 border-blue-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1 text-sm text-slate-400 pb-3">
          <Heart className="w-4 h-4" /> 0
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        {['Any location type', 'Any contract type', 'Posted anytime'].map(f => (
          <button key={f} className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 text-xs text-slate-600 hover:bg-slate-50 transition-colors">
            {f} <Filter className="w-3 h-3" />
          </button>
        ))}
      </div>

      {/* ⭐ You're a good match banner */}
      <div className="flex items-center gap-2 mb-6 px-4 py-3 bg-blue-50 rounded-xl border border-blue-100">
        <span className="text-sm">✨</span>
        <p className="text-sm text-slate-700">You're a good match for these jobs. <a href="/account" className="text-blue-600 font-semibold hover:underline">Change your preferences here</a></p>
      </div>

      {/* Job list + detail */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: job cards */}
        <div className="space-y-3">
          {SAMPLE_JOBS.map(job => (
            <div key={job.id} onClick={() => setSelectedJob(job)}
              className={`p-4 rounded-xl border cursor-pointer transition-all ${selectedJob?.id === job.id ? 'border-blue-300 bg-blue-50/50 shadow-sm' : 'border-slate-200 bg-white hover:shadow-sm'}`}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">{job.company[0]}</div>
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-800 text-sm">{job.title}</p>
                  <p className="text-xs text-slate-500">{job.company}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{job.location}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{job.posted}</span>
                  </div>
                </div>
                <button className="text-slate-300 hover:text-red-400 transition-colors"><Heart className="w-4 h-4" /></button>
              </div>
            </div>
          ))}
        </div>

        {/* Right: job detail */}
        {selectedJob && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 sticky top-20 self-start">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold flex-shrink-0">{selectedJob.company[0]}</div>
              <div>
                <p className="text-xs text-slate-500">{selectedJob.company}</p>
                <h3 className="text-lg font-bold text-slate-800">{selectedJob.title}</h3>
                <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{selectedJob.location}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{selectedJob.posted}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mb-6">
              <a href="/generate" className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold text-center hover:shadow-md transition-all flex items-center justify-center gap-2">
                <Briefcase className="w-4 h-4" /> Tailor my resume
              </a>
              <button className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors">Apply</button>
            </div>

            <h4 className="font-bold text-slate-800 mb-2">Summary</h4>
            <p className="text-sm text-slate-600 leading-relaxed">This is a great opportunity for experienced professionals. The role involves working with cutting-edge technology in a dynamic environment. Apply now to join a growing team!</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
