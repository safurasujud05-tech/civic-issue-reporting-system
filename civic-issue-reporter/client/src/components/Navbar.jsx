// components/Navbar.jsx
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

export default function Navbar() {
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const { user, logout } = useAuth();

  const adminPortalRoutes = ['/government', '/admin'];
  const isAdmin = user?.role?.toLowerCase() === 'admin';
  const isAdminPortalView = adminPortalRoutes.some(route => location.pathname.startsWith(route))
    || (location.pathname === '/dashboard' && isAdmin)
    || (location.pathname.startsWith('/complaint/') && isAdmin);
  const logoIcon = isAdminPortalView ? '🛡️' : '🏛️';
  const logoLabel = isAdminPortalView ? 'Admin Portal' : 'CivicAI';

  const navLinks = isAdminPortalView
    ? [{ path: '/admin', label: 'Dashboard' }]
    : [
        { path: '/', label: 'Home' },
        { path: '/dashboard', label: 'Dashboard' },
        { path: '/legal', label: 'Legal Help' },
      ];

  if (!isAdminPortalView) {
    navLinks.splice(1, 0, { path: '/report', label: 'Report Issue' });
  }


  const isActive = (path) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          {isAdminPortalView ? (
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-sky-600 rounded-xl flex items-center justify-center shadow-sm">
                <span className="text-white text-lg">{logoIcon}</span>
              </div>
              <span className="font-display font-bold text-xl text-gray-900">
                {logoLabel}
              </span>
            </div>
          ) : (
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-9 h-9 bg-sky-600 rounded-xl flex items-center justify-center shadow-sm group-hover:bg-sky-700 transition-colors">
                <span className="text-white text-lg">{logoIcon}</span>
              </div>
              <span className="font-display font-bold text-xl text-gray-900">
                {logoLabel}
              </span>
            </Link>
          )}

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive(link.path)
                    ? 'bg-sky-50 text-sky-700 font-semibold'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <button
                onClick={logout}
                className="px-4 py-2 rounded-lg text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50"
              >
                Logout
              </button>
            ) : (
              <Link to="/auth" className="px-4 py-2 rounded-lg text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-gray-50">
                Sign In
              </Link>
            )}
          </div>

          {/* CTA */}
          <div className="hidden md:block">
            {!isAdminPortalView && (
              <Link to="/report" className="btn-primary text-sm py-2 px-5">
                + New Report
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 border-t border-gray-100 mt-2 pt-3 space-y-1">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMenuOpen(false)}
                className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.path)
                    ? 'bg-sky-50 text-sky-700 font-semibold'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setMenuOpen(false);
                }}
                className="block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMenuOpen(false)}
                className="block px-4 py-2.5 rounded-lg text-sm font-medium text-slate-700 hover:bg-gray-50"
              >
                Sign In
              </Link>
            )}
            {user?.role !== 'admin' && (
              <Link
                to="/report"
                onClick={() => setMenuOpen(false)}
                className="block btn-primary text-sm py-2.5 text-center mt-2"
              >
                + New Report
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
