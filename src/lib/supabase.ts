import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Route {
  id: string;
  name: string;
  description: string;
  color: string;
  created_at: string;
}

export interface Stop {
  id: string;
  route_id: string;
  name: string;
  lat: number;
  lng: number;
  sequence: number;
  created_at: string;
}

export interface Bus {
  id: string;
  number: string;
  route_id: string;
  current_lat: number;
  current_lng: number;
  status: 'on-time' | 'delayed' | 'overcrowded' | 'breakdown';
  next_stop_id: string | null;
  pollution_level: 'low' | 'medium' | 'high';
  maintenance_status: 'ok' | 'needs-service';
  updated_at: string;
  created_at: string;
}
