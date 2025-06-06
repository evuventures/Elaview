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
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#f8fafc',
      color: '#1e293b',
      fontFamily: 'system-ui, -apple-system, sans-serif',
      padding: '2rem 1rem'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        padding: '2rem',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{
          textAlign: 'center',
          marginBottom: '2rem',
          paddingBottom: '1.5rem',
          borderBottom: '2px solid #e2e8f0'
        }}>
          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: '700',
            color: '#0f172a',
            margin: '0 0 0.5rem 0',
            background: 'linear-gradient(135deg, #059669, #0891b2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            🧪 Database Connection Test
          </h1>
          <p style={{
            color: '#64748b',
            fontSize: '1.1rem',
            margin: 0
          }}>
            Test your backend API and database connectivity
          </p>
        </div>

        {/* Test Buttons */}
        <div style={{
          marginBottom: '2rem',
          display: 'flex',
          gap: '0.75rem',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          <button
            onClick={testPing}
            style={{
              backgroundColor: '#10b981',
              color: '#ffffff',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '500',
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
              outline: 'none'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#059669'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#10b981'}
          >
            🏓 Test Ping
          </button>
          
          <button
            onClick={testConnection}
            style={{
              backgroundColor: '#8b5cf6',
              color: '#ffffff',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '500',
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
              outline: 'none'
            }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#7c3aed'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#8b5cf6'}
          >
            🔗 Test DB Connection
          </button>
          
          <button
            onClick={fetchUsers}
            disabled={loading}
            style={{
              backgroundColor: loading ? '#93c5fd' : '#3b82f6',
              color: '#ffffff',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '500',
              fontSize: '0.875rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'background-color 0.15s ease',
              outline: 'none'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#2563eb';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.backgroundColor = '#3b82f6';
              }
            }}
          >
            {loading ? 'Loading...' : '🔄 Refresh Data'}
          </button>
        </div>

        {/* Connection Status */}
        <div style={{
          marginBottom: '2rem',
          padding: '1.5rem',
          borderRadius: '12px',
          backgroundColor: '#f1f5f9',
          border: '1px solid #cbd5e1'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            marginBottom: '1rem',
            color: '#334155'
          }}>
            Connection Status
          </h2>
          
          {connectionStatus && (
            <div style={{
              marginBottom: '0.75rem',
              padding: '0.75rem',
              borderRadius: '8px',
              backgroundColor: connectionStatus.includes('✅') ? '#dcfce7' : '#fef2f2',
              border: `1px solid ${connectionStatus.includes('✅') ? '#bbf7d0' : '#fecaca'}`,
              color: connectionStatus.includes('✅') ? '#166534' : '#dc2626',
              fontWeight: '500'
            }}>
              {connectionStatus}
            </div>
          )}
          
          {loading && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              color: '#3b82f6',
              fontWeight: '500'
            }}>
              <div style={{
                width: '1rem',
                height: '1rem',
                border: '2px solid #3b82f6',
                borderTopColor: 'transparent',
                borderRadius: '50%',
                marginRight: '0.5rem',
                animation: 'spin 1s linear infinite'
              }}></div>
              Testing connection...
            </div>
          )}
          
          {error && (
            <div style={{
              padding: '0.75rem',
              borderRadius: '8px',
              backgroundColor: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              fontWeight: '500'
            }}>
              ❌ Error: {error}
            </div>
          )}
          
          {!loading && !error && users.length >= 0 && (
            <div style={{
              padding: '0.75rem',
              borderRadius: '8px',
              backgroundColor: '#dcfce7',
              border: '1px solid #bbf7d0',
              color: '#166534',
              fontWeight: '500'
            }}>
              ✅ Connected! Found {users.length} users
            </div>
          )}
        </div>

        {/* Users List */}
        {!loading && !error && users.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h2 style={{
              fontSize: '1.5rem',
              fontWeight: '600',
              marginBottom: '1.5rem',
              color: '#334155',
              borderBottom: '2px solid #e2e8f0',
              paddingBottom: '0.5rem'
            }}>
              Test Users
            </h2>
            <div style={{
              display: 'grid',
              gap: '1rem',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))'
            }}>
              {users.map((user) => (
                <div
                  key={user.id}
                  style={{
                    border: '1px solid #e2e8f0',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    backgroundColor: '#ffffff',
                    transition: 'box-shadow 0.15s ease',
                    cursor: 'default'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                    marginBottom: '1rem'
                  }}>
                    <h3 style={{
                      fontWeight: '600',
                      fontSize: '1.125rem',
                      color: '#334155',
                      margin: 0
                    }}>
                      {user.name}
                    </h3>
                    <span style={{
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.75rem',
                      fontWeight: '500',
                      backgroundColor: user.role === 'landlord' ? '#dbeafe' : '#dcfce7',
                      color: user.role === 'landlord' ? '#1e40af' : '#166534'
                    }}>
                      {user.role}
                    </span>
                  </div>
                  
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.5rem',
                    fontSize: '0.875rem',
                    color: '#64748b',
                    marginBottom: '1rem'
                  }}>
                    <div>📧 {user.email}</div>
                    <div>📍 {user.city || 'No city'}, {user.state || 'No state'}</div>
                    <div>📞 {user.phone || 'No phone'}</div>
                  </div>
                    
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    flexWrap: 'wrap',
                    marginBottom: '1rem'
                  }}>
                    {user.is_verified && (
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#dcfce7',
                        color: '#166534',
                        fontSize: '0.75rem',
                        borderRadius: '6px',
                        fontWeight: '500'
                      }}>
                        ✅ Verified
                      </span>
                    )}
                    {user.phone_verified && (
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#dbeafe',
                        color: '#1e40af',
                        fontSize: '0.75rem',
                        borderRadius: '6px',
                        fontWeight: '500'
                      }}>
                        📱 Phone OK
                      </span>
                    )}
                    {user.is_active && (
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        backgroundColor: '#f3e8ff',
                        color: '#7c3aed',
                        fontSize: '0.75rem',
                        borderRadius: '6px',
                        fontWeight: '500'
                      }}>
                        🟢 Active
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => fetchSingleUser(user.id)}
                    style={{
                      color: '#3b82f6',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      border: 'none',
                      backgroundColor: 'transparent',
                      cursor: 'pointer',
                      padding: '0.25rem 0',
                      outline: 'none',
                      transition: 'color 0.15s ease'
                    }}
                    onMouseEnter={(e) => e.target.style.color = '#1d4ed8'}
                    onMouseLeave={(e) => e.target.style.color = '#3b82f6'}
                  >
                    Test Single Fetch →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && users.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '3rem 1rem',
            backgroundColor: '#f8fafc',
            borderRadius: '12px',
            border: '1px solid #e2e8f0',
            marginBottom: '2rem'
          }}>
            <div style={{
              fontSize: '3rem',
              marginBottom: '1rem'
            }}>
              📊
            </div>
            <p style={{
              color: '#64748b',
              marginBottom: '1rem',
              fontSize: '1.125rem'
            }}>
              No users found. Your database might be empty.
            </p>
            <div style={{
              fontSize: '0.875rem',
              color: '#94a3b8'
            }}>
              <p style={{ marginBottom: '0.75rem' }}>Make sure you've:</p>
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
                alignItems: 'center'
              }}>
                <div>• Created the user_profiles table in Supabase</div>
                <div>• Added some test data</div>
                <div>• Set the correct RLS policies</div>
              </div>
            </div>
          </div>
        )}

        {/* API Endpoints Testing */}
        <div style={{
          padding: '1.5rem',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{
            fontWeight: '600',
            marginBottom: '1rem',
            color: '#334155',
            fontSize: '1.125rem'
          }}>
            🔧 API Testing (Public Test Endpoints)
          </h3>
          <div style={{
            fontSize: '0.875rem',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
            color: '#475569',
            marginBottom: '1rem'
          }}>
            <div>
              <strong style={{ color: '#059669' }}>GET</strong> /api/test/ping - Test if routes work
            </div>
            <div>
              <strong style={{ color: '#059669' }}>GET</strong> /api/test/health - Test database connection
            </div>
            <div>
              <strong style={{ color: '#3b82f6' }}>GET</strong> /api/test/users - Fetch all users (NO AUTH)
            </div>
            <div>
              <strong style={{ color: '#3b82f6' }}>GET</strong> /api/test/users/:id - Fetch single user (NO AUTH)
            </div>
            <div>
              <strong>Backend URL:</strong> http://localhost:4000
            </div>
          </div>
          
          <div style={{
            padding: '1rem',
            backgroundColor: '#fef3c7',
            border: '1px solid #fcd34d',
            borderRadius: '8px',
            color: '#92400e',
            fontSize: '0.875rem'
          }}>
            <strong>Note:</strong> These are public test endpoints that bypass authentication. 
            The protected endpoints require JWT tokens.
          </div>
        </div>

        {/* Inline CSS for animation */}
        <style>
          {`
            @keyframes spin {
              from {
                transform: rotate(0deg);
              }
              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>
      </div>
    </div>
  );
};

export default TestPage;