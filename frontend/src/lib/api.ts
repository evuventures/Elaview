const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export class UserAPI {
  private static getAuthHeaders() {
    const token = localStorage.getItem('auth_token');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  // Authentication
  static async signup(data: {
    email: string;
    password: string;
    name: string;
    role: 'renter' | 'landlord';
  }) {
    const response = await fetch(`${API_BASE_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  }

  static async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const result = await response.json();
    
    // Store token if login successful
    if (result.success && result.data.session?.access_token) {
      localStorage.setItem('auth_token', result.data.session.access_token);
    }
    
    return result;
  }

  static async logout() {
    const response = await fetch(`${API_BASE_URL}/auth/logout`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    
    // Clear stored token
    localStorage.removeItem('auth_token');
    
    return response.json();
  }

  // User Profile
  static async getMyProfile() {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }

  static async createProfile(data: {
    name: string;
    role: 'renter' | 'landlord';
    phone?: string;
    company_name?: string;
    bio?: string;
    city?: string;
    state?: string;
  }) {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  }

  static async updateProfile(data: any) {
    const response = await fetch(`${API_BASE_URL}/users/me`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return response.json();
  }

  static async getPublicProfile(userId: string) {
    const response = await fetch(`${API_BASE_URL}/users/${userId}`, {
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }

  static async searchUsers(params: {
    search?: string;
    role?: string;
    city?: string;
    state?: string;
    verified_only?: boolean;
    page?: number;
    limit?: number;
  } = {}) {
    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString();
    
    const response = await fetch(`${API_BASE_URL}/users/search?${queryString}`, {
      headers: this.getAuthHeaders(),
    });
    return response.json();
  }

  static async uploadProfileImage(imageUrl: string) {
    const response = await fetch(`${API_BASE_URL}/users/upload-image`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ image_url: imageUrl }),
    });
    return response.json();
  }
}