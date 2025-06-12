import { useState } from 'react';
import { supabase } from '../utils/SupabaseClient.js';
import { Link, useNavigate } from 'react-router-dom';
import './styles/SignUpPage.css';

function SignUp() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    const { email, password, first_name, last_name, phone } = formData;

    try {
      // Step 1: Create the auth user
      const { data: authData, error: signupError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signupError || !authData.user) {
        setError(signupError?.message || 'Signup failed.');
        return;
      }

      const user_id = authData.user.id;
      const fullName = `${first_name} ${last_name}`.trim();

      // Step 2: Create the user profile
      const { error: insertError } = await supabase.from('user_profiles').insert([
        {
          id: user_id,
          email,
          name: fullName,
          phone,
          role: 'renter',
          is_active: true,
          is_verified: false,
          phone_verified: false,
          onboarding_completed: false, // Track onboarding status
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (insertError) {
        setError('Account created, but failed to save profile info. Please contact support.');
        console.error('Profile creation error:', insertError);
        return;
      }

      // Step 3: Sign in the user automatically
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError('Account created but auto-login failed. Please sign in manually.');
        return;
      }

      // Step 4: Redirect to account questions form
      setSuccess('Account created successfully! Redirecting to complete your profile...');
      
      // Small delay to show success message
      setTimeout(() => {
        navigate('/account-questions', { 
          state: { 
            isFirstTime: true,
            userId: user_id 
          }
        });
      }, 1500);

    } catch (err) {
      console.error('Signup error:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <h2 className="signup-title">Sign Up</h2>
      <form onSubmit={handleSignup} className="signup-form">
        <div className="name-row">
          <div className="name-input">
            <label htmlFor="first_name">First name</label>
            <input
              type="text"
              name="first_name"
              placeholder="John"
              value={formData.first_name}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
          <div className="name-input">
            <label htmlFor="last_name">Last name</label>
            <input
              type="text"
              name="last_name"
              placeholder="Doe"
              value={formData.last_name}
              onChange={handleChange}
              required
              disabled={isLoading}
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            placeholder="email@example.com"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            type="text"
            name="phone"
            placeholder="1234567890"
            value={formData.phone}
            onChange={handleChange}
            disabled={isLoading}
          />
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Creating Account...' : 'Sign Up'}
        </button>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
      </form>
      <p>Already have an account? Sign in <Link to="/signin">here.</Link></p>
    </div>
  );
}

export default SignUp;