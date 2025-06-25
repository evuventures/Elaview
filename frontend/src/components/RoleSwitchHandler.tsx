// Enhanced Role Switch Handler with proper cache invalidation
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/SupabaseClient';
import { useUserStore } from '../hooks/useUserStore';

interface RoleSwitchHandlerProps {
  targetRole: 'renter' | 'landlord';
}

export const RoleSwitchHandler: React.FC<RoleSwitchHandlerProps> = ({ targetRole }) => {
  const navigate = useNavigate();
  const { user, refreshProfile, invalidateCache, notifyRoleChange } = useUserStore();
  const [switching, setSwitching] = useState(false);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState<string>('Initializing...');

  useEffect(() => {
    const handleRoleSwitch = async () => {
      setSwitching(true);
      setError('');
      
      try {
        setProgress('Verifying authentication...');
        
        if (!user) {
          setError('User not authenticated');
          return;
        }

        setProgress('Loading current profile...');
        
        // Get current user profile to determine if admin
        const { data: currentProfile, error: profileError } = await supabase
          .from('user_profiles')
          .select('role, sub_role')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error('Profile fetch error:', profileError);
          setError('Failed to load user profile');
          return;
        }

        setProgress(`Switching to ${targetRole} mode...`);

        let updateData: any = {
          updated_at: new Date().toISOString()
        };

        if (currentProfile.role === 'admin') {
          // Admin users: update sub_role
          updateData.sub_role = targetRole;
          console.log(`Admin switching sub_role to: ${targetRole}`);
        } else {
          // Regular users: update main role
          updateData.role = targetRole;
          console.log(`Regular user switching role to: ${targetRole}`);
        }

        const { error: updateError } = await supabase
          .from('user_profiles')
          .update(updateData)
          .eq('id', user.id);

        if (updateError) {
          console.error('Update error:', updateError);
          setError(`Failed to switch role: ${updateError.message}`);
          return;
        }

        setProgress('Clearing cached data...');
        
        // CRITICAL: Invalidate all caches and notify components
        invalidateCache();
        
        setProgress('Refreshing user profile...');
        
        // Refresh the profile to get latest data
        await refreshProfile();
        
        setProgress('Notifying components of role change...');
        
        // Notify all components of the role change
        notifyRoleChange(targetRole);
        
        setProgress('Redirecting to dashboard...');
        
        // Small delay to ensure all components have updated
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Navigate without full page reload
        const dashboardPath = targetRole === 'landlord' ? '/landlord-dashboard' : '/renter-dashboard';
        navigate(dashboardPath, { replace: true });

      } catch (error) {
        console.error('Error switching role:', error);
        setError('An unexpected error occurred during role switch');
      } finally {
        setSwitching(false);
      }
    };

    handleRoleSwitch();
  }, [targetRole, user, navigate, refreshProfile, invalidateCache, notifyRoleChange]);

  if (error) {
    return (
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center',
        maxWidth: '500px',
        margin: '0 auto',
        backgroundColor: '#fee',
        borderRadius: '8px',
        border: '1px solid #fcc'
      }}>
        <h2 style={{ color: '#d32f2f', marginBottom: '1rem' }}>Role Switch Failed</h2>
        <p style={{ color: '#d32f2f', marginBottom: '1.5rem', fontSize: '1.1em' }}>
          {error}
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <button 
            onClick={() => window.history.back()}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            ← Go Back
          </button>
          <button 
            onClick={() => window.location.reload()}
            style={{
              padding: '0.75rem 1.5rem',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '2rem', 
      textAlign: 'center',
      maxWidth: '500px',
      margin: '0 auto'
    }}>
      <h2 style={{ marginBottom: '1rem', color: '#333' }}>
        Switching to {targetRole === 'landlord' ? 'Landlord' : 'Advertiser'} Mode
      </h2>
      
      {switching && (
        <div style={{ marginBottom: '2rem' }}>
          <div style={{ 
            display: 'inline-block',
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #007bff',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            marginBottom: '1rem'
          }} />
          
          <p style={{ 
            fontSize: '1.1em', 
            color: '#666',
            marginBottom: '0.5rem'
          }}>
            {progress}
          </p>
          
          <div style={{
            width: '100%',
            height: '4px',
            backgroundColor: '#e9ecef',
            borderRadius: '2px',
            overflow: 'hidden',
            margin: '1rem 0'
          }}>
            <div style={{
              height: '100%',
              backgroundColor: '#007bff',
              borderRadius: '2px',
              animation: 'progress 2s ease-in-out infinite'
            }} />
          </div>
          
          <p style={{ 
            fontSize: '0.9em', 
            color: '#999',
            fontStyle: 'italic'
          }}>
            Please don't close this page during the switch...
          </p>
        </div>
      )}
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes progress {
            0% { width: 0%; }
            50% { width: 70%; }
            100% { width: 100%; }
          }
        `}
      </style>
    </div>
  );
};

export default RoleSwitchHandler;