// Global user state management with cache invalidation
import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { supabase } from '../utils/SupabaseClient'

interface UserProfile {
  id: string;
  role: 'renter' | 'landlord' | 'admin';
  sub_role?: 'renter' | 'landlord' | null;
  onboarding_completed?: boolean;
  is_active: boolean;
}

interface UserStore {
  // State
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  profileLoading: boolean;
  
  // Actions
  setUser: (user: any | null) => void;
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setProfileLoading: (loading: boolean) => void;
  refreshProfile: () => Promise<void>;
  clearUserData: () => void;
  
  // Cache invalidation
  invalidateCache: () => void;
  notifyRoleChange: (newRole: string) => void;
}

export const useUserStore = create<UserStore>()(
  subscribeWithSelector((set, get) => ({
    // Initial state
    user: null,
    profile: null,
    loading: true,
    profileLoading: false,

    // Basic setters
    setUser: (user) => set({ user }),
    setProfile: (profile) => set({ profile }),
    setLoading: (loading) => set({ loading }),
    setProfileLoading: (profileLoading) => set({ profileLoading }),

    // Refresh profile from database
    refreshProfile: async () => {
      const { user } = get();
      if (!user) return;

      set({ profileLoading: true });
      
      try {
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('id, role, sub_role, onboarding_completed, is_active')
          .eq('id', user.id)
          .single();

        if (error) {
          console.error('❌ UserStore: Error fetching profile:', error);
          // Create fallback profile for development
          const fallbackProfile: UserProfile = {
            id: user.id,
            role: 'admin',
            sub_role: 'renter',
            onboarding_completed: true,
            is_active: true
          };
          set({ profile: fallbackProfile });
        } else {
          // Handle admin users without sub_role
          if (profile.role === 'admin' && !profile.sub_role) {
            const { error: updateError } = await supabase
              .from('user_profiles')
              .update({ 
                sub_role: 'renter',
                updated_at: new Date().toISOString() 
              })
              .eq('id', user.id);

            if (!updateError) {
              profile.sub_role = 'renter';
            }
          }
          
          set({ profile });
        }
      } catch (error) {
        console.error('❌ UserStore: Exception in refreshProfile:', error);
      } finally {
        set({ profileLoading: false });
      }
    },

    // Clear all user data
    clearUserData: () => {
      set({ 
        user: null, 
        profile: null, 
        loading: false, 
        profileLoading: false 
      });
    },

    // Cache invalidation function
    invalidateCache: () => {
      console.log('🔄 UserStore: Invalidating all caches');
      
      // Clear localStorage cache
      const keysToRemove = Object.keys(localStorage).filter(key => 
        key.includes('user') || 
        key.includes('profile') || 
        key.includes('listings') || 
        key.includes('messages') ||
        key.includes('dashboard') ||
        key.includes('cached_')
      );
      
      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🗑️ UserStore: Removed ${key} from localStorage`);
      });

      // Clear sessionStorage
      sessionStorage.clear();
      console.log('🗑️ UserStore: Cleared sessionStorage');

      // Broadcast cache invalidation event
      window.dispatchEvent(new CustomEvent('cache-invalidated', {
        detail: { timestamp: Date.now() }
      }));
    },

    // Notify all components of role change
    notifyRoleChange: (newRole: string) => {
      console.log(`🔄 UserStore: Broadcasting role change to ${newRole}`);
      
      // Invalidate cache first
      get().invalidateCache();
      
      // Broadcast role change event
      window.dispatchEvent(new CustomEvent('role-changed', {
        detail: { 
          newRole,
          timestamp: Date.now(),
          userId: get().user?.id
        }
      }));
      
      // Refresh profile to get latest data
      get().refreshProfile();
    }
  }))
);

// Helper function to get effective role
export const getEffectiveRole = (profile: UserProfile | null): string | null => {
  if (!profile) return null;
  
  // For admin users, use sub_role (default to renter if sub_role is null/undefined)
  if (profile.role === 'admin') {
    return profile.sub_role || 'renter';
  }
  
  // For normal users, use their actual role
  return profile.role;
};

// Subscribe to profile changes and notify components
useUserStore.subscribe(
  (state) => state.profile,
  (profile, previousProfile) => {
    if (profile && previousProfile) {
      const currentRole = getEffectiveRole(profile);
      const previousRole = getEffectiveRole(previousProfile);
      
      if (currentRole !== previousRole) {
        console.log(`🔄 UserStore: Role changed from ${previousRole} to ${currentRole}`);
        window.dispatchEvent(new CustomEvent('role-changed', {
          detail: { 
            newRole: currentRole,
            previousRole,
            timestamp: Date.now()
          }
        }));
      }
    }
  }
);