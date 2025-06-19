// Updated ProtectedRoute.js - Add this logic to your existing ProtectedRoute component

import React from 'react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/SupabaseClient';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: string | null;
  requireOnboarding?: boolean;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireRole = null, 
  requireOnboarding = true 
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [devMode, setDevMode] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      try {
        // Check dev mode first
        const devModeEnabled = localStorage.getItem('dev_mode') === 'true';
        setDevMode(devModeEnabled);
        
        // If dev mode is enabled, bypass all checks
        if (devModeEnabled) {
          console.log('🔧 ProtectedRoute: Dev mode enabled - bypassing all checks');
          setAuthorized(true);
          setLoading(false);
          return;
        }

        // Normal auth checks
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !user) {
          console.log('❌ ProtectedRoute: No authenticated user');
          navigate('/signin');
          return;
        }

        // If no role requirement, just check if user is authenticated
        if (!requireRole) {
          console.log('✅ ProtectedRoute: User authenticated, no role required');
          setAuthorized(true);
          setLoading(false);
          return;
        }

        // Check user profile for role requirements
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('role, sub_role, onboarding_completed')
          .eq('id', user.id)
          .single();

        if (profileError || !profile) {
          console.log('❌ ProtectedRoute: Profile not found');
          navigate('/account-questions');
          return;
        }

        // Check onboarding requirement
        if (requireOnboarding && !profile.onboarding_completed) {
          console.log('❌ ProtectedRoute: Onboarding not completed');
          navigate('/account-questions');
          return;
        }

        // Check role requirement
        const userRole = profile.role === 'admin' && profile.sub_role ? profile.sub_role : profile.role;
        
        if (requireRole && userRole !== requireRole) {
          console.log(`❌ ProtectedRoute: Role mismatch. Required: ${requireRole}, User: ${userRole}`);
          navigate('/');
          return;
        }

        console.log(`✅ ProtectedRoute: Access granted. Role: ${userRole}`);
        setAuthorized(true);

      } catch (error) {
        console.error('❌ ProtectedRoute: Access check failed:', error);
        navigate('/signin');
      } finally {
        setLoading(false);
      }
    };

    checkAccess();

    // Listen for dev mode changes
    const handleDevModeChange = () => {
      const devModeEnabled = localStorage.getItem('dev_mode') === 'true';
      setDevMode(devModeEnabled);
      
      if (devModeEnabled) {
        setAuthorized(true);
      } else {
        // If dev mode is turned off, re-check access
        checkAccess();
      }
    };

    window.addEventListener('dev-mode-change', handleDevModeChange);
    
    return () => {
      window.removeEventListener('dev-mode-change', handleDevModeChange);
    };
  }, [navigate, requireRole, requireOnboarding]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '60vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #e5e7eb',
          borderTop: '4px solid #22c55e',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <p style={{ color: '#6b7280' }}>
          {devMode ? 'Loading in dev mode...' : 'Checking access...'}
        </p>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    );
  }

  if (!authorized) {
    return null; // Navigation will happen in useEffect
  }

  return (
    <>
      {devMode && (
        <div style={{
          position: 'fixed',
          bottom: '20px',
          left: '20px',
          background: 'rgba(239, 68, 68, 0.9)',
          color: 'white',
          padding: '8px 12px',
          borderRadius: '8px',
          fontSize: '12px',
          fontWeight: '600',
          zIndex: 9999,
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
          backdropFilter: 'blur(8px)'
        }}>
          🔧 Dev Mode Active
        </div>
      )}
      {children}
    </>
  );
};

export default ProtectedRoute;