import { createClient } from '@supabase/supabase-js';

// Access environment variables safely for Vite
// We use 'as any' casting to avoid TypeScript errors if types aren't perfectly set up in the environment
const envUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const envKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

// Fallback to prevent white screen crash if variables are missing in local dev
const supabaseUrl = envUrl || 'https://placeholder.supabase.co';
const supabaseKey = envKey || 'placeholder-key';

if (!envUrl || !envKey) {
  console.warn("Supabase credentials not found. App will load but data fetching will fail.");
}

export const supabase = createClient(supabaseUrl, supabaseKey);