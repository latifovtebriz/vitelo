import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import DashboardLayout from '../components/DashboardLayout';
import { Shield, CreditCard, AlertTriangle, Coins } from 'lucide-react';

export default function Account() {
  const { user, logout } = useAuthStore();
  const [firstName, setFirstName] = useState(() => user?.full_name?.split(' ')[0] || '');
  const [lastName, setLastName] = useState(() => user?.full_name?.split(' ').slice(1).join(' ') || '');
  const [saved, setSaved] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleSave = () => {
    localStorage.setItem('vitelo_profile', JSON.stringify({ firstName, lastName }));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleDelete = () => {
    logout();
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <DashboardLayout activeKey="settings">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-slate-900 mb-8">Account Settings</h1>

        {/* YOUR PLAN */}
        <section className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Your Plan</h2>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">Free Account</h3>
                  <p className="text-sm text-slate-500 mt-0.5">
                    You are on the free plan. You can save your data and search for jobs. Upgrade for PDF downloads & premium features.
                  </p>
                </div>
              </div>
              <Link to="/pricing" className="text-sm font-semibold text-blue-600 hover:text-blue-700 whitespace-nowrap">
                Upgrade
              </Link>
            </div>

            {(user?.credits || 0) > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-500" />
                <span className="text-sm font-semibold text-slate-700">You have <span className="text-amber-600">{user?.credits}</span> credits</span>
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-slate-100">
              <Link to="/pricing" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm font-bold hover:shadow-md transition-all">
                <CreditCard className="w-4 h-4" /> Buy Credits
              </Link>
            </div>
          </div>
        </section>

        {/* ACCOUNT */}
        <section className="mb-8">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Account</h2>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm text-slate-500 mb-1.5">First Name</label>
                <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
              <div>
                <label className="block text-sm text-slate-500 mb-1.5">Last Name</label>
                <input type="text" value={lastName} onChange={e => setLastName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-sm text-slate-500 mb-1.5">Email</label>
              <input type="email" value={user?.email || ''} readOnly
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-500 cursor-not-allowed" />
              <p className="text-xs text-slate-400 mt-1">Use this email to log in to your Vitelo account and receive notifications.</p>
            </div>
            <div className="flex items-center justify-end gap-3">
              {saved && <span className="text-sm text-green-600 font-semibold">✓ Saved</span>}
              <button onClick={handleSave} className="text-sm font-bold text-blue-600 hover:text-blue-700">Save</button>
            </div>
          </div>
        </section>

        {/* DANGER ZONE */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-widest text-red-400 mb-4">Danger Zone</h2>
          <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-500" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-800">Delete Account</h3>
                <p className="text-sm text-slate-500 mt-0.5">Permanently delete your account and all associated data. This action cannot be undone.</p>
                <button onClick={() => setShowDeleteModal(true)} className="mt-3 px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors">
                  Delete My Account
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowDeleteModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <h3 className="font-bold text-slate-800 text-lg mb-2">Delete Account?</h3>
              <p className="text-sm text-slate-500 mb-6">All your CVs, credits, and data will be permanently lost.</p>
              <div className="flex gap-3">
                <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50">Cancel</button>
                <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700">Yes, Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
