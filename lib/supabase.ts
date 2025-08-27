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
  process_type: 'consultation' | 'initiative' | 'assembly' | 'poll' | 'petition' | 'budget' | 'debate'
  scope: 'federal' | 'provincial' | 'city' | 'district' | 'community'
  start_date: string
  end_date: string
  created_by?: string
  organization?: string
  participation_count: number
  signature_threshold: number
  current_signatures: number
  signature_deadline?: string
  response_required: boolean
  response_deadline?: string
  government_response?: string
  government_response_ur?: string
  response_date?: string
  visibility: 'public' | 'restricted' | 'private'
  participation_method: 'open' | 'invited' | 'random_selection' | 'application'
  min_participants: number
  max_participants?: number
  verification_required: boolean
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
  status: 'under_review' | 'pending' | 'approved' | 'rejected' | 'implemented'
  vote_count: number
  support_percentage: number
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

// Enhanced Democratic Features (Based on Decidim & Polis)
export interface ProcessSignature {
  id: string
  process_id: string
  user_id: string
  signature_type: 'support' | 'endorsement' | 'participation_request'
  comment?: string
  comment_ur?: string
  verified: boolean
  created_at: string
}

export interface ProcessPhase {
  id: string
  process_id: string
  title: string
  title_ur?: string
  description?: string
  description_ur?: string
  phase_type: 'information' | 'debate' | 'proposal' | 'voting' | 'implementation' | 'evaluation'
  start_date: string
  end_date: string
  is_active: boolean
  order_index: number
  created_at: string
}

export interface Meeting {
  id: string
  process_id?: string
  title: string
  title_ur?: string
  description?: string
  description_ur?: string
  location?: string
  location_ur?: string
  online_meeting_url?: string
  meeting_type: 'in_person' | 'online' | 'hybrid'
  start_time: string
  end_time: string
  max_attendees?: number
  registration_required: boolean
  registration_deadline?: string
  agenda?: string
  agenda_ur?: string
  minutes?: string
  minutes_ur?: string
  organizer_id: string
  status: 'upcoming' | 'ongoing' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

export interface MeetingAttendee {
  id: string
  meeting_id: string
  user_id: string
  registration_date: string
  attendance_status: 'registered' | 'attended' | 'no_show' | 'cancelled'
  check_in_time?: string
}

export interface UserRole {
  id: string
  user_id: string
  role: 'citizen' | 'government_admin' | 'moderator' | 'facilitator' | 'observer'
  scope?: 'platform' | 'process' | 'component'
  resource_id?: string
  granted_by?: string
  granted_at: string
  expires_at?: string
  is_active: boolean
}

export interface ProcessFollower {
  id: string
  process_id: string
  user_id: string
  notification_preferences: {
    email: boolean
    push: boolean
  }
  followed_at: string
}

// Enhanced Process Types
export type ProcessType = 'consultation' | 'initiative' | 'assembly' | 'poll' | 'petition' | 'budget' | 'debate'
export type ProcessScope = 'federal' | 'provincial' | 'city' | 'district' | 'community'
export type ParticipationMethod = 'open' | 'invited' | 'random_selection' | 'application'
export type ProcessVisibility = 'public' | 'restricted' | 'private'

// Process with enhanced features
export interface ProcessWithSignatures extends Process {
  signatures?: ProcessSignature[]
  signature_progress?: number
  phases?: ProcessPhase[]
  meetings?: Meeting[]
  followers?: ProcessFollower[]
}