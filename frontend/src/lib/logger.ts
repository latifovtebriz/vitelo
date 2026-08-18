/**
 * Comprehensive Application Telemetry & Event Logger
 * 
 * Captures:
 * 1. UI Button clicks & actions
 * 2. Unhandled JavaScript runtime errors
 * 3. API network & HTTP failure diagnostics
 * 4. Batched transmission to /api/v1/logs
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
  payload?: any;
}

class TelemetryLogger {
  private queue: LogPayload[] = [];
  private flushTimer: any = null;
  private isFlushing = false;
  private readonly apiUrl = import.meta.env.VITE_API_URL || 'https://api.vitelo.me';

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

  private enqueue(entry: LogPayload) {
    this.queue.push({
      ...entry,
      page_url: entry.page_url || (typeof window !== 'undefined' ? window.location.pathname + window.location.search : ''),
    });

    // Flush immediately if ERROR or queue reaches 5 items
    if (entry.level === 'ERROR' || this.queue.length >= 5) {
      this.flush();
    } else if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => this.flush(), 3000);
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
      const token = typeof localStorage !== 'undefined' ? localStorage.getItem('access_token') : null;
      await axios.post(
        `${this.apiUrl}/api/v1/logs/`,
        { logs: batch },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          timeout: 5000,
        }
      );
    } catch {
      // In case backend is offline, preserve console logging without infinite error loops
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
