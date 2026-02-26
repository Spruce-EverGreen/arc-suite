import { createContext, useContext, useState, useEffect } from 'react';
import { supabase, signIn, signUp, signOut, getCurrentUser, getBusinessProfile, createBusinessProfile } from '../lib/supabase';
import { DEMO_USER, DEMO_BUSINESS } from '../data/mockData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    let isMounted = true;
    
    const initAuth = async () => {
      try {
        // Simple session check without locks
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        if (session?.user) {
          setUser(session.user);
          // Fetch business profile
          const { data: businessData } = await supabase
            .from('business_profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
          
          if (isMounted && businessData) {
            setBusiness(businessData);
          }
        }
      } catch (error) {
        console.error('Auth init error:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Timeout fallback
    const timeout = setTimeout(() => {
      if (isMounted) setLoading(false);
    }, 3000);

    initAuth().finally(() => clearTimeout(timeout));

    // Simple auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return;
      
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        setIsDemo(false);
        // Fetch business in background
        supabase
          .from('business_profiles')
          .select('*')
          .eq('user_id', session.user.id)
          .single()
          .then(({ data }) => {
            if (isMounted && data) setBusiness(data);
          });
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setBusiness(null);
        setIsDemo(false);
      }
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  // Demo login (mock data, no Supabase)
  const demoLogin = () => {
    setUser(DEMO_USER);
    setBusiness(DEMO_BUSINESS);
    setIsDemo(true);
    setLoading(false);
    return true;
  };

  // Real login with Supabase
  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data, error } = await signIn(email, password);
      if (error) throw error;
      
      if (data.user) {
        setUser(data.user);
        const { data: businessData } = await getBusinessProfile(data.user.id);
        if (businessData) {
          setBusiness(businessData);
        }
        setIsDemo(false);
      }
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Real signup with Supabase
  const register = async (email, password, businessName) => {
    setLoading(true);
    try {
      const { data, error } = await signUp(email, password);
      if (error) throw error;

      if (data.user) {
        // Check if business profile already exists
        const { data: existingBusiness } = await getBusinessProfile(data.user.id);
        
        if (existingBusiness) {
          setUser(data.user);
          setBusiness(existingBusiness);
        } else {
          // Create business profile for new user
          const { data: businessData, error: businessError } = await createBusinessProfile({
            user_id: data.user.id,
            business_name: businessName,
            contact_email: email,
          });

          if (businessError) throw businessError;

          setUser(data.user);
          setBusiness(businessData);
        }
        setIsDemo(false);
      }
      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    if (isDemo) {
      setUser(null);
      setBusiness(null);
      setIsDemo(false);
      return;
    }

    await signOut();
    setUser(null);
    setBusiness(null);
    setIsDemo(false);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      business, 
      isDemo, 
      loading,
      demoLogin, 
      login,
      register,
      logout, 
      setBusiness 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
