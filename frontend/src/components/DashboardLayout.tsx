import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import {
  LayoutDashboard, FileText, Briefcase, ClipboardList, Brain,
  Search, DollarSign, CreditCard, BookOpen,
  ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Settings, LogOut, Sparkles, Bell, Menu, X,
  Coins, User,
} from 'lucide-react';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/dashboard' },
  {
    key: 'documents', label: 'Documents', icon: FileText, href: '#', children: [
      { label: 'My Resumes', href: '/documents' },
      { label: 'My Cover Letters', href: '/documents?tab=covers' },
    ]
  },
  { key: 'jobs', label: 'Jobs', icon: Briefcase, href: '/jobs' },
  { key: 'job-tracker', label: 'Job Tracker', icon: ClipboardList, href: '/job-tracker' },
  { key: 'interview', label: 'Interview Prep', icon: Brain, href: '/interview-prep' },
  { key: 'salary', label: 'Salary Analyzer', icon: DollarSign, href: '/salary-analyzer' },
  { key: 'learning', label: 'Unlimited Learning', icon: BookOpen, href: '/dashboard?tab=learning', badge: 'NEW' },
  { key: 'job-method', label: 'Job Search Method', icon: Search, href: '/job-search-method' },
  { key: 'pricing', label: 'Pricing', icon: CreditCard, href: '/dashboard-pricing' },
];

interface Props { children: React.ReactNode; activeKey?: string; }

