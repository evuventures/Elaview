import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../utils/SupabaseClient';

// Types
interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'renter' | 'landlord' | 'admin';
  sub_role?: 'renter' | 'landlord' | null;
}

interface AdminPanelState {
  isVisible: boolean;
  isExpanded: boolean;
  currentUser: AdminUser | null;
  devMode: boolean;
  selectedUser: AdminUser | null;
  availableUsers: AdminUser[];
}

const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [state, setState] = useState<AdminPanelState>({
    isVisible: false,
    isExpanded: false,
    currentUser: null,
    devMode: false,
    selectedUser: null,
    availableUsers: []
  });

  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Memoized navigation items to prevent re-renders
  const navigationItems = useMemo(() => [
    { label: '🏠 Home', path: '/', description: 'Landing page' },
    { label: '🔍 Browse', path: '/browse', description: 'Browse listings' },
    { label: '📝 List Space', path: '/list', description: 'Create listing' },
    { label: '👤 Profile', path: '/profile', description: 'User profile' },
    { label: '💬 Messages', path: '/messaging', description: 'Chat interface' },
    { label: '🔐 Sign In', path: '/signin', description: 'Login page' },
    { label: '📋 Sign Up', path: '/signup', description: 'Registration' },
    { label: '❓ Setup', path: '/account-questions', description: 'Account setup' }
  ], []);

  // Optimized admin check with caching
  const checkAdminStatus = useCallback(async () => {
    if (!mounted) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setState(prev => ({ ...prev, isVisible: false, currentUser: null }));
        return;
      }

      // Check cache first
      const cacheKey = `admin_status_${user.id}`;
      const cached = sessionStorage.getItem(cacheKey);
      
      if (cached) {
        try {
          const profile = JSON.parse(cached);
          if (profile.role === 'admin') {
            setState(prev => ({
              ...prev,
              isVisible: true,
              currentUser: profile as AdminUser
            }));
            return;
          }
        } catch (e) {
          // Clear invalid cache
          sessionStorage.removeItem(cacheKey);
        }
      }

      // Fetch from database if not cached
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('id, name, email, role, sub_role')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Admin check failed:', error);
        return;
      }

      if (profile) {
        // Cache the result
        sessionStorage.setItem(cacheKey, JSON.stringify(profile));
        
        if (profile.role === 'admin') {
          setState(prev => ({
            ...prev,
            isVisible: true,
            currentUser: profile as AdminUser
          }));
        }
      }
    } catch (error) {
      console.error('Admin check failed:', error);
    }
  }, [mounted]);

  // Optimized user loading
  const loadAvailableUsers = useCallback(async () => {
    try {
      const { data: users } = await supabase
        .from('user_profiles')
        .select('id, name, email, role')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(10); // Reduced limit for performance

      if (users) {
        setState(prev => ({
          ...prev,
          availableUsers: users as AdminUser[]
        }));
      }
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  }, []); // No dependencies to prevent re-renders

  // Mount effect
  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Check admin status on mount and load dev mode state
  useEffect(() => {
    if (mounted) {
      checkAdminStatus();
      
      // Check if dev mode was previously enabled
      const savedDevMode = localStorage.getItem('admin_dev_mode') === 'true' || 
                          sessionStorage.getItem('admin_dev_mode') === 'true';
      
      if (savedDevMode) {
        setState(prev => ({ ...prev, devMode: true }));
      }
    }
  }, [mounted, checkAdminStatus]);

  // Load users when dev mode is enabled and current user is set
  useEffect(() => {
    if (state.devMode && state.currentUser && state.availableUsers.length === 0 && !loading) {
      loadAvailableUsers();
    }
  }, [state.devMode, state.currentUser?.id, state.availableUsers.length, loading, loadAvailableUsers]);

  const togglePanel = useCallback(() => {
    setState(prev => ({
      ...prev,
      isExpanded: !prev.isExpanded
    }));
  }, []);

  const toggleDevMode = useCallback(() => {
    setState(prev => {
      const newDevMode = !prev.devMode;
      
      // Sync with localStorage so ProtectedRoute can read it
      if (newDevMode) {
        localStorage.setItem('admin_dev_mode', 'true');
        sessionStorage.setItem('admin_dev_mode', 'true');
      } else {
        localStorage.removeItem('admin_dev_mode');
        sessionStorage.removeItem('admin_dev_mode');
      }
      
      // Dispatch storage event to notify other components
      window.dispatchEvent(new Event('storage'));
      
      return {
        ...prev,
        devMode: newDevMode
      };
    });
  }, []);

  // Fixed navigation function using React Router
  const navigateToPage = useCallback((path: string) => {
    try {
      navigate(path);
    } catch (error) {
      console.error('Navigation failed:', error);
      // Fallback to window.location for edge cases
      window.location.href = path;
    }
  }, [navigate]);

  // Function to update admin sub_role in database
  const updateAdminSubRole = useCallback(async (newSubRole: 'renter' | 'landlord' | null) => {
    if (!state.currentUser || state.currentUser.role !== 'admin') {
      console.error('Only admins can change sub_role');
      return;
    }

    if (loading) return; // Prevent multiple simultaneous updates

    try {
      setLoading(true);
      
      // Update database
      const { error } = await supabase
        .from('user_profiles')
        .update({ sub_role: newSubRole })
        .eq('id', state.currentUser.id);

      if (error) {
        throw error;
      }

      // Update local state
      setState(prev => ({
        ...prev,
        currentUser: prev.currentUser ? {
          ...prev.currentUser,
          sub_role: newSubRole
        } : null
      }));

      // Clear guest mode if setting a role
      if (newSubRole) {
        sessionStorage.removeItem('admin_guest_mode');
        localStorage.setItem('admin_dev_mode', 'true');
      }

      // Update cache
      if (state.currentUser) {
        const cacheKey = `admin_status_${state.currentUser.id}`;
        const updatedProfile = { ...state.currentUser, sub_role: newSubRole };
        sessionStorage.setItem(cacheKey, JSON.stringify(updatedProfile));
      }

      // Trigger header update
      window.dispatchEvent(new Event('admin-role-change'));
      
      console.log(`Admin sub_role updated to: ${newSubRole || 'null'}`);
      
    } catch (error) {
      console.error('Failed to update sub_role:', error);
      alert('Failed to update role. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [state.currentUser?.id, state.currentUser?.role, loading]);

  // Function to handle guest mode (session-only)
  const setGuestMode = useCallback(() => {
    // Clear any database sub_role
    updateAdminSubRole(null);
    
    // Set session flag for guest mode
    sessionStorage.setItem('admin_guest_mode', 'true');
    localStorage.removeItem('admin_dev_mode');
    
    // Trigger header update
    window.dispatchEvent(new Event('admin-role-change'));
  }, [updateAdminSubRole]);

  // Function to switch user (dev mode only)
  const switchUser = useCallback((userId: string) => {
    if (!state.devMode) {
      alert('Enable Developer Mode to switch users');
      return;
    }

    setLoading(true);
    try {
      const selectedUser = state.availableUsers.find(u => u.id === userId);
      if (selectedUser) {
        setState(prev => ({
          ...prev,
          selectedUser
        }));
        
        // Store selected user in sessionStorage for persistence
        sessionStorage.setItem('dev_impersonate_user', JSON.stringify(selectedUser));
        alert(`Switched to user: ${selectedUser.name} (${selectedUser.role})`);
      }
    } catch (error) {
      console.error('User switch failed:', error);
    } finally {
      setLoading(false);
    }
  }, [state.devMode, state.availableUsers]);

  const clearState = useCallback(() => {
    localStorage.clear();
    sessionStorage.clear();
    alert('Storage cleared!');
  }, []);

  const getCurrentRoute = useCallback(() => {
    return location.pathname;
  }, [location.pathname]);

  // Helper function to get current view mode
  const getCurrentViewMode = useCallback(() => {
    if (sessionStorage.getItem('admin_guest_mode') === 'true') return 'Guest';
    const subRole = state.currentUser?.sub_role;
    if (subRole) return subRole.charAt(0).toUpperCase() + subRole.slice(1);
    return 'Admin';
  }, [state.currentUser?.sub_role]);

  // Helper function to get view mode color
  const getViewModeColor = useCallback(() => {
    if (sessionStorage.getItem('admin_guest_mode') === 'true') return '#93c5fd';
    const subRole = state.currentUser?.sub_role;
    if (subRole === 'renter') return '#86efac';
    if (subRole === 'landlord') return '#c4b5fd';
    return '#9ca3af';
  }, [state.currentUser?.sub_role]);

  // Helper function to get view mode background
  const getViewModeBackground = useCallback(() => {
    if (sessionStorage.getItem('admin_guest_mode') === 'true') {
      return 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)';
    }
    const subRole = state.currentUser?.sub_role;
    if (subRole === 'renter') return 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(22, 163, 74, 0.05) 100%)';
    if (subRole === 'landlord') return 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(147, 51, 234, 0.05) 100%)';
    return 'linear-gradient(135deg, rgba(75, 85, 99, 0.1) 0%, rgba(55, 65, 81, 0.05) 100%)';
  }, [state.currentUser?.sub_role]);

  // Helper function to get view mode border
  const getViewModeBorder = useCallback(() => {
    if (sessionStorage.getItem('admin_guest_mode') === 'true') return 'rgba(59, 130, 246, 0.2)';
    const subRole = state.currentUser?.sub_role;
    if (subRole === 'renter') return 'rgba(34, 197, 94, 0.2)';
    if (subRole === 'landlord') return 'rgba(168, 85, 247, 0.2)';
    return 'rgba(75, 85, 99, 0.2)';
  }, [state.currentUser?.sub_role]);

  // Don't render anything if not visible or not mounted
  if (!mounted || !state.isVisible) {
    return null;
  }

  return (
    <>
      {/* Toggle Button - Sleek dark circular button */}
      <button
        onClick={togglePanel}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: state.devMode 
            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
            : 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '56px',
          height: '56px',
          cursor: 'pointer',
          boxShadow: state.devMode 
            ? '0 8px 25px rgba(239, 68, 68, 0.3), 0 4px 12px rgba(0,0,0,0.15)'
            : '0 8px 25px rgba(31, 41, 55, 0.3), 0 4px 12px rgba(0,0,0,0.15)',
          fontSize: '18px',
          fontWeight: '600',
          zIndex: 10001,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          transform: state.isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
          backdropFilter: 'blur(10px)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = state.isExpanded ? 'rotate(180deg) scale(1.1)' : 'rotate(0deg) scale(1.1)';
          e.currentTarget.style.boxShadow = state.devMode 
            ? '0 12px 35px rgba(239, 68, 68, 0.4), 0 6px 15px rgba(0,0,0,0.2)'
            : '0 12px 35px rgba(31, 41, 55, 0.4), 0 6px 15px rgba(0,0,0,0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = state.isExpanded ? 'rotate(180deg) scale(1)' : 'rotate(0deg) scale(1)';
          e.currentTarget.style.boxShadow = state.devMode 
            ? '0 8px 25px rgba(239, 68, 68, 0.3), 0 4px 12px rgba(0,0,0,0.15)'
            : '0 8px 25px rgba(31, 41, 55, 0.3), 0 4px 12px rgba(0,0,0,0.15)';
        }}
        title={state.devMode ? 'Developer Mode Active' : 'Admin Panel'}
      >
        <span style={{ fontSize: '20px' }}>
          {state.isExpanded ? '✕' : '⚙'}
        </span>
      </button>

      {/* Side Panel */}
      {state.isExpanded && (
        <>
          {/* Overlay with glassmorphism */}
          <div
            onClick={togglePanel}
            style={{
              position: 'fixed',
              top: '0',
              left: '0',
              right: '0',
              bottom: '0',
              background: 'rgba(0, 0, 0, 0.5)',
              backdropFilter: 'blur(8px)',
              zIndex: 9998,
              cursor: 'pointer',
              animation: 'fadeIn 0.3s ease-out'
            }}
          />
          
          {/* Panel with dark glassmorphism */}
          <div
            style={{
              position: 'fixed',
              top: '0',
              right: '0',
              width: '33.33vw',
              minWidth: '350px',
              height: '100vh',
              background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(31, 41, 55, 0.98) 100%)',
              backdropFilter: 'blur(20px)',
              borderLeft: '1px solid rgba(75, 85, 99, 0.3)',
              boxShadow: '-20px 0 40px rgba(0, 0, 0, 0.3)',
              zIndex: 9999,
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: '14px',
              overflowY: 'auto',
              color: 'white',
              animation: 'slideIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            <div style={{ padding: '80px 24px 24px 24px' }}>
              
              {/* Header */}
              <div style={{ marginBottom: '32px' }}>
                <h2 style={{ 
                  margin: '0 0 8px 0', 
                  color: 'white',
                  fontSize: '28px',
                  fontWeight: '700',
                  background: 'linear-gradient(135deg, #ffffff 0%, #d1d5db 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Developer Panel
                </h2>
                <p style={{ 
                  margin: 0, 
                  color: 'rgba(156, 163, 175, 0.8)',
                  fontSize: '14px',
                  fontWeight: '400'
                }}>
                  Development tools & site navigation
                </p>
              </div>

              {/* Developer Mode Toggle */}
              <div style={{ 
                marginBottom: '32px',
                padding: '24px',
                background: state.devMode 
                  ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)'
                  : 'linear-gradient(135deg, rgba(75, 85, 99, 0.1) 0%, rgba(55, 65, 81, 0.05) 100%)',
                borderRadius: '16px',
                border: `1px solid ${state.devMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(75, 85, 99, 0.2)'}`,
                backdropFilter: 'blur(10px)'
              }}>
                <label style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  cursor: 'pointer',
                  gap: '16px'
                }}>
                  <div style={{ position: 'relative' }}>
                    <input
                      type="checkbox"
                      checked={state.devMode}
                      onChange={toggleDevMode}
                      style={{ 
                        opacity: 0,
                        position: 'absolute',
                        width: '20px',
                        height: '20px'
                      }}
                    />
                    <div style={{
                      width: '48px',
                      height: '24px',
                      borderRadius: '12px',
                      background: state.devMode 
                        ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
                        : 'linear-gradient(135deg, #374151 0%, #4b5563 100%)',
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      border: '1px solid rgba(255, 255, 255, 0.1)'
                    }}>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        borderRadius: '50%',
                        background: 'white',
                        position: 'absolute',
                        top: '1px',
                        left: state.devMode ? '26px' : '2px',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                      }} />
                    </div>
                  </div>
                  <div>
                    <span style={{ 
                      fontWeight: '700',
                      fontSize: '16px',
                      color: state.devMode ? '#fca5a5' : 'white'
                    }}>
                      Developer Mode
                    </span>
                    <p style={{ 
                      margin: '4px 0 0 0', 
                      fontSize: '13px',
                      color: 'rgba(156, 163, 175, 0.8)'
                    }}>
                      Bypass auth & enable user switching
                    </p>
                  </div>
                </label>
              </div>

              {/* View Mode Switcher (Dev Mode Only) */}
              {state.devMode && (
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ 
                    margin: '0 0 16px 0',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>
                    👁️ View Mode
                  </h3>
                  <div style={{ 
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr 1fr',
                    gap: '8px',
                    marginBottom: '16px'
                  }}>
                    {/* Guest Mode */}
                    <button
                      onClick={setGuestMode}
                      style={{
                        padding: '12px 8px',
                        background: (sessionStorage.getItem('admin_guest_mode') === 'true')
                          ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.1) 100%)'
                          : 'linear-gradient(135deg, rgba(75, 85, 99, 0.1) 0%, rgba(55, 65, 81, 0.05) 100%)',
                        border: `1px solid ${(sessionStorage.getItem('admin_guest_mode') === 'true') ? 'rgba(59, 130, 246, 0.3)' : 'rgba(75, 85, 99, 0.3)'}`,
                        borderRadius: '8px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                        color: 'white',
                        fontWeight: '600',
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        opacity: loading ? 0.6 : 1
                      }}
                      disabled={loading}
                    >
                      <span style={{ fontSize: '16px' }}>👤</span>
                      Guest
                    </button>

                    {/* Renter Mode */}
                    <button
                      onClick={() => updateAdminSubRole('renter')}
                      style={{
                        padding: '12px 8px',
                        background: (state.currentUser?.sub_role === 'renter')
                          ? 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.1) 100%)'
                          : 'linear-gradient(135deg, rgba(75, 85, 99, 0.1) 0%, rgba(55, 65, 81, 0.05) 100%)',
                        border: `1px solid ${(state.currentUser?.sub_role === 'renter') ? 'rgba(34, 197, 94, 0.3)' : 'rgba(75, 85, 99, 0.3)'}`,
                        borderRadius: '8px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                        color: 'white',
                        fontWeight: '600',
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        opacity: loading ? 0.6 : 1
                      }}
                      disabled={loading}
                    >
                      <span style={{ fontSize: '16px' }}>🏠</span>
                      Renter
                    </button>

                    {/* Landlord Mode */}
                    <button
                      onClick={() => updateAdminSubRole('landlord')}
                      style={{
                        padding: '12px 8px',
                        background: (state.currentUser?.sub_role === 'landlord')
                          ? 'linear-gradient(135deg, rgba(168, 85, 247, 0.2) 0%, rgba(147, 51, 234, 0.1) 100%)'
                          : 'linear-gradient(135deg, rgba(75, 85, 99, 0.1) 0%, rgba(55, 65, 81, 0.05) 100%)',
                        border: `1px solid ${(state.currentUser?.sub_role === 'landlord') ? 'rgba(168, 85, 247, 0.3)' : 'rgba(75, 85, 99, 0.3)'}`,
                        borderRadius: '8px',
                        cursor: loading ? 'not-allowed' : 'pointer',
                        fontSize: '12px',
                        color: 'white',
                        fontWeight: '600',
                        textAlign: 'center',
                        transition: 'all 0.3s ease',
                        backdropFilter: 'blur(10px)',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '4px',
                        opacity: loading ? 0.6 : 1
                      }}
                      disabled={loading}
                    >
                      <span style={{ fontSize: '16px' }}>🏢</span>
                      Landlord
                    </button>
                  </div>
                  
                  {/* Current View Indicator */}
                  <div style={{ 
                    padding: '12px',
                    background: getViewModeBackground(),
                    borderRadius: '8px',
                    fontSize: '13px',
                    color: getViewModeColor(),
                    border: `1px solid ${getViewModeBorder()}`,
                    textAlign: 'center',
                    fontWeight: '600'
                  }}>
                    Currently viewing as: {getCurrentViewMode()}
                  </div>
                </div>
              )}

              {/* Current Status */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ 
                  margin: '0 0 16px 0',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600'
                }}>
                  Current Status
                </h3>
                <div style={{ 
                  background: 'linear-gradient(135deg, rgba(75, 85, 99, 0.1) 0%, rgba(55, 65, 81, 0.05) 100%)',
                  padding: '20px',
                  borderRadius: '12px',
                  fontSize: '13px',
                  lineHeight: '1.6',
                  border: '1px solid rgba(75, 85, 99, 0.2)',
                  backdropFilter: 'blur(10px)'
                }}>
                  <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(156, 163, 175, 0.8)' }}>Route:</span>
                    <span style={{ color: 'white', fontFamily: 'monospace', fontSize: '12px' }}>{getCurrentRoute()}</span>
                  </div>
                  <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(156, 163, 175, 0.8)' }}>User:</span>
                    <span style={{ color: 'white' }}>{state.currentUser?.name}</span>
                  </div>
                  <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(156, 163, 175, 0.8)' }}>Role:</span>
                    <span style={{ color: '#fbbf24', fontWeight: '600' }}>{state.currentUser?.role}</span>
                  </div>
                  <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(156, 163, 175, 0.8)' }}>View As:</span>
                    <span style={{ 
                      color: getViewModeColor(),
                      fontWeight: '600'
                    }}>
                      {getCurrentViewMode()}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(156, 163, 175, 0.8)' }}>Mode:</span>
                    <span style={{ 
                      color: state.devMode ? '#fca5a5' : '#86efac',
                      fontWeight: '600'
                    }}>{state.devMode ? 'Development' : 'Production'}</span>
                  </div>
                </div>
              </div>

              {/* Quick Navigation */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ 
                  margin: '0 0 16px 0',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600'
                }}>
                  Site Navigation
                </h3>
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '6px'
                }}>
                  {navigationItems.map(({ label, path, description }) => {
                    const isActive = getCurrentRoute() === path;
                    return (
                      <button
                        key={path}
                        onClick={() => navigateToPage(path)}
                        style={{
                          padding: '12px 14px',
                          background: isActive 
                            ? 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.1) 100%)'
                            : 'linear-gradient(135deg, rgba(75, 85, 99, 0.05) 0%, rgba(55, 65, 81, 0.02) 100%)',
                          border: `1px solid ${isActive ? 'rgba(59, 130, 246, 0.3)' : 'rgba(75, 85, 99, 0.2)'}`,
                          borderRadius: '10px',
                          cursor: 'pointer',
                          fontSize: '13px',
                          color: 'white',
                          textAlign: 'left',
                          transition: 'all 0.3s ease',
                          backdropFilter: 'blur(10px)',
                          minHeight: '60px',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'center'
                        }}
                        onMouseEnter={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(75, 85, 99, 0.15) 0%, rgba(55, 65, 81, 0.08) 100%)';
                            e.currentTarget.style.borderColor = 'rgba(75, 85, 99, 0.4)';
                            e.currentTarget.style.transform = 'translateY(-2px)';
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (!isActive) {
                            e.currentTarget.style.background = 'linear-gradient(135deg, rgba(75, 85, 99, 0.05) 0%, rgba(55, 65, 81, 0.02) 100%)';
                            e.currentTarget.style.borderColor = 'rgba(75, 85, 99, 0.2)';
                            e.currentTarget.style.transform = 'translateY(0px)';
                          }
                        }}
                      >
                        <div style={{ fontWeight: '600', marginBottom: '2px', fontSize: '13px' }}>{label}</div>
                        <div style={{ fontSize: '11px', color: 'rgba(156, 163, 175, 0.8)', lineHeight: '1.2' }}>
                          {description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* User Switching (Dev Mode Only) */}
              {state.devMode && (
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ 
                    margin: '0 0 16px 0',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>
                    🔄 User Switching
                  </h3>
                  <select
                    onChange={(e) => switchUser(e.target.value)}
                    value={state.selectedUser?.id || ''}
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'linear-gradient(135deg, rgba(75, 85, 99, 0.1) 0%, rgba(55, 65, 81, 0.05) 100%)',
                      border: '1px solid rgba(75, 85, 99, 0.3)',
                      borderRadius: '8px',
                      fontSize: '14px',
                      color: 'white',
                      backdropFilter: 'blur(10px)'
                    }}
                  >
                    <option value="" style={{ background: '#1f2937', color: 'white' }}>Select user...</option>
                    {state.availableUsers.map(user => (
                      <option key={user.id} value={user.id} style={{ background: '#1f2937', color: 'white' }}>
                        {user.name} - {user.role}
                      </option>
                    ))}
                  </select>
                  {state.selectedUser && (
                    <div style={{ 
                      marginTop: '12px',
                      padding: '12px',
                      background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(245, 158, 11, 0.05) 100%)',
                      borderRadius: '8px',
                      fontSize: '13px',
                      color: '#fbbf24',
                      border: '1px solid rgba(251, 191, 36, 0.2)'
                    }}>
                      <strong>⚠️ Impersonating:</strong> {state.selectedUser.name}
                    </div>
                  )}
                </div>
              )}

              {/* Development Tools */}
              <div style={{ marginBottom: '32px' }}>
                <h3 style={{ 
                  margin: '0 0 20px 0',
                  color: 'white',
                  fontSize: '16px',
                  fontWeight: '600'
                }}>
                  🛠️ Tools
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <button
                    onClick={clearState}
                    style={{
                      padding: '12px 16px',
                      background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)',
                      border: '1px solid rgba(239, 68, 68, 0.3)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#fca5a5',
                      fontWeight: '500',
                      transition: 'all 0.3s ease',
                      backdropFilter: 'blur(10px)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.1) 100%)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)';
                      e.currentTarget.style.transform = 'translateY(0px)';
                    }}
                  >
                    🗑️ Clear Storage
                  </button>
                  <button
                    onClick={() => window.location.reload()}
                    style={{
                      padding: '12px 16px',
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      color: '#93c5fd',
                      fontWeight: '500',
                      transition: 'all 0.3s ease',
                      backdropFilter: 'blur(10px)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(37, 99, 235, 0.1) 100%)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(37, 99, 235, 0.05) 100%)';
                      e.currentTarget.style.transform = 'translateY(0px)';
                    }}
                  >
                    🔄 Refresh
                  </button>
                </div>
              </div>

              {/* Footer */}
              <div style={{ 
                paddingTop: '24px',
                borderTop: '1px solid rgba(75, 85, 99, 0.3)',
                textAlign: 'center'
              }}>
                <div style={{ 
                  fontSize: '12px',
                  color: 'rgba(156, 163, 175, 0.6)',
                  marginBottom: '8px'
                }}>
                  <strong>Admin Panel v2.0</strong>
                </div>
                <div style={{
                  display: 'inline-block',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  background: state.devMode 
                    ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.1) 100%)'
                    : 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.1) 100%)',
                  border: `1px solid ${state.devMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
                  fontSize: '11px',
                  fontWeight: '600',
                  color: state.devMode ? '#fca5a5' : '#86efac'
                }}>
                  {state.devMode ? '🔧 DEV MODE' : '🔒 PROD MODE'}
                </div>
              </div>
            </div>
          </div>

          <style>
            {`
              @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
              }
              
              @keyframes slideIn {
                from { transform: translateX(100%); }
                to { transform: translateX(0); }
              }
            `}
          </style>
        </>
      )}
    </>
  );
};

export default AdminPanel;