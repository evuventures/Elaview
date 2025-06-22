// frontend/src/partials/ElaviewHeader.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Calendar, Filter, MessageSquare, Bell, User as UserIcon, Menu, Sparkles, TrendingUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/SupabaseClient';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import './styles/Header.css'

// Types
interface UserProfile {
  id: string;
  role: 'renter' | 'landlord' | 'admin';
  sub_role?: 'renter' | 'landlord' | null;
  onboarding_completed?: boolean;
  is_active: boolean;
}

interface AISuggestion {
  type: 'ai-interpretation' | 'location' | 'space-type';
  icon: React.ReactNode;
  text: string;
  description?: string;
  interpretation?: string;
  confidence?: number;
  score?: number;
  count?: number;
}

const ElaviewHeader = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(false);
  const [devMode, setDevMode] = useState(false);
  
  // Search states
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const searchRef = useRef<HTMLInputElement>(null);

  // Mock AI suggestions based on natural language processing
  const generateAiSuggestions = (query: string): AISuggestion[] => {
    if (!query) return [];
    
    const suggestions: AISuggestion[] = [
      {
        type: 'ai-interpretation',
        icon: <Sparkles className="ai-sparkles-icon" />,
        text: `Looking for: ${query}`,
        interpretation: 'Billboard near downtown, budget $2-5K, tech audience',
        confidence: 95
      },
      {
        type: 'location',
        icon: <MapPin className="location-icon" />,
        text: 'Downtown Tech District',
        description: 'High foot traffic • Young professionals • $3,200 avg',
        score: 89
      },
      {
        type: 'location',
        icon: <MapPin className="location-icon" />,
        text: 'Business District',
        description: 'Premium visibility • Business audience • $4,800 avg',
        score: 92
      },
      {
        type: 'space-type',
        icon: <TrendingUp className="trending-icon" />,
        text: 'Digital Billboards',
        description: '12 available • High engagement • Perfect for tech',
        count: 12
      },
      {
        type: 'space-type',
        icon: <TrendingUp className="trending-icon" />,
        text: 'Building Walls',
        description: '8 available • Creative freedom • Lower cost',
        count: 8
      }
    ];
    
    return suggestions.filter(s => 
      s.text.toLowerCase().includes(query.toLowerCase()) ||
      (s.description && s.description.toLowerCase().includes(query.toLowerCase()))
    );
  };

  // Fetch user profile from database
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

  // AI search suggestions effect
  useEffect(() => {
    if (searchQuery) {
      const timer = setTimeout(() => {
        setAiSuggestions(generateAiSuggestions(searchQuery));
        setShowResults(true);
      }, 300);
      return () => clearTimeout(timer);
    } else {
      setShowResults(false);
    }
  }, [searchQuery]);

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

  const handleSearchFocus = () => {
    setSearchFocused(true);
    if (searchQuery) setShowResults(true);
  };

  const handleSearchBlur = () => {
    // Delay to allow clicking on suggestions
    setTimeout(() => {
      setSearchFocused(false);
      setShowResults(false);
    }, 200);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/browse?q=${encodeURIComponent(searchQuery)}`);
      setShowResults(false);
      setSearchFocused(false);
    }
  };

  const handleSuggestionClick = (suggestion: AISuggestion) => {
    if (suggestion.type === 'ai-interpretation') {
      setSearchQuery(suggestion.text);
      navigate(`/browse?q=${encodeURIComponent(suggestion.text)}`);
    } else if (suggestion.type === 'location') {
      navigate(`/browse?location=${encodeURIComponent(suggestion.text)}`);
    } else if (suggestion.type === 'space-type') {
      navigate(`/browse?type=${encodeURIComponent(suggestion.text)}`);
    }
    setShowResults(false);
    setSearchFocused(false);
  };

  const quickFilters = [
    { label: 'Billboards', count: 234 },
    { label: 'Digital Displays', count: 156 },
    { label: 'Vehicle Wraps', count: 89 },
    { label: 'Storefronts', count: 312 }
  ];

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
          <Link to="/list" className="nav-button action-btn">List Space</Link>
        </>
      );
    } else if (effectiveRole === 'admin') {
      roleSpecificNavigation = (
        <>
          <Link to="/landlord-dashboard" className="nav-button action-btn">Dashboard</Link>
          <Link to="/list" className="nav-button action-btn">List Space</Link>
          <Link to="/admin" className="nav-button admin-btn">Admin Panel</Link>
        </>
      );
    }

    return (
      <>
        {baseNavigation}
        {roleSpecificNavigation}
      </>
    );
  };

  const mockUser = {
    name: user?.email?.split('@')[0] || 'User',
    role: effectiveRole === 'renter' ? 'Advertiser' : effectiveRole === 'landlord' ? 'Landlord' : 'User',
    avatar: user?.email?.charAt(0).toUpperCase() || 'P',
    notifications: 3,
    messages: 2
  };

  console.log('🔍 Header: Rendering. Loading:', loading, 'User:', !!user, 'Profile:', !!userProfile, 'DevMode:', devMode);

  if (loading) {
    console.log('🔍 Header: Showing loading state');
    return (
      <header className="navbar">
        <Link to="/">
          <div className="logo-text">Elaview</div>
        </Link>
        <nav className="nav-links">
          <div className="nav-loading">Loading...</div>
        </nav>
      </header>
    );
  }

  console.log('🔍 Header: Showing normal header');
  return (
    <div className="main-header">
      {/* Main Header */}
      <div className="header-container">
        <div className="header-content">
          
          {/* Logo */}
          <div className="logo-section">
            <Link to="/" className="logo-text">
              Elaview
            </Link>
          </div>

          {/* AI-Powered Search Bar */}
          <div className="search-section">
            <form onSubmit={handleSearchSubmit}>
              <div className={`search-wrapper ${searchFocused ? 'search-focused' : ''}`}>
                
                {/* Search Input Container */}
                <div className={`search-input-container ${searchFocused ? 'input-focused' : ''}`}>
                  
                  {/* Search Icon */}
                  <div className="search-icon-wrapper">
                    <Search className={`search-icon ${searchFocused ? 'icon-focused' : ''}`} />
                  </div>

                  {/* Search Input */}
                  <input
                    ref={searchRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={handleSearchFocus}
                    onBlur={handleSearchBlur}
                    placeholder="Find your perfect ad space... Try: 'billboard near tech companies under $3000'"
                    className="search-input"
                  />

                  {/* AI Badge */}
                  {searchQuery && (
                    <div className="ai-badge">
                      <Sparkles className="ai-badge-icon" />
                      <span>AI</span>
                    </div>
                  )}

                  {/* Quick Filters */}
                  <div className="search-controls">
                    <button type="button" className="search-control-btn">
                      <MapPin className="search-control-icon" />
                    </button>
                    <button type="button" className="search-control-btn">
                      <Calendar className="search-control-icon" />
                    </button>
                    <button type="button" className="search-control-btn">
                      <Filter className="search-control-icon" />
                    </button>
                  </div>
                </div>
              </div>
            </form>

            {/* AI Search Results Dropdown */}
            {showResults && aiSuggestions.length > 0 && (
              <div className="ai-suggestions-dropdown">
                
                {/* AI Interpretation */}
                {aiSuggestions.find(s => s.type === 'ai-interpretation') && (
                  <div className="ai-interpretation-section">
                    <button
                      onClick={() => handleSuggestionClick(aiSuggestions.find(s => s.type === 'ai-interpretation')!)}
                      className="ai-interpretation-button"
                    >
                      <Sparkles className="ai-interpretation-icon" />
                      <div className="ai-interpretation-content">
                        <div className="ai-interpretation-title">AI Understanding</div>
                        <div className="ai-interpretation-text">
                          {aiSuggestions.find(s => s.type === 'ai-interpretation')?.interpretation}
                        </div>
                        <div className="ai-interpretation-confidence">
                          95% confidence • Click to search
                        </div>
                      </div>
                    </button>
                  </div>
                )}

                {/* Location Suggestions */}
                <div className="suggestions-section">
                  <div className="suggestions-header">
                    Recommended Locations
                  </div>
                  {aiSuggestions.filter(s => s.type === 'location').map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="suggestion-item"
                    >
                      {suggestion.icon}
                      <div className="suggestion-content">
                        <div className="suggestion-title">{suggestion.text}</div>
                        <div className="suggestion-description">{suggestion.description}</div>
                      </div>
                      <div className="suggestion-score">
                        Score: {suggestion.score}
                      </div>
                    </button>
                  ))}
                </div>

                {/* Space Type Suggestions */}
                <div className="suggestions-section bordered">
                  <div className="suggestions-header">
                    Matching Ad Spaces
                  </div>
                  {aiSuggestions.filter(s => s.type === 'space-type').map((suggestion, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="suggestion-item"
                    >
                      {suggestion.icon}
                      <div className="suggestion-content">
                        <div className="suggestion-title">{suggestion.text}</div>
                        <div className="suggestion-description">{suggestion.description}</div>
                      </div>
                      <div className="suggestion-count">
                        {suggestion.count} available
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Navigation & User Controls */}
          <div className="controls-section">
            
            {/* Role-based Navigation */}
            <div className="nav-desktop">
              {getRoleBasedNavigation()}
            </div>

            {/* Switch Role */}
            {user && effectiveRole !== 'admin' && (
              <Link 
                to={effectiveRole === 'landlord' ? '/switch-to-renter' : '/switch-to-landlord'}
                className="switch-role-btn"
              >
                Switch to {effectiveRole === 'landlord' ? 'Advertiser' : 'Landlord'}
              </Link>
            )}

            {/* Messages */}
            {user && (
              <Link to="/messages" className="icon-button">
                <MessageSquare className="icon-button-icon" />
                {mockUser.messages > 0 && (
                  <span className="notification-badge">
                    {mockUser.messages}
                  </span>
                )}
              </Link>
            )}

            {/* Notifications */}
            {user && (
              <button className="icon-button">
                <Bell className="icon-button-icon" />
                {mockUser.notifications > 0 && (
                  <span className="notification-badge">
                    {mockUser.notifications}
                  </span>
                )}
              </button>
            )}

            {/* User Profile Dropdown */}
            {user && (
              <div className="user-profile-container">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="user-profile-button"
                >
                  <div className="user-avatar">
                    {mockUser.avatar}
                  </div>
                  <div className="user-info">
                    <div className="user-name">{mockUser.name}</div>
                    <div className="user-role">{mockUser.role}</div>
                  </div>
                </button>

                {/* User Dropdown Menu */}
                {showUserMenu && (
                  <div className="user-profile-dropdown">
                    <div className="user-profile-header">
                      <div className="user-profile-name">{mockUser.name}</div>
                      <div className="user-profile-role">{mockUser.role}</div>
                    </div>
                    
                    <div className="user-profile-menu">
                      <Link to="/dashboard" className="user-profile-menu-item">
                        Dashboard
                      </Link>
                      <Link to="/campaigns" className="user-profile-menu-item">
                        My Campaigns
                      </Link>
                      <Link to="/saved-searches" className="user-profile-menu-item">
                        Saved Searches
                      </Link>
                      <Link to="/settings" className="user-profile-menu-item">
                        Account Settings
                      </Link>
                    </div>

                    <div className="user-profile-menu-section">
                      <Link to="/become-landlord" className="user-profile-menu-item featured">
                        Become a Landlord
                      </Link>
                      <Link to="/refer" className="user-profile-menu-item">
                        Refer a Friend
                      </Link>
                    </div>

                    <div className="user-profile-menu-section">
                      <button 
                        onClick={() => supabase.auth.signOut()}
                        className="user-profile-menu-item danger"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Hamburger Menu */}
            <button className="hamburger-menu">
              <Menu className="hamburger-icon" />
            </button>
          </div>
        </div>
      </div>

      {/* Dev Mode Indicator */}
      {devMode && (
        <div className="dev-mode-indicator">
          🔧 Dev Mode Enabled
        </div>
      )}

      {/* Quick Filter Bar */}
      <div className="quick-filter-bar">
        <div className="quick-filter-container">
          <div className="quick-filter-items">
            <span className="quick-filter-label">Popular:</span>
            {quickFilters.map((filter, idx) => (
              <Link
                key={idx}
                to={`/browse?type=${encodeURIComponent(filter.label)}`}
                className="quick-filter-link"
              >
                {filter.label} ({filter.count})
              </Link>
            ))}
          </div>
          
          <Link
            to="/browse?advanced=true"
            className="advanced-filter-link"
          >
            Advanced Filters
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ElaviewHeader;