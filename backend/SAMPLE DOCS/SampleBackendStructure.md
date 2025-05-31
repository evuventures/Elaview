*THESE ARE NON-VERIFIED SAMPLES FOR REFERENCE AND DEVELOPMENT*
*NOT THE ACTUAL MODELS YET*
*-----------------------------------------------*


# Rental Marketplace API Setup Guide

## 📁 Project Structure
```
your-monorepo/
├── backend/
│   ├── types/
│   │   └── index.ts          # TypeScript interfaces
│   └── utils/
│       ├── supabase.ts       # Supabase client setup
│       ├── auth.ts           # Authentication middleware
│       ├── validation.ts     # Zod validation schemas
│       └── helpers.ts        # Utility functions
├── api/                      # Vercel API routes
│   ├── auth/
│   │   ├── signup.ts         # POST /api/auth/signup
│   │   └── login.ts          # POST /api/auth/login
│   ├── users/
│   │   └── me.ts             # GET/PATCH /api/users/me
│   ├── listings/
│   │   ├── index.ts          # GET/POST /api/listings
│   │   └── [id].ts           # GET/PATCH/DELETE /api/listings/:id
│   ├── favorites/
│   │   ├── index.ts          # GET/POST /api/favorites
│   │   └── [id].ts           # PATCH/DELETE /api/favorites/:id
│   └── messages/
│       ├── start.ts          # POST /api/messages/start
│       ├── threads.ts        # GET /api/messages/threads
│       └── thread/
│           └── [id].ts       # GET/POST /api/messages/thread/:id
└── frontend/                 # Your Vite frontend
```

## 🔧 Environment Variables

Create `.env.local` in your project root:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Optional: For development
NODE_ENV=development
```

## 📦 Dependencies

Install these packages:

```bash
npm install @supabase/supabase-js zod
npm install -D @types/node
```

## 🚀 API Endpoints Overview

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user

### User Management
- `GET /api/users/me` - Get current user profile
- `PATCH /api/users/me` - Update user profile

### Listings
- `GET /api/listings` - Browse/filter listings
- `POST /api/listings` - Create new listing (landlords only)
- `GET /api/listings/:id` - Get listing details
- `PATCH /api/listings/:id` - Update listing (owner only)
- `DELETE /api/listings/:id` - Archive listing (owner only)

### Favorites
- `GET /api/favorites` - Get user's saved listings
- `POST /api/favorites` - Save a listing
- `PATCH /api/favorites/:id` - Update saved listing
- `DELETE /api/favorites/:id` - Remove from favorites

### Messaging
- `POST /api/messages/start` - Start conversation
- `GET /api/messages/threads` - Get user's conversations
- `GET /api/messages/thread/:id` - Get messages in thread
- `POST /api/messages/thread/:id` - Send message

## 🔐 Authentication Flow

All API routes (except auth) require a Bearer token:

```typescript
// Frontend example
const token = supabase.auth.session()?.access_token;

fetch('/api/listings', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
```

## 📊 Query Parameters

### GET /api/listings
```
?page=1&limit=20
&city=New York&state=NY&type=wall
&price_min=50&price_max=200
&features=lit,high_traffic
&search=billboard
&latitude=40.7128&longitude=-74.0060&radius=10
&sort_by=price_per_day&sort_order=asc
```

### GET /api/favorites
```
?page=1&limit=20
&folder=business&priority=1
&include_archived=false
&sort_by=saved_at&sort_order=desc
```

### GET /api/messages/threads
```
?page=1&limit=20
&status=active&archived=false
&unread_only=true
```

## 🏗️ Database Functions

Add these to your Supabase SQL editor:

```sql
-- Function to increment view count
CREATE OR REPLACE FUNCTION increment_view_count(listing_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE rental_listings 
  SET view_count = view_count + 1 
  WHERE id = listing_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions
GRANT EXECUTE ON FUNCTION increment_view_count(UUID) TO authenticated;
```

## 🎯 User Flows Implementation

### 1. Landlord Creates Listing
```typescript
// 1. User authenticates
const { data: session } = await supabase.auth.signInWithPassword({
  email, password
});

// 2. Create listing
const response = await fetch('/api/listings', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: "Prime Wall Space - Times Square",
    type: "wall",
    price_per_day: 150,
    city: "New York",
    state: "NY",
    // ... other listing data
  })
});

// 3. Receive response
const { success, data } = await response.json();
// data contains the new listing with ID
```

### 2. Renter Searches Listings
```typescript
const searchParams = new URLSearchParams({
  city: 'NYC',
  type: 'car',
  price_max: '100',
  page: '1',
  limit: '20'
});

const response = await fetch(`/api/listings?${searchParams}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { data, pagination } = await response.json();
// data: array of filtered listings
// pagination: { page, limit, total, totalPages }
```

### 3. Renter Messages Landlord
```typescript
const response = await fetch('/api/messages/start', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    listing_id: 'listing-uuid',
    message: 'Hi, I\'m interested in renting this space for my campaign.',
    subject: 'Inquiry about Times Square Wall'
  })
});

const { data } = await response.json();
// data.conversation_id for future messages
```

### 4. Renter Saves Listing
```typescript
const response = await fetch('/api/favorites', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    listing_id: 'listing-uuid',
    folder_name: 'business',
    personal_notes: 'Perfect for Q4 campaign',
    priority_level: 2
  })
});
```

## 🔧 Frontend Integration Example

```typescript
// frontend/src/lib/api.ts
class ApiClient {
  private baseUrl = '/api';
  private token: string | null = null;

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...(this.token && { 'Authorization': `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    const response = await fetch(url, config);
    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error || 'API Error');
    }

    return data;
  }

  // Listings
  async getListings(params?: any) {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request(`/listings${query}`);
  }

  async createListing(listing: CreateListingRequest) {
    return this.request('/listings', {
      method: 'POST',
      body: JSON.stringify(listing),
    });
  }

  // Favorites
  async getFavorites() {
    return this.request('/favorites');
  }

  async saveListing(listingId: string, data?: any) {
    return this.request('/favorites', {
      method: 'POST',
      body: JSON.stringify({ listing_id: listingId, ...data }),
    });
  }

  // Messages
  async startConversation(listingId: string, message: string) {
    return this.request('/messages/start', {
      method: 'POST',
      body: JSON.stringify({ listing_id: listingId, message }),
    });
  }

  async getThreads() {
    return this.request('/messages/threads');
  }

  async getMessages(conversationId: string) {
    return this.request(`/messages/thread/${conversationId}`);
  }

  async sendMessage(conversationId: string, content: string) {
    return this.request(`/messages/thread/${conversationId}`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  }
}

export const apiClient = new ApiClient();
```

## 🚀 Deployment to Vercel

1. Connect your GitHub repo to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy! The API routes will be automatically available at your domain

## 🔒 Security Features

- **Row Level Security** on all database tables
- **JWT Authentication** with Supabase
- **Input validation** with Zod schemas
- **Rate limiting** (implement with Vercel Edge Config if needed)
- **CORS protection** built into Vercel API routes

## 📈 Performance Optimizations

- **Database indexes** on all query columns
- **Pagination** on all list endpoints
- **Efficient joins** with Supabase views
- **Caching headers** (add `Cache-Control` as needed)

This setup gives you a production-ready, type-safe API that scales with your rental marketplace!