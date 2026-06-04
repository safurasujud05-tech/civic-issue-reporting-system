// App.jsx - Main app with routing
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import ReportIssue from './pages/ReportIssue';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import GovernmentDashboard from './pages/GovernmentDashboard';
import CitizenDashboard from './pages/CitizenDashboard';
import ComplaintDetail from './pages/ComplaintDetail';
import LegalAssistant from './pages/LegalAssistant';
import AuthPage from './pages/AuthPage';
import RoleSelection from './pages/RoleSelection';
import RoleLoginPage from './pages/RoleLoginPage';
import { AuthProvider } from './contexts/AuthContext';

function AppContent() {
  const location = useLocation();
  const hideNavbarRoutes = ['/', '/login/admin', '/login/citizen', '/citizen-dashboard'];
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <>
      {shouldShowNavbar && <Navbar />}
      
      <Routes>
        <Route path="/" element={<RoleSelection />} />
        <Route path="/login/:role" element={<RoleLoginPage />} />
        <Route path="/home" element={<Home />} />
        <Route path="/report" element={<ReportIssue />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/government" element={<GovernmentDashboard />} />
        <Route path="/citizen-dashboard" element={<CitizenDashboard />} />
        <Route path="/complaint/:id" element={<ComplaintDetail />} />
        <Route path="/legal" element={<LegalAssistant />} />
        <Route path="/auth" element={<AuthPage />} />

        {/* 404 */}
        <Route path="*" element={
          <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
            <p className="text-6xl mb-4">🏙️</p>
            <h2 className="text-2xl font-display font-bold text-gray-800 mb-2">Page not found</h2>
            <p className="text-gray-500 mb-6">The page you're looking for doesn't exist.</p>
            <a href="/" className="btn-primary">Go Home</a>
          </div>
        } />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

