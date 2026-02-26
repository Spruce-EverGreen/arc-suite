import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { demoLogin, login, register } = useAuth();
  const navigate = useNavigate();

  const handleDemo = () => {
    demoLogin();
    navigate('/dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!businessName.trim()) {
          setError('Business name is required');
          setLoading(false);
          return;
        }
        const { error } = await register(email, password, businessName);
        if (error) throw error;
      } else {
        const { error } = await login(email, password);
        if (error) throw error;
      }
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="arc-bg" />
      
      <div className="content-wrapper min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          
          {/* Logo */}
          <div className="flex justify-center">
            <div className="logo-pill">
              <img src="/logo.png" alt="ARC Labs" className="w-8 h-8" />
              <span>ARC LABS</span>
            </div>
          </div>

          {/* Title */}
          <div className="text-center">
            <div className="title-pill mb-4">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </div>
            <p className="text-muted">Service Calculator</p>
          </div>

          {/* Error */}
          {error && (
            <div className="glass-pill px-6 py-3 text-center text-red-400 border-red-500/30">
              {error}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="input-glass"
                placeholder="Business Name"
              />
            )}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-glass"
              placeholder="Email"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-glass"
              placeholder="Password"
              required
              minLength={6}
            />
            
            <button 
              type="submit" 
              className="btn-arc w-full justify-center"
              disabled={loading}
            >
              {loading ? 'Please wait...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </form>

          {/* Toggle */}
          <p className="text-center text-sm text-muted">
            {isSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button 
              onClick={() => { setIsSignUp(!isSignUp); setError(''); }}
              className="text-arc hover:underline"
            >
              {isSignUp ? 'Sign In' : 'Sign Up'}
            </button>
          </p>

          {/* Divider */}
          <div className="divider" />

          {/* Demo */}
          <button onClick={handleDemo} className="btn-pill w-full justify-center">
            Try Demo Mode
          </button>

          <p className="text-center text-sm text-subtle">
            Demo uses sample data — no account required
          </p>
        </div>
      </div>
    </div>
  );
}
