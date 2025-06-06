import { useState } from 'react';
import { supabase } from '../utils/SupabaseClient.js';
import { Link } from 'react-router-dom';
import './styles/SignUpPage.css';

function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { error } = await supabase.auth.signUp({ email, password });

    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Check your email to confirm your account!');
    }
  };

  return (
    <>
      <div className='signup-container'>
        <h2>Sign Up</h2>
        <form onSubmit={handleSignUp}>
        <input
          className='input-field'
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        /><br/>
        <input
          className='input-field'
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        /><br/>
        <button type="submit">Sign Up</button>
        </form>
        <p>Already have an account? Sign in</p> <Link to="/signin">here</Link>
      </div>
    </>
  );
}

export default SignUp;