import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/SupabaseClient';

interface UserProfile {
  id: string;
  role: 'renter' | 'landlord' | 'admin';
  sub_role?: 'renter' | 'landlord' | null;
  onboarding_completed?: boolean;
}

const BecomeLandlordPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [devMode, setDevMode] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    const initializePage = async () => {
      // Check dev mode
      const devModeEnabled = localStorage.getItem('dev_mode') === 'true';
      setDevMode(devModeEnabled);

      if (devModeEnabled) {
        setProfileLoading(false);
        return;
      }

      // Get user and profile for non-dev mode
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          navigate('/signin');
          return;
        }

        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('id, role, sub_role, onboarding_completed')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('Error fetching profile:', error);
          navigate('/profile');
          return;
        }

        setUserProfile(profile);
      } catch (error) {
        console.error('Error initializing page:', error);
        navigate('/profile');
      } finally {
        setProfileLoading(false);
      }
    };

    initializePage();
  }, [navigate]);

  const handleBecomeLandlord = async () => {
    if (devMode) {
      // In dev mode, just show success message but don't actually change anything
      alert('Dev mode: Landlord onboarding completed (simulation)');
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !userProfile) {
        throw new Error('User not found');
      }

      let updateData: any = {
        onboarding_completed: true,
        updated_at: new Date().toISOString()
      };

      if (userProfile.role === 'admin') {
        // Admin users: update sub_role to landlord
        updateData.sub_role = 'landlord';
      } else {
        // Regular users: update main role to landlord
        updateData.role = 'landlord';
      }

      const { error } = await supabase
        .from('user_profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // Success! Redirect to landlord dashboard
      navigate('/landlord-dashboard');

    } catch (error) {
      console.error('Error becoming landlord:', error);
      alert('Failed to complete landlord onboarding. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '2rem', 
      maxWidth: '600px', 
      margin: '0 auto',
      textAlign: 'center'
    }}>
      <h1 style={{ 
        fontSize: '2.5rem', 
        fontWeight: 'bold', 
        marginBottom: '1rem',
        color: '#1f2937'
      }}>
        Become a Landlord
      </h1>
      
      {devMode && (
        <div style={{
          backgroundColor: '#fef3c7',
          border: '1px solid #f59e0b',
          padding: '1rem',
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <strong>🔧 Dev Mode:</strong> This page is viewable for styling purposes. 
          Onboarding will be simulated.
        </div>
      )}

      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        marginBottom: '2rem'
      }}>
        <h2 style={{ 
          fontSize: '1.5rem', 
          marginBottom: '1rem',
          color: '#374151'
        }}>
          Start Listing Your Spaces
        </h2>
        
        <p style={{ 
          fontSize: '1.1rem', 
          lineHeight: '1.6',
          color: '#6b7280',
          marginBottom: '2rem'
        }}>
          Join thousands of property owners who are earning passive income by 
          renting out their spaces for advertising. It's simple, profitable, 
          and completely managed for you.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{
            padding: '1rem',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px'
          }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
              📍 List Your Space
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
              Add photos and details of your available wall space
            </p>
          </div>
          
          <div style={{
            padding: '1rem',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px'
          }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
              💰 Earn Income
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
              Get paid monthly for each advertising placement
            </p>
          </div>
          
          <div style={{
            padding: '1rem',
            backgroundColor: '#f3f4f6',
            borderRadius: '8px'
          }}>
            <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
              🛠️ We Handle Everything
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#6b7280' }}>
              Installation, maintenance, and advertiser relations
            </p>
          </div>
        </div>

        <button
          onClick={handleBecomeLandlord}
          disabled={loading}
          style={{
            backgroundColor: loading ? '#9ca3af' : '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '1rem 2rem',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.3s ease',
            minWidth: '200px'
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = '#2563eb';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = '#3b82f6';
            }
          }}
        >
          {loading ? 'Processing...' : 'Complete Landlord Onboarding'}
        </button>
      </div>

      <div style={{
        fontSize: '0.9rem',
        color: '#6b7280',
        lineHeight: '1.5'
      }}>
        <p>
          By becoming a landlord, you agree to our terms of service and 
          understand that we'll help connect you with advertisers looking 
          for quality wall space.
        </p>
        <p style={{ marginTop: '0.5rem' }}>
          Questions? <a href="/help" style={{ color: '#3b82f6' }}>Contact our support team</a>
        </p>
      </div>
    </div>
  );
};

export default BecomeLandlordPage;