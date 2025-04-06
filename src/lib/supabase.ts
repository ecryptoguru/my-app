import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
// In a real application, these values would come from environment variables
// For development purposes, we're using placeholder values
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-supabase-url.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'your-supabase-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);
