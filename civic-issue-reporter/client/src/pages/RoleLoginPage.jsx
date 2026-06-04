import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RoleLoginPage() {
  const { role } = useParams();
  const navigate = useNavigate();
  const { login, register } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState(role === 'admin' ? 'admin@civic.ai' : 'citizen@civic.ai');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const isAdmin = role === 'admin';
  const title = isAdmin ? 'Admin Login' : 'Citizen Login';
  const roleColor = isAdmin ? 'blue' : 'green';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = isLogin
        ? await login(email, password)
        : await register(name, email, password, role);

      if (result.success) {
        navigate(isAdmin ? '/admin' : '/citizen-dashboard');
      } else {
        setError(result.message || result.error || 'Authentication failed');
      }
    } catch (err) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-${roleColor}-50 to-${roleColor}-100 flex items-center justify-center px-4`}>
      <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className={`text-5xl mb-3 text-${roleColor}-600`}>
            {isAdmin ? '👨‍💼' : '👤'}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-gray-600 mt-1">
            {isAdmin ? 'Manage civic issues' : 'Report and track issues'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="Enter your full name"
                required={!isLogin}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-${roleColor}-600 hover:bg-${roleColor}-700 text-white font-semibold py-2 px-4 rounded-lg transition disabled:opacity-50`}
          >
            {loading ? 'Logging in...' : isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        {/* Default test credentials hint */}
        {isLogin && (
          <div className="mt-4 p-3 rounded-lg bg-gray-50 border border-gray-200 text-xs text-gray-600">
            <p className="font-semibold mb-1">Demo Credentials:</p>
            <p>Email: {isAdmin ? 'admin@civic.ai' : 'citizen@civic.ai'}</p>
            <p>Password: password123</p>
          </div>
        )}

        {/* Toggle between login and signup */}
        <div className="text-center mt-6 text-sm text-gray-600">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className={`text-${roleColor}-600 hover:underline font-semibold`}
          >
            {isLogin ? 'Sign Up' : 'Sign In'}
          </button>
        </div>

        {/* Back button */}
        <div className="text-center mt-4">
          <button
            onClick={() => navigate('/')}
            className="text-gray-500 hover:text-gray-700 text-sm underline"
          >
            Back to role selection
          </button>
        </div>
      </div>
    </div>
  );
}
