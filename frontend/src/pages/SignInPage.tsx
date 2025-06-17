import './styles/SignInPage.css';
import { useState } from 'react';
import { supabase } from '../utils/SupabaseClient.js';
import { useNavigate , Link } from 'react-router-dom';

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
        // redirect or update app state
        navigate('/profile');
      }
  
      setLoading(false);
    };
  
    return (
      <>
        
        <div className="signin-container">
            
            <h2>Sign In</h2>
            <form onSubmit={handleSignIn}>
            <input
                className="input-field"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            /><br />
            <input
                className = "input-field"
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
            <p>Don't have an account yet? Sign up <Link to="/signup">here.</Link> </p>
        </div>
      </>
    );
  }
  
  export default SignIn;