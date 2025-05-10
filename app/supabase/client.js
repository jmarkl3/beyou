'use client';
import { createClient } from '@supabase/supabase-js';

// Create a single supabase client for the entire app
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export default supabase;
