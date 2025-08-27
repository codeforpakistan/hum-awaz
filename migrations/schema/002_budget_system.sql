-- Schema Migration 2: Participatory Budget System Tables
-- Tables for participatory budgeting features

-- =====================================================
-- BUDGETS TABLE
-- =====================================================
CREATE TABLE budgets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  process_id UUID REFERENCES processes(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  title_ur TEXT,
  description TEXT NOT NULL,
  description_ur TEXT,
  total_amount NUMERIC NOT NULL CHECK (total_amount > 0),
  currency TEXT DEFAULT 'PKR',
  fiscal_year INTEGER NOT NULL,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'voting', 'closed', 'approved')),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  CONSTRAINT budget_dates_check CHECK (end_date > start_date),
  CONSTRAINT budget_fiscal_year_check CHECK (fiscal_year >= 2020 AND fiscal_year <= 2100)
);

-- =====================================================
-- BUDGET CATEGORIES TABLE
-- =====================================================
CREATE TABLE budget_categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  name_ur TEXT,
  description TEXT,
  description_ur TEXT,
  icon TEXT,
  color TEXT,
  min_amount NUMERIC NOT NULL DEFAULT 0 CHECK (min_amount >= 0),
  max_amount NUMERIC CHECK (max_amount IS NULL OR max_amount >= min_amount),
  suggested_amount NUMERIC CHECK (suggested_amount IS NULL OR suggested_amount >= min_amount),
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- =====================================================
-- BUDGET PROPOSALS TABLE
-- =====================================================
CREATE TABLE budget_proposals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES budget_categories(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_ur TEXT,
  description TEXT NOT NULL,
  description_ur TEXT,
  estimated_cost NUMERIC NOT NULL CHECK (estimated_cost > 0),
  location TEXT,
  location_ur TEXT,
  beneficiaries INTEGER CHECK (beneficiaries > 0),
  submitted_by UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'selected', 'implemented')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- =====================================================
-- BUDGET VOTES TABLE
-- =====================================================
CREATE TABLE budget_votes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(budget_id, user_id)
);

-- =====================================================
-- BUDGET VOTE ALLOCATIONS TABLE
-- =====================================================
CREATE TABLE budget_vote_allocations (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  vote_id UUID NOT NULL REFERENCES budget_votes(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES budget_categories(id) ON DELETE CASCADE,
  amount NUMERIC NOT NULL CHECK (amount >= 0),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(vote_id, category_id)
);

-- =====================================================
-- BUDGET PROPOSAL VOTES TABLE
-- =====================================================
CREATE TABLE budget_proposal_votes (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  proposal_id UUID NOT NULL REFERENCES budget_proposals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  support BOOLEAN NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  UNIQUE(proposal_id, user_id)
);

-- =====================================================
-- BUDGET INDEXES
-- =====================================================

-- Budgets indexes
CREATE INDEX idx_budgets_process_id ON budgets(process_id);
CREATE INDEX idx_budgets_status ON budgets(status);
CREATE INDEX idx_budgets_fiscal_year ON budgets(fiscal_year);
CREATE INDEX idx_budgets_created_by ON budgets(created_by);
CREATE INDEX idx_budgets_dates ON budgets(start_date, end_date);

-- Budget Categories indexes
CREATE INDEX idx_budget_categories_budget_id ON budget_categories(budget_id);
CREATE INDEX idx_budget_categories_order ON budget_categories(budget_id, order_index);

-- Budget Proposals indexes
CREATE INDEX idx_budget_proposals_budget_id ON budget_proposals(budget_id);
CREATE INDEX idx_budget_proposals_category_id ON budget_proposals(category_id);
CREATE INDEX idx_budget_proposals_submitted_by ON budget_proposals(submitted_by);
CREATE INDEX idx_budget_proposals_status ON budget_proposals(status);
CREATE INDEX idx_budget_proposals_cost ON budget_proposals(estimated_cost);

-- Budget Votes indexes
CREATE INDEX idx_budget_votes_budget_id ON budget_votes(budget_id);
CREATE INDEX idx_budget_votes_user_id ON budget_votes(user_id);

-- Budget Vote Allocations indexes
CREATE INDEX idx_budget_allocations_vote_id ON budget_vote_allocations(vote_id);
CREATE INDEX idx_budget_allocations_category_id ON budget_vote_allocations(category_id);

-- Budget Proposal Votes indexes
CREATE INDEX idx_budget_proposal_votes_proposal_id ON budget_proposal_votes(proposal_id);
CREATE INDEX idx_budget_proposal_votes_user_id ON budget_proposal_votes(user_id);
CREATE INDEX idx_budget_proposal_votes_support ON budget_proposal_votes(support);

-- =====================================================
-- BUDGET UPDATED_AT TRIGGERS
-- =====================================================
CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON budgets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_proposals_updated_at
  BEFORE UPDATE ON budget_proposals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budget_votes_updated_at
  BEFORE UPDATE ON budget_votes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- BUDGET VALIDATION FUNCTIONS
-- =====================================================

-- Function to validate budget allocations don't exceed total
CREATE OR REPLACE FUNCTION validate_budget_allocation()
RETURNS TRIGGER AS $$
DECLARE
  budget_total NUMERIC;
  category_total NUMERIC;
  vote_total NUMERIC;
BEGIN
  -- Get budget total
  SELECT b.total_amount INTO budget_total
  FROM budgets b
  JOIN budget_categories bc ON bc.budget_id = b.id
  WHERE bc.id = NEW.category_id;

  -- Get vote total for this budget
  SELECT COALESCE(SUM(bva.amount), 0) INTO vote_total
  FROM budget_vote_allocations bva
  JOIN budget_votes bv ON bv.id = bva.vote_id
  JOIN budget_categories bc ON bc.id = bva.category_id
  WHERE bc.budget_id = (
    SELECT bc2.budget_id 
    FROM budget_categories bc2 
    WHERE bc2.id = NEW.category_id
  )
  AND bva.vote_id = NEW.vote_id;

  -- Add the new allocation
  vote_total := vote_total + NEW.amount;

  -- Check if allocation exceeds budget
  IF vote_total > budget_total THEN
    RAISE EXCEPTION 'Budget allocation (%) exceeds total budget (%)', vote_total, budget_total;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to validate allocations
CREATE TRIGGER validate_budget_allocation_trigger
  BEFORE INSERT OR UPDATE ON budget_vote_allocations
  FOR EACH ROW
  EXECUTE FUNCTION validate_budget_allocation();

-- =====================================================
-- BUDGET UTILITY VIEWS
-- =====================================================

-- View for budget allocation summary by category
CREATE VIEW budget_allocation_summary AS
SELECT 
  bc.budget_id,
  bc.id as category_id,
  bc.name as category_name,
  bc.name_ur as category_name_ur,
  COALESCE(SUM(bva.amount), 0) as total_allocated,
  COUNT(DISTINCT bv.user_id) as vote_count,
  CASE 
    WHEN COUNT(DISTINCT bv.user_id) > 0 
    THEN COALESCE(SUM(bva.amount), 0) / COUNT(DISTINCT bv.user_id)
    ELSE 0
  END as average_allocation
FROM budget_categories bc
LEFT JOIN budget_vote_allocations bva ON bc.id = bva.category_id
LEFT JOIN budget_votes bv ON bv.id = bva.vote_id
GROUP BY bc.budget_id, bc.id, bc.name, bc.name_ur;

-- View for budget proposal statistics
CREATE VIEW budget_proposal_stats AS
SELECT 
  bp.id,
  bp.budget_id,
  bp.category_id,
  bp.title,
  bp.estimated_cost,
  COUNT(bpv.id) as total_votes,
  COUNT(CASE WHEN bpv.support = true THEN 1 END) as support_votes,
  COUNT(CASE WHEN bpv.support = false THEN 1 END) as oppose_votes,
  CASE 
    WHEN COUNT(bpv.id) > 0 
    THEN ROUND((COUNT(CASE WHEN bpv.support = true THEN 1 END) * 100.0) / COUNT(bpv.id), 2)
    ELSE 0
  END as support_percentage
FROM budget_proposals bp
LEFT JOIN budget_proposal_votes bpv ON bp.id = bpv.proposal_id
GROUP BY bp.id, bp.budget_id, bp.category_id, bp.title, bp.estimated_cost;

COMMENT ON TABLE budgets IS 'Participatory budgets for citizen allocation';
COMMENT ON TABLE budget_categories IS 'Categories for budget allocation';
COMMENT ON TABLE budget_proposals IS 'Specific project proposals within budgets';
COMMENT ON TABLE budget_votes IS 'User votes on budget allocations';
COMMENT ON TABLE budget_vote_allocations IS 'How users allocate budget across categories';
COMMENT ON TABLE budget_proposal_votes IS 'Votes on specific budget proposals';
COMMENT ON VIEW budget_allocation_summary IS 'Summary of budget allocations by category';
COMMENT ON VIEW budget_proposal_stats IS 'Statistics for budget proposals including vote counts';