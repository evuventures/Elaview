import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/SupabaseClient';
import './styles/RenterDashboard.css';

// TypeScript Interfaces
interface DashboardStats {
  totalBookings: number;
  activeBookings: number;
  savedSpaces: number;
  pendingApprovals: number;
}

interface Booking {
  id: string;
  listing_id: string;
  renter_id: string;
  start_date: string;
  end_date: string;
  total_days: number;
  quoted_price: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed';
  created_at: string;
  responded_at?: string;
  // Listing details
  listing_title?: string;
  listing_location?: string;
  listing_image?: string;
  landlord_name?: string;
  // Content approval
  ad_design_status?: 'pending' | 'uploaded' | 'approved' | 'rejected';
}

interface SavedSpace {
  id: string;
  listing_id: string;
  saved_at: string;
  // Listing details
  title: string;
  location: string;
  price: number;
  image_url?: string;
  is_available: boolean;
}

interface MessageThread {
  id: string;
  listing_id: string;
  landlord_id: string;
  subject: string;
  last_message_text: string;
  last_message_at: string;
  unread_by_renter: number;
  // Listing details
  listing_title?: string;
  landlord_name?: string;
}

const RenterDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalBookings: 0,
    activeBookings: 0,
    savedSpaces: 0,
    pendingApprovals: 0
  });
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [savedSpaces, setSavedSpaces] = useState<SavedSpace[]>([]);
  const [messages, setMessages] = useState<MessageThread[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    console.log('🚀 Loading renter dashboard data...');
    setLoading(true);
    
    try {
      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        console.error('❌ Authentication error:', authError);
        navigate('/signin');
        return;
      }

      console.log('✅ User authenticated:', user.id);

      // Load all data concurrently
      await Promise.all([
        loadBookings(user.id),
        loadSavedSpaces(user.id),
        loadMessages(user.id),
        loadStats(user.id)
      ]);

    } catch (error) {
      console.error('❌ Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadBookings = async (userId: string) => {
    try {
      console.log('📋 Loading bookings for user:', userId);
      
      // Get bookings with listing details
      const { data: bookingsData, error } = await supabase
        .from('listing_inquiries')
        .select(`
          *,
          rental_listings (
            title,
            location,
            image_urls
          ),
          user_profiles!listing_inquiries_renter_id_fkey (
            name
          )
        `)
        .eq('renter_id', userId)
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.error('❌ Error loading bookings:', error);
        return;
      }

      console.log('✅ Bookings loaded:', bookingsData?.length || 0);

      // Transform data
      const transformedBookings: Booking[] = (bookingsData || []).map(booking => ({
        id: booking.id,
        listing_id: booking.listing_id,
        renter_id: booking.renter_id,
        start_date: booking.start_date,
        end_date: booking.end_date,
        total_days: booking.total_days,
        quoted_price: booking.quoted_price,
        status: booking.status,
        created_at: booking.created_at,
        responded_at: booking.responded_at,
        listing_title: booking.rental_listings?.title,
        listing_location: booking.rental_listings?.location,
        listing_image: booking.rental_listings?.image_urls?.[0],
        landlord_name: booking.user_profiles?.name,
        // Mock content approval status for now
        ad_design_status: booking.status === 'confirmed' ? 'pending' : 
                         booking.status === 'active' ? 'approved' : undefined
      }));

      setBookings(transformedBookings);
    } catch (error) {
      console.error('❌ Exception loading bookings:', error);
    }
  };

  const loadSavedSpaces = async (userId: string) => {
    try {
      console.log('⭐ Loading saved spaces for user:', userId);
      
      const { data: savedData, error } = await supabase
        .from('saved_listings')
        .select(`
          *,
          rental_listings (
            title,
            location,
            price,
            image_urls,
            status
          )
        `)
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) {
        console.error('❌ Error loading saved spaces:', error);
        return;
      }

      console.log('✅ Saved spaces loaded:', savedData?.length || 0);

      // Transform data
      const transformedSaved: SavedSpace[] = (savedData || []).map(saved => ({
        id: saved.id,
        listing_id: saved.listing_id,
        saved_at: saved.created_at,
        title: saved.rental_listings?.title || 'Untitled Space',
        location: saved.rental_listings?.location || 'Location TBD',
        price: saved.rental_listings?.price || 0,
        image_url: saved.rental_listings?.image_urls?.[0],
        is_available: saved.rental_listings?.status === 'active'
      }));

      setSavedSpaces(transformedSaved);
    } catch (error) {
      console.error('❌ Exception loading saved spaces:', error);
    }
  };

  const loadMessages = async (userId: string) => {
    try {
      console.log('💬 Loading messages for user:', userId);
      
      const { data: messagesData, error } = await supabase
        .from('conversations')
        .select(`
          *,
          rental_listings (
            title
          ),
          user_profiles!conversations_landlord_id_fkey (
            name
          )
        `)
        .eq('renter_id', userId)
        .order('last_message_at', { ascending: false })
        .limit(4);

      if (error) {
        console.error('❌ Error loading messages:', error);
        return;
      }

      console.log('✅ Messages loaded:', messagesData?.length || 0);

      // Transform data
      const transformedMessages: MessageThread[] = (messagesData || []).map(conversation => ({
        id: conversation.id,
        listing_id: conversation.listing_id,
        landlord_id: conversation.landlord_id,
        subject: conversation.subject || `Inquiry about ${conversation.rental_listings?.title}`,
        last_message_text: conversation.last_message_text || 'No messages yet',
        last_message_at: conversation.last_message_at,
        unread_by_renter: conversation.unread_by_renter || 0,
        listing_title: conversation.rental_listings?.title,
        landlord_name: conversation.user_profiles?.name
      }));

      setMessages(transformedMessages);
    } catch (error) {
      console.error('❌ Exception loading messages:', error);
    }
  };

  const loadStats = async (userId: string) => {
    try {
      console.log('📊 Calculating stats for user:', userId);
      
      // Calculate stats from loaded data
      const totalBookings = bookings.length;
      const activeBookings = bookings.filter(b => b.status === 'active' || b.status === 'confirmed').length;
      const savedSpacesCount = savedSpaces.length;
      const pendingApprovals = bookings.filter(b => b.ad_design_status === 'pending' || b.ad_design_status === 'uploaded').length;

      setStats({
        totalBookings,
        activeBookings,
        savedSpaces: savedSpacesCount,
        pendingApprovals
      });

      console.log('✅ Stats calculated:', { totalBookings, activeBookings, savedSpacesCount, pendingApprovals });
    } catch (error) {
      console.error('❌ Exception calculating stats:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#3b82f6';
      case 'active': return '#10b981';
      case 'completed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'confirmed': return '✅';
      case 'active': return '🟢';
      case 'completed': return '🏁';
      default: return '❓';
    }
  };

  const getApprovalStatusColor = (status?: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'uploaded': return '#3b82f6';
      case 'approved': return '#10b981';
      case 'rejected': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0
    }).format(price);
  };

  const handleViewAllBookings = () => {
    navigate('/bookings');
  };

  const handleViewAllSaved = () => {
    navigate('/saved');
  };

  const handleViewAllMessages = () => {
    navigate('/messaging');
  };

  const handleBookingClick = (bookingId: string) => {
    navigate(`/booking/${bookingId}`);
  };

  const handleSpaceClick = (listingId: string) => {
    navigate(`/listing/${listingId}`);
  };

  const handleMessageClick = (conversationId: string) => {
    navigate(`/messaging/${conversationId}`);
  };

  const handleBrowseSpaces = () => {
    navigate('/browse');
  };

  const handleUploadDesign = (bookingId: string) => {
    navigate(`/booking/${bookingId}/upload-design`);
  };

  if (loading) {
    return (
      <div className="renter-dashboard">
        <div className="dashboard-loading">
          <div className="loading-spinner"></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="renter-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <h1>Your Dashboard</h1>
        <p>Manage your bookings and discover new spaces</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📋</div>
          <div className="stat-content">
            <div className="stat-number">{stats.totalBookings}</div>
            <div className="stat-label">Total Bookings</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🟢</div>
          <div className="stat-content">
            <div className="stat-number">{stats.activeBookings}</div>
            <div className="stat-label">Active Bookings</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <div className="stat-number">{stats.savedSpaces}</div>
            <div className="stat-label">Saved Spaces</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🎨</div>
          <div className="stat-content">
            <div className="stat-number">{stats.pendingApprovals}</div>
            <div className="stat-label">Pending Approvals</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-content">
        
        {/* Current Bookings Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Your Bookings</h2>
            <button className="view-all-btn" onClick={handleViewAllBookings}>
              View All
            </button>
          </div>
          
          <div className="bookings-grid">
            {bookings.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <h3>No bookings yet</h3>
                <p>Start by browsing available spaces</p>
                <button className="browse-btn" onClick={handleBrowseSpaces}>
                  Browse Spaces
                </button>
              </div>
            ) : (
              bookings.map((booking) => (
                <div 
                  key={booking.id} 
                  className="booking-card"
                  onClick={() => handleBookingClick(booking.id)}
                >
                  <div className="booking-image">
                    {booking.listing_image ? (
                      <img src={booking.listing_image} alt={booking.listing_title} />
                    ) : (
                      <div className="placeholder-image">📷</div>
                    )}
                    <div 
                      className="booking-status"
                      style={{ backgroundColor: getStatusColor(booking.status) }}
                    >
                      {getStatusIcon(booking.status)} {booking.status}
                    </div>
                  </div>
                  
                  <div className="booking-content">
                    <h3>{booking.listing_title || 'Billboard Space'}</h3>
                    <p className="booking-location">📍 {booking.listing_location}</p>
                    
                    <div className="booking-details">
                      <div className="booking-dates">
                        <strong>{formatDate(booking.start_date)}</strong> - {formatDate(booking.end_date)}
                        <span className="booking-duration">({booking.total_days} days)</span>
                      </div>
                      <div className="booking-price">{formatPrice(booking.quoted_price)}</div>
                    </div>

                    {booking.landlord_name && (
                      <div className="booking-landlord">
                        Host: {booking.landlord_name}
                      </div>
                    )}

                    {/* Content Approval Status */}
                    {booking.ad_design_status && (
                      <div className="approval-status">
                        <span 
                          className="approval-badge"
                          style={{ backgroundColor: getApprovalStatusColor(booking.ad_design_status) }}
                        >
                          🎨 Design: {booking.ad_design_status}
                        </span>
                        {booking.ad_design_status === 'pending' && (
                          <button 
                            className="upload-design-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleUploadDesign(booking.id);
                            }}
                          >
                            Upload Design
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Saved Spaces Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Saved Spaces</h2>
            <button className="view-all-btn" onClick={handleViewAllSaved}>
              View All
            </button>
          </div>
          
          <div className="saved-spaces-grid">
            {savedSpaces.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">⭐</div>
                <h3>No saved spaces</h3>
                <p>Save spaces you're interested in for quick access</p>
                <button className="browse-btn" onClick={handleBrowseSpaces}>
                  Browse Spaces
                </button>
              </div>
            ) : (
              savedSpaces.map((space) => (
                <div 
                  key={space.id} 
                  className="saved-space-card"
                  onClick={() => handleSpaceClick(space.listing_id)}
                >
                  <div className="space-image">
                    {space.image_url ? (
                      <img src={space.image_url} alt={space.title} />
                    ) : (
                      <div className="placeholder-image">📷</div>
                    )}
                    <div className={`availability-badge ${space.is_available ? 'available' : 'unavailable'}`}>
                      {space.is_available ? '✅ Available' : '❌ Unavailable'}
                    </div>
                  </div>
                  
                  <div className="space-content">
                    <h3>{space.title}</h3>
                    <p className="space-location">📍 {space.location}</p>
                    <div className="space-price">{formatPrice(space.price)}/month</div>
                    <div className="saved-date">
                      Saved {formatDate(space.saved_at)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Messages Section */}
        <div className="dashboard-section">
          <div className="section-header">
            <h2>Recent Messages</h2>
            <button className="view-all-btn" onClick={handleViewAllMessages}>
              View All
            </button>
          </div>
          
          <div className="messages-list">
            {messages.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">💬</div>
                <h3>No messages yet</h3>
                <p>Messages with landlords will appear here</p>
              </div>
            ) : (
              messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`message-item ${message.unread_by_renter > 0 ? 'unread' : ''}`}
                  onClick={() => handleMessageClick(message.id)}
                >
                  <div className="message-avatar">
                    {message.landlord_name ? message.landlord_name.charAt(0).toUpperCase() : '?'}
                  </div>
                  
                  <div className="message-content">
                    <div className="message-header">
                      <h4>{message.subject}</h4>
                      <span className="message-time">{formatDate(message.last_message_at)}</span>
                    </div>
                    <p className="message-preview">{message.last_message_text}</p>
                    <div className="message-meta">
                      <span className="listing-name">{message.listing_title}</span>
                      {message.unread_by_renter > 0 && (
                        <span className="unread-count">{message.unread_by_renter} new</span>
                      )}
                    </div>
                  </div>

                  <div className="message-actions">
                    <button className="quick-reply-btn">
                      Reply
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default RenterDashboard;