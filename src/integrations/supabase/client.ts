import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use environment variables for production, fallback to hardcoded values for development
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || "https://ojbdiawbfqyepbadnivw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qYmRpYXdiZnF5ZXBiYWRuaXZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM1NTE3MDMsImV4cCI6MjA2OTEyNzcwM30.i-Kqf-JpU9pmEdcVXF634D8N1FD-UuHh99A_evsmLuc";

// Validate environment variables
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error('Missing Supabase environment variables. Please check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});