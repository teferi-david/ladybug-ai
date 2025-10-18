-- Safe Supabase schema for Square payments integration
-- This version handles existing data gracefully

-- Create payments table for idempotency and payment tracking
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  plan text NOT NULL CHECK (plan IN ('trial', 'monthly', 'annual', 'single-use')),
  square_payment_id text UNIQUE NOT NULL,
  amount int NOT NULL,
  currency text NOT NULL DEFAULT 'USD',
  metadata jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_square_payment_id ON payments(square_payment_id);
CREATE INDEX IF NOT EXISTS idx_payments_created_at ON payments(created_at);
CREATE INDEX IF NOT EXISTS idx_payments_plan ON payments(plan);

-- Add RLS (Row Level Security) policies
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own payments
CREATE POLICY "Users can view own payments" ON payments
  FOR SELECT USING (auth.uid() = user_id);

-- Policy: Service role can insert payments (for webhook processing)
CREATE POLICY "Service role can insert payments" ON payments
  FOR INSERT WITH CHECK (true);

-- Policy: Service role can update payments
CREATE POLICY "Service role can update payments" ON payments
  FOR UPDATE USING (true);

-- Safely update users table to ensure it has the required columns
DO $$ 
BEGIN
  -- Add current_plan column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'current_plan') THEN
    ALTER TABLE users ADD COLUMN current_plan text DEFAULT 'free';
  END IF;

  -- Add plan_expiry column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'plan_expiry') THEN
    ALTER TABLE users ADD COLUMN plan_expiry timestamptz;
  END IF;

  -- Add subscription_status column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'subscription_status') THEN
    ALTER TABLE users ADD COLUMN subscription_status text DEFAULT 'inactive';
  END IF;

  -- Add uses_left column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'uses_left') THEN
    ALTER TABLE users ADD COLUMN uses_left int DEFAULT 0;
  END IF;

  -- Add words_used column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'words_used') THEN
    ALTER TABLE users ADD COLUMN words_used int DEFAULT 0;
  END IF;

  -- Add updated_at column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'updated_at') THEN
    ALTER TABLE users ADD COLUMN updated_at timestamptz DEFAULT now();
  END IF;
END $$;

-- Clean up existing data before adding constraints
-- Update any NULL or invalid current_plan values
UPDATE users 
SET current_plan = 'free' 
WHERE current_plan IS NULL 
   OR current_plan NOT IN ('free', 'trial', 'monthly', 'annual', 'single-use');

-- Update any NULL or invalid subscription_status values
UPDATE users 
SET subscription_status = 'inactive' 
WHERE subscription_status IS NULL 
   OR subscription_status NOT IN ('active', 'inactive', 'trialing', 'cancelled');

-- Drop existing constraints if they exist (to avoid conflicts)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_current_plan') THEN
    ALTER TABLE users DROP CONSTRAINT check_current_plan;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_subscription_status') THEN
    ALTER TABLE users DROP CONSTRAINT check_subscription_status;
  END IF;
END $$;

-- Add constraints to users table (now that data is clean)
ALTER TABLE users 
ADD CONSTRAINT check_current_plan 
CHECK (current_plan IN ('free', 'trial', 'monthly', 'annual', 'single-use'));

ALTER TABLE users 
ADD CONSTRAINT check_subscription_status 
CHECK (subscription_status IN ('active', 'inactive', 'trialing', 'cancelled'));

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create function to get user plan details
CREATE OR REPLACE FUNCTION get_user_plan_details(user_uuid uuid)
RETURNS TABLE (
  current_plan text,
  plan_expiry timestamptz,
  subscription_status text,
  uses_left int,
  words_used int,
  is_active boolean
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.current_plan,
    u.plan_expiry,
    u.subscription_status,
    u.uses_left,
    u.words_used,
    CASE 
      WHEN u.subscription_status = 'active' AND (u.plan_expiry IS NULL OR u.plan_expiry > now()) 
      THEN true 
      ELSE false 
    END as is_active
  FROM users u
  WHERE u.id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE ON payments TO anon, authenticated;
GRANT SELECT, UPDATE ON users TO anon, authenticated;
GRANT EXECUTE ON FUNCTION get_user_plan_details(uuid) TO anon, authenticated;

-- Create view for payment analytics (optional)
CREATE OR REPLACE VIEW payment_analytics AS
SELECT 
  plan,
  COUNT(*) as total_payments,
  SUM(amount) as total_revenue,
  AVG(amount) as average_amount,
  MIN(created_at) as first_payment,
  MAX(created_at) as latest_payment
FROM payments
GROUP BY plan
ORDER BY total_revenue DESC;

-- Grant access to payment analytics view
GRANT SELECT ON payment_analytics TO anon, authenticated;
