import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';

// Pages
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import GenerateCV from './pages/GenerateCV';
import Login from './pages/Login';
import Register from './pages/Register';
import Templates from './pages/Templates';
import Examples from './pages/Examples';
import ExampleDetail from './pages/ExampleDetail';
import CoverLetterExamples from './pages/CoverLetterExamples';
import CoverLetterDetail from './pages/CoverLetterDetail';
import Account from './pages/Account';

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

        {/* Stubs — to build later */}
        <Route path="/pricing" element={<Landing />} />
        <Route path="/checker" element={<Landing />} />
        <Route path="/privacy" element={<Landing />} />
        <Route path="/terms" element={<Landing />} />

        {/* Protected */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/generate" element={<ProtectedRoute><GenerateCV /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}
