import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { FileText, PlusCircle, ExternalLink, Download, Lock as LockIcon } from 'lucide-react';

interface CV {
  id: string;
  status: string;
  tier: string | null;
  ats_score: number | null;
  watermarked_pdf_url: string | null;
  clean_pdf_url: string | null;
  created_at: string;
}

export default function Dashboard() {
  const { user, updateCredits, logout } = useAuthStore();
  const [cvs, setCvs] = useState<CV[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [creditsRes, cvsRes] = await Promise.all([
          api.get('/billing/credits'),
          api.get('/cv/')
        ]);
        updateCredits(creditsRes.data.credits);
        setCvs(cvsRes.data);
      } catch (err) {
        console.error('Failed to load dashboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, [updateCredits]);

  const handleCheckout = async (tier: string) => {
    try {
      const res = await api.get(`/billing/checkout/${tier}`);
      window.location.href = res.data.checkout_url;
    } catch (err) {
      console.error('Checkout failed', err);
      alert('Failed to initialize checkout.');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <nav className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="text-xl font-bold bg-gradient-to-r from-primary to-blue-400 bg-clip-text text-transparent">
            Vitelo
          </Link>
          <div className="flex items-center gap-6">
            <span className="text-sm font-medium px-3 py-1 bg-slate-100 rounded-full">
              Credits: {user?.credits || 0}
            </span>
            <button onClick={handleLogout} className="text-sm text-slate-500 hover:text-slate-900">
              Log out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold">Your CVs</h1>
            <p className="text-slate-500 text-sm mt-1">Manage and unlock your generated resumes.</p>
          </div>
          <Link to="/generate" className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow hover:bg-primary/90 transition-colors">
            <PlusCircle className="mr-2 h-4 w-4" /> Create New CV
          </Link>
        </div>

        {loading ? (
          <div className="animate-pulse flex space-x-4">
            <div className="flex-1 space-y-4 py-1">
              <div className="h-4 bg-slate-200 rounded w-1/4"></div>
              <div className="space-y-2">
                <div className="h-20 bg-slate-200 rounded"></div>
                <div className="h-20 bg-slate-200 rounded"></div>
              </div>
            </div>
          </div>
        ) : cvs.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-dashed">
            <h3 className="text-lg font-medium text-slate-900">No CVs generated yet</h3>
            <p className="mt-2 text-sm text-slate-500">Create your first highly-optimized AI CV for free.</p>
            <Link to="/generate" className="mt-6 inline-flex items-center justify-center rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors">
              Get Started
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {cvs.map((cv) => (
              <div key={cv.id} className="bg-white rounded-xl border shadow-sm p-5 flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className="bg-blue-50 text-blue-700 w-10 h-10 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5" />
                  </div>
                  {cv.tier ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      Unlocked - {cv.tier.toUpperCase()}
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                      Draft Preview
                    </span>
                  )}
                </div>
                
                <div className="mb-4">
                  <p className="text-sm text-slate-500 mb-1">Generated {new Date(cv.created_at).toLocaleDateString()}</p>
                  <p className="font-semibold text-slate-900">ATS Score: {cv.ats_score || 'N/A'}/100</p>
                </div>

                <div className="mt-auto space-y-2">
                  {cv.clean_pdf_url ? (
                    <a href={cv.clean_pdf_url} target="_blank" rel="noreferrer" className="w-full inline-flex justify-center items-center rounded-md bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary/90 transition-colors">
                      <Download className="mr-2 h-4 w-4" /> Download Clean PDF
                    </a>
                  ) : (
                    <div className="space-y-2">
                      <a href={cv.watermarked_pdf_url || '#'} target="_blank" rel="noreferrer" className="w-full inline-flex justify-center items-center rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none">
                        <ExternalLink className="mr-2 h-4 w-4" /> View Preview
                      </a>
                      
                      {/* Unlock Flow directly from Dashboard */}
                      {(user?.credits || 0) > 0 ? (
                        <Link to={`/generate?unlock=${cv.id}`} className="w-full inline-flex justify-center items-center rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors">
                          <LockIcon className="mr-2 h-4 w-4" /> Use Credit to Unlock
                        </Link>
                      ) : (
                        <button onClick={() => handleCheckout('basic')} className="w-full inline-flex justify-center items-center rounded-md bg-gradient-to-r from-green-500 to-emerald-600 px-3 py-2 text-sm font-medium text-white hover:from-green-600 hover:to-emerald-700 transition-colors">
                          <LockIcon className="mr-2 h-4 w-4" /> Buy Credit ($3)
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
