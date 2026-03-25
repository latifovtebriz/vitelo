import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { Brain, Sparkles } from 'lucide-react';

export default function InterviewPrep() {
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');

  return (
    <DashboardLayout activeKey="interview">
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
          <div className="inline-flex px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold mb-5">Sample Interview</div>
          <h1 className="text-xl font-bold text-slate-800 mb-2">Tell us about this dream job</h1>
          <p className="text-sm text-slate-500 mb-6">Enter the job title and company. We'll use these to generate real questions from our database.</p>

          <div className="space-y-5">
            <div>
              <label className="text-sm text-slate-500 mb-1.5 block">Job Title</label>
              <input type="text" placeholder="e.g. Software Developer" value={jobTitle} onChange={e => setJobTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
            </div>
            <div>
              <label className="text-sm text-slate-500 mb-1.5 block">Desired Company (Optional)</label>
              <input type="text" placeholder="e.g. Amazon, Google" value={company} onChange={e => setCompany(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
            </div>

            {/* Step dots */}
            <div className="flex items-center gap-2 pt-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
            </div>

            <button className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm hover:shadow-md transition-all flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4" /> Create Interview
            </button>
          </div>
        </div>

        {/* Preview card */}
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border border-slate-200 p-8 flex flex-col items-center justify-center">
          <div className="w-28 h-28 rounded-2xl bg-white border border-slate-200 flex items-center justify-center mb-5 shadow-sm">
            <Brain className="w-12 h-12 text-blue-400" />
          </div>
          <p className="text-sm text-slate-400 mb-1">Job title</p>
          <div className="bg-white rounded-xl border border-blue-200 px-6 py-4 shadow-sm">
            <p className="text-xl font-bold text-slate-800">{jobTitle || 'Software Engineer'}</p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
