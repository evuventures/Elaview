import './styles/Header.css';
import logo from '../assets/logo.png'
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../utils/SupabaseClient.js';
import type { User } from '@supabase/supabase-js';

// Types
interface UserProfile {
  id: string;
  role: 'renter' | 'landlord' | 'admin';
  sub_role?: 'renter' | 'landlord' | null;
  onboarding_completed?: boolean;
  is_active: boolean;
}

function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [devMode, setDevMode] = useState(false);

  // Fetch user profile from database (only called once per session)
  const fetchUserProfile = async (userId: string) => {
    if (profileLoading) {
      console.log('🔍 Header: Profile fetch already in progress, skipping');
      return;
    }

    console.log('🔍 Header: Starting fetchUserProfile for:', userId);
    setProfileLoading(true);
    
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('id, role, sub_role, onboarding_completed, is_active')
        .eq('id', userId)
        .single();

      console.log('🔍 Header: Profile query result:', { profile, error });

      if (error) {
        console.error('❌ Header: Error fetching user profile:', error);
        // Create fallback admin profile for development
        const fallbackProfile: UserProfile = {
          id: userId,
          role: 'admin',
          sub_role: null,
          onboarding_completed: true,
          is_active: true
        };
        setUserProfile(fallbackProfile);
      } else {
        console.log('✅ Header: Profile fetched successfully:', profile);
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('❌ Header: Exception in fetchUserProfile:', error);
      // Create fallback profile on any error
      const fallbackProfile: UserProfile = {
        id: userId,
        role: 'admin',
        sub_role: null,
        onboarding_completed: true,
        is_active: true
      };
      setUserProfile(fallbackProfile);
    } finally {
      setProfileLoading(false);
      console.log('🔍 Header: fetchUserProfile completed');
    }
  };

  // Auth initialization - only run once
  useEffect(() => {
    const initializeAuth = async () => {
      console.log('🔍 Header: Initializing auth...');
      
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('❌ Header: Auth error:', error);
        }
        
        console.log('🔍 Header: Current user:', user?.id || 'No user');
        setUser(user);

        // Check for dev mode
        const devModeEnabled = localStorage.getItem('dev_mode') === 'true';
        setDevMode(devModeEnabled);
        console.log('🔍 Header: Dev mode:', devModeEnabled);

        // Fetch profile if user exists
        if (user) {
          await fetchUserProfile(user.id);
        }
        
      } catch (error) {
        console.error('❌ Header: Error in initializeAuth:', error);
      } finally {
        console.log('🔍 Header: Setting loading to false');
        setLoading(false);
        console.log('✅ Header: Auth initialization complete');
      }
    };

    initializeAuth();
  }, []); // Empty dependency array - only run once

  // Auth state changes - separate effect
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔍 Header: Auth state change:', event, session?.user?.id || 'No user');
      
      const newUser = session?.user ?? null;
      setUser(newUser);
      setLoading(false); // Always stop loading after auth state change
      
      if (newUser) {
        // Only fetch profile if we don't have one yet
        if (!userProfile) {
          fetchUserProfile(newUser.id).catch(error => {
            console.error('🔍 Header: Profile fetch failed:', error);
          });
        }
      } else {
        // User signed out - clear everything
        setUserProfile(null);
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [userProfile]); // Only depend on userProfile to prevent excessive fetching

  // Listen for dev mode changes from AdminPanel
  useEffect(() => {
    const handleDevModeChange = () => {
      const devModeEnabled = localStorage.getItem('dev_mode') === 'true';
      setDevMode(devModeEnabled);
      console.log('🔍 Header: Dev mode changed:', devModeEnabled);
    };

    window.addEventListener('dev-mode-change', handleDevModeChange);
    
    return () => {
      window.removeEventListener('dev-mode-change', handleDevModeChange);
    };
  }, []);

  // Determine effective role for navigation
  const getEffectiveRole = () => {
    // In dev mode, we'll handle navigation differently
    if (devMode) {
      return 'dev'; // Special case for dev mode
    }

    // If not authenticated, always show guest navigation
    if (!user) {
      return null;
    }

    // If user profile not loaded yet
    if (!userProfile) {
      return null;
    }

    // For normal users, use their actual role
    if (userProfile.role === 'admin' && userProfile.sub_role) {
      return userProfile.sub_role;
    }
    
    return userProfile.role;
  };

  const effectiveRole = getEffectiveRole();
  console.log('🔍 Header: Current effective role:', effectiveRole, 'Dev mode:', devMode);

  // Role-based navigation
  const getRoleBasedNavigation = () => {
    // Dev mode - show special navigation with both dashboards
    if (devMode) {
      console.log('🔍 Header: Showing dev mode navigation');
      return (
        <>
          <Link to="/browse" className="nav-button browse-btn">Browse Spaces</Link>
          <Link to="/landlord-dashboard" className="nav-button action-btn">Dashboard (L)</Link>
          <Link to="/renter-dashboard" className="nav-button action-btn">Dashboard (R)</Link>
          <Link to="/list" className="nav-button">Add Listing</Link>
          <Link to="/messaging" className="nav-button">Messages</Link>
          <Link to="/profile" className="nav-button">Profile</Link>
          {userProfile?.role === 'admin' && (
            <Link to="/admin" className="nav-button admin-btn">Admin Panel</Link>
          )}
        </>
      );
    }

    // Guest mode or unauthenticated user
    if (!user || effectiveRole === null) {
      console.log('🔍 Header: Showing unauthenticated navigation');
      return (
        <>
          <Link to="/browse" className="nav-button browse-btn">Browse Spaces</Link>
          <Link to="/signin" className="nav-button signin-btn">Sign In</Link>
        </>
      );
    }

    // Profile is loading
    if (profileLoading) {
      console.log('🔍 Header: Profile loading, showing minimal navigation');
      return (
        <>
          <Link to="/browse" className="nav-button browse-btn">Browse Spaces</Link>
          <Link to="/profile" className="nav-button">Profile</Link>
        </>
      );
    }

    console.log('🔍 Header: Showing role-based navigation for:', effectiveRole);

    // Base navigation for all authenticated users
    const baseNavigation = (
      <Link to="/browse" className="nav-button browse-btn">Browse Spaces</Link>
    );

    // Role-specific navigation
    let roleSpecificNavigation = null;
    
    if (effectiveRole === 'renter') {
      roleSpecificNavigation = (
        <Link to="/renter-dashboard" className="nav-button action-btn">Dashboard</Link>
      );
    } else if (effectiveRole === 'landlord') {
      roleSpecificNavigation = (
        <>
          <Link to="/landlord-dashboard" className="nav-button action-btn">Dashboard</Link>
          <Link to="/list" className="nav-button">Add Listing</Link>
        </>
      );
    } else if (effectiveRole === 'admin') {
      roleSpecificNavigation = (
        <>
          <Link to="/landlord-dashboard" className="nav-button action-btn">Dashboard</Link>
          <Link to="/list" className="nav-button">Add Listing</Link>
          <Link to="/admin" className="nav-button admin-btn">Admin Panel</Link>
        </>
      );
    }

    // Common navigation for all authenticated users
    const commonNavigation = (
      <>
        <Link to="/messaging" className="nav-button">Messages</Link>
        <Link to="/profile" className="nav-button">Profile</Link>
      </>
    );

    return (
      <>
        {baseNavigation}
        {roleSpecificNavigation}
        {commonNavigation}
      </>
    );
  };

  console.log('🔍 Header: Rendering. Loading:', loading, 'User:', !!user, 'Profile:', !!userProfile, 'DevMode:', devMode);

  if (loading) {
    console.log('🔍 Header: Showing loading state');
    return (
      <header className="navbar">
        <Link to="/">
          <img src={logo} className="logo" alt="Elaview Logo" />
        </Link>
        <nav className="nav-links">
          <div className="nav-loading">Loading...</div>
        </nav>
      </header>
    );
  }

  console.log('🔍 Header: Showing normal header');
  return (
    <header className="navbar">
      <Link to="/">
        <img src={logo} className="logo" alt="Elaview Logo" />
      </Link>
      
      {/* Dev Mode Indicator */}
      {devMode && (
        <div style={{
          position: 'absolute',
          top: '0',
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: 'white',
          padding: '4px 12px',
          fontSize: '12px',
          fontWeight: '600',
          borderRadius: '0 0 8px 8px',
          zIndex: 1000,
          boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)'
        }}>
          🔧 Dev Mode Enabled
        </div>
      )}
      
      <nav className="nav-links">
        {getRoleBasedNavigation()}
      </nav>
    </header>
  );
}

export default Header;