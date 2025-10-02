import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rmmdtxpomsxslcalvciq.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJtbWR0eHBvbXN4c2xjYWx2Y2lxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc3Njg3NjksImV4cCI6MjA3MzM0NDc2OX0.0w1RK041KElAefs_JN5YSz5Qf8a63oHfsuilQUD2Fc0'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Test connection function
export const testSupabaseConnection = async () => {
  try {
    const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
    if (error) {
      console.error('Supabase connection error:', error);
      return false;
    }
    console.log('Supabase connection successful');
    return true;
  } catch (error) {
    console.error('Supabase connection failed:', error);
    return false;
  }
};

// Database types
export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          user_id: string
          age: number | null
          blood_type: string | null
          health_status: 'excellent' | 'good' | 'fair' | 'poor'
          allergies: string[]
          medications: string[]
          conditions: string[]
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          age?: number | null
          blood_type?: string | null
          health_status?: 'excellent' | 'good' | 'fair' | 'poor'
          allergies?: string[]
          medications?: string[]
          conditions?: string[]
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          age?: number | null
          blood_type?: string | null
          health_status?: 'excellent' | 'good' | 'fair' | 'poor'
          allergies?: string[]
          medications?: string[]
          conditions?: string[]
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan: 'free' | 'premium'
          status: 'active' | 'trial' | 'cancelled'
          trial_end_date: string | null
          billing_cycle: 'monthly' | 'yearly' | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan?: 'free' | 'premium'
          status?: 'active' | 'trial' | 'cancelled'
          trial_end_date?: string | null
          billing_cycle?: 'monthly' | 'yearly' | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan?: 'free' | 'premium'
          status?: 'active' | 'trial' | 'cancelled'
          trial_end_date?: string | null
          billing_cycle?: 'monthly' | 'yearly' | null
          created_at?: string
          updated_at?: string
        }
      }
      vital_signs: {
        Row: {
          id: string
          user_id: string
          type: 'blood_pressure' | 'heart_rate' | 'temperature' | 'weight' | 'blood_sugar'
          value: string
          unit: string
          notes: string | null
          recorded_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'blood_pressure' | 'heart_rate' | 'temperature' | 'weight' | 'blood_sugar'
          value: string
          unit: string
          notes?: string | null
          recorded_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'blood_pressure' | 'heart_rate' | 'temperature' | 'weight' | 'blood_sugar'
          value?: string
          unit?: string
          notes?: string | null
          recorded_at?: string
          created_at?: string
        }
      }
      medications: {
        Row: {
          id: string
          user_id: string
          name: string
          dosage: string
          frequency: string
          start_date: string
          end_date: string | null
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          dosage: string
          frequency: string
          start_date: string
          end_date?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          dosage?: string
          frequency?: string
          start_date?: string
          end_date?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}