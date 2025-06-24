// Hook for components to listen to role changes and refresh their data
import { useEffect, useCallback } from 'react';

interface RoleChangeListenerOptions {
  onRoleChange?: (newRole: string, previousRole?: string) => void;
  onCacheInvalidated?: () => void;
  refreshData?: () => void | Promise<void>;
  componentName?: string; // For debugging
}

export const useRoleChangeListener = (options: RoleChangeListenerOptions = {}) => {
  const {
    onRoleChange,
    onCacheInvalidated,
    refreshData,
    componentName = 'Unknown'
  } = options;

  // Memoized refresh function
  const handleRefresh = useCallback(async () => {
    if (refreshData) {
      console.log(`🔄 ${componentName}: Refreshing data due to role change`);
      try {
        await refreshData();
        console.log(`✅ ${componentName}: Data refresh completed`);
      } catch (error) {
        console.error(`❌ ${componentName}: Data refresh failed:`, error);
      }
    }
  }, [refreshData, componentName]);

  // Listen for role change events
  useEffect(() => {
    const handleRoleChange = async (event: Event) => {
      const customEvent = event as CustomEvent;
      const { newRole, previousRole } = customEvent.detail;
      console.log(`🔄 ${componentName}: Role change detected - ${previousRole} → ${newRole}`);
      
      // Call custom role change handler if provided
      if (onRoleChange) {
        onRoleChange(newRole, previousRole);
      }
      
      // Refresh data if function provided
      await handleRefresh();
    };

    const handleCacheInvalidated = async (event: Event) => {
      const customEvent = event as CustomEvent;
      const { timestamp } = customEvent.detail;
      console.log(`🗑️ ${componentName}: Cache invalidation detected at ${new Date(timestamp).toISOString()}`);
      
      // Call custom cache invalidation handler if provided
      if (onCacheInvalidated) {
        onCacheInvalidated();
      }
      
      // Refresh data if function provided
      await handleRefresh();
    };

    // Add event listeners
    window.addEventListener('role-changed', handleRoleChange);
    window.addEventListener('cache-invalidated', handleCacheInvalidated);

    return () => {
      window.removeEventListener('role-changed', handleRoleChange);
      window.removeEventListener('cache-invalidated', handleCacheInvalidated);
    };
  }, [componentName, onRoleChange, onCacheInvalidated, handleRefresh]);

  // Return helper functions that components can use
  return {
    // Force refresh data manually
    refreshData: handleRefresh,
    
    // Check if component should invalidate its cache
    shouldInvalidateCache: useCallback(() => {
      // Components can use this to check if they should clear their local cache
      const lastInvalidation = localStorage.getItem('last_cache_invalidation');
      const componentLastUpdate = localStorage.getItem(`${componentName}_last_update`);
      
      if (!lastInvalidation || !componentLastUpdate) {
        return true;
      }
      
      return new Date(lastInvalidation) > new Date(componentLastUpdate);
    }, [componentName]),
    
    // Mark component as updated
    markAsUpdated: useCallback(() => {
      localStorage.setItem(`${componentName}_last_update`, new Date().toISOString());
    }, [componentName])
  };
};