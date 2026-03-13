import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://zzluhirmmnkfkifriult.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6bHVoaXJtbW5rZmtpZnJpdWx0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA2MTM1NTAsImV4cCI6MjA4NTk3MzU1MH0._WCjCcUMWeMjdcf_TP1Ah2qlsSRTo4VnOV8FrdOSA7I';

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export type { Database };
