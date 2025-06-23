// frontend/src/partials/ElaviewHeader.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Calendar, Filter, MessageSquare, Bell, User as UserIcon, Menu, Sparkles, TrendingUp, Globe } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/SupabaseClient';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import logo from '../assets/logo.png';
import './styles/ElaviewHeader.css'

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
        icon: <Sparkles />,
        text: `Looking for: ${query}`,
        interpretation: 'Billboard near downtown, budget $2-5K, tech audience',
        confidence: 95
      },
      {
        type: 'location',
        icon: <MapPin />,
        text: 'Downtown Tech District',
        description: 'High foot traffic • Young professionals • $3,200 avg',
        score: 89
      },
      {
        type: 'location',
        icon: <MapPin />,
        text: 'Business District',
        description: 'Premium visibility • Business audience • $4,800 avg',
        score: 92
      },
      {
        type: 'space-type',
        icon: <TrendingUp />,
        text: 'Digital Billboards',
        description: '12 available • High engagement • Perfect for tech',
        count: 12
      },
      {
        type: 'space-type',
        icon: <TrendingUp />,
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
          sub_role: 'renter', // Default to renter
          onboarding_completed: true,
          is_active: true
        };
        setUserProfile(fallbackProfile);
      } else {
        console.log('✅ Header: Profile fetched successfully:', profile);
        
        // If this is an admin user without a sub_role, set it to renter by default
        if (profile.role === 'admin' && !profile.sub_role) {
          console.log('🔍 Header: Admin user without sub_role, setting default to renter');
          
          const { error: updateError } = await supabase
            .from('user_profiles')
            .update({ 
              sub_role: 'renter',
              updated_at: new Date().toISOString() 
            })
            .eq('id', userId);
  
          if (updateError) {
            console.error('❌ Header: Failed to set default sub_role:', updateError);
          }
  
          // Update the profile object with the default sub_role
          profile.sub_role = 'renter';
        }
        
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('❌ Header: Exception in fetchUserProfile:', error);
      // Create fallback profile on any error
      const fallbackProfile: UserProfile = {
        id: userId,
        role: 'admin',
        sub_role: 'renter', // Default to renter
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
  
    // For admin users, use sub_role (default to renter if sub_role is null/undefined)
    if (userProfile.role === 'admin') {
      return userProfile.sub_role || 'renter';
    }
    
    // For normal users, use their actual role
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

  const effectiveRole = getEffectiveRole();
  console.log('🔍 Header: Current effective role:', effectiveRole, 'Dev mode:', devMode);

  // Center navigation based on role
  // Replace the getCenterNavigation function in ElaviewHeader.tsx with this:

const getCenterNavigation = () => {
  // Dev mode - show special navigation with both dashboards
  if (devMode) {
    console.log('🔍 Header: Showing dev mode navigation');
    return (
      <>
        <Link to="/browse" className="nav-button browse-btn">Browse Spaces</Link>
        <Link to="/landlord-dashboard" className="nav-button action-btn">Dashboard (L)</Link>
        <Link to="/renter-dashboard" className="nav-button action-btn">Dashboard (R)</Link>
        <Link to="/list" className="nav-button">Add Listing</Link>
      </>
    );
  }

  // Guest mode or unauthenticated user
  if (!user || effectiveRole === null) {
    console.log('🔍 Header: Showing unauthenticated navigation');
    return (
      <Link to="/browse" className="nav-button browse-btn">Browse Spaces</Link>
    );
  }

  // Profile is loading
  if (profileLoading) {
    console.log('🔍 Header: Profile loading, showing minimal navigation');
    return (
      <Link to="/browse" className="nav-button browse-btn">Browse Spaces</Link>
    );
  }

  console.log('🔍 Header: Showing role-based navigation for:', effectiveRole);

  // Role-specific navigation
  // Note: effectiveRole for admin users will be their sub_role ('renter' or 'landlord')
  if (effectiveRole === 'renter') {
    return (
      <>
        <Link to="/browse" className="nav-button browse-btn">Browse Spaces</Link>
        <Link to="/renter-dashboard" className="nav-button action-btn">Dashboard</Link>
      </>
    );
  } else if (effectiveRole === 'landlord') {
    return (
      <>
        <Link to="/browse" className="nav-button browse-btn">Browse Spaces</Link>
        <Link to="/list" className="nav-button action-btn">New Listing</Link>
        <Link to="/landlord-dashboard" className="nav-button action-btn">Dashboard</Link>
      </>
    );
  }

  // Fallback for any unexpected cases
  return (
    <Link to="/browse" className="nav-button browse-btn">Browse Spaces</Link>
  );
};

  // Hamburger menu content based on auth state
  const getHamburgerMenuContent = () => {
    if (!user) {
      // Unauthenticated user menu
      return (
        <div className="hamburger-dropdown">
          <Link to="/help" className="hamburger-menu-item">Help Center</Link>
          <Link to="/become-landlord" className="hamburger-menu-item">Become a Landlord</Link>
          <Link to="/signin" className="hamburger-menu-item">Login or Sign Up</Link>
        </div>
      );
    } else {
      // Authenticated user menu (simplified)
      return (
        <div className="hamburger-dropdown">
          <Link to="/help" className="hamburger-menu-item">Help Center</Link>
          <Link to="/settings" className="hamburger-menu-item">Settings</Link>
          <button 
            onClick={() => supabase.auth.signOut()}
            className="hamburger-menu-item"
          >
            Sign Out
          </button>
        </div>
      );
    }
  };

  const mockUser = {
    name: user?.email?.split('@')[0] || 'User',
    avatar: user?.email?.charAt(0).toUpperCase() || 'G',
  };

  console.log('🔍 Header: Rendering. Loading:', loading, 'User:', !!user, 'Profile:', !!userProfile, 'DevMode:', devMode);

  if (loading) {
    console.log('🔍 Header: Showing loading state');
    return (
      <header className="navbar">
        <Link to="/">
        <img src={logo} alt="Elaview" className="logo-img" />
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
        
        {/* Top Row - Logo, Navigation, and User Controls */}
        <div className="header-top-row">
          
          {/* Left: Logo */}
          <div className="logo-section">
            <Link to="/">
            <img src={logo} alt="Elaview" className="logo-img"/>
            </Link>
          </div>

          {/* Center: Navigation */}
          <div className="nav-section">
            {getCenterNavigation()}
          </div>

          {/* Right: User Controls */}
          <div className="user-controls-section">
            
            {/* Unauthenticated state */}
            {!user && (
              <>
                <Link to="/become-landlord" className="become-landlord-text">
                  Become a Landlord
                </Link>
                <div className="user-avatar globe-avatar">
                  <Globe />
                </div>
              </>
            )}

            {/* Authenticated state */}
           
{user && (
  <>
    {/* Role-based text for authenticated users */}
    {(() => {
      // For admin users, check their sub_role (default to renter if null)
      if (userProfile?.role === 'admin') {
        const currentSubRole = userProfile.sub_role || 'renter';
        if (currentSubRole === 'renter') {
          return (
            <Link to="/become-landlord" className="become-landlord-text">
              Switch to Landlord
            </Link>
          );
        } else {
          return (
            <Link to="/switch-to-renter" className="become-landlord-text">
              Switch to Advertiser
            </Link>
          );
        }
      }
      
      // For regular users
      if (effectiveRole === 'renter') {
        return (
          <Link to="/become-landlord" className="become-landlord-text">
            Become a Landlord
          </Link>
        );
      } else if (effectiveRole === 'landlord') {
        return (
          <Link to="/switch-to-renter" className="become-landlord-text">
            Switch to Advertiser
          </Link>
        );
      }
      
      return null;
    })()}
    
    <Link to="/profile" className="user-avatar-link">
      <div className="user-avatar">
        {mockUser.avatar}
      </div>
    </Link>
  </>
)}

            {/* Hamburger Menu */}
            <div className="hamburger-container">
              <button 
                className="hamburger-menu"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <Menu />
              </button>

              {/* Hamburger Dropdown */}
              {showUserMenu && getHamburgerMenuContent()}
            </div>
          </div>
        </div>

        {/* Search Row - Prominent Search Bar */}
        <div className="header-search-row">
          <div className="search-section-prominent">
            <form onSubmit={handleSearchSubmit} className="search-form">
              <div className={`search-wrapper ${searchFocused ? 'focused' : ''}`}>
                <div className="search-icon-container">
                  <Search className="search-icon" />
                </div>
                <input
                  ref={searchRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={handleSearchFocus}
                  onBlur={handleSearchBlur}
                  placeholder="Describe your ideal space..."
                  className="search-input"
                />
                {searchQuery && (
                  <div className="ai-badge">
                    <Sparkles />
                    <span>AI</span>
                  </div>
                )}
                <div className="search-controls">
                  <button type="button" className="search-control-btn">
                    <MapPin />
                  </button>
                  <button type="button" className="search-control-btn">
                    <Calendar />
                  </button>
                  <button type="button" className="search-control-btn">
                    <Filter />
                  </button>
                </div>
              </div>
            </form>

            {/* AI Suggestions Dropdown */}
            {showResults && aiSuggestions.length > 0 && (
              <div className="suggestions-dropdown">
                {aiSuggestions.find(s => s.type === 'ai-interpretation') && (
                  <div className="ai-interpretation">
                    <button
                      onClick={() => handleSuggestionClick(aiSuggestions.find(s => s.type === 'ai-interpretation')!)}
                      className="ai-interpretation-btn"
                    >
                      <Sparkles />
                      <div className="ai-content">
                        <div className="ai-title">AI Understanding</div>
                        <div className="ai-text">
                          {aiSuggestions.find(s => s.type === 'ai-interpretation')?.interpretation}
                        </div>
                        <div className="ai-confidence">95% confidence • Click to search</div>
                      </div>
                    </button>
                  </div>
                )}

                <div className="suggestions-section">
                  <div className="suggestions-header">Recommended Locations</div>
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
                      <div className="suggestion-score">Score: {suggestion.score}</div>
                    </button>
                  ))}
                </div>

                <div className="suggestions-section">
                  <div className="suggestions-header">Matching Ad Spaces</div>
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
                      <div className="suggestion-count">{suggestion.count} available</div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dev Mode Indicator */}
      {devMode && (
        <div className="dev-mode-indicator">
          🔧 Dev Mode Enabled
        </div>
      )}
    </div>
  );
};

export default ElaviewHeader;