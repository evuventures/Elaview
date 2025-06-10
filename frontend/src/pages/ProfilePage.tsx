import './styles/ProfilePage.css';
import { useEffect, useState } from 'react';
import Header from '../partials/Header';
import { supabase } from '../utils/SupabaseClient.js';
import { useNavigate, Link } from 'react-router-dom';

interface UserProfile {
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
    const navigate = useNavigate();
  
    useEffect(() => {
      const fetchProfile = async () => {
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();
  
        if (userError || !user) {
          navigate('/signin');
          return;
        }
  
        const { data, error } = await supabase
          .from('user_profiles')
          .select('name, email, phone, role')
          .eq('id', user.id)
          .single();
  
        if (error) {
          console.error('Error fetching profile:', error.message);
        } else {
          setProfile(data);
        }
  
        setLoading(false);
      };
  
      fetchProfile();
    }, [navigate]);
  
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      if (!profile) return;
      setProfile({ ...profile, [e.target.name]: e.target.value });
    };
  
    const handleUpdate = async (e: React.FormEvent) => {
      e.preventDefault();
      setMessage('');
      if (!profile) return;
  
      const {
        data: { user },
      } = await supabase.auth.getUser();
  
      const { error } = await supabase
        .from('user_profiles')
        .update({
          name: profile.name,
          phone: profile.phone,
          role: profile.role,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user?.id);
  
      if (error) {
        setMessage('Update failed: ' + error.message);
      } else {
        setMessage('Profile updated successfully.');
        setEditing(false);
      }
    };
  
    if (loading) return <div className="profile-container">Loading profile...</div>;
    if (!profile) return <div className="profile-container">Profile not found.</div>;
  
    return (
      <div className="profile-container">
        <h2>Profile</h2>
  
        {editing ? (
          <form onSubmit={handleUpdate} className="profile-form">
            <label>Name</label>
            <input
              type="text"
              name="name"
              value={profile.name}
              onChange={handleChange}
              required
            />
  
            <label>Phone</label>
            <input
              type="text"
              name="phone"
              value={profile.phone}
              onChange={handleChange}
            />
  
            <label>Role</label>
            <select name="role" value={profile.role} onChange={handleChange}>
              <option value="renter">Renter</option>
              <option value="landlord">Landlord</option>
            </select>
  
            <button type="submit">Save Changes</button>
            <button type="button" onClick={() => setEditing(false)}>
              Cancel
            </button>
          </form>
        ) : (
          <>
            <p><strong>Name:</strong> {profile.name}</p>
            <p><strong>Email:</strong> {profile.email}</p>
            <p><strong>Phone:</strong> {profile.phone || 'Not provided'}</p>
            <p><strong>Role:</strong> {profile.role}</p>
            <button onClick={() => setEditing(true)}>Edit Profile</button>
          </>
        )}
  
        {message && <p style={{ marginTop: '1rem', color: message.includes('successfully') ? 'green' : 'red' }}>{message}</p>}
      </div>
    );
  }