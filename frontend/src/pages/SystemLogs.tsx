import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import DashboardLayout from '../components/DashboardLayout';
import {
  Terminal, RefreshCw, Trash2, Search,
  ChevronDown, ChevronUp, Activity,
} from 'lucide-react';

interface LogItem {
  id: string;
  level: string;
  source: string;
  category: string;
  message: string;
  page_url?: string | null;
  component?: string | null;
  user_email?: string | null;
  payload?: any;
  ip_address?: string | null;
  created_at: string;
}

const SUPABASE_URL = 'https://qxwxpykthyoyfnydsxvn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4d3hweWt0aHlveWZueWRzeHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwNTI0NTAsImV4cCI6MjEwMjYyODQ1MH0.RqhXRDwJE37f9TykmJ77PRtH7PTc_8ZdQ7lbxc8rBiU';

export default function SystemLogs() {
  const [logs, setLogs] = useState<LogItem[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const fetchLogs = async () => {
    try {
      let url = `${SUPABASE_URL}/rest/v1/app_logs?select=*&order=created_at.desc&limit=100`;
      if (selectedLevel !== 'ALL') {
        url += `&level=eq.${selectedLevel}`;
      }
      if (searchQuery.trim()) {
        url += `&or=(message.ilike.*${encodeURIComponent(searchQuery.trim())}*,component.ilike.*${encodeURIComponent(searchQuery.trim())}*)`;
      }

      const res = await fetch(url, {
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setLogs(data);
        return;
      }

      // Fallback
      const backendRes = await api.get('/logs/');
      setLogs(backendRes.data.items || []);
    } catch {
      // Fallback
      try {
        const backendRes = await api.get('/logs/');
        setLogs(backendRes.data.items || []);
      } catch {}
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedLevel, searchQuery]);

  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchLogs();
    }, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh, selectedLevel, searchQuery]);

  const handleClear = async () => {
    if (!confirm('Are you sure you want to clear all system telemetry logs?')) return;
    try {
      await fetch(`${SUPABASE_URL}/rest/v1/app_logs?id=neq.00000000-0000-0000-0000-000000000000`, {
        method: 'DELETE',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        },
      });
      setLogs([]);
    } catch {}
  };

  const getLevelBadge = (level: string) => {
    switch (level.toUpperCase()) {
      case 'ERROR':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700 border border-rose-200">🔴 ERROR</span>;
      case 'WARN':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-700 border border-amber-200">🟡 WARN</span>;
      case 'ACTION':
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 border border-emerald-200">🟢 ACTION</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-blue-100 text-blue-700 border border-blue-200">🔵 INFO</span>;
    }
  };

  return (
    <DashboardLayout activeKey="settings">
      <div className="max-w-6xl mx-auto pb-16">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-indigo-600" />
              <h1 className="text-xl font-extrabold text-slate-900">Live System Diagnostics & Action Logs</h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time telemetry stream capturing UI button clicks, form submissions, and API errors
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                autoRefresh
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                  : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <Activity className={`w-3.5 h-3.5 ${autoRefresh ? 'animate-pulse text-emerald-600' : ''}`} />
              {autoRefresh ? 'Live Auto-Polling (4s)' : 'Polling Paused'}
            </button>

            <button
              onClick={fetchLogs}
              className="p-2 rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={handleClear}
              className="p-2 rounded-xl border border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex bg-slate-100 p-1 rounded-xl gap-1">
            {['ALL', 'ERROR', 'ACTION', 'WARN', 'INFO'].map(lvl => (
              <button
                key={lvl}
                onClick={() => setSelectedLevel(lvl)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  selectedLevel === lvl
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>

          <div className="relative min-w-[260px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search component, error, or message..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Logs Feed Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {logs.length === 0 ? (
            <div className="p-12 text-center">
              <Terminal className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-600">No logs captured yet</p>
              <p className="text-xs text-slate-400 mt-1">Actions and errors will appear here live as you interact with the app</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {logs.map((log) => {
                const isExpanded = expandedLogId === log.id;
                return (
                  <div key={log.id} className="p-4 hover:bg-slate-50/70 transition-colors">
                    <div
                      className="flex items-start justify-between gap-4 cursor-pointer"
                      onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className="mt-0.5">{getLevelBadge(log.level)}</div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-0.5">
                            {log.component && (
                              <span className="text-[11px] font-mono font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-100">
                                {log.component}
                              </span>
                            )}
                            {log.page_url && (
                              <span className="text-[10px] text-slate-400 font-mono">
                                {log.page_url}
                              </span>
                            )}
                            {log.user_email && (
                              <span className="text-[10px] text-slate-400 font-semibold">
                                • {log.user_email}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-slate-800 break-words">{log.message}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-shrink-0">
                        <span className="text-[10px] text-slate-400 font-mono">
                          {new Date(log.created_at).toLocaleTimeString()}
                        </span>
                        <button className="text-slate-400 hover:text-slate-600">
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Expandable JSON Detail Payload */}
                    {isExpanded && log.payload && (
                      <div className="mt-3 pt-3 border-t border-slate-100">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">
                          Diagnostic Context & Payload:
                        </p>
                        <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl text-[11px] font-mono overflow-x-auto max-h-64">
                          {JSON.stringify(log.payload, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </DashboardLayout>
  );
}
