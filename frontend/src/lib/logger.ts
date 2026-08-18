/**
 * Comprehensive Application Telemetry & Event Logger
 * 
 * Directly streams:
 * 1. UI Button clicks & user actions
 * 2. Unhandled JavaScript runtime errors
 * 3. API network & HTTP failure diagnostics
 * 4. Real-time direct ingestion into Supabase `app_logs` table
 */

import axios from 'axios';

type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'ACTION' | 'DEBUG';

interface LogPayload {
  level: LogLevel;
  source: 'frontend';
  category: string;
  message: string;
  page_url?: string;
  component?: string;
  user_email?: string | null;
  payload?: any;
}

const SUPABASE_URL = 'https://qxwxpykthyoyfnydsxvn.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4d3hweWt0aHlveWZueWRzeHZuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODcwNTI0NTAsImV4cCI6MjEwMjYyODQ1MH0.RqhXRDwJE37f9TykmJ77PRtH7PTc_8ZdQ7lbxc8rBiU';

class TelemetryLogger {
  private queue: LogPayload[] = [];
  private flushTimer: any = null;
  private isFlushing = false;

  constructor() {
    this.setupGlobalErrorListeners();
  }

  private setupGlobalErrorListeners() {
    if (typeof window === 'undefined') return;

    // Capture uncaught JS runtime exceptions
    window.addEventListener('error', (event) => {
      this.error('GlobalWindow', `Uncaught runtime error: ${event.message}`, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      });
    });

    // Capture unhandled Promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.error('UnhandledPromise', `Unhandled Promise Rejection: ${event.reason}`, {
        reason: typeof event.reason === 'object' ? JSON.stringify(event.reason) : String(event.reason),
      });
    });
  }

  private getUserEmail(): string | null {
    try {
      if (typeof localStorage !== 'undefined') {
        const auth = localStorage.getItem('auth_storage');
        if (auth) {
          const parsed = JSON.parse(auth);
          return parsed.state?.user?.email || null;
        }
      }
    } catch {}
    return null;
  }

  private enqueue(entry: LogPayload) {
    this.queue.push({
      ...entry,
      user_email: entry.user_email || this.getUserEmail(),
      page_url: entry.page_url || (typeof window !== 'undefined' ? window.location.pathname + window.location.search : ''),
    });

    // Flush immediately on ERROR or when queue reaches 3 items
    if (entry.level === 'ERROR' || this.queue.length >= 3) {
      this.flush();
    } else if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => this.flush(), 2000);
    }
  }

  public async flush() {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    if (this.queue.length === 0 || this.isFlushing) return;

    const batch = [...this.queue];
    this.queue = [];
    this.isFlushing = true;

    try {
      // Direct high-speed ingestion into Supabase PostgreSQL `app_logs`
      await axios.post(
        `${SUPABASE_URL}/rest/v1/app_logs`,
        batch,
        {
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          timeout: 4000,
        }
      );
    } catch {
      // Fallback to local /api/v1/logs if network restricted
      try {
        const token = typeof localStorage !== 'undefined' ? localStorage.getItem('access_token') : null;
        await axios.post(
          '/api/v1/logs/',
          { logs: batch },
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
            timeout: 3000,
          }
        );
      } catch {}
    } finally {
      this.isFlushing = false;
    }
  }

  /**
   * Log a user interaction (button click, modal open, form submit)
   */
  public action(component: string, actionName: string, details?: any) {
    console.log(
      `%c[ACTION] [${component}] %c${actionName}`,
      'background: #10b981; color: white; padding: 2px 5px; border-radius: 3px; font-weight: bold;',
      'color: #0f172a; font-weight: bold;',
      details || ''
    );

    this.enqueue({
      level: 'ACTION',
      source: 'frontend',
      category: 'ui_button_click',
      message: actionName,
      component,
      payload: details,
    });
  }

  /**
   * Log an application error with stack trace and context
   */
  public error(component: string, message: string, errorObj?: any, details?: any) {
    console.error(
      `%c[ERROR] [${component}] %c${message}`,
      'background: #ef4444; color: white; padding: 2px 5px; border-radius: 3px; font-weight: bold;',
      'color: #dc2626;',
      errorObj || '',
      details || ''
    );

    let stack: string | undefined = undefined;
    if (errorObj instanceof Error) {
      stack = errorObj.stack;
    } else if (errorObj?.stack) {
      stack = errorObj.stack;
    }

    this.enqueue({
      level: 'ERROR',
      source: 'frontend',
      category: 'client_exception',
      message,
      component,
      payload: {
        error: typeof errorObj === 'object' ? { ...errorObj, stack } : String(errorObj),
        details,
      },
    });
  }

  /**
   * Log a warning
   */
  public warn(component: string, message: string, details?: any) {
    console.warn(`[WARN] [${component}] ${message}`, details || '');
    this.enqueue({
      level: 'WARN',
      source: 'frontend',
      category: 'warning',
      message,
      component,
      payload: details,
    });
  }

  /**
   * Log standard info
   */
  public info(component: string, message: string, details?: any) {
    console.info(`[INFO] [${component}] ${message}`, details || '');
    this.enqueue({
      level: 'INFO',
      source: 'frontend',
      category: 'info',
      message,
      component,
      payload: details,
    });
  }
}

export const logger = new TelemetryLogger();
