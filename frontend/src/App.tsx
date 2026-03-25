import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';

// Public pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Templates from './pages/Templates';
import Examples from './pages/Examples';
import ExampleDetail from './pages/ExampleDetail';
import CoverLetterExamples from './pages/CoverLetterExamples';
import CoverLetterDetail from './pages/CoverLetterDetail';

// Dashboard pages (protected)
import Dashboard from './pages/Dashboard';
import Documents from './pages/Documents';
import Jobs from './pages/Jobs';
import JobTracker from './pages/JobTracker';
import InterviewPrep from './pages/InterviewPrep';
import SalaryAnalyzer from './pages/SalaryAnalyzer';
import JobSearchMethod from './pages/JobSearchMethod';
import DashboardPricing from './pages/DashboardPricing';
import Account from './pages/Account';
import GenerateCV from './pages/GenerateCV';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/templates" element={<Templates />} />
        <Route path="/examples" element={<Examples />} />
        <Route path="/examples/:slug" element={<ExampleDetail />} />
        <Route path="/cover-letter" element={<CoverLetterExamples />} />
        <Route path="/cover-letter/:slug" element={<CoverLetterDetail />} />

        {/* Public stubs */}
        <Route path="/pricing" element={<Landing />} />
        <Route path="/checker" element={<Landing />} />
        <Route path="/privacy" element={<Landing />} />
        <Route path="/terms" element={<Landing />} />

        {/* Protected — Dashboard suite */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
        <Route path="/jobs" element={<ProtectedRoute><Jobs /></ProtectedRoute>} />
        <Route path="/job-tracker" element={<ProtectedRoute><JobTracker /></ProtectedRoute>} />
        <Route path="/interview-prep" element={<ProtectedRoute><InterviewPrep /></ProtectedRoute>} />
        <Route path="/salary-analyzer" element={<ProtectedRoute><SalaryAnalyzer /></ProtectedRoute>} />
        <Route path="/job-search-method" element={<ProtectedRoute><JobSearchMethod /></ProtectedRoute>} />
        <Route path="/dashboard-pricing" element={<ProtectedRoute><DashboardPricing /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
        <Route path="/generate" element={<ProtectedRoute><GenerateCV /></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
