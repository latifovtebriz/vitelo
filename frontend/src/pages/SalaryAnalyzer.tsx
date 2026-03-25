import { useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { DollarSign, Building2, MapPin, ArrowRight, Info } from 'lucide-react';

export default function SalaryAnalyzer() {
  const [step, setStep] = useState(1);
  const [jobTitle, setJobTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');

  return (
    <DashboardLayout activeKey="salary">
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Form */}
        <div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Step {step}: Offer Details</h1>
          <p className="text-sm text-slate-500 mb-8">Please enter offered job title, location and company name</p>

          <div className="space-y-5">
            <div>
              <label className="text-sm text-slate-500 mb-1.5 block">Job Title</label>
              <input type="text" placeholder="Software Developer" value={jobTitle} onChange={e => setJobTitle(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
            </div>
            <div>
              <label className="text-sm text-slate-500 mb-1.5 block">Company Name</label>
              <input type="text" placeholder="Talent Inc" value={company} onChange={e => setCompany(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
            </div>
            <div>
              <label className="text-sm text-slate-500 mb-1.5 block">Location</label>
              <input type="text" placeholder="City, state" value={location} onChange={e => setLocation(e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
            </div>

            {/* Info box */}
            <div className="flex items-start gap-3 bg-blue-50 rounded-xl p-4 border border-blue-100">
              <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-slate-600">Salary Analyzer is currently available for Azerbaijan and popular international markets. More regions will be added soon.</p>
            </div>

            {/* Step dots */}
            <div className="flex items-center gap-2">
              {[1, 2, 3].map(s => (
                <div key={s} className={`w-2.5 h-2.5 rounded-full ${step === s ? 'bg-blue-500' : 'bg-slate-200'}`} />
              ))}
            </div>

            <button onClick={() => setStep(Math.min(step + 1, 3))}
              className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-sm hover:shadow-md transition-all flex items-center gap-2">
              Next <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Preview card */}
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border border-slate-200 p-8 self-start">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4">{jobTitle || 'Job Title'}</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <Building2 className="w-4 h-4 text-slate-400" /> {company || 'Company Name'}
              </div>
              <div className="flex items-center gap-3 text-sm text-slate-600">
                <MapPin className="w-4 h-4 text-slate-400" /> {location || 'Location'}
              </div>
            </div>

            {step >= 2 && (
              <div className="mt-6 pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-semibold text-slate-700">Estimated Range</span>
                </div>
                <p className="text-2xl font-bold text-green-600">$45,000 — $85,000</p>
                <p className="text-xs text-slate-400 mt-1">Based on market data for this role</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
