import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from './supabase.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load profile from public.profiles table
  const fetchProfile = async (userId) => {
    if (!userId || !isSupabaseConfigured) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.warn('Error fetching profile:', error);
        return;
      }

      if (data) {
        setProfile(data);
        setIsAdmin(Boolean(data.is_admin));
      } else {
        // If profile row doesn't exist yet, fallback to non-admin
        setProfile(null);
        setIsAdmin(false);
      }
    } catch (err) {
      console.error('fetchProfile unexpected error:', err);
    }
  };

  useEffect(() => {
    let mounted = true;

    if (!isSupabaseConfigured) {
      // Demo / preview mode support when Supabase credentials are not yet set
      const demoAuthRaw = localStorage.getItem('mrsoth_demo_auth');
      if (demoAuthRaw) {
        try {
          const parsed = JSON.parse(demoAuthRaw);
          if (parsed && parsed.is_admin) {
            setUser({ id: 'admin-1', email: parsed.email || 'admin@mrsoth.dev' });
            setProfile(parsed);
            setIsAdmin(true);
          }
        } catch (e) {
          console.warn('Could not parse demo auth:', e);
        }
      }
      setLoading(false);
      return;
    }

    // Supabase Auth listener
    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!mounted) return;

        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          setIsAdmin(false);
        }
      } catch (err) {
        console.error('Session check error:', err);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!mounted) return;
      if (session?.user) {
        setUser(session.user);
        await fetchProfile(session.user.id);
      } else {
        setUser(null);
        setProfile(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, []);

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured) {
      // Mock sign-in for preview testing
      const mockProfile = {
        id: 'admin-1',
        email,
        full_name: 'Mr. Soth',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
        bio: 'Tech blog author & software engineer',
        is_admin: true,
        created_at: new Date().toISOString()
      };
      localStorage.setItem('mrsoth_demo_auth', JSON.stringify(mockProfile));
      setUser({ id: 'admin-1', email });
      setProfile(mockProfile);
      setIsAdmin(true);
      return { user: { id: 'admin-1', email }, error: null };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    if (data?.user) {
      await fetchProfile(data.user.id);
    }
    return data;
  };

  const signUp = async (email, password, fullName = '') => {
    if (!isSupabaseConfigured) {
      const mockProfile = {
        id: `user-${Date.now()}`,
        email,
        full_name: fullName || 'New User',
        avatar_url: '',
        bio: '',
        is_admin: false,
        created_at: new Date().toISOString()
      };
      setUser({ id: mockProfile.id, email });
      setProfile(mockProfile);
      setIsAdmin(false);
      return { user: { id: mockProfile.id, email }, error: null };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    if (!isSupabaseConfigured) {
      localStorage.removeItem('mrsoth_demo_auth');
      setUser(null);
      setProfile(null);
      setIsAdmin(false);
      return;
    }

    const { error } = await supabase.auth.signOut();
    if (error) console.error('SignOut error:', error);
    setUser(null);
    setProfile(null);
    setIsAdmin(false);
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAdmin,
        loading,
        isConfigured: isSupabaseConfigured,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
