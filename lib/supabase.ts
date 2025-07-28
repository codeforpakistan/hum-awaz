import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://rpdgdovdiibsegukbtgz.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwZGdkb3ZkaWlic2VndWtidGd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2OTEyNjUsImV4cCI6MjA2OTI2NzI2NX0.64nQoPNQrd1_ren7kAcvPDwb9J6P3995Y4eQcq0cHBo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface User {
  id: string
  email: string
  full_name?: string
  phone?: string
  language: 'en' | 'ur'
  location?: string
  created_at: string
  updated_at: string
}

export interface Process {
  id: number
  title: string
  title_ur?: string
  description: string
  description_ur?: string
  category: string
  phase: 'discussion' | 'voting' | 'proposal' | 'implementation'
  location: string
  start_date: string
  end_date: string
  created_by?: string
  created_at: string
  updated_at: string
  is_active: boolean
}

export interface Proposal {
  id: number
  process_id: number
  title: string
  title_ur?: string
  description: string
  description_ur?: string
  author_id?: string
  status: 'draft' | 'submitted' | 'approved' | 'rejected'
  created_at: string
  updated_at: string
}

export interface Vote {
  id: number
  proposal_id: number
  user_id: string
  vote_type: 'support' | 'oppose' | 'abstain'
  created_at: string
}

export interface Comment {
  id: number
  proposal_id: number
  user_id: string
  content: string
  content_ur?: string
  created_at: string
  updated_at: string
} 