import './styles/SignInPage.css';
import { useState } from 'react';
import { supabase } from '../utils/SupabaseClient.js';
import { useNavigate, Link } from 'react-router-dom';

function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  
  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      console.log('Signed in:', data);
      navigate('/profile');
    }

    setLoading(false);
  };

  return (
    <div className="signin-container">
      <div className="signin-content">
        <div className="brand-logo">
          <h1 className="brand-text">ELAVIEW</h1>
        </div>
        
        <h2 className="signin-title">Sign in to your account</h2>
        <p className="signin-subtitle">Enter your email and password to continue</p>
        
        <form onSubmit={handleSignIn} className="signin-form">
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              className="form-input"
              type="email"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <div className="label-row">
              <label className="form-label" htmlFor="password">Password</label>
              <Link to="/forgot-password" className="forgot-password-link">
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              className="form-input"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          
          <button type="submit" className="signin-button" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          
          {error && <p className="error-message">{error}</p>}
        </form>
        
        <p className="signup-link">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default SignIn;