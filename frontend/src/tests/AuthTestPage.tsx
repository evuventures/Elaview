// frontend/src/pages/AuthTestPage.tsx
import React, { useState, useEffect } from 'react';
import { supabase } from '../utils/SupabaseClient.js';

// TypeScript interfaces
interface SupabaseUser {
  id: string;
  email: string;
  email_confirmed_at?: string;
  last_sign_in_at?: string;
}

interface UserProfile {
  id: string;
  name: string;
  role: 'renter' | 'landlord' | 'both';
  phone?: string;
  company_name?: string;
  business_license?: string;
  bio?: string;
  address_line1?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  website_url?: string;
  verification_level: string;
  can_create_listings: boolean;
  is_active: boolean;
  created_at: string;
}

interface AuthState {
  user: SupabaseUser | null;
  profile: UserProfile | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  needsProfileCompletion: boolean;
}

const AuthTestPage: React.FC = () => {
  // Auth State
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    profile: null,
    accessToken: null,
    isAuthenticated: false,
    needsProfileCompletion: false
  });

  // UI State
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTest, setActiveTest] = useState<string | null>(null);

  // Form States
  const [signupForm, setSignupForm] = useState({
    email: '',
    password: '',
    wantsToRentSpaces: false
  });

  const [loginForm, setLoginForm] = useState({
    email: '',
    password: ''
  });

  const [profileForm, setProfileForm] = useState({
    name: '',
    role: 'renter' as 'renter' | 'landlord',
    wantsToRentSpaces: false,
    phone: '',
    company_name: '',
    bio: '',
    address_line1: '',
    city: '',
    state: '',
    postal_code: '',
    website_url: ''
  });

  // Initialize auth state on component mount
  useEffect(() => {
    const initializeAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user && session?.access_token) {
        await handleAuthSuccess(session.user, session.access_token);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user && session?.access_token) {
        await handleAuthSuccess(session.user, session.access_token);
      } else if (event === 'SIGNED_OUT') {
        setAuthState({
          user: null,
          profile: null,
          accessToken: null,
          isAuthenticated: false,
          needsProfileCompletion: false
        });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Handle successful authentication
  const handleAuthSuccess = async (user: any, accessToken: string) => {
    setAuthState(prev => ({
      ...prev,
      user: {
        id: user.id,
        email: user.email,
        email_confirmed_at: user.email_confirmed_at,
        last_sign_in_at: user.last_sign_in_at
      },
      accessToken,
      isAuthenticated: true
    }));

    // Check if profile exists
    await checkUserProfile(accessToken);
  };

  // Check if user has completed their profile
  const checkUserProfile = async (token: string) => {
    try {
      const response = await fetch('/api/auth/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success && data.data) {
        setAuthState(prev => ({
          ...prev,
          profile: data.data,
          needsProfileCompletion: false
        }));
      } else {
        setAuthState(prev => ({
          ...prev,
          needsProfileCompletion: true
        }));
      }
    } catch (err) {
      console.error('Profile check failed:', err);
      setAuthState(prev => ({
        ...prev,
        needsProfileCompletion: true
      }));
    }
  };

  // Clear messages
  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  // Test Functions
  const testSupabaseSignup = async () => {
    setActiveTest('signup');
    setLoading(true);
    clearMessages();

    try {
      const { data, error } = await supabase.auth.signUp({
        email: signupForm.email,
        password: signupForm.password
      });

      if (error) {
        setError(`Signup failed: ${error.message}`);
      } else if (data.user) {
        setSuccess('✅ Signup successful! Check email for confirmation. User will need profile completion.');
        console.log('Signup data:', data);
      }
    } catch (err) {
      setError(`Signup error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
      setActiveTest(null);
    }
  };

  const testSupabaseLogin = async () => {
    setActiveTest('login');
    setLoading(true);
    clearMessages();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginForm.email,
        password: loginForm.password
      });

      if (error) {
        setError(`Login failed: ${error.message}`);
      } else if (data.session) {
        setSuccess('✅ Login successful! Token extracted.');
        console.log('Login data:', data);
        // handleAuthSuccess is called automatically by the auth listener
      }
    } catch (err) {
      setError(`Login error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
      setActiveTest(null);
    }
  };

  const testProfileCompletion = async () => {
    if (!authState.accessToken) {
      setError('No access token available. Please login first.');
      return;
    }

    setActiveTest('profile');
    setLoading(true);
    clearMessages();

    try {
      const response = await fetch('/api/auth/complete-profile', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authState.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...profileForm,
          wantsToRentSpaces: signupForm.wantsToRentSpaces || profileForm.wantsToRentSpaces
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(`✅ Profile ${data.isNewUser ? 'created' : 'updated'} successfully!`);
        setAuthState(prev => ({
          ...prev,
          profile: data.data,
          needsProfileCompletion: false
        }));
        console.log('Profile data:', data);
      } else {
        setError(`Profile completion failed: ${data.error}`);
      }
    } catch (err) {
      setError(`Profile error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
      setActiveTest(null);
    }
  };

  const testProtectedRoute = async () => {
    if (!authState.accessToken) {
      setError('No access token available. Please login first.');
      return;
    }

    setActiveTest('protected');
    setLoading(true);
    clearMessages();

    try {
      const response = await fetch('/api/auth/test-protected', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authState.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('✅ Protected route accessed successfully!');
        console.log('Protected route data:', data);
      } else {
        setError(`Protected route failed: ${data.error}`);
      }
    } catch (err) {
      setError(`Protected route error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
      setActiveTest(null);
    }
  };

  const testLandlordRoute = async () => {
    if (!authState.accessToken) {
      setError('No access token available. Please login first.');
      return;
    }

    setActiveTest('landlord');
    setLoading(true);
    clearMessages();

    try {
      const response = await fetch('/api/auth/test-landlord', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authState.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('✅ Landlord route accessed successfully!');
        console.log('Landlord route data:', data);
      } else {
        setError(`Landlord route failed: ${data.error} ${data.userRole ? `(Current role: ${data.userRole})` : ''}`);
      }
    } catch (err) {
      setError(`Landlord route error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
      setActiveTest(null);
    }
  };

  const testTokenVerification = async () => {
    if (!authState.accessToken) {
      setError('No access token available. Please login first.');
      return;
    }

    setActiveTest('verify');
    setLoading(true);
    clearMessages();

    try {
      const response = await fetch('/api/auth/verify-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: authState.accessToken
        })
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('✅ Token verification successful!');
        console.log('Token verification data:', data);
      } else {
        setError(`Token verification failed: ${data.error}`);
      }
    } catch (err) {
      setError(`Token verification error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
      setActiveTest(null);
    }
  };

  const testLogout = async () => {
    setActiveTest('logout');
    setLoading(true);
    clearMessages();

    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        setError(`Logout failed: ${error.message}`);
      } else {
        setSuccess('✅ Logout successful!');
        // Auth state is cleared automatically by the auth listener
      }
    } catch (err) {
      setError(`Logout error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
      setActiveTest(null);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      color: '#1e293b',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '2rem 1rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        padding: '2rem',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem',
          paddingBottom: '1.5rem',
          borderBottom: '2px solid #e2e8f0'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#0f172a',
            margin: '0 0 0.5rem 0',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            🔐 Authentication Testing Dashboard
          </h1>
          <p style={{
            color: '#64748b',
            fontSize: '1.1rem',
            margin: 0
          }}>
            Test your authentication flow and backend integration
          </p>
        </div>

        {/* Auth Status */}
        <div style={{
          marginBottom: '2rem',
          padding: '1.5rem',
          borderRadius: '12px',
          backgroundColor: '#f1f5f9',
          border: '1px solid #cbd5e1'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: '#334155'
          }}>
            Authentication Status
          </h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              padding: '0.75rem',
              borderRadius: '8px',
              backgroundColor: authState.isAuthenticated ? '#dcfce7' : '#fef2f2',
              border: `1px solid ${authState.isAuthenticated ? '#bbf7d0' : '#fecaca'}`,
              color: authState.isAuthenticated ? '#166534' : '#dc2626'
            }}>
              <span style={{ fontSize: '1.25rem', marginRight: '0.5rem' }}>
                {authState.isAuthenticated ? '✅' : '❌'}
              </span>
              <span style={{ fontWeight: '500' }}>
                {authState.isAuthenticated ? 'Authenticated' : 'Not Authenticated'}
              </span>
            </div>
            
            {authState.user && (
              <div style={{
                padding: '1rem',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '0.875rem',
                color: '#475569'
              }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>👤 User:</strong> {authState.user.email}
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>🆔 ID:</strong> {authState.user.id}
                </div>
                <div>
                  <strong>🔑 Token:</strong> {authState.accessToken ? '✅ Available' : '❌ Missing'}
                </div>
              </div>
            )}

            {authState.profile && (
              <div style={{
                padding: '1rem',
                backgroundColor: '#ffffff',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
                fontSize: '0.875rem',
                color: '#475569'
              }}>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>📝 Profile:</strong> {authState.profile.name} ({authState.profile.role})
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong>🏠 Can Create Listings:</strong> {authState.profile.can_create_listings ? 'Yes' : 'No'}
                </div>
                <div>
                  <strong>✅ Verification:</strong> {authState.profile.verification_level}
                </div>
              </div>
            )}

            {authState.needsProfileCompletion && (
              <div style={{
                padding: '0.75rem',
                borderRadius: '8px',
                backgroundColor: '#fef3c7',
                border: '1px solid #fcd34d',
                color: '#92400e',
                fontWeight: '500'
              }}>
                ⚠️ Profile completion required
              </div>
            )}
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            backgroundColor: '#fef2f2',
            border: '1px solid #fecaca',
            borderRadius: '8px',
            color: '#dc2626',
            fontWeight: '500'
          }}>
            ❌ {error}
          </div>
        )}
        
        {success && (
          <div style={{
            marginBottom: '1.5rem',
            padding: '1rem',
            backgroundColor: '#dcfce7',
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            color: '#166534',
            fontWeight: '500'
          }}>
            {success}
          </div>
        )}

        {/* Test Sections */}
        <div style={{
          display: 'grid',
          gap: '1.5rem',
          gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))'
        }}>
          
          {/* Supabase Auth Tests */}
          <div style={{
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.5rem',
            backgroundColor: '#ffffff'
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
              color: '#334155',
              borderBottom: '2px solid #e2e8f0',
              paddingBottom: '0.5rem'
            }}>
              🔐 Supabase Auth Tests
            </h3>
            
            {/* Signup Test */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{
                fontWeight: '500',
                marginBottom: '0.75rem',
                color: '#475569',
                fontSize: '1rem'
              }}>
                Test Signup
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input
                  type="email"
                  placeholder="Email"
                  value={signupForm.email}
                  onChange={(e) => setSignupForm(prev => ({ ...prev, email: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    backgroundColor: '#ffffff',
                    color: '#374151',
                    outline: 'none',
                    transition: 'border-color 0.15s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={signupForm.password}
                  onChange={(e) => setSignupForm(prev => ({ ...prev, password: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    backgroundColor: '#ffffff',
                    color: '#374151',
                    outline: 'none',
                    transition: 'border-color 0.15s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  fontSize: '0.875rem',
                  color: '#475569',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={signupForm.wantsToRentSpaces}
                    onChange={(e) => setSignupForm(prev => ({ ...prev, wantsToRentSpaces: e.target.checked }))}
                    style={{ marginRight: '0.5rem', accentColor: '#3b82f6', width: '1.25rem', height: '1.25rem' }}
                  />
                  Do you plan to rent out advertising spaces?
                </label>
                <button
                  onClick={testSupabaseSignup}
                  disabled={loading && activeTest === 'signup'}
                  style={{
                    width: '100%',
                    backgroundColor: loading && activeTest === 'signup' ? '#93c5fd' : '#3b82f6',
                    color: '#ffffff',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '500',
                    fontSize: '0.875rem',
                    cursor: loading && activeTest === 'signup' ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.15s ease',
                    outline: 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading || activeTest !== 'signup') {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#2563eb';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading || activeTest !== 'signup') {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#3b82f6';
                    }
                  }}
                >
                  {loading && activeTest === 'signup' ? 'Signing up...' : 'Test Signup'}
                </button>
              </div>
            </div>

            {/* Login Test */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{
                fontWeight: '500',
                marginBottom: '0.75rem',
                color: '#475569',
                fontSize: '1rem'
              }}>
                Test Login
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input
                  type="email"
                  placeholder="Email"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, email: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    backgroundColor: '#ffffff',
                    color: '#374151',
                    outline: 'none',
                    transition: 'border-color 0.15s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#10b981'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
                <input
                  type="password"
                  placeholder="Password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm(prev => ({ ...prev, password: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    backgroundColor: '#ffffff',
                    color: '#374151',
                    outline: 'none',
                    transition: 'border-color 0.15s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#10b981'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
                <button
                  onClick={testSupabaseLogin}
                  disabled={loading && activeTest === 'login'}
                  style={{
                    width: '100%',
                    backgroundColor: loading && activeTest === 'login' ? '#86efac' : '#10b981',
                    color: '#ffffff',
                    padding: '0.75rem',
                    borderRadius: '8px',
                    border: 'none',
                    fontWeight: '500',
                    fontSize: '0.875rem',
                    cursor: loading && activeTest === 'login' ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.15s ease',
                    outline: 'none'
                  }}
                  onMouseEnter={(e) => {
                    if (!loading || activeTest !== 'login') {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#059669';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!loading || activeTest !== 'login') {
                      (e.target as HTMLButtonElement).style.backgroundColor = '#10b981';
                    }
                  }}
                >
                  {loading && activeTest === 'login' ? 'Logging in...' : 'Test Login'}
                </button>
              </div>
            </div>

            {/* Logout Test */}
            <button
              onClick={testLogout}
              disabled={(loading && activeTest === 'logout') || !authState.isAuthenticated}
              style={{
                width: '100%',
                backgroundColor: ((loading && activeTest === 'logout') || !authState.isAuthenticated) ? '#fca5a5' : '#ef4444',
                color: '#ffffff',
                padding: '0.75rem',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '500',
                fontSize: '0.875rem',
                cursor: ((loading && activeTest === 'logout') || !authState.isAuthenticated) ? 'not-allowed' : 'pointer',
                transition: 'background-color 0.15s ease',
                outline: 'none'
              }}
              onMouseEnter={(e) => {
                if (!((loading && activeTest === 'logout') || !authState.isAuthenticated)) {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#dc2626';
                }
              }}
              onMouseLeave={(e) => {
                if (!((loading && activeTest === 'logout') || !authState.isAuthenticated)) {
                  (e.target as HTMLButtonElement).style.backgroundColor = '#ef4444';
                }
              }}
            >
              {loading && activeTest === 'logout' ? 'Logging out...' : 'Test Logout'}
            </button>
          </div>

          {/* Profile Completion Tests */}
          <div style={{
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.5rem',
            backgroundColor: '#ffffff'
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
              color: '#334155',
              borderBottom: '2px solid #e2e8f0',
              paddingBottom: '0.5rem'
            }}>
              👤 Profile Completion Tests
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <input
                type="text"
                placeholder="Full Name"
                value={profileForm.name}
                onChange={(e) => setProfileForm(prev => ({ ...prev, name: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  backgroundColor: '#ffffff',
                  color: '#374151',
                  outline: 'none',
                  transition: 'border-color 0.15s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
              
              <select
                value={profileForm.role}
                onChange={(e) => setProfileForm(prev => ({ ...prev, role: e.target.value as 'renter' | 'landlord' }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  backgroundColor: '#ffffff',
                  color: '#374151',
                  outline: 'none',
                  transition: 'border-color 0.15s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              >
                <option value="renter">Renter</option>
                <option value="landlord">Landlord</option>
              </select>

              <label style={{
                display: 'flex',
                alignItems: 'center',
                fontSize: '0.875rem',
                color: '#475569',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={profileForm.wantsToRentSpaces}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, wantsToRentSpaces: e.target.checked }))}
                  style={{ marginRight: '0.5rem', accentColor: '#8b5cf6', width: '1.25rem', height: '1.25rem' }}
                />
                Want to rent out spaces? (adds landlord role)
              </label>

              <input
                type="tel"
                placeholder="Phone"
                value={profileForm.phone}
                onChange={(e) => setProfileForm(prev => ({ ...prev, phone: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  backgroundColor: '#ffffff',
                  color: '#374151',
                  outline: 'none',
                  transition: 'border-color 0.15s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />

              <input
                type="text"
                placeholder="Company Name (optional)"
                value={profileForm.company_name}
                onChange={(e) => setProfileForm(prev => ({ ...prev, company_name: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  backgroundColor: '#ffffff',
                  color: '#374151',
                  outline: 'none',
                  transition: 'border-color 0.15s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />

              <textarea
                placeholder="Bio"
                value={profileForm.bio}
                onChange={(e) => setProfileForm(prev => ({ ...prev, bio: e.target.value }))}
                rows={2}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  backgroundColor: '#ffffff',
                  color: '#374151',
                  outline: 'none',
                  transition: 'border-color 0.15s ease',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />

              <input
                type="text"
                placeholder="Address"
                value={profileForm.address_line1}
                onChange={(e) => setProfileForm(prev => ({ ...prev, address_line1: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  backgroundColor: '#ffffff',
                  color: '#374151',
                  outline: 'none',
                  transition: 'border-color 0.15s ease',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <input
                  type="text"
                  placeholder="City"
                  value={profileForm.city}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, city: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    backgroundColor: '#ffffff',
                    color: '#374151',
                    outline: 'none',
                    transition: 'border-color 0.15s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
                <input
                  type="text"
                  placeholder="State"
                  value={profileForm.state}
                  onChange={(e) => setProfileForm(prev => ({ ...prev, state: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    border: '1px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '0.875rem',
                    backgroundColor: '#ffffff',
                    color: '#374151',
                    outline: 'none',
                    transition: 'border-color 0.15s ease',
                    boxSizing: 'border-box'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#8b5cf6'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
              </div>

              <button
                onClick={testProfileCompletion}
                disabled={(loading && activeTest === 'profile') || !authState.isAuthenticated}
                style={{
                  width: '100%',
                  backgroundColor: ((loading && activeTest === 'profile') || !authState.isAuthenticated) ? '#c4b5fd' : '#8b5cf6',
                  color: '#ffffff',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  cursor: ((loading && activeTest === 'profile') || !authState.isAuthenticated) ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.15s ease',
                  outline: 'none'
                }}
                onMouseEnter={(e) => {
                  if (!((loading && activeTest === 'profile') || !authState.isAuthenticated)) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#7c3aed';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!((loading && activeTest === 'profile') || !authState.isAuthenticated)) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#8b5cf6';
                  }
                }}
              >
                {loading && activeTest === 'profile' ? 'Saving...' : 'Test Profile Completion'}
              </button>
            </div>
          </div>

          {/* Backend Integration Tests */}
          <div style={{
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.5rem',
            backgroundColor: '#ffffff'
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
              color: '#334155',
              borderBottom: '2px solid #e2e8f0',
              paddingBottom: '0.5rem'
            }}>
              🔒 Backend Integration Tests
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <button
                onClick={testTokenVerification}
                disabled={(loading && activeTest === 'verify') || !authState.accessToken}
                style={{
                  width: '100%',
                  backgroundColor: ((loading && activeTest === 'verify') || !authState.accessToken) ? '#a5b4fc' : '#6366f1',
                  color: '#ffffff',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  cursor: ((loading && activeTest === 'verify') || !authState.accessToken) ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.15s ease',
                  outline: 'none'
                }}
                onMouseEnter={(e) => {
                  if (!((loading && activeTest === 'verify') || !authState.accessToken)) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#4f46e5';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!((loading && activeTest === 'verify') || !authState.accessToken)) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#6366f1';
                  }
                }}
              >
                {loading && activeTest === 'verify' ? 'Verifying...' : 'Test Token Verification'}
              </button>

              <button
                onClick={testProtectedRoute}
                disabled={(loading && activeTest === 'protected') || !authState.accessToken}
                style={{
                  width: '100%',
                  backgroundColor: ((loading && activeTest === 'protected') || !authState.accessToken) ? '#fde68a' : '#f59e0b',
                  color: '#ffffff',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  cursor: ((loading && activeTest === 'protected') || !authState.accessToken) ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.15s ease',
                  outline: 'none'
                }}
                onMouseEnter={(e) => {
                  if (!((loading && activeTest === 'protected') || !authState.accessToken)) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#d97706';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!((loading && activeTest === 'protected') || !authState.accessToken)) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#f59e0b';
                  }
                }}
              >
                {loading && activeTest === 'protected' ? 'Testing...' : 'Test Protected Route'}
              </button>

              <button
                onClick={testLandlordRoute}
                disabled={(loading && activeTest === 'landlord') || !authState.accessToken}
                style={{
                  width: '100%',
                  backgroundColor: ((loading && activeTest === 'landlord') || !authState.accessToken) ? '#fed7aa' : '#f97316',
                  color: '#ffffff',
                  padding: '0.75rem',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: '500',
                  fontSize: '0.875rem',
                  cursor: ((loading && activeTest === 'landlord') || !authState.accessToken) ? 'not-allowed' : 'pointer',
                  transition: 'background-color 0.15s ease',
                  outline: 'none'
                }}
                onMouseEnter={(e) => {
                  if (!((loading && activeTest === 'landlord') || !authState.accessToken)) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#ea580c';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!((loading && activeTest === 'landlord') || !authState.accessToken)) {
                    (e.target as HTMLButtonElement).style.backgroundColor = '#f97316';
                  }
                }}
              >
                {loading && activeTest === 'landlord' ? 'Testing...' : 'Test Landlord Route'}
              </button>
            </div>
          </div>

          {/* Test Results */}
          <div style={{
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.5rem',
            backgroundColor: '#ffffff'
          }}>
            <h3 style={{
              fontSize: '1.125rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
              color: '#334155',
              borderBottom: '2px solid #e2e8f0',
              paddingBottom: '0.5rem'
            }}>
              📊 Test Results & Info
            </h3>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.875rem' }}>
              <div style={{
                padding: '1rem',
                backgroundColor: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#334155' }}>
                  Expected Flow:
                </div>
                <ol style={{ 
                  paddingLeft: '1.25rem', 
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                  color: '#475569'
                }}>
                  <li>User signs up with Supabase</li>
                  <li>User confirms email</li>
                  <li>User logs in (gets JWT token)</li>
                  <li>User completes profile (creates backend profile)</li>
                  <li>User can access protected routes</li>
                  <li>Role-based access works correctly</li>
                </ol>
              </div>

              <div style={{
                padding: '1rem',
                backgroundColor: '#eff6ff',
                borderRadius: '8px',
                border: '1px solid #bfdbfe'
              }}>
                <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#1e40af' }}>
                  Role Logic:
                </div>
                <ul style={{ 
                  paddingLeft: '1.25rem', 
                  margin: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.25rem',
                  color: '#1e40af'
                }}>
                  <li>Default role: "renter"</li>
                  <li>If "wants to rent spaces" = true → role becomes "both"</li>
                  <li>Landlord routes require "landlord" or "both" role</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* API Documentation */}
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{
            fontWeight: '600',
            marginBottom: '1rem',
            color: '#334155',
            fontSize: '1.125rem'
          }}>
            🔧 Authentication API Endpoints
          </h3>
          <div style={{ 
            fontSize: '0.875rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            color: '#475569'
          }}>
            <div><strong style={{ color: '#059669' }}>POST</strong> /api/auth/complete-profile - Complete user profile</div>
            <div><strong style={{ color: '#3b82f6' }}>GET</strong> /api/auth/profile - Get current user profile</div>
            <div><strong style={{ color: '#059669' }}>POST</strong> /api/auth/verify-token - Verify Supabase JWT token</div>
            <div><strong style={{ color: '#3b82f6' }}>GET</strong> /api/auth/test-protected - Test protected route access</div>
            <div><strong style={{ color: '#3b82f6' }}>GET</strong> /api/auth/test-landlord - Test landlord-only route access</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthTestPage;