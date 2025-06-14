import './styles/ProfilePage.css';
import { useEffect, useState } from 'react';
import { supabase } from '../utils/SupabaseClient.js';
import { useNavigate } from 'react-router-dom';

interface UserProfile {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
}

export default function ProfilePage() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();
  
    useEffect(() => {
      const fetchProfile = async () => {
        try {
          // Get the current user
          const {
            data: { user },
            error: userError,
          } = await supabase.auth.getUser();
  
          if (userError || !user) {
            console.error('Auth error:', userError);
            navigate('/signin');
            return;
          }

          console.log('Current user:', { id: user.id, email: user.email }); // Debug log
  
          // First, try to find profile by user ID
          const { data: profileById, error: idError } = await supabase
            .from('user_profiles')
            .select('id, name, email, phone, role')
            .eq('id', user.id);
  
          console.log('Profile by ID query:', { profileById, idError }); // Debug log

          if (profileById && profileById.length > 0) {
            // Profile found by ID
            setProfile(profileById[0] as UserProfile);
            setLoading(false);
            return;
          }

          // If no profile found by ID, try to find by email
          const { data: profileByEmail, error: emailError } = await supabase
            .from('user_profiles')
            .select('id, name, email, phone, role')
            .eq('email', user.email);

          console.log('Profile by email query:', { profileByEmail, emailError }); // Debug log

          if (profileByEmail && profileByEmail.length > 0) {
            // Profile exists with same email but different ID - update the ID
            console.log('Found profile by email, updating ID...');
            
            const { data: updatedProfile, error: updateError } = await supabase
              .from('user_profiles')
              .update({ 
                id: user.id,
                updated_at: new Date().toISOString()
              })
              .eq('email', user.email)
              .select('id, name, email, phone, role')
              .single();

            if (updateError) {
              console.error('Error updating profile ID:', updateError);
              setError(`Profile sync error: ${updateError.message}`);
            } else {
              setProfile(updatedProfile);
            }
          } else {
            // No profile exists at all - create a new one
            console.log('No profile found, creating new one...');
            
            const { data: newProfile, error: createError } = await supabase
              .from('user_profiles')
              .insert([
                {
                  id: user.id,
                  email: user.email || '',
                  name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                  phone: user.user_metadata?.phone || '',
                  role: 'renter',
                  is_active: true,
                  is_verified: false,
                  phone_verified: false,
                  onboarding_completed: false,
                  created_at: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                }
              ])
              .select('id, name, email, phone, role')
              .single();
  
            if (createError) {
              console.error('Error creating profile:', createError);
              
              // Handle specific duplicate email error
              if (createError.code === '23505' && createError.message.includes('unique_email')) {
                setError('A profile with this email already exists. Please contact support to resolve this issue.');
              } else {
                setError(`Failed to create profile: ${createError.message}`);
              }
            } else {
              setProfile(newProfile);
            }
          }
  
        } catch (err) {
          console.error('Unexpected error:', err);
          setError('An unexpected error occurred.');
        } finally {
          setLoading(false);
        }
      };
  
      fetchProfile();
    }, [navigate]);

    // Function to manually sync profile if there are issues
    const handleProfileSync = async () => {
      setError('');
      setLoading(true);

      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Check if there's a profile with this email but wrong ID
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('email', user.email);

        if (profiles && profiles.length > 0) {
          // Update the existing profile's ID to match current user
          const { data: syncedProfile, error: syncError } = await supabase
            .from('user_profiles')
            .update({ 
              id: user.id,
              updated_at: new Date().toISOString()
            })
            .eq('email', user.email)
            .select('id, name, email, phone, role')
            .single();

          if (syncError) {
            setError(`Sync failed: ${syncError.message}`);
          } else {
            setProfile(syncedProfile);
            setMessage('Profile synced successfully!');
          }
        }
      } catch (err) {
        setError('Sync failed. Please contact support.');
      } finally {
        setLoading(false);
      }
    };
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      if (!profile) return;
      setProfile({ ...profile, [e.target.name]: e.target.value });
    };
  
    const handleUpdate = async (e: React.FormEvent) => {
      e.preventDefault();
      setMessage('');
      setError('');
      
      if (!profile) return;
  
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setError('User not authenticated');
          return;
        }
  
        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({
            name: profile.name,
            phone: profile.phone,
            role: profile.role,
            updated_at: new Date().toISOString(),
          })
          .eq('id', user.id);
  
        if (updateError) {
          console.error('Update error:', updateError);
          setError('Update failed: ' + updateError.message);
        } else {
          setMessage('Profile updated successfully.');
          setEditing(false);
        }
      } catch (err) {
        console.error('Update error:', err);
        setError('An unexpected error occurred during update.');
      }
    };

    const handleSignOut = async () => {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) {
        console.error('Error signing out:', signOutError);
      } else {
        navigate('/signin');
      }
    };
  
    if (loading) {
      return (
        <div className="profile-container">
          <div className="loading-spinner">Loading profile...</div>
        </div>
      );
    }
    
    if (error) {
      return (
        <div className="profile-container">
          <div className="error-message">
            <h3>Profile Loading Error</h3>
            <p>{error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
            {error.includes('email already exists') && (
              <button onClick={handleProfileSync}>Sync Profile</button>
            )}
            <button onClick={handleSignOut}>Sign Out</button>
          </div>
        </div>
      );
    }
    
    if (!profile) {
      return (
        <div className="profile-container">
          <div className="error-message">
            <h3>Profile Not Found</h3>
            <p>Unable to load your profile. Please try syncing your profile data.</p>
            <button onClick={handleProfileSync}>Sync Profile</button>
            <button onClick={() => window.location.reload()}>Refresh</button>
            <button onClick={handleSignOut}>Sign Out</button>
          </div>
        </div>
      );
    }
  
    return (
      <div className="profile-container">
        <div className="profile-header">
          <h2>My Profile</h2>
          <button onClick={handleSignOut} className="sign-out-btn">Sign Out</button>
        </div>
  
        {editing ? (
          <form onSubmit={handleUpdate} className="profile-form">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={profile.name}
                onChange={handleChange}
                required
              />
            </div>
  
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={profile.email}
                disabled
                className="disabled-input"
                title="Email cannot be changed"
              />
              <small>Email cannot be modified</small>
            </div>
  
            <div className="form-group">
              <label htmlFor="phone">Phone</label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={profile.phone || ''}
                onChange={handleChange}
                placeholder="Enter your phone number"
              />
            </div>
  
            <div className="form-group">
              <label htmlFor="role">Role</label>
              <select id="role" name="role" value={profile.role} onChange={handleChange}>
                <option value="renter">Renter</option>
                <option value="landlord">Landlord</option>
              </select>
            </div>
  
            <div className="form-actions">
              <button type="submit" className="save-btn">Save Changes</button>
              <button type="button" onClick={() => setEditing(false)} className="cancel-btn">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="profile-display">
            <div className="profile-info">
              <div className="info-item">
                <strong>Name:</strong> {profile.name}
              </div>
              <div className="info-item">
                <strong>Email:</strong> {profile.email}
              </div>
              <div className="info-item">
                <strong>Phone:</strong> {profile.phone || 'Not provided'}
              </div>
              <div className="info-item">
                <strong>Role:</strong> {profile.role}
              </div>
            </div>
            <button onClick={() => setEditing(true)} className="edit-btn">
              Edit Profile
            </button>
          </div>
        )}
  
        {message && (
          <div className="success-message">
            {message}
          </div>
        )}
        
        {error && (
          <div className="error-message">
            {error}
          </div>
        )}
      </div>
    );
  }