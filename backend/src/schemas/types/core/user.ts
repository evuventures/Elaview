// 001_user_profiles.sql
// user profiles

// Add to your UserProfile:
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'renter' | 'landlord' | 'both';
  bio?: string;
  profile_image_url?: string;
  phone?: string;
  phone_verified: boolean;     
  city?: string;
  state?: string;
  country: string;             // (default 'US')
  company_name?: string;
  is_verified: boolean;        
  is_active: boolean;          
  verification_level: 'unverified' | 'email_verified' | 'phone_verified'; 
  total_listings: number;
  total_bookings: number;
  total_reviews: number;
  average_rating: number | null;
  created_at: string;
  updated_at: string;
}

export interface CreateUserProfileRequest {
  name: string;
  role: 'renter' | 'landlord' | 'both';
  bio?: string;
  phone?: string;
  city?: string;
  state?: string;
  company_name?: string;
}

export interface UpdateUserProfileRequest extends Partial<CreateUserProfileRequest> {}


export interface PublicUserProfile {
  id: string;
  name: string;
  role: 'renter' | 'landlord' | 'both';
  bio?: string;
  profile_image_url?: string;
  company_name?: string;
  city?: string;
  state?: string;
  is_verified: boolean;
  total_listings: number;
  total_reviews: number;
  average_rating: number | null;
  created_at: string;
}
