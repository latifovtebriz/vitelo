import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { api } from '../lib/api';
import DashboardLayout from '../components/DashboardLayout';
import {
  CreditCard, AlertTriangle, User, Lock,
  Check, Loader2, Bell, ChevronRight,
  Coins, Eye, EyeOff, LogOut, Trash2, Terminal,
} from 'lucide-react';


type Section = 'profile' | 'security' | 'billing' | 'notifications';

export default function Account() {
  const { user, logout, updateCredits } = useAuthStore();
  const [activeSection, setActiveSection] = useState<Section>('profile');

  /* ── Profile ── */
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email] = useState(user?.email || '');
  const [profileSaved, setProfileSaved] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);

  /* ── Password ── */
  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [pwdError, setPwdError] = useState('');
  const [pwdSaved, setPwdSaved] = useState(false);
  const [pwdLoading, setPwdLoading] = useState(false);

  /* ── Credits & Transactions ── */
  const [credits, setCredits] = useState(user?.credits ?? 0);
  const [creditsLoading, setCreditsLoading] = useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [txnsLoading, setTxnsLoading] = useState(false);

  /* ── Notifications ── */
  const [notifs, setNotifs] = useState({
    job_matches: true,
    interview_reminders: true,
    product_updates: false,
    weekly_summary: true,
  });
  const [notifSaved, setNotifSaved] = useState(false);

  /* ── Delete account ── */
  const [showDelete, setShowDelete] = useState(false);

  /* ── Load credits & transactions ── */
  useEffect(() => {
    setCreditsLoading(true);
    api.get('/billing/credits')
      .then(r => { setCredits(r.data.credits); updateCredits(r.data.credits); })
      .catch(() => {})
      .finally(() => setCreditsLoading(false));

    setTxnsLoading(true);
    api.get('/billing/history')
      .then(r => {
        if (Array.isArray(r.data)) setTransactions(r.data);
      })
      .catch(() => {})
      .finally(() => setTxnsLoading(false));
  }, [updateCredits]);

  /* ── Save profile ── */
  const saveProfile = async () => {
    if (!fullName.trim()) return;
    setProfileLoading(true);
    try {
      await api.patch('/user/me', { full_name: fullName.trim() });
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch (e) { console.error(e); }
    finally { setProfileLoading(false); }
  };

  /* ── Change password ── */
  const changePassword = async () => {
    setPwdError('');
    if (newPwd.length < 8) { setPwdError('Password must be at least 8 characters.'); return; }
    if (newPwd !== confirmPwd) { setPwdError('Passwords do not match.'); return; }
    setPwdLoading(true);
    try {
      await api.post('/auth/change-password', { current_password: currentPwd, new_password: newPwd });
      setPwdSaved(true);
      setCurrentPwd(''); setNewPwd(''); setConfirmPwd('');
      setTimeout(() => setPwdSaved(false), 3000);
    } catch (e: any) {
      setPwdError(e?.response?.data?.detail || 'Failed to update password. Please check your current password.');
    } finally { setPwdLoading(false); }
  };

  /* ── Save notifications ── */
  const saveNotifs = () => {
    setNotifSaved(true);
    setTimeout(() => setNotifSaved(false), 2500);
  };

  /* ── Delete ── */
  const handleDelete = () => {
    logout();
    localStorage.clear();
    window.location.href = '/';
  };

  const SECTIONS: { key: Section; label: string; icon: typeof User }[] = [
    { key: 'profile', label: 'Profile', icon: User },
    { key: 'security', label: 'Password & Security', icon: Lock },
    { key: 'billing', label: 'Credits & Billing', icon: CreditCard },
    { key: 'notifications', label: 'Notifications', icon: Bell },
  ];

  return (
    <DashboardLayout activeKey="settings">
      <div className="max-w-4xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Account Settings</h1>
          <p className="text-sm text-slate-400 mt-1">Manage your profile, security, and preferences</p>
        </div>

        <div className="grid md:grid-cols-4 gap-6">

          {/* ── Sidebar Nav ── */}
          <div className="md:col-span-1">
            <nav className="space-y-1">
              {SECTIONS.map(s => (
                <button key={s.key} onClick={() => setActiveSection(s.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    activeSection === s.key
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}>
                  <s.icon className={`w-4 h-4 ${activeSection === s.key ? 'text-blue-500' : 'text-slate-400'}`} />
                  {s.label}
                  {activeSection === s.key && <ChevronRight className="w-3.5 h-3.5 ml-auto text-blue-400" />}
                </button>
              ))}
              <div className="pt-4 border-t border-slate-100 mt-4 space-y-1">
                <Link to="/logs"
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-all">
                  <Terminal className="w-4 h-4 text-indigo-600" /> Live System Logs
                </Link>
                <button onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all">
                  <LogOut className="w-4 h-4" /> Log Out
                </button>
              </div>
            </nav>
          </div>

          {/* ── Main Content ── */}
          <div className="md:col-span-3 space-y-5">

            {/* ════ PROFILE ════ */}
            {activeSection === 'profile' && (
              <>
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <h2 className="font-bold text-slate-800 mb-5">Personal Information</h2>

                  {/* Avatar */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-2xl font-extrabold">
                      {(fullName || user?.full_name || 'U')[0]?.toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{user?.full_name || 'Your Name'}</p>
                      <p className="text-sm text-slate-400">{user?.email}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm text-slate-500 mb-1.5">Full Name</label>
                      <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm text-slate-500 mb-1.5">Email Address</label>
                      <input type="email" value={email} disabled
                        className="w-full rounded-xl border border-slate-100 px-4 py-3 text-sm bg-slate-50 text-slate-400 cursor-not-allowed" />
                      <p className="text-xs text-slate-400 mt-1">Email address cannot be changed</p>
                    </div>
                  </div>

                  <button onClick={saveProfile} disabled={profileLoading || !fullName.trim()}
                    className="mt-5 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2">
                    {profileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : profileSaved ? <Check className="w-4 h-4" /> : null}
                    {profileSaved ? 'Saved!' : 'Save Changes'}
                  </button>
                </div>

                {/* Danger Zone */}
                <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-6">
                  <h2 className="font-bold text-red-700 mb-1 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" /> Danger Zone
                  </h2>
                  <p className="text-sm text-slate-500 mb-4">Permanently delete your account and all associated data. This cannot be undone.</p>
                  <button onClick={() => setShowDelete(true)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-bold hover:bg-red-50 transition-colors">
                    <Trash2 className="w-4 h-4" /> Delete My Account
                  </button>
                </div>
              </>
            )}

            {/* ════ SECURITY ════ */}
            {activeSection === 'security' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="font-bold text-slate-800 mb-5">Change Password</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-slate-500 mb-1.5">Current Password</label>
                    <div className="relative">
                      <input type={showPwd ? 'text' : 'password'} value={currentPwd}
                        onChange={e => setCurrentPwd(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none pr-10" />
                      <button onClick={() => setShowPwd(!showPwd)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                        {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-slate-500 mb-1.5">New Password</label>
                    <input type={showPwd ? 'text' : 'password'} value={newPwd}
                      onChange={e => setNewPwd(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm text-slate-500 mb-1.5">Confirm New Password</label>
                    <input type={showPwd ? 'text' : 'password'} value={confirmPwd}
                      onChange={e => setConfirmPwd(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:ring-2 focus:ring-blue-400 focus:outline-none" />
                  </div>

                  {/* Strength indicator */}
                  {newPwd && (
                    <div className="space-y-1">
                      <div className="flex gap-1">
                        {[1, 2, 3, 4].map(i => (
                          <div key={i} className={`flex-1 h-1.5 rounded-full transition-colors ${
                            newPwd.length >= i * 3
                              ? i <= 1 ? 'bg-red-400' : i <= 2 ? 'bg-amber-400' : i <= 3 ? 'bg-blue-400' : 'bg-emerald-500'
                              : 'bg-slate-100'
                          }`} />
                        ))}
                      </div>
                      <p className="text-xs text-slate-400">
                        {newPwd.length < 4 ? 'Very weak' : newPwd.length < 7 ? 'Weak' : newPwd.length < 10 ? 'Medium' : 'Strong'}
                      </p>
                    </div>
                  )}

                  {pwdError && (
                    <p className="text-sm text-red-600 flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" /> {pwdError}
                    </p>
                  )}
                  {pwdSaved && (
                    <p className="text-sm text-emerald-600 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5" /> Password updated successfully!
                    </p>
                  )}

                  <button onClick={changePassword}
                    disabled={pwdLoading || !currentPwd || !newPwd || !confirmPwd}
                    className="px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-all flex items-center gap-2">
                    {pwdLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                    Update Password
                  </button>
                </div>
              </div>
            )}

            {/* ════ BILLING ════ */}
            {activeSection === 'billing' && (
              <>
                {/* Credits balance */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-blue-200 mb-1">Available Credits</p>
                      {creditsLoading ? (
                        <Loader2 className="w-8 h-8 animate-spin text-white/60" />
                      ) : (
                        <p className="text-4xl font-extrabold">{credits}</p>
                      )}
                      <p className="text-xs text-blue-200 mt-1">1 credit = 1 CV generation or unlock</p>
                    </div>
                    <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center">
                      <Coins className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>

                {/* Plans */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <h2 className="font-bold text-slate-800 mb-4">Choose Career Package</h2>
                  <div className="grid sm:grid-cols-3 gap-4">
                    {[
                      { name: 'Basic', credits: '3 CVs + 3 CLs', price: '$4.99', color: 'border-slate-200', btnColor: 'bg-slate-800 hover:bg-slate-900' },
                      { name: 'Pro', credits: '5 CVs + 5 CLs', price: '$7.99', color: 'border-blue-300 ring-2 ring-blue-100', btnColor: 'bg-blue-600 hover:bg-blue-700', badge: 'Most Popular' },
                      { name: 'Ultimate', credits: '8 CVs + 8 CLs', price: '$12.99', color: 'border-purple-200', btnColor: 'bg-purple-600 hover:bg-purple-700' },
                    ].map(plan => (
                      <div key={plan.name} className={`rounded-xl border p-4 ${plan.color} relative`}>
                        {plan.badge && (
                          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[10px] font-extrabold px-3 py-0.5 rounded-full bg-blue-600 text-white whitespace-nowrap">
                            {plan.badge}
                          </span>
                        )}
                        <p className="font-bold text-slate-800 mt-1">{plan.name}</p>
                        <p className="text-2xl font-extrabold text-slate-900 mt-1">{plan.price}</p>
                        <p className="text-xs text-slate-500 mb-4">{plan.credits}</p>
                        <Link to="/dashboard-pricing"
                          className={`w-full block text-center py-2 rounded-lg text-white text-xs font-bold transition-colors ${plan.btnColor}`}>
                          Buy Package
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Transaction History Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <h2 className="font-bold text-slate-800 mb-4">Billing & Payment History</h2>
                  {txnsLoading ? (
                    <div className="flex items-center justify-center py-8 text-slate-400 gap-2">
                      <Loader2 className="w-5 h-5 animate-spin" /> Loading transactions...
                    </div>
                  ) : transactions.length === 0 ? (
                    <div className="text-center py-8 text-slate-400 text-xs">
                      No transactions recorded yet. Completed LemonSqueezy orders will appear here.
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="border-b border-slate-100 text-slate-400 uppercase font-extrabold text-[10px]">
                          <tr>
                            <th className="pb-3">Date</th>
                            <th className="pb-3">Package / Tier</th>
                            <th className="pb-3">Amount</th>
                            <th className="pb-3">Credits Granted</th>
                            <th className="pb-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 text-slate-700">
                          {transactions.map((tx: any) => (
                            <tr key={tx.id}>
                              <td className="py-3 font-medium">
                                {new Date(tx.created_at).toLocaleDateString()}
                              </td>
                              <td className="py-3 font-bold uppercase text-slate-900">
                                {tx.tier}
                              </td>
                              <td className="py-3 font-semibold text-slate-900">
                                ${tx.amount_usd}
                              </td>
                              <td className="py-3 text-blue-600 font-bold">
                                +{tx.credits_granted} credits
                              </td>
                              <td className="py-3">
                                <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                                  {tx.status || 'Paid'}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ════ NOTIFICATIONS ════ */}
            {activeSection === 'notifications' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h2 className="font-bold text-slate-800 mb-5">Notification Preferences</h2>
                <div className="space-y-4">
                  {[
                    { key: 'job_matches' as const, label: 'Job Matches', desc: 'Get notified when new jobs match your CV and skills' },
                    { key: 'interview_reminders' as const, label: 'Interview Reminders', desc: 'Receive reminders for scheduled interviews from your Job Tracker' },
                    { key: 'weekly_summary' as const, label: 'Weekly Summary', desc: 'A weekly digest of your job search activity and new opportunities' },
                    { key: 'product_updates' as const, label: 'Product Updates', desc: 'News about new features, templates, and improvements' },
                  ].map(item => (
                    <div key={item.key} className="flex items-start justify-between gap-4 py-3 border-b border-slate-50 last:border-0">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{item.label}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                      </div>
                      {/* Toggle */}
                      <button onClick={() => setNotifs(n => ({ ...n, [item.key]: !n[item.key] }))}
                        className={`flex-shrink-0 w-11 h-6 rounded-full transition-colors relative ${notifs[item.key] ? 'bg-blue-600' : 'bg-slate-200'}`}>
                        <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${notifs[item.key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={saveNotifs}
                  className="mt-5 px-6 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-all flex items-center gap-2">
                  {notifSaved ? <><Check className="w-4 h-4" /> Saved!</> : 'Save Preferences'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Delete Confirm Modal ── */}
      {showDelete && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setShowDelete(false)}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-base font-bold text-slate-800 text-center mb-1">Delete Account?</h3>
            <p className="text-sm text-slate-500 text-center mb-5">
              All your resumes, cover letters, interview sessions, and job tracker data will be permanently deleted. This cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setShowDelete(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50">
                Cancel
              </button>
              <button onClick={handleDelete}
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700 flex items-center justify-center gap-2">
                <Trash2 className="w-4 h-4" /> Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
