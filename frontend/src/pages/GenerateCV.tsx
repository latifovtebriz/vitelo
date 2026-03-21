import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useAuthStore } from '../stores/authStore';
import { FileDown, ChevronRight, Lock as LockIcon } from 'lucide-react';

export default function GenerateCV() {
  const [searchParams] = useSearchParams();
  const unlockId = searchParams.get('unlock'); // Used if user came from dashboard to unlock
  const { user, updateCredits } = useAuthStore();
  const navigate = useNavigate();

  // State
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [generatedData, setGeneratedData] = useState<any>(null); // holds cv_id, watermarked_url, ats_score
  
  // Unlock State
  const [selectedTier, setSelectedTier] = useState('basic');

  // Form State
  const [formData, setFormData] = useState({
    personal: { name: '', email: '', phone: '', location: '', linkedin: '' },
    experience: [{ job_title: '', company: '', start_date: '', end_date: '', description: '', achievements: [] }],
    education: [{ degree: '', institution: '', graduation_year: '' }],
    skills: '',
    target_job: '',
  });

  useEffect(() => {
    if (unlockId) {
      // If we landed here via ?unlock=UUID, skip form and go to Unlock view
      setGeneratedData({ cv_id: unlockId, watermarked_pdf_url: null });
      setStep(3);
    }
  }, [unlockId]);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        personal: formData.personal,
        experience: formData.experience,
        education: formData.education,
        skills: formData.skills.split(',').map(s => s.trim()).filter(Boolean),
        target_job: formData.target_job
      };

      const res = await api.post('/cv/generate', payload);
      setGeneratedData(res.data);
      setStep(3); // Result / Unlock page
    } catch (err) {
      console.error(err);
      alert('Generation failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async () => {
    if ((user?.credits || 0) < 1) {
      // Need to buy credits -> redirect to checkout for selected tier
      try {
        const res = await api.get(`/billing/checkout/${selectedTier}`);
        window.location.href = res.data.checkout_url;
      } catch (err) {
        alert("Failed to initiate checkout");
      }
      return;
    }

    // Has credits -> proceed to unlock
    setUnlocking(true);
    try {
      await api.post(`/cv/unlock/${generatedData.cv_id}`, {
        tier: selectedTier,
        job_description: formData.target_job || 'General Role'
      });
      // Updating local credits
      updateCredits((user?.credits || 1) - 1);
      alert('CV Unlocked Successfully!');
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
      alert('Unlock failed');
    } finally {
      setUnlocking(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border p-8">
        
        {/* Progress Tracker */}
        {step < 3 && (
          <div className="mb-8 flex items-center justify-between border-b pb-4">
            <h1 className="text-2xl font-bold text-slate-900">Create your CV</h1>
            <span className="text-sm font-medium text-slate-500">Step {step} of 2</span>
          </div>
        )}

        {/* STEP 1: Personal & Education */}
        {step === 1 && (
          <form className="space-y-6" onSubmit={() => setStep(2)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700">Full Name</label>
                <input required type="text" className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  value={formData.personal.name} onChange={e => setFormData({...formData, personal: {...formData.personal, name: e.target.value}})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Email</label>
                <input required type="email" className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  value={formData.personal.email} onChange={e => setFormData({...formData, personal: {...formData.personal, email: e.target.value}})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Phone</label>
                <input type="text" className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  value={formData.personal.phone} onChange={e => setFormData({...formData, personal: {...formData.personal, phone: e.target.value}})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Target Job (Optional)</label>
                <input type="text" placeholder="e.g. Senior Frontend Developer" className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  value={formData.target_job} onChange={e => setFormData({...formData, target_job: e.target.value})} />
              </div>
            </div>

            <hr className="my-6" />
            <h3 className="text-lg font-medium text-slate-900">Highest Education</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">Institution</label>
                <input required type="text" className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  value={formData.education[0].institution} onChange={e => setFormData({...formData, education: [{...formData.education[0], institution: e.target.value}]})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Degree & Year</label>
                <input required type="text" placeholder="BSc CompSci 2024" className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  value={formData.education[0].degree} onChange={e => setFormData({...formData, education: [{...formData.education[0], degree: e.target.value, graduation_year: '2024'}]})} />
              </div>
            </div>

            <div className="mt-8 flex justify-end">
              <button type="button" onClick={() => setStep(2)} className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90">
                Continue <ChevronRight className="ml-2 h-4 w-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: Experience & Skills */}
        {step === 2 && (
          <form className="space-y-6" onSubmit={handleGenerate}>
            <h3 className="text-lg font-medium text-slate-900">Recent Experience</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-lg border">
              <div>
                <label className="block text-sm font-medium text-slate-700">Job Title</label>
                <input required type="text" className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm sm:text-sm"
                  value={formData.experience[0].job_title} onChange={e => setFormData({...formData, experience: [{...formData.experience[0], job_title: e.target.value}]})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Company</label>
                <input required type="text" className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm sm:text-sm"
                  value={formData.experience[0].company} onChange={e => setFormData({...formData, experience: [{...formData.experience[0], company: e.target.value}]})} />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700">What did you do? (Be descriptive, AI will optimize it)</label>
                <textarea required rows={4} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm sm:text-sm"
                  value={formData.experience[0].description} onChange={e => setFormData({...formData, experience: [{...formData.experience[0], description: e.target.value}]})} />
              </div>
            </div>

            <div className="mt-6">
              <label className="block text-sm font-medium text-slate-700">Skills (Comma separated)</label>
              <input type="text" placeholder="React, Python, Project Management" className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm sm:text-sm"
                 value={formData.skills} onChange={e => setFormData({...formData, skills: e.target.value})} />
            </div>

            <div className="mt-8 flex justify-between">
              <button type="button" onClick={() => setStep(1)} className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50">
                Back
              </button>
              <button type="submit" disabled={loading} className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 disabled:opacity-75">
                {loading ? 'AI is working...' : 'Generate CV'}
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Preview & Unlock */}
        {step === 3 && generatedData && (
          <div className="text-center">
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">{!unlockId ? 'CV Generated Successfully!' : 'Unlock Your CV'}</h2>
            
            {generatedData.ats_score && (
              <p className="inline-block px-4 py-1.5 rounded-full bg-green-100 text-green-800 font-semibold mb-8">
                ATS Score: {generatedData.ats_score}/100 🔥
              </p>
            )}

            <div className="relative mx-auto max-w-lg mb-10 group rounded-xl overflow-hidden border shadow-sm">
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 transition-all">
                <LockIcon className="w-12 h-12 text-white/50 mb-4" />
                <h3 className="text-2xl font-bold text-white mb-2">Unlock Clean PDF</h3>
                <p className="text-slate-200 text-sm mb-6">Remove the watermark and download in high-resolution.</p>
                
                <div className="flex gap-2 bg-white/10 p-1 rounded-lg backdrop-blur-md mb-6 w-full max-w-sm">
                  {['basic', 'pro', 'ultimate'].map(tier => (
                    <button key={tier} onClick={() => setSelectedTier(tier)} className={`flex-1 capitalize text-sm py-2 rounded-md font-medium transition-colors ${selectedTier === tier ? 'bg-white text-slate-900 shadow' : 'text-white hover:bg-white/20'}`}>
                      {tier}
                    </button>
                  ))}
                </div>

                <div className="text-slate-100 text-sm mb-6 italic">
                  {selectedTier === 'basic' && "$3 - High-res PDF download"}
                  {selectedTier === 'pro' && "$5.99 - CV + Detailed Cover Letter"}
                  {selectedTier === 'ultimate' && "$8.99 - CV + Cover Letter + 5 Interview Q&As"}
                </div>

                <button onClick={handleUnlock} disabled={unlocking} className="w-full max-w-sm inline-flex justify-center items-center rounded-md bg-gradient-to-r from-green-500 to-emerald-600 px-6 py-3 text-base font-bold text-white shadow hover:from-green-600 hover:to-emerald-700">
                  {unlocking ? 'Processing...' : (user?.credits || 0) > 0 ? 'Use 1 Credit to Unlock' : 'Checkout & Unlock'}
                </button>
              </div>

              {/* Fake preview background mimicking CV */}
              <div className="bg-white p-8 h-96 select-none opacity-50 relative pointer-events-none">
                 <div className="absolute inset-0 flex items-center justify-center text-4xl font-black text-slate-200 -rotate-45 tracking-widest z-0">VITELO</div>
                 <div className="h-4 bg-slate-200 w-1/3 mb-4 rounded"></div>
                 <div className="h-2 bg-slate-100 w-1/4 mb-8 rounded"></div>
                 <div className="h-2 bg-slate-100 w-full mb-2 rounded"></div>
                 <div className="h-2 bg-slate-100 w-5/6 mb-6 rounded"></div>
                 <div className="h-3 bg-slate-200 w-1/4 mb-3 rounded"></div>
                 <div className="h-2 bg-slate-100 w-full mb-2 rounded"></div>
                 <div className="h-2 bg-slate-100 w-4/5 mb-2 rounded"></div>
              </div>
            </div>

            {generatedData.watermarked_pdf_url && (
              <a href={generatedData.watermarked_pdf_url} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700">
                <FileDown className="mr-2 h-4 w-4" /> Download Watermarked Preview (Free)
              </a>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
