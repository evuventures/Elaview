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
  const [isGuestMode, setIsGuestMode] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      // Check for guest mode (session-only)
      setIsGuestMode(sessionStorage.getItem('admin_guest_mode') === 'true');

      if (user) {
        // Get user profile with role and sub_role
        const { data: profile } = await supabase
          .from('user_profiles')
          .select('id, role, sub_role, onboarding_completed, is_active')
          .eq('id', user.id)
          .single();

        if (profile) {
          setUserProfile(profile);
        }
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    };

    getUser();

    // Listen to auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        getUser();
      } else {
        setUserProfile(null);
        setIsGuestMode(false);
        setLoading(false);
      }
    });

    // Listen for admin role changes
    const handleAdminRoleChange = () => {
      setIsGuestMode(sessionStorage.getItem('admin_guest_mode') === 'true');
      // Refresh user profile to get updated sub_role
      if (user) {
        getUser();
      }
    };

    window.addEventListener('admin-role-change', handleAdminRoleChange);

    return () => {
      listener.subscription.unsubscribe();
      window.removeEventListener('admin-role-change', handleAdminRoleChange);
    };
  }, [user]);

  // Determine effective role for navigation
  const getEffectiveRole = () => {
    // Guest mode (admin viewing as unauthenticated user)
    if (isGuestMode) {
      return null;
    }
    
    if (!userProfile) return null;
    
    // If admin has sub_role set, use that
    if (userProfile.role === 'admin' && userProfile.sub_role) {
      return userProfile.sub_role;
    }
    
    // Otherwise use actual role
    return userProfile.role;
  };

  const effectiveRole = getEffectiveRole();

  // Role-based navigation items
  const getRoleBasedNavigation = () => {
    // Guest mode or unauthenticated user
    if (isGuestMode || !user || (!userProfile && !isGuestMode)) {
      return (
        <>
          <Link to="/browse" className="nav-button browse-btn">Browse Spaces</Link>
          <Link to="/signin" className="nav-button signin-btn">Sign In</Link>
        </>
      );
    }

    if (!userProfile) {
      // User exists but no profile yet
      return (
        <>
          <Link to="/browse" className="nav-button browse-btn">Browse Spaces</Link>
          <Link to="/profile" className="nav-button profile-btn">Profile</Link>
        </>
      );
    }

    // Authenticated user with profile (or admin with sub_role)
    const baseNavigation = (
      <>
        <Link to="/browse" className="nav-button browse-btn">Browse Spaces</Link>
      </>
    );

    let roleSpecificNavigation;
    
    if (effectiveRole === 'renter') {
      roleSpecificNavigation = (
        <Link to="/bookings" className="nav-button action-btn">View Bookings</Link>
      );
    } else if (effectiveRole === 'landlord') {
      roleSpecificNavigation = (
        <Link to="/listings" className="nav-button action-btn">My Listings</Link>
      );
    }
    // Note: No admin panel button in header as requested

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

  if (loading) {
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

  return (
    <header className="navbar">
      <Link to="/">
        <img src={logo} className="logo" alt="Elaview Logo" />
      </Link>
      
      <nav className="nav-links">
        {getRoleBasedNavigation()}
      </nav>
    </header>
  );
}

export default Header;