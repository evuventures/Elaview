import './styles/SignInPage.css';
import { useState } from 'react';
import Header from '../partials/Header';
import { supabase } from '../utils/SupabaseClient.js';

function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
  
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
        // redirect or update app state
      }
  
      setLoading(false);
    };
  
    return (
      <>
        <Header />
        <div className="signin-container">
            
            <h2>Sign In</h2>
            <form onSubmit={handleSignIn}>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            /><br />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            /><br />
            <button type="submit" disabled={loading}>
                {loading ? 'Signing in...' : 'Sign In'}
            </button>
            {error && <p style={{ color: 'red' }}>{error}</p>}
            </form>
        </div>
      </>
    );
  }
  
  export default SignIn;