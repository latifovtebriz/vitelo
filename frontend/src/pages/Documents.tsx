import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import DashboardLayout from '../components/DashboardLayout';
import { FileText, Plus, Download, ExternalLink, Sparkles, MoreHorizontal } from 'lucide-react';

interface CV { id: string; status: string; tier: string | null; ats_score: number | null; watermarked_pdf_url: string | null; clean_pdf_url: string | null; created_at: string; template: string; }

export default function Documents() {
  const [searchParams] = useSearchParams();
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') === 'covers' ? 'covers' : 'resumes');
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/cv/').then(res => setCvs(res.data)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout activeKey="documents">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Resumes & Cover Letters</h1>
        <Link to="/generate" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold hover:shadow-md transition-all">
          <Plus className="w-4 h-4" /> Create New
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-slate-200 mb-8">
        {[{ key: 'resumes', label: 'Resumes' }, { key: 'covers', label: 'Cover Letters' }].map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`pb-3 text-sm font-semibold transition-all border-b-2 ${activeTab === tab.key ? 'text-blue-600 border-blue-600' : 'text-slate-400 border-transparent hover:text-slate-600'}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Promo banner */}
      <div className="flex items-center gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4 mb-8">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1">
          <p className="text-sm font-semibold text-slate-800">Ready to give your job search a boost?</p>
          <p className="text-xs text-slate-500">Choose your resume and we'll help you tailor it in just a few clicks</p>
        </div>
        <Link to="/generate" className="px-4 py-2 rounded-lg border border-slate-300 text-sm font-semibold text-slate-700 hover:bg-white transition-colors whitespace-nowrap">Start Now</Link>
      </div>

      {/* Resumes tab */}
      {activeTab === 'resumes' && (
        <div>
          {loading ? (
            <div className="animate-pulse space-y-4"><div className="h-36 bg-slate-200 rounded-xl" /></div>
          ) : cvs.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200">
              <FileText className="w-10 h-10 mx-auto text-slate-300 mb-3" />
              <p className="font-medium text-slate-600">No resumes yet</p>
              <p className="text-sm text-slate-400 mt-1 mb-4">Create your first AI-powered resume.</p>
              <Link to="/generate" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700">
                <Sparkles className="w-4 h-4" /> Create Resume
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {cvs.map(cv => (
                <div key={cv.id} className="bg-white rounded-xl border border-slate-200 p-5 flex items-start gap-5 hover:shadow-sm transition-shadow">
                  {/* Thumbnail */}
                  <div className="w-24 h-32 rounded-lg bg-gradient-to-br from-slate-100 to-slate-200 border border-slate-200 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-8 h-8 text-slate-300" />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <h3 className="font-bold text-slate-800">Untitled ✏️</h3>
                        <p className="text-xs text-slate-400">Updated {new Date(cv.created_at).toLocaleDateString()}</p>
                      </div>
                      <button className="p-1.5 rounded-md hover:bg-slate-100"><MoreHorizontal className="w-4 h-4 text-slate-400" /></button>
                    </div>

                    {/* ATS Score */}
                    {cv.ats_score && (
                      <div className="inline-flex items-center gap-1.5 mt-2 mb-3">
                        <span className={`px-2 py-0.5 rounded text-xs font-bold text-white ${cv.ats_score >= 80 ? 'bg-green-500' : cv.ats_score >= 50 ? 'bg-amber-500' : 'bg-red-500'}`}>{cv.ats_score}%</span>
                        <span className="text-xs text-slate-500">Your resume score</span>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="space-y-1.5">
                      <button className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600 transition-colors">
                        <Sparkles className="w-3.5 h-3.5" /> Tailor to job listing
                      </button>
                      {cv.clean_pdf_url ? (
                        <a href={cv.clean_pdf_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600"><Download className="w-3.5 h-3.5" /> Download PDF</a>
                      ) : cv.watermarked_pdf_url ? (
                        <a href={cv.watermarked_pdf_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600"><ExternalLink className="w-3.5 h-3.5" /> Preview PDF</a>
                      ) : null}
                      <button className="flex items-center gap-2 text-sm text-slate-600 hover:text-blue-600"><MoreHorizontal className="w-3.5 h-3.5" /> More</button>
                    </div>
                  </div>

                  {/* New resume card */}
                  <div className="hidden lg:flex w-36 h-32 rounded-xl border-2 border-dashed border-slate-200 items-center justify-center flex-col gap-2 hover:border-blue-300 hover:bg-blue-50/50 transition-colors cursor-pointer flex-shrink-0" onClick={() => window.location.href = '/generate'}>
                    <Plus className="w-6 h-6 text-slate-300" />
                    <div className="text-center">
                      <p className="text-xs font-bold text-slate-600">New Resume</p>
                      <p className="text-[10px] text-slate-400 leading-tight">Create a tailored resume</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Cover Letters tab */}
      {activeTab === 'covers' && (
        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-slate-200">
          <FileText className="w-10 h-10 mx-auto text-slate-300 mb-3" />
          <p className="font-medium text-slate-600">No cover letters yet</p>
          <p className="text-sm text-slate-400 mt-1 mb-4">Generate one from your CV with AI.</p>
          <Link to="/cover-letter" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700"><Sparkles className="w-4 h-4" /> Create Cover Letter</Link>
        </div>
      )}
    </DashboardLayout>
  );
}
