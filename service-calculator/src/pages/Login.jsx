import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Zap } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, demoLogin, isSupabaseConfigured } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error } = isSignUp
        ? await signUp(email, password)
        : await signIn(email, password);

      if (error) throw error;

      if (isSignUp) {
        alert('Check your email for the confirmation link!');
      } else {
        navigate('/admin');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    demoLogin();
    navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-600 rounded-xl mb-4">
            <Zap className="text-white" size={28} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">ARC Suite</h1>
          <p className="text-gray-500 text-sm">Service Calculator</p>
        </div>

        {/* Demo Banner */}
        <div className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
          <p className="text-sm text-blue-700 mb-3 font-medium">
            Want to explore first? No account needed.
          </p>
          <button
            onClick={handleDemoLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            <Zap size={18} />
            Try Demo — One Click
          </button>
        </div>

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">or sign in</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition text-sm"
              placeholder="••••••••"
            />
          </div>

          {!isSupabaseConfigured && (
            <div className="bg-amber-50 border border-amber-200 text-amber-700 px-4 py-3 rounded-lg text-sm">
              ⚠️ Database not configured. Real accounts unavailable — use demo mode above.
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !isSupabaseConfigured}
            className="w-full bg-gray-800 hover:bg-gray-900 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            {loading ? 'Loading...' : isSignUp ? 'Create Account' : 'Sign In'}
          </button>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
