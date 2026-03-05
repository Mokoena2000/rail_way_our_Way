import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Log more details to help you debug in the browser console
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase Config Missing:", { 
    url: supabaseUrl ? "Found" : "MISSING", 
    key: supabaseAnonKey ? "Found" : "MISSING" 
  });
}

// Use empty strings as fallback to prevent the 'supabaseKey is required' crash
export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");