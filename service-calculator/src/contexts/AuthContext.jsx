import { createContext, useContext, useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { DEMO_USER } from '../data/mockData';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      // No Supabase — check if demo mode was saved
      const demoActive = localStorage.getItem('arc_demo_mode') === 'true';
      if (demoActive) {
        setUser(DEMO_USER);
        setIsDemoMode(true);
      }
      setLoading(false);
      return;
    }

    // Real Supabase auth
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password) => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: new Error('Database not configured. Use demo mode to explore the app.') };
    }
    const { data, error } = await supabase.auth.signUp({ email, password });
    return { data, error };
  };

  const signIn = async (email, password) => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: new Error('Database not configured. Use demo mode to explore the app.') };
    }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
  };

  const signOut = async () => {
    if (isDemoMode) {
      localStorage.removeItem('arc_demo_mode');
      setUser(null);
      setIsDemoMode(false);
      return { error: null };
    }
    if (!isSupabaseConfigured || !supabase) return { error: null };
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  // One-click demo login — no credentials needed
  const demoLogin = () => {
    localStorage.setItem('arc_demo_mode', 'true');
    setUser(DEMO_USER);
    setIsDemoMode(true);
  };

  const value = {
    user,
    loading,
    isDemoMode,
    isSupabaseConfigured,
    signUp,
    signIn,
    signOut,
    demoLogin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
