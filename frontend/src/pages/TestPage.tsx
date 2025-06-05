// frontend/src/pages/TestPage.tsx
import React, { useState, useEffect } from 'react';

// TypeScript interface for user data (matches your schema)
interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: 'landlord' | 'renter';
  bio?: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
  is_verified: boolean;
  is_active: boolean;
  phone_verified: boolean;
  verification_level: string;
  created_at: string;
  updated_at: string;
}

// API Response interface
interface ApiResponse {
  success: boolean;
  data: UserProfile[];
  count: number;
  message?: string;
}

const TestPage: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<string>('');

  // Test database connection first
  const testConnection = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/test/health', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(`Connection test failed: ${response.status}`);
      }

      setConnectionStatus(`✅ Database connected! Found ${data.userCount} users`);
      return true;
      
    } catch (err) {
      console.error('Connection test failed:', err);
      setConnectionStatus(`❌ Connection failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return false;
    }
  };

  // Fetch users from your backend API using TEST endpoint
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // First test the connection
      const connectionOk = await testConnection();
      if (!connectionOk) {
        setError('Database connection failed');
        return;
      }

      // Use the PUBLIC test endpoint (no auth required)
      const response = await fetch('http://localhost:4000/api/test/users', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status} ${response.statusText}`);
      }

      const apiResponse: ApiResponse = await response.json();
      
      if (apiResponse.success) {
        setUsers(apiResponse.data);
        console.log('✅ Successfully fetched users:', apiResponse);
      } else {
        throw new Error('API returned success: false');
      }
      
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Test individual user fetch using TEST endpoint
  const fetchSingleUser = async (userId: string) => {
    try {
      // Use the PUBLIC test endpoint for single user
      const response = await fetch(`http://localhost:4000/api/test/users/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`Failed to fetch user: ${response.status}`);
      }
      
      const result = await response.json();
      
      if (result.success) {
        console.log('Single user:', result.data);
        alert(`✅ Fetched user: ${result.data.name || result.data.email}`);
      } else {
        throw new Error(result.error || 'Failed to fetch user');
      }
      
    } catch (err) {
      console.error('Error fetching single user:', err);
      alert(`❌ Error fetching user: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  // Test simple ping
  const testPing = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/test/ping');
      const data = await response.json();
      
      if (data.success) {
        alert('🏓 Ping successful! Test routes are working.');
        console.log('Ping response:', data);
      }
    } catch (err) {
      alert('❌ Ping failed - check if backend is running');
      console.error('Ping error:', err);
    }
  };

  // Fetch data when component mounts
  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          🧪 Database Connection Test
        </h1>

        {/* Test Buttons */}
        <div className="mb-6 flex gap-3 flex-wrap">
          <button
            onClick={testPing}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            🏓 Test Ping
          </button>
          
          <button
            onClick={testConnection}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            🔗 Test DB Connection
          </button>
          
          <button
            onClick={fetchUsers}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            {loading ? 'Loading...' : '🔄 Refresh Data'}
          </button>
        </div>

        {/* Connection Status */}
        <div className="mb-6 p-4 rounded-md bg-gray-50">
          <h2 className="text-lg font-semibold mb-2">Connection Status:</h2>
          {connectionStatus && (
            <div className="mb-2">
              {connectionStatus}
            </div>
          )}
          {loading && (
            <div className="flex items-center text-blue-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Testing connection...
            </div>
          )}
          {error && (
            <div className="text-red-600">
              ❌ Error: {error}
            </div>
          )}
          {!loading && !error && users.length >= 0 && (
            <div className="text-green-600">
              ✅ Connected! Found {users.length} users
            </div>
          )}
        </div>

        {/* Users List */}
        {!loading && !error && users.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">Test Users:</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg">{user.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      user.role === 'landlord' 
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                  
                  <div className="space-y-1 text-sm text-gray-600">
                    <p>📧 {user.email}</p>
                    <p>📍 {user.city || 'No city'}, {user.state || 'No state'}</p>
                    <p>📞 {user.phone || 'No phone'}</p>
                    
                    <div className="flex gap-2 mt-2 flex-wrap">
                      {user.is_verified && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded">
                          ✅ Verified
                        </span>
                      )}
                      {user.phone_verified && (
                        <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                          📱 Phone OK
                        </span>
                      )}
                      {user.is_active && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                          🟢 Active
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-3">
                    <button
                      onClick={() => fetchSingleUser(user.id)}
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      Test Single Fetch →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && users.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No users found. Your database might be empty.</p>
            <div className="text-sm text-gray-400">
              <p>Make sure you've:</p>
              <ul className="list-disc list-inside mt-2">
                <li>Created the user_profiles table in Supabase</li>
                <li>Added some test data</li>
                <li>Set the correct RLS policies</li>
              </ul>
            </div>
          </div>
        )}

        {/* API Endpoints Testing */}
        <div className="mt-8 p-4 bg-gray-50 rounded-md">
          <h3 className="font-semibold mb-2">🔧 API Testing (Public Test Endpoints):</h3>
          <div className="text-sm space-y-1">
            <p><strong>GET</strong> /api/test/ping - Test if routes work</p>
            <p><strong>GET</strong> /api/test/health - Test database connection</p>
            <p><strong>GET</strong> /api/test/users - Fetch all users (NO AUTH)</p>
            <p><strong>GET</strong> /api/test/users/:id - Fetch single user (NO AUTH)</p>
            <p><strong>Backend URL:</strong> http://localhost:4000</p>
          </div>
          
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded">
            <p className="text-yellow-800 text-sm">
              <strong>Note:</strong> These are public test endpoints that bypass authentication. 
              The protected endpoints require JWT tokens.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestPage;