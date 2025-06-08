import { useState } from 'react';
import { supabase } from '../utils/SupabaseClient.js';
import { Link } from 'react-router-dom';
import './styles/SignUpPage.css';

function SignUp() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    phone: '',
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const { email, password, first_name, last_name, phone } = formData;

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

    const { error: insertError } = await supabase.from('user_profiles').insert([
      {
        id: user_id,
        email,
        name: fullName,
        phone,
        role: 'renter', // Assign default role
        is_active: true,
        is_verified: false,
        phone_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ]);

    if (insertError) {
      setError('Account created, but failed to save profile info.');
    } else {
      setSuccess('Account created successfully!');
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
              onChange={handleChange}
              required
            />
          </div>
          <div className="name-input">
            <label htmlFor="last_name">Last name</label>
            <input
              type="text"
              name="last_name"
              placeholder="Doe"
              onChange={handleChange}
              required
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            name="email"
            placeholder="email@example.com"
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            placeholder="••••••••"
            onChange={handleChange}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="phone">Phone</label>
          <input
            type="text"
            name="phone"
            placeholder="1234567890"
            onChange={handleChange}
          />
        </div>

        <button type="submit">Sign Up</button>

        {error && <p className="error-message">{error}</p>}
        {success && <p className="success-message">{success}</p>}
      </form>
      <p>Account created? Sign in <Link to="/signin">here.</Link> </p>
    </div>
    
  );
}

export default SignUp;