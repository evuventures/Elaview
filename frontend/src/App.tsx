import './App.css';
// Remove old Header import and use the new ElaviewHeader
import ElaviewHeader from './partials/ElaviewHeader';
import { Routes, Route, useLocation } from 'react-router-dom';
import ListSpacePage from './pages/ListSpacePage';
import SignIn from './pages/SignInPage';
import SignUp from './pages/SignUpPage';
import Home from './pages/HomePage';
import Footer from './partials/Footer';
import ItemDetailPage from './pages/ItemDetailPage';
import TestPage from './tests/TestPage';
import AuthTestPage from './tests/AuthTestPage';
import AccountQuestionsForm from './partials/AccountQuestionsForm.js';
import ProtectedRoute from './partials/ProtectedRoute.js';
import BrowseSpace from './pages/BrowsePage.js';
import ProfilePage from './pages/ProfilePage.js';
import MessagingPage from './pages/MessagingPage.js';
import LandlordDashboard from './pages/LandlordDashboard';
import RenterDashboard from './pages/RenterDashboard';
import SimplifiedAdminPanel from './partials/SimplifiedAdminPanel.js';
import { useEffect, useState } from 'react';
import { supabase } from './utils/SupabaseClient';
import { User as SupabaseUser } from '@supabase/supabase-js';

function App() {
  const location = useLocation();
  const hideHeaderFooter = location.pathname === '/test' || location.pathname === '/auth-test';

  return (
    <>
      {/* Use the new AI-powered ElaviewHeader instead of old Header */}
      {!hideHeaderFooter && <ElaviewHeader />}
      
      <Routes>
        {/* Public routes - no authentication required */}
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<BrowseSpace />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/test" element={<TestPage />} />
        <Route path="/auth-test" element={<AuthTestPage />} />

        {/* Semi-protected routes - require auth but not onboarding */}
        <Route path="/account-questions" element={
          <ProtectedRoute requireOnboarding={false}>
            <AccountQuestionsForm />
          </ProtectedRoute>
        } />
        
        {/* Protected routes - require auth and completed onboarding */}
        <Route path='/profile' element={
          <ProtectedRoute requireOnboarding={true}>
            <ProfilePage />
          </ProtectedRoute>
        } />
        
        <Route path="/list" element={
          <ProtectedRoute requireRole="landlord" requireOnboarding={true}>
            <ListSpacePage />
          </ProtectedRoute> 
        } />

        {/* Dashboard routes */}
        <Route path="/dashboard" element={
          <ProtectedRoute requireOnboarding={true}>
            <DashboardRedirect />
          </ProtectedRoute>
        } />

        {/* Landlord Dashboard - landlord specific route */}
        <Route path="/landlord-dashboard" element={
          <ProtectedRoute requireRole="landlord" requireOnboarding={true}>
            <LandlordDashboard />
          </ProtectedRoute>
        } />

        {/* Renter Dashboard - renter specific route */}
        <Route path="/renter-dashboard" element={
          <ProtectedRoute requireRole="renter" requireOnboarding={true}>
            <RenterDashboard />
          </ProtectedRoute>
        } />
        
        {/* Details page - could be public for browsing, protected for actions */}
        <Route path="/detailsPage/:id" element={<ItemDetailPage />} />

        <Route path="/messaging" element={
          <ProtectedRoute requireOnboarding={true}>
            <MessagingPageWrapper />
          </ProtectedRoute>
        } />

        {/* Additional routes for AI-powered header functionality */}
        <Route path="/messages" element={
          <ProtectedRoute requireOnboarding={true}>
            <MessagingPageWrapper />
          </ProtectedRoute>
        } />

        <Route path="/campaigns" element={
          <ProtectedRoute requireRole="renter" requireOnboarding={true}>
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h2>My Campaigns</h2>
              <p>Coming soon - view and manage your advertising campaigns</p>
              <button onClick={() => window.history.back()}>← Back</button>
            </div>
          </ProtectedRoute>
        } />

        <Route path="/saved-searches" element={
          <ProtectedRoute requireOnboarding={true}>
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h2>Saved Searches</h2>
              <p>Coming soon - view your saved search criteria and get alerts</p>
              <button onClick={() => window.history.back()}>← Back</button>
            </div>
          </ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute requireOnboarding={true}>
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h2>Account Settings</h2>
              <p>Coming soon - manage your account preferences and settings</p>
              <button onClick={() => window.history.back()}>← Back</button>
            </div>
          </ProtectedRoute>
        } />

        <Route path="/become-landlord" element={
          <ProtectedRoute requireOnboarding={true}>
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h2>Become a Landlord</h2>
              <p>Coming soon - upgrade your account to start listing spaces</p>
              <button onClick={() => window.history.back()}>← Back</button>
            </div>
          </ProtectedRoute>
        } />

        <Route path="/refer" element={
          <ProtectedRoute requireOnboarding={true}>
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h2>Refer a Friend</h2>
              <p>Coming soon - invite friends and earn referral bonuses</p>
              <button onClick={() => window.history.back()}>← Back</button>
            </div>
          </ProtectedRoute>
        } />

        {/* Role switching routes */}
        <Route path="/switch-to-renter" element={
          <ProtectedRoute requireOnboarding={true}>
            <RoleSwitchHandler targetRole="renter" />
          </ProtectedRoute>
        } />

        <Route path="/switch-to-landlord" element={
          <ProtectedRoute requireOnboarding={true}>
            <RoleSwitchHandler targetRole="landlord" />
          </ProtectedRoute>
        } />

        {/* Future routes for landlord dashboard features */}
        <Route path="/messages/:bookingId" element={
          <ProtectedRoute requireOnboarding={true}>
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h2>Individual Message Thread</h2>
              <p>Coming soon - detailed conversation view</p>
              <button onClick={() => window.history.back()}>← Back</button>
            </div>
          </ProtectedRoute>
        } />

        <Route path="/content-approval/:bookingId" element={
          <ProtectedRoute requireRole="landlord" requireOnboarding={true}>
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h2>Content Approval Interface</h2>
              <p>Coming soon - review and approve renter ad designs</p>
              <button onClick={() => window.history.back()}>← Back</button>
            </div>
          </ProtectedRoute>
        } />

        <Route path="/installation/:bookingId" element={
          <ProtectedRoute requireRole="landlord" requireOnboarding={true}>
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h2>Installation Scheduling</h2>
              <p>Coming soon - coordinate installation dates and details</p>
              <button onClick={() => window.history.back()}>← Back</button>
            </div>
          </ProtectedRoute>
        } />

        <Route path="/edit-listing/:id" element={
          <ProtectedRoute requireRole="landlord" requireOnboarding={true}>
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h2>Edit Listing</h2>
              <p>Coming soon - edit existing listing details</p>
              <button onClick={() => window.history.back()}>← Back</button>
            </div>
          </ProtectedRoute>
        } />

        {/* Renter-specific routes */}
        <Route path="/booking/:bookingId" element={
          <ProtectedRoute requireRole="renter" requireOnboarding={true}>
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h2>Booking Details</h2>
              <p>Coming soon - detailed booking information and actions</p>
              <button onClick={() => window.history.back()}>← Back</button>
            </div>
          </ProtectedRoute>
        } />

        <Route path="/booking/:bookingId/upload-design" element={
          <ProtectedRoute requireRole="renter" requireOnboarding={true}>
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h2>Upload Ad Design</h2>
              <p>Coming soon - upload and submit ad designs for approval</p>
              <button onClick={() => window.history.back()}>← Back</button>
            </div>
          </ProtectedRoute>
        } />

        <Route path="/saved" element={
          <ProtectedRoute requireRole="renter" requireOnboarding={true}>
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <h2>Saved Spaces</h2>
              <p>Coming soon - view all your saved/favorited spaces</p>
              <button onClick={() => window.history.back()}>← Back</button>
            </div>
          </ProtectedRoute>
        } />

        {/* Admin-only routes */}
        <Route path="/admin" element={
          <ProtectedRoute requireRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        } />
      </Routes>

      {!hideHeaderFooter && <Footer />}
      
      {/* Simplified Admin Panel - shows for admin users or when dev mode enabled */}
      <SimplifiedAdminPanel />
    </>
  )
}

// Dashboard redirect component to send users to appropriate dashboard
function DashboardRedirect() {
  const [userProfile, setUserProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from('user_profiles')
            .select('role, sub_role')
            .eq('id', user.id)
            .single();
          
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  useEffect(() => {
    if (!loading && userProfile) {
      const effectiveRole = userProfile.role === 'admin' && userProfile.sub_role 
        ? userProfile.sub_role 
        : userProfile.role;
      
      if (effectiveRole === 'landlord' || effectiveRole === 'admin') {
        window.location.href = '/landlord-dashboard';
      } else if (effectiveRole === 'renter') {
        window.location.href = '/renter-dashboard';
      }
    }
  }, [loading, userProfile]);

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Redirecting to Dashboard...</h2>
    </div>
  );
}

// Role switching component
function RoleSwitchHandler({ targetRole }: { targetRole: 'renter' | 'landlord' }) {
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    const handleRoleSwitch = async () => {
      setSwitching(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Update user's sub_role for admin users, or main role for others
          const { data: currentProfile } = await supabase
            .from('user_profiles')
            .select('role')
            .eq('id', user.id)
            .single();

          if (currentProfile?.role === 'admin') {
            // Admin users switch via sub_role
            await supabase
              .from('user_profiles')
              .update({ sub_role: targetRole })
              .eq('id', user.id);
          } else {
            // Regular users switch main role
            await supabase
              .from('user_profiles')
              .update({ role: targetRole })
              .eq('id', user.id);
          }

          // Redirect to appropriate dashboard
          window.location.href = targetRole === 'landlord' ? '/landlord-dashboard' : '/renter-dashboard';
        }
      } catch (error) {
        console.error('Error switching role:', error);
      } finally {
        setSwitching(false);
      }
    };

    handleRoleSwitch();
  }, [targetRole]);

  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h2>Switching to {targetRole === 'landlord' ? 'Landlord' : 'Advertiser'} Mode...</h2>
      {switching && <p>Please wait...</p>}
    </div>
  );
}

function MessagingPageWrapper() {
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    getUser();
  }, []);

  if (!user) return <p>Loading messaging...</p>;

  return <MessagingPage user={user} />;
}

// Simple admin dashboard component
function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalListings: 0,
    totalBookings: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Load admin statistics
        const [usersResponse, listingsResponse] = await Promise.all([
          supabase.from('user_profiles').select('id', { count: 'exact', head: true }),
          supabase.from('rental_listings').select('id', { count: 'exact', head: true })
        ]);

        setStats({
          totalUsers: usersResponse.count || 0,
          totalListings: listingsResponse.count || 0,
          totalBookings: 0 // Add bookings count when you have bookings table
        });
      } catch (error) {
        console.error('Failed to load admin stats:', error);
      }
    };

    loadStats();
  }, []);

  return (
    <div style={{ padding: '40px 20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '32px', fontWeight: 'bold', marginBottom: '32px' }}>
        Admin Dashboard
      </h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
        gap: '24px',
        marginBottom: '40px'
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            Total Users
          </h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#3b82f6' }}>
            {stats.totalUsers}
          </p>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            Total Listings
          </h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#10b981' }}>
            {stats.totalListings}
          </p>
        </div>

        <div style={{
          backgroundColor: 'white',
          padding: '24px',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          border: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
            Total Bookings
          </h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#f59e0b' }}>
            {stats.totalBookings}
          </p>
        </div>
      </div>

      <div style={{
        backgroundColor: 'white',
        padding: '24px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        border: '1px solid #e5e7eb'
      }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
          Quick Actions
        </h3>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <button
            onClick={() => window.location.href = '/browse'}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            View All Listings
          </button>
          <button
            onClick={() => window.location.href = '/'}
            style={{
              padding: '8px 16px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            View Frontend
          </button>
          <button
            onClick={() => console.log('Admin action triggered')}
            style={{
              padding: '8px 16px',
              backgroundColor: '#f59e0b',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Export Data
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;