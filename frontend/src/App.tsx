import './App.css';
import Header from './partials/Header';
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
import RenterDashboard from './pages/RenterDashboard'; // NEW: Added RenterDashboard import
import SimplifiedAdminPanel from './partials/SimplifiedAdminPanel.js'
import { useEffect, useState } from 'react';
import { supabase } from './utils/SupabaseClient';
import { User } from '@supabase/supabase-js';

function App() {
  const location = useLocation();
  const hideHeaderFooter = location.pathname === '/test' || location.pathname === '/auth-test';

  return (
    <>
      {!hideHeaderFooter && <Header />}
      
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

        {/* Landlord Dashboard - landlord specific route */}
        <Route path="/landlord-dashboard" element={
          <ProtectedRoute requireRole="landlord" requireOnboarding={true}>
            <LandlordDashboard />
          </ProtectedRoute>
        } />

        {/* NEW: Renter Dashboard - renter specific route */}
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

        {/* NEW: Future renter-specific routes */}
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

function MessagingPageWrapper() {
  const [user, setUser] = useState<User | null>(null);

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