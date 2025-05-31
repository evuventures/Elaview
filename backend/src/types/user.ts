export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'renter' | 'landlord' | 'both';
  bio?: string;
  profile_image_url?: string;
  phone?: string;
  city?: string;
  state?: string;
  company_name?: string;
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

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
