import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '../utils/SupabaseClient';
import { User } from '@supabase/supabase-js';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireRole?: 'renter' | 'landlord' | 'admin' | 'both' | 'any';
  requireOnboarding?: boolean;
}

interface UserProfile {
  id: string;
  role: 'renter' | 'landlord' | 'admin' | 'both';
  onboarding_completed?: boolean;
  is_active: boolean;
}

function ProtectedRoute({ 
  children, 
  requireRole = 'any',
  requireOnboarding = false 
}: ProtectedRouteProps) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [devMode, setDevMode] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      try {
        // Get current user from Supabase
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        if (user) {
          // Get user profile
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('id, role, onboarding_completed, is_active')
            .eq('id', user.id)
            .single();

          if (profile) {
            setUserProfile(profile);
            setIsAdmin(profile.role === 'admin');
            
            // Only check dev mode if user is admin
            if (profile.role === 'admin') {
              const devModeEnabled = localStorage.getItem('admin_dev_mode') === 'true' || 
                                   sessionStorage.getItem('admin_dev_mode') === 'true';
              setDevMode(devModeEnabled);
            } else {
              setDevMode(false);
            }
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setLoading(false);
      }
    };

    checkUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await checkUser();
      } else {
        setUserProfile(null);
        setIsAdmin(false);
        setDevMode(false);
        setLoading(false);
      }
    });

    // Listen for dev mode changes (from admin panel)
    const handleStorageChange = () => {
      if (isAdmin) {
        const devModeEnabled = localStorage.getItem('admin_dev_mode') === 'true' || 
                             sessionStorage.getItem('admin_dev_mode') === 'true';
        setDevMode(devModeEnabled);
      }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [isAdmin]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px',
        fontSize: '16px',
        color: '#6b7280'
      }}>
        Loading...
      </div>
    );
  }

  // Admin bypass: If user is admin and dev mode is enabled, bypass all checks
  if (isAdmin && devMode) {
    return (
      <div>
        {/* Show dev mode indicator */}
        <div style={{
          position: 'fixed',
          top: '0',
          left: '0',
          right: '0',
          backgroundColor: '#fee2e2',
          color: '#dc2626',
          padding: '8px',
          textAlign: 'center',
          fontSize: '12px',
          fontWeight: '600',
          zIndex: 1000,
          borderBottom: '2px solid #fecaca'
        }}>
          🔧 DEVELOPER MODE ACTIVE - Auth checks bypassed
        </div>
        <div style={{ paddingTop: '40px' }}>
          {children}
        </div>
      </div>
    );
  }

  // Standard auth checks
  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (!userProfile) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px',
        fontSize: '16px',
        color: '#6b7280',
        textAlign: 'center'
      }}>
        <p>Profile not found</p>
        <button 
          onClick={() => window.location.href = '/profile'}
          style={{
            marginTop: '16px',
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Create Profile
        </button>
      </div>
    );
  }

  // Check if user account is active
  if (!userProfile.is_active) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '200px',
        fontSize: '16px',
        color: '#dc2626',
        textAlign: 'center'
      }}>
        <p>Your account has been deactivated</p>
        <p>Please contact support for assistance</p>
      </div>
    );
  }

  // Check role requirements
  if (requireRole !== 'any') {
    const hasRequiredRole = 
      requireRole === userProfile.role || 
      userProfile.role === 'admin' || // Admins can access any role
      (requireRole === 'landlord' && userProfile.role === 'both') ||
      (requireRole === 'renter' && userProfile.role === 'both');

    if (!hasRequiredRole) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          height: '200px',
          fontSize: '16px',
          color: '#dc2626',
          textAlign: 'center'
        }}>
          <p>Access denied</p>
          <p>This page requires {requireRole} access</p>
          <p>Your current role: {userProfile.role}</p>
        </div>
      );
    }
  }

  // Check onboarding requirements
  if (requireOnboarding && !userProfile.onboarding_completed) {
    return <Navigate to="/account-questions" replace />;
  }

  return <>{children}</>;
}

export default ProtectedRoute;

// Export additional utility functions for admin panel
export const AdminUtils = {
  // Enable dev mode (call from admin panel)
  enableDevMode: () => {
    localStorage.setItem('admin_dev_mode', 'true');
    window.dispatchEvent(new Event('storage'));
  },

  // Disable dev mode
  disableDevMode: () => {
    localStorage.removeItem('admin_dev_mode');
    sessionStorage.removeItem('admin_dev_mode');
    window.dispatchEvent(new Event('storage'));
  },

  // Check if current user is admin
  checkAdminStatus: async (): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      return profile?.role === 'admin';
    } catch {
      return false;
    }
  },

  // Get current user profile
  getCurrentUserProfile: async (): Promise<UserProfile | null> => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from('user_profiles')
        .select('id, role, onboarding_completed, is_active')
        .eq('id', user.id)
        .single();

      return profile;
    } catch {
      return null;
    }
  }
};