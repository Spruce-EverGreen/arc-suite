-- ARC Suite: Call Tracker Schema
-- Run this in Supabase SQL Editor

-- ============================================
-- CALL LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS call_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  
  -- Call Info
  call_date DATE NOT NULL,
  month_year TEXT GENERATED ALWAYS AS (TO_CHAR(call_date, 'YYYY-MM')) STORED,
  who_took_call TEXT,
  
  -- Contact Info
  caller_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  
  -- Lead Source
  referral_source TEXT,
  referral_name TEXT,
  
  -- Qualification
  matter_type TEXT,
  is_qualified BOOLEAN DEFAULT false,
  not_qualified_reason TEXT,
  referral_made BOOLEAN DEFAULT false,
  
  -- Appointment
  appointment_date DATE,
  salesperson TEXT,
  showed_up BOOLEAN,
  
  -- Engagement/Close
  engaged BOOLEAN,
  not_engaged_reason TEXT,
  engagement_date DATE,
  estimated_value DECIMAL(12,2) DEFAULT 0,
  
  -- Follow-ups
  followup_date_1 DATE,
  followup_date_2 DATE,
  followup_date_3 DATE,
  reschedule_date DATE,
  
  -- Notes
  notes TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE call_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only manage their own calls
CREATE POLICY "Users can view own calls" ON call_logs
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calls" ON call_logs
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calls" ON call_logs
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calls" ON call_logs
  FOR DELETE USING (auth.uid() = user_id);

-- Index for faster queries
CREATE INDEX idx_call_logs_user_date ON call_logs(user_id, call_date DESC);
CREATE INDEX idx_call_logs_month ON call_logs(user_id, month_year);

-- ============================================
-- REFERRAL SOURCES LOOKUP
-- ============================================
CREATE TABLE IF NOT EXISTS referral_sources (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE referral_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own referral sources" ON referral_sources
  FOR ALL USING (auth.uid() = user_id);

-- Default referral sources (inserted per user on signup)
-- Internet-Google, Firm Website, Referral-Professional, Referral-Client, 
-- Prior Client, Billboard, Radio/TV Ad, Social Media, Other

-- ============================================
-- MATTER TYPES LOOKUP
-- ============================================
CREATE TABLE IF NOT EXISTS matter_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE matter_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own matter types" ON matter_types
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- SALESPEOPLE LOOKUP
-- ============================================
CREATE TABLE IF NOT EXISTS salespeople (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE salespeople ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own salespeople" ON salespeople
  FOR ALL USING (auth.uid() = user_id);

-- ============================================
-- VIEWS FOR ANALYTICS
-- ============================================

-- Monthly summary view
CREATE OR REPLACE VIEW call_summary_monthly AS
SELECT 
  user_id,
  month_year,
  COUNT(*) as total_calls,
  COUNT(*) FILTER (WHERE is_qualified = true) as qualified_leads,
  COUNT(*) FILTER (WHERE appointment_date IS NOT NULL) as scheduled,
  COUNT(*) FILTER (WHERE showed_up = true) as showed_up,
  COUNT(*) FILTER (WHERE engaged = true) as engaged,
  COALESCE(SUM(estimated_value) FILTER (WHERE engaged = true), 0) as total_value,
  ROUND(
    COUNT(*) FILTER (WHERE is_qualified = true)::DECIMAL / NULLIF(COUNT(*), 0) * 100, 1
  ) as qualified_rate,
  ROUND(
    COUNT(*) FILTER (WHERE showed_up = true)::DECIMAL / NULLIF(COUNT(*) FILTER (WHERE appointment_date IS NOT NULL), 0) * 100, 1
  ) as showup_rate,
  ROUND(
    COUNT(*) FILTER (WHERE engaged = true)::DECIMAL / NULLIF(COUNT(*) FILTER (WHERE showed_up = true), 0) * 100, 1
  ) as close_rate
FROM call_logs
GROUP BY user_id, month_year
ORDER BY month_year DESC;

-- Referral source performance view
CREATE OR REPLACE VIEW referral_source_performance AS
SELECT 
  user_id,
  referral_source,
  COUNT(*) as total_calls,
  COUNT(*) FILTER (WHERE is_qualified = true) as qualified,
  COUNT(*) FILTER (WHERE engaged = true) as closed,
  COALESCE(SUM(estimated_value) FILTER (WHERE engaged = true), 0) as revenue,
  ROUND(
    COUNT(*) FILTER (WHERE engaged = true)::DECIMAL / NULLIF(COUNT(*), 0) * 100, 1
  ) as conversion_rate
FROM call_logs
WHERE referral_source IS NOT NULL
GROUP BY user_id, referral_source
ORDER BY revenue DESC;

-- ============================================
-- FUNCTION: Initialize user defaults
-- ============================================
CREATE OR REPLACE FUNCTION initialize_call_tracker_defaults()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert default referral sources
  INSERT INTO referral_sources (user_id, name) VALUES
    (NEW.id, 'Internet-Google'),
    (NEW.id, 'Firm Website'),
    (NEW.id, 'Referral-Professional'),
    (NEW.id, 'Referral-Client'),
    (NEW.id, 'Prior Client'),
    (NEW.id, 'Billboard'),
    (NEW.id, 'Radio/TV Ad'),
    (NEW.id, 'Social Media'),
    (NEW.id, 'Other');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Note: Connect this trigger to your user signup flow
-- CREATE TRIGGER on_auth_user_created
--   AFTER INSERT ON auth.users
--   FOR EACH ROW EXECUTE FUNCTION initialize_call_tracker_defaults();
