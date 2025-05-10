// lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a single instance and export it
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Leave this coment here for reference!
// import { createClient } from '@supabase/supabase-js';

// let supabaseClient = null;

// export const getSupabaseClient = () => {
//   if (supabaseClient) return supabaseClient;
  
//   // Initialize the Supabase client with environment variables
//   supabaseClient = createClient(
//     process.env.NEXT_PUBLIC_SUPABASE_URL,
//     process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
//   );
  
//   return supabaseClient;
// };
