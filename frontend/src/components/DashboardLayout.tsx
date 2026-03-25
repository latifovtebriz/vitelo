import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import {
  LayoutDashboard, FileText, Briefcase, ClipboardList, Brain,
  Search, DollarSign, CreditCard, BookOpen,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Settings, LogOut, Sparkles
} from 'lucide-react';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  { key: 'documents', label: 'Documents', icon: FileText, href: '#', children: [
    { label: 'My Resumes', href: '/documents' },
    { label: 'My Cover Letters', href: '/documents?tab=covers' },
  ]},
  { key: 'jobs', label: 'Jobs', icon: Briefcase, href: '/jobs' },
  { key: 'job-tracker', label: 'Job Tracker', icon: ClipboardList, href: '/job-tracker' },
  { key: 'interview', label: 'Interview Prep', icon: Brain, href: '/interview-prep' },
  { key: 'salary', label: 'Salary Analyzer', icon: DollarSign, href: '/salary-analyzer' },
  { key: 'learning', label: 'Unlimited Learning', icon: BookOpen, href: '/dashboard?tab=learning', badge: 'NEW' },
  { key: 'job-method', label: 'Job Search Method', icon: Search, href: '/job-search-method', hasChildren: true },
  { key: 'pricing', label: 'Pricing', icon: CreditCard, href: '/dashboard-pricing' },
];

interface Props { children: React.ReactNode; activeKey?: string; }

export default function DashboardLayout({ children, activeKey }: Props) {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>(null);

  const profilePct = 45;
  const currentKey = activeKey || 'dashboard';

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex">

      {/* ── Sidebar ── */}
      <aside className={`fixed top-0 left-0 h-full bg-white border-r border-slate-200 z-40 transition-all duration-300 flex flex-col ${collapsed ? 'w-16' : 'w-[232px]'}`}>

        {/* Logo */}
        <div className="px-4 py-4 border-b border-slate-100 flex items-center gap-2.5 min-h-[60px]">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          {!collapsed && <span className="font-extrabold text-lg text-slate-900 tracking-tight">Vitelo</span>}
        </div>

        {/* User card */}
        <div className={`px-3 py-3 border-b border-slate-100 ${collapsed ? 'flex justify-center' : ''}`}>
          <div className="flex items-center gap-2.5">
            <div className="relative flex-shrink-0">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
                {user?.full_name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="absolute -bottom-0.5 -left-0.5 bg-blue-500 text-white text-[8px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-[1.5px] border-white">
                {profilePct}%
              </div>
            </div>
            {!collapsed && (
              <div className="min-w-0">
                <p className="text-[13px] font-bold text-slate-800 truncate leading-tight">{user?.full_name || 'User'}</p>
                <Link to="/account" className="text-[11px] text-blue-500 hover:text-blue-600 leading-tight">Set your target role</Link>
              </div>
            )}
          </div>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto py-1.5 px-2">
          {NAV_ITEMS.map(item => {
            const isActive = currentKey === item.key;
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedMenu === item.key;

            return (
              <div key={item.key}>
                {hasChildren ? (
                  <button
                    onClick={() => setExpandedMenu(isExpanded ? null : item.key)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all mb-px ${isActive ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'}`}
                  >
                    <item.icon className={`w-[17px] h-[17px] flex-shrink-0 ${isActive ? 'text-blue-500' : 'text-slate-400'}`} />
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    to={item.href}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all mb-px ${isActive ? 'bg-blue-50 text-blue-600 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'}`}
                  >
                    <item.icon className={`w-[17px] h-[17px] flex-shrink-0 ${isActive ? 'text-blue-500' : 'text-slate-400'}`} />
                    {!collapsed && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500 text-white leading-none">{item.badge}</span>
                        )}
                        {item.hasChildren && <ChevronRight className="w-3 h-3 text-slate-400" />}
                      </>
                    )}
                  </Link>
                )}

                {hasChildren && isExpanded && !collapsed && (
                  <div className="ml-8 mb-1 space-y-px">
                    {item.children!.map(child => (
                      <Link key={child.label} to={child.href}
                        className={`block px-3 py-1.5 rounded-lg text-[13px] transition-all ${location.pathname + location.search === child.href ? 'text-blue-600 font-semibold' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
                        {child.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(!collapsed)}
          className="absolute top-1/2 -right-3 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow z-50">
          {collapsed ? <ChevronRight className="w-3 h-3 text-slate-500" /> : <ChevronLeft className="w-3 h-3 text-slate-500" />}
        </button>

        {/* Bottom */}
        <div className="border-t border-slate-100 p-2">
          <Link to="/account" className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all">
            <Settings className="w-[17px] h-[17px]" />{!collapsed && <span>Settings</span>}
          </Link>
          <button onClick={logout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all">
            <LogOut className="w-[17px] h-[17px]" />{!collapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className={`flex-1 transition-all duration-300 ${collapsed ? 'ml-16' : 'ml-[232px]'}`}>
        <header className="sticky top-0 z-30 h-14 bg-white/80 backdrop-blur border-b border-slate-200 flex items-center justify-end px-6 gap-3">
          <Link to="/dashboard-pricing" className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-bold hover:shadow-md transition-all">
            <Sparkles className="w-3.5 h-3.5" /> Upgrade Now
          </Link>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 text-sm text-slate-600">
            <CreditCard className="w-3.5 h-3.5" /> {user?.credits || 0} credits
          </div>
        </header>
        <div className="p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