export default function DashboardLayout({ children, activeKey }: Props) {
  const { user, logout } = useAuthStore();
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedMenu, setExpandedMenu] = useState<string | null>('documents');

  const currentKey = activeKey || 'dashboard';

  // Close mobile sidebar on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Compute profile completion %
  const profilePct = Math.min(
    100,
    (user?.full_name ? 30 : 0) +
    (user?.email ? 30 : 0) +
    (user?.credits !== undefined ? 20 : 0) +
    20 // base
  );

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`px-4 py-4 border-b border-slate-100 flex items-center gap-2.5 min-h-[60px] ${isMobile ? 'justify-between' : ''}`}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          {(!collapsed || isMobile) && (
            <span className="font-extrabold text-lg text-slate-900 tracking-tight">Vitelo</span>
          )}
        </div>
        {isMobile && (
          <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        )}
      </div>

      {/* User card */}
      <div className={`px-3 py-3 border-b border-slate-100 ${(collapsed && !isMobile) ? 'flex justify-center' : ''}`}>
        <Link to="/account" className="flex items-center gap-2.5 group">
          <div className="relative flex-shrink-0">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm">
              {user?.full_name?.[0]?.toUpperCase() || 'U'}
            </div>
            {/* Profile % ring */}
            <div className="absolute -bottom-0.5 -right-0.5 bg-blue-500 text-white text-[8px] font-bold rounded-full w-4 h-4 flex items-center justify-center border border-white">
              {Math.round(profilePct / 10) * 10}
            </div>
          </div>
          {(!collapsed || isMobile) && (
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-bold text-slate-800 truncate leading-tight group-hover:text-blue-600 transition-colors">
                {user?.full_name || 'User'}
              </p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-400 rounded-full" style={{ width: `${profilePct}%` }} />
                </div>
                <span className="text-[10px] text-slate-400">{profilePct}%</span>
              </div>
            </div>
          )}
        </Link>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-2 px-2">
        {NAV_ITEMS.map(item => {
          const isActive = currentKey === item.key;
          const hasChildren = item.children && item.children.length > 0;
          const isExpanded = expandedMenu === item.key;

          return (
            <div key={item.key}>
              {hasChildren ? (
                <>
                  <button
                    onClick={() => setExpandedMenu(isExpanded ? null : item.key)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all mb-px ${
                      isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                    }`}>
                    <item.icon className={`w-[17px] h-[17px] flex-shrink-0 ${isActive ? 'text-blue-500' : 'text-slate-400'}`} />
                    {(!collapsed || isMobile) && (
                      <>
                        <span className="flex-1 text-left">{item.label}</span>
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
                      </>
                    )}
                  </button>
                  {isExpanded && (!collapsed || isMobile) && (
                    <div className="ml-8 mb-1 space-y-px">
                      {item.children!.map(child => (
                        <Link key={child.label} to={child.href}
                          className={`block px-3 py-1.5 rounded-lg text-[13px] transition-all ${
                            location.pathname + location.search === child.href
                              ? 'text-blue-600 font-semibold bg-blue-50'
                              : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                          }`}>
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <Link to={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all mb-px ${
                    isActive ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }`}>
                  <item.icon className={`w-[17px] h-[17px] flex-shrink-0 ${isActive ? 'text-blue-500' : 'text-slate-400'}`} />
                  {(!collapsed || isMobile) && (
                    <>
                      <span className="flex-1">{item.label}</span>
                      {item.badge && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-500 text-white leading-none">
                          {item.badge}
                        </span>
                      )}
                    </>
                  )}
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-slate-100 p-2 space-y-px">
        <Link to="/account"
          className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] transition-all ${
            currentKey === 'settings' ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
          }`}>
          <Settings className="w-[17px] h-[17px]" />
          {(!collapsed || isMobile) && <span>Settings</span>}
        </Link>
        <button onClick={logout}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px] text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all">
          <LogOut className="w-[17px] h-[17px]" />
          {(!collapsed || isMobile) && <span>Log Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex">

      {/* ── Desktop Sidebar ── */}
      <aside className={`hidden md:flex fixed top-0 left-0 h-full bg-white border-r border-slate-200 z-40 flex-col transition-all duration-300 ${collapsed ? 'w-16' : 'w-[232px]'}`}>
        <SidebarContent />
        {/* Collapse toggle */}
        <button onClick={() => setCollapsed(!collapsed)}
          className="absolute top-1/2 -right-3 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm hover:shadow-md transition-shadow z-50">
          {collapsed ? <ChevronRight className="w-3 h-3 text-slate-500" /> : <ChevronLeft className="w-3 h-3 text-slate-500" />}
        </button>
      </aside>

      {/* ── Mobile Sidebar overlay ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 h-full w-[260px] bg-white shadow-xl">
            <SidebarContent isMobile />
          </aside>
        </div>
      )}

      {/* ── Main ── */}
      <main className={`flex-1 transition-all duration-300 ${collapsed ? 'md:ml-16' : 'md:ml-[232px]'} ml-0`}>

        {/* ── Header ── */}
        <header className="sticky top-0 z-30 h-14 bg-white/90 backdrop-blur border-b border-slate-200 flex items-center justify-between px-4 md:px-6 gap-3">

          {/* Mobile hamburger */}
          <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 rounded-lg hover:bg-slate-100 transition-colors">
            <Menu className="w-5 h-5 text-slate-600" />
          </button>

          {/* Mobile logo */}
          <Link to="/dashboard" className="md:hidden flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-extrabold text-base text-slate-900">Vitelo</span>
          </Link>

          {/* Right side */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Create new */}
            <Link to="/generate"
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-bold hover:shadow-md transition-all">
              <Sparkles className="w-3.5 h-3.5" /> Create Resume
            </Link>

            {/* Credits pill */}
            <Link to="/dashboard-pricing"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors">
              <Coins className="w-3.5 h-3.5 text-amber-500" />
              <span>{user?.credits ?? 0}</span>
            </Link>

            {/* Notification bell */}
            <button className="relative p-2 rounded-full hover:bg-slate-100 transition-colors">
              <Bell className="w-4.5 h-4.5 text-slate-500" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
            </button>

            {/* Avatar */}
            <Link to="/account" className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white font-bold text-sm hover:ring-2 hover:ring-blue-300 transition-all">
              {user?.full_name?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
            </Link>
          </div>
        </header>

        {/* ── Page content ── */}
        <div className="p-4 md:p-6 lg:p-8">{children}</div>
      </main>
    </div>
  );
}
