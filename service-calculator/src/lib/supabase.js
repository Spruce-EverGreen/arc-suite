import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Custom storage that doesn't use locks
const customStorage = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch {
      // ignore
    }
  },
  removeItem: (key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: customStorage,
    storageKey: 'arc-auth',
    autoRefreshToken: false,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// Auth helpers
export const signUp = async (email, password) => {
  const { data, error } = await supabase.auth.signUp({ email, password });
  return { data, error };
};

export const signIn = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  return { error };
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();
  return user;
};

// Business profile helpers
export const getBusinessProfile = async (userId) => {
  const { data, error } = await supabase
    .from('business_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  return { data, error };
};

export const createBusinessProfile = async (profile) => {
  const { data, error } = await supabase
    .from('business_profiles')
    .insert(profile)
    .select()
    .single();
  return { data, error };
};

export const updateBusinessProfile = async (id, updates) => {
  const { data, error } = await supabase
    .from('business_profiles')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

// Services helpers
export const getServices = async (businessId) => {
  const { data, error } = await supabase
    .from('services')
    .select('*, add_ons(*)')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const getActiveServices = async (businessId) => {
  const { data, error } = await supabase
    .from('services')
    .select('*, add_ons(*)')
    .eq('business_id', businessId)
    .eq('is_active', true)
    .order('name');
  return { data, error };
};

export const createService = async (service) => {
  const { data, error } = await supabase
    .from('services')
    .insert(service)
    .select()
    .single();
  return { data, error };
};

export const updateService = async (id, updates) => {
  const { data, error } = await supabase
    .from('services')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

export const deleteService = async (id) => {
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', id);
  return { error };
};

// Add-ons helpers
export const createAddOn = async (addOn) => {
  const { data, error } = await supabase
    .from('add_ons')
    .insert(addOn)
    .select()
    .single();
  return { data, error };
};

export const updateAddOn = async (id, updates) => {
  const { data, error } = await supabase
    .from('add_ons')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  return { data, error };
};

export const deleteAddOn = async (id) => {
  const { error } = await supabase
    .from('add_ons')
    .delete()
    .eq('id', id);
  return { error };
};

// Quotes helpers
export const getQuotes = async (businessId) => {
  const { data, error } = await supabase
    .from('quotes')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });
  return { data, error };
};

export const createQuote = async (quote) => {
  const { data, error } = await supabase
    .from('quotes')
    .insert(quote)
    .select()
    .single();
  return { data, error };
};
