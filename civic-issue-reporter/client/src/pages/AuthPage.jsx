import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function AuthPage() {
  const { login, register } = useAuth();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        const response = await register(name, email, password);
        if (!response?.success) {
          setError(response?.message || response?.error || 'Unable to create account');
        } else {
          navigate(response.user?.role === 'admin' ? '/admin' : '/dashboard');
        }
      } else {
        const response = await login(email, password);
        if (!response?.success) {
          setError(response?.message || response?.error || 'Unable to sign in');
        } else {
          navigate(response.user?.role === 'admin' ? '/admin' : '/dashboard');
        }
      }
    } catch (err) {
      setError('Unable to authenticate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-10 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          {isRegister ? 'Create an account' : 'Sign in to CivicAI'}
        </h1>
        <p className="text-sm text-slate-500 mb-8">
          {isRegister
            ? 'Register so you can track reports and request legal guidance.'
            : 'Continue to the dashboard and submit issues with AI-assisted support.'}
        </p>

        <form onSubmit={onSubmit} className="space-y-4">
          {isRegister && (
            <label className="block">
              <span className="text-sm text-slate-700">Name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-sky-500 focus:ring-sky-500"
                required
              />
            </label>
          )}

          <label className="block">
            <span className="text-sm text-slate-700">Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-sky-500 focus:ring-sky-500"
              required
            />
          </label>

          <label className="block">
            <span className="text-sm text-slate-700">Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 block w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 focus:border-sky-500 focus:ring-sky-500"
              required
            />
          </label>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            className="w-full rounded-2xl bg-sky-600 px-4 py-3 text-white transition hover:bg-sky-700 disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'Working...' : isRegister ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500">
          {isRegister ? (
            <>
              Already have an account?{' '}
              <button type="button" onClick={() => setIsRegister(false)} className="font-semibold text-sky-600 hover:text-sky-700">
                Sign in
              </button>
            </>
          ) : (
            <>
              New to CivicAI?{' '}
              <button type="button" onClick={() => setIsRegister(true)} className="font-semibold text-sky-600 hover:text-sky-700">
                Create account
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
