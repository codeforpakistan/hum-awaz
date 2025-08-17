import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://rpdgdovdiibsegukbtgz.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwZGdkb3ZkaWlic2VndWtidGd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTM2OTEyNjUsImV4cCI6MjA2OTI2NzI2NX0.64nQoPNQrd1_ren7kAcvPDwb9J6P3995Y4eQcq0cHBo'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types matching our new schema
export interface Profile {
  id: string
  username?: string
  full_name?: string
  bio?: string
  avatar_url?: string
  location?: string
  preferred_language: 'en' | 'ur'
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface Process {
  id: string
  title: string
  title_ur?: string
  description: string
  description_ur?: string
  status: 'draft' | 'active' | 'closed' | 'completed'
  category: 'education' | 'healthcare' | 'infrastructure' | 'economy' | 'environment' | 'governance' | 'other'
  start_date: string
  end_date: string
  created_by?: string
  organization?: string
  participation_count: number
  is_approved: boolean
  created_at: string
  updated_at: string
}

export interface Proposal {
  id: string
  process_id: string
  title: string
  title_ur?: string
  description: string
  description_ur?: string
  author_id: string
  status: 'pending' | 'approved' | 'rejected' | 'implemented'
  vote_count: number
  support_percentage: number
  is_approved: boolean
  created_at: string
  updated_at: string
}

export interface Discussion {
  id: string
  process_id?: string
  proposal_id?: string
  parent_id?: string
  author_id: string
  content: string
  content_ur?: string
  likes_count: number
  is_pinned: boolean
  is_deleted: boolean
  created_at: string
  updated_at: string
}

export interface Vote {
  id: string
  user_id: string
  proposal_id: string
  vote_type: 'support' | 'oppose' | 'neutral'
  created_at: string
}

export interface Participation {
  id: string
  user_id: string
  process_id: string
  participation_type: 'view' | 'proposal' | 'vote' | 'comment'
  created_at: string
}

export interface Notification {
  id: string
  user_id: string
  type: 'proposal_approved' | 'proposal_rejected' | 'new_comment' | 'process_ending' | 'vote_milestone'
  title: string
  message: string
  related_process_id?: string
  related_proposal_id?: string
  is_read: boolean
  created_at: string
}

// Participatory Budgeting Types
export interface Budget {
  id: string
  process_id?: string
  title: string
  title_ur?: string
  description: string
  description_ur?: string
  total_amount: number
  currency: string
  fiscal_year: number
  start_date: string
  end_date: string
  status: 'draft' | 'active' | 'voting' | 'closed' | 'approved'
  created_by?: string
  created_at: string
  updated_at: string
}

export interface BudgetCategory {
  id: string
  budget_id: string
  name: string
  name_ur?: string
  description?: string
  description_ur?: string
  icon?: string
  color?: string
  min_amount: number
  max_amount?: number
  suggested_amount?: number
  order_index: number
  created_at: string
}

export interface BudgetProposal {
  id: string
  budget_id: string
  category_id: string
  title: string
  title_ur?: string
  description: string
  description_ur?: string
  estimated_cost: number
  location?: string
  location_ur?: string
  beneficiaries?: number
  submitted_by?: string
  status: 'pending' | 'approved' | 'rejected' | 'selected' | 'implemented'
  admin_notes?: string
  created_at: string
  updated_at: string
}

export interface BudgetVote {
  id: string
  budget_id: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface BudgetVoteAllocation {
  id: string
  vote_id: string
  category_id: string
  amount: number
  created_at: string
}

export interface BudgetProposalVote {
  id: string
  proposal_id: string
  user_id: string
  support: boolean
  created_at: string
}

export interface BudgetAllocationSummary {
  category_id: string
  category_name: string
  total_allocated: number
  vote_count: number
  average_allocation: number
} 