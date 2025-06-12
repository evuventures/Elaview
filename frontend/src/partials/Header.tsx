import './styles/Header.css';
import logo from '../assets/logo.png' // replace logo with actual logo later
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { supabase } from '../utils/SupabaseClient.js';
import type { User } from '@supabase/supabase-js';

function Header() {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Fetch current user on mount
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    // Optional: Listen to auth state changes
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // Cleanup listener on unmount
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

    return (
      <header className="navbar">
        
          <Link to="/">
            <img src={logo} className="logo" alt="Elaview Logo" />
          </Link>
            
          
        
        <nav className="nav-links">
          {/* <a href="/" className="nav-button">Home</a> */}
          <Link to="/browse" className="nav-button">Browse Spaces</Link>
          <Link to="/list" className="nav-button">List Your Space</Link>
          {user && <Link to="/messaging" className="nav-button">Messages</Link>}
          {user && <Link to="/profile" className="nav-button">Profile</Link>}
          {!user && <Link to="/signin" className="nav-button">Sign In</Link>}
        </nav>
      </header>
    );
}

export default Header;