// frontend/src/hooks/useSupabase.ts
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { User } from '@supabase/supabase-js';

// Example hook to fetch data from Supabase
export function useSupabaseFetch<T>(
  tableName: string,
  query?: {
    column?: string;
    value?: any;
    limit?: number;
  }
) {
  const [data, setData] = useState<T[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        let queryBuilder = supabase.from(tableName).select('*');

        // Apply filters if provided
        if (query?.column && query?.value !== undefined) {
          queryBuilder = queryBuilder.eq(query.column, query.value);
        }

        // Apply limit if provided
        if (query?.limit) {
          queryBuilder = queryBuilder.limit(query.limit);
        }

        const { data, error } = await queryBuilder;

        if (error) throw error;

        setData(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [tableName, query?.column, query?.value, query?.limit]);

  return { data, loading, error };
}

// Example hook for authentication
export function useSupabaseAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authError, setAuthError] = useState<Error | null>(null);

  useEffect(() => {
    // Set initial user
    setAuthLoading(true);
    supabase.auth.getUser().then(({ data: { user }, error }) => {
      if (error) setAuthError(new Error(error.message));
      else setUser(user);
      setAuthLoading(false);
    });

    // Listen for auth changes
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    // Clean up subscription
    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (err) {
      setAuthError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
    } catch (err) {
      setAuthError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (err) {
      setAuthError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    }
  };

  return {
    user,
    authLoading,
    authError,
    signIn,
    signUp,
    signOut
  };
}