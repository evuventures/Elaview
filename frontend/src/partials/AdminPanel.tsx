import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../utils/SupabaseClient';

// Types
interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'admin';
  last_seen?: string;
  is_online?: boolean;
}

interface AdminPanelState {
  isVisible: boolean;
  isExpanded: boolean;
  currentUser: AdminUser | null;
  onlineAdmins: AdminUser[];
}

const SimplifiedAdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const mountTimeRef = useRef<number>(Date.now());
  const lastCheckRef = useRef<number>(0);
  const checkTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  
  const [state, setState] = useState<AdminPanelState>({
    isVisible: false,
    isExpanded: false,
    currentUser: null,
    onlineAdmins: []
  });

  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [devMode, setDevMode] = useState(false);

  // Memoized navigation items
  const navigationItems = useMemo(() => [
    { label: '🏠 Home', path: '/', description: 'Landing page' },
    { label: '🔍 Browse', path: '/browse', description: 'Browse listings' },
    { label: '📝 List Space', path: '/list', description: 'Create listing' },
    { label: '🏢 Landlord Dashboard', path: '/landlord-dashboard', description: 'Landlord management' },
    { label: '🏠 Renter Dashboard', path: '/renter-dashboard', description: 'Renter bookings' },
    { label: '👤 Profile', path: '/profile', description: 'User profile' },
    { label: '💬 Messages', path: '/messaging', description: 'Chat interface' },
    { label: '🔐 Sign In', path: '/signin', description: 'Login page' },
    { label: '📋 Sign Up', path: '/signup', description: 'Registration' }
  ], []);

  // Check if admin panel should be visible
  const checkAdminStatus = useCallback(async () => {
    if (!mounted) return;
    
    const now = Date.now();
    if (now - lastCheckRef.current < 1000) return;
    lastCheckRef.current = now;
  
    try {
      // ALWAYS check auth first - even in dev mode
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setState(prev => ({ ...prev, isVisible: false, currentUser: null }));
        return;
      }
  
      // ALWAYS check if user is admin - even in dev mode  
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('id, name, email, role')
        .eq('id', user.id)
        .single();
  
      if (error) {
        console.error('Admin check failed:', error);
        setState(prev => ({ ...prev, isVisible: false, currentUser: null }));
        return;
      }
  
      // ONLY show if user is actually admin
      if (profile?.role === 'admin') {
        setState(prev => ({
          ...prev,
          isVisible: true,
          currentUser: profile as AdminUser
        }));
        loadOnlineAdmins();
      } else {
        setState(prev => ({ ...prev, isVisible: false, currentUser: null }));
      }
      
    } catch (error) {
      console.error('Admin check failed:', error);
      setState(prev => ({ ...prev, isVisible: false, currentUser: null }));
    }
  }, [mounted]);

  // Load other online admin users
  const loadOnlineAdmins = useCallback(async () => {
    try {
      // Get all admin users and their last activity
      const { data: admins, error } = await supabase
        .from('user_profiles')
        .select('id, name, email, role, updated_at')
        .eq('role', 'admin')
        .neq('id', state.currentUser?.id || '');

      if (error) {
        console.error('Failed to load admin users:', error);
        return;
      }

      // Consider users online if they've been active in the last 10 minutes
      const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
      
      const onlineAdmins = (admins || []).map(admin => ({
        ...admin,
        is_online: new Date(admin.updated_at) > tenMinutesAgo,
        last_seen: admin.updated_at
      })) as AdminUser[];

      setState(prev => ({ ...prev, onlineAdmins }));
    } catch (error) {
      console.error('Exception loading online admins:', error);
    }
  }, [state.currentUser?.id]);

  // Mount effect
  useEffect(() => {
    setMounted(true);
    
    // Load initial dev mode state
    const savedDevMode = localStorage.getItem('dev_mode') === 'true';
    setDevMode(savedDevMode);
    
    return () => {
      setMounted(false);
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, []);

  // Delayed admin check
  useEffect(() => {
    if (!mounted) return;

    if (checkTimeoutRef.current) {
      clearTimeout(checkTimeoutRef.current);
    }

    checkTimeoutRef.current = setTimeout(() => {
      checkAdminStatus();
    }, 500);

    return () => {
      if (checkTimeoutRef.current) {
        clearTimeout(checkTimeoutRef.current);
      }
    };
  }, [mounted, checkAdminStatus]);

  // Refresh online admins every 30 seconds
  useEffect(() => {
    if (!state.currentUser) return;

    const interval = setInterval(() => {
      loadOnlineAdmins();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [state.currentUser, loadOnlineAdmins]);

  const togglePanel = useCallback(() => {
    setState(prev => ({
      ...prev,
      isExpanded: !prev.isExpanded
    }));
  }, []);

  const toggleDevMode = useCallback(() => {
    const newDevMode = !devMode;
    setDevMode(newDevMode);
    
    if (newDevMode) {
      localStorage.setItem('dev_mode', 'true');
    } else {
      localStorage.removeItem('dev_mode');
    }
    
    // Dispatch event to notify Header and ProtectedRoute
    window.dispatchEvent(new Event('dev-mode-change'));
    
    console.log(`🔧 Dev mode ${newDevMode ? 'enabled' : 'disabled'}`);
  }, [devMode]);

  const navigateToPage = useCallback((path: string) => {
    try {
      navigate(path);
    } catch (error) {
      console.error('Navigation failed:', error);
      window.location.href = path;
    }
  }, [navigate]);

  const clearState = useCallback(() => {
    localStorage.clear();
    sessionStorage.clear();
    alert('Storage cleared!');
  }, []);

  const getCurrentRoute = useCallback(() => {
    return location.pathname;
  }, [location.pathname]);

  const formatLastSeen = (lastSeen?: string) => {
    if (!lastSeen) return 'Unknown';
    
    const now = new Date();
    const then = new Date(lastSeen);
    const diffMinutes = Math.floor((now.getTime() - then.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays}d ago`;
  };

  // Don't render if not visible
  if (!mounted || !state.isVisible) {
    return null;
  }

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={togglePanel}
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          background: devMode 
            ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' 
            : 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
          color: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '56px',
          height: '56px',
          cursor: 'pointer',
          boxShadow: devMode 
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
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = state.isExpanded ? 'rotate(180deg) scale(1)' : 'rotate(0deg) scale(1)';
        }}
        title={devMode ? 'Dev Mode Active' : 'Admin Panel'}
      >
        <span style={{ fontSize: '20px' }}>
          {state.isExpanded ? '✕' : '⚙'}
        </span>
      </button>

      {state.isExpanded && (
        <>
          {/* Overlay */}
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
          
          {/* Panel */}
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
                  Admin Panel
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

              {/* Dev Mode Toggle */}
              <div style={{ 
                marginBottom: '32px',
                padding: '24px',
                background: devMode 
                  ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.1) 0%, rgba(220, 38, 38, 0.05) 100%)'
                  : 'linear-gradient(135deg, rgba(75, 85, 99, 0.1) 0%, rgba(55, 65, 81, 0.05) 100%)',
                borderRadius: '16px',
                border: `1px solid ${devMode ? 'rgba(239, 68, 68, 0.2)' : 'rgba(75, 85, 99, 0.2)'}`,
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
                      checked={devMode}
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
                      background: devMode 
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
                        left: devMode ? '26px' : '2px',
                        transition: 'all 0.3s ease',
                        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)'
                      }} />
                    </div>
                  </div>
                  <div>
                    <span style={{ 
                      fontWeight: '700',
                      fontSize: '16px',
                      color: devMode ? '#fca5a5' : 'white'
                    }}>
                      Developer Mode
                    </span>
                    <p style={{ 
                      margin: '4px 0 0 0', 
                      fontSize: '13px',
                      color: 'rgba(156, 163, 175, 0.8)'
                    }}>
                      Bypass auth & access any page
                    </p>
                  </div>
                </label>
              </div>

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
                  {state.currentUser && (
                    <>
                      <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'rgba(156, 163, 175, 0.8)' }}>User:</span>
                        <span style={{ color: 'white' }}>{state.currentUser.name}</span>
                      </div>
                      <div style={{ marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: 'rgba(156, 163, 175, 0.8)' }}>Role:</span>
                        <span style={{ color: '#fbbf24', fontWeight: '600' }}>{state.currentUser.role}</span>
                      </div>
                    </>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'rgba(156, 163, 175, 0.8)' }}>Mode:</span>
                    <span style={{ 
                      color: devMode ? '#fca5a5' : '#86efac',
                      fontWeight: '600'
                    }}>{devMode ? 'Development' : 'Production'}</span>
                  </div>
                </div>
              </div>

              {/* Online Admins */}
              {state.onlineAdmins.length > 0 && (
                <div style={{ marginBottom: '32px' }}>
                  <h3 style={{ 
                    margin: '0 0 16px 0',
                    color: 'white',
                    fontSize: '16px',
                    fontWeight: '600'
                  }}>
                    👥 Online Admins
                  </h3>
                  <div style={{ 
                    background: 'linear-gradient(135deg, rgba(75, 85, 99, 0.1) 0%, rgba(55, 65, 81, 0.05) 100%)',
                    padding: '16px',
                    borderRadius: '12px',
                    border: '1px solid rgba(75, 85, 99, 0.2)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    {state.onlineAdmins.map(admin => (
                      <div key={admin.id} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px',
                        marginBottom: '12px',
                        fontSize: '13px'
                      }}>
                        <div style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: admin.is_online ? '#22c55e' : '#6b7280'
                        }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ color: 'white', fontWeight: '500' }}>{admin.name}</div>
                          <div style={{ color: 'rgba(156, 163, 175, 0.8)', fontSize: '11px' }}>
                            {admin.is_online ? 'Online' : formatLastSeen(admin.last_seen)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Site Navigation */}
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
                  <strong>Admin Panel v4.0 (Simplified)</strong>
                </div>
                <div style={{
                  display: 'inline-block',
                  padding: '6px 12px',
                  borderRadius: '20px',
                  background: devMode 
                    ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.1) 100%)'
                    : 'linear-gradient(135deg, rgba(34, 197, 94, 0.2) 0%, rgba(22, 163, 74, 0.1) 100%)',
                  border: `1px solid ${devMode ? 'rgba(239, 68, 68, 0.3)' : 'rgba(34, 197, 94, 0.3)'}`,
                  fontSize: '11px',
                  fontWeight: '600',
                  color: devMode ? '#fca5a5' : '#86efac'
                }}>
                  {devMode ? '🔧 DEV MODE' : '🔒 PROD MODE'}
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

export default SimplifiedAdminPanel;