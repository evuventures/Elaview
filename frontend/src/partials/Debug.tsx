// Emergency Debug App.tsx - Replace your entire App.tsx temporarily with this

import { Routes, Route } from 'react-router-dom';
import { useState, useEffect } from 'react';

// Minimal Header without any Supabase calls
function MinimalHeader() {
  return (
    <header style={{ padding: '1rem', borderBottom: '1px solid #ccc' }}>
      <h1>ELAVIEW DEBUG MODE</h1>
      <nav>
        <a href="/" style={{ marginRight: '1rem' }}>Home</a>
        <a href="/test" style={{ marginRight: '1rem' }}>Test</a>
        <a href="/debug" style={{ marginRight: '1rem' }}>Debug</a>
      </nav>
    </header>
  );
}

// Simple test page
function TestPage() {
  const [supabaseTest, setSupabaseTest] = useState<string>('Testing...');

  useEffect(() => {
    const testSupabase = async () => {
      try {
        // Import Supabase dynamically to catch import errors
        const { supabase } = await import('../utils/SupabaseClient');
        
        console.log('✅ Supabase imported successfully');
        
        // Test basic connection
        const { data, error } = await supabase.from('user_profiles').select('id').limit(1);
        
        if (error) {
          setSupabaseTest(`❌ Supabase Error: ${error.message}`);
        } else {
          setSupabaseTest(`✅ Supabase Connected - Found ${data?.length || 0} profiles`);
        }
      } catch (error) {
        setSupabaseTest(`❌ Import Error: ${(error as Error).message}`);
      }
    };

    testSupabase();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Supabase Connection Test</h2>
      <p>{supabaseTest}</p>
      
      <h3>Browser Info:</h3>
      <ul>
        <li>URL: {window.location.href}</li>
        <li>User Agent: {navigator.userAgent.slice(0, 100)}...</li>
        <li>Local Storage Keys: {Object.keys(localStorage).join(', ')}</li>
        <li>Session Storage Keys: {Object.keys(sessionStorage).join(', ')}</li>
      </ul>
    </div>
  );
}

// Auth test page
function AuthTestPage() {
  const [authState, setAuthState] = useState<string>('Testing auth...');

  useEffect(() => {
    const testAuth = async () => {
      try {
        const { supabase } = await import('../utils/SupabaseClient');
        
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          setAuthState(`❌ Auth Error: ${error.message}`);
        } else if (user) {
          setAuthState(`✅ User Found: ${user.id} (${user.email})`);
        } else {
          setAuthState(`⚠️ No user signed in`);
        }
      } catch (error) {
        setAuthState(`❌ Auth Test Error: ${(error as Error).message}`);
      }
    };

    testAuth();
  }, []);

  return (
    <div style={{ padding: '2rem' }}>
      <h2>Auth Test</h2>
      <p>{authState}</p>
      
      <button 
        onClick={() => window.location.href = '/signin'}
        style={{ padding: '0.5rem 1rem', margin: '1rem 0' }}
      >
        Go to Sign In
      </button>
    </div>
  );
}

// Simple home page
function DebugHomePage() {
  return (
    <div style={{ padding: '2rem' }}>
      <h2>Debug Home Page</h2>
      <p>If you can see this without infinite loading, the issue is with your complex components.</p>
      
      <div style={{ marginTop: '2rem' }}>
        <h3>Next Steps:</h3>
        <ol>
          <li>Check browser console for errors</li>
          <li>Test Supabase connection above</li>
          <li>Test auth state above</li>
          <li>Clear all browser storage if needed</li>
        </ol>
      </div>
      
      <button 
        onClick={() => {
          localStorage.clear();
          sessionStorage.clear();
          window.location.reload();
        }}
        style={{ 
          padding: '0.5rem 1rem', 
          backgroundColor: '#ff4444', 
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          marginTop: '1rem'
        }}
      >
        🚨 Clear All Storage & Reload
      </button>
    </div>
  );
}

function EmergencyDebugApp() {
  return (
    <>
      <MinimalHeader />
      <Routes>
        <Route path="/" element={<DebugHomePage />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/debug" element={<AuthTestPage />} />
        <Route path="*" element={
          <div style={{ padding: '2rem' }}>
            <h2>Page Not Found in Debug Mode</h2>
            <a href="/">← Back to Debug Home</a>
          </div>
        } />
      </Routes>
    </>
  );
}

export default EmergencyDebugApp;