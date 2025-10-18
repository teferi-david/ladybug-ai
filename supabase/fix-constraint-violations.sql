-- Fix constraint violations in users table
-- Run this script in your Supabase SQL editor to fix existing data

-- First, ensure all required columns exist
DO $$ 
BEGIN
  -- Add current_plan column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'current_plan') THEN
    ALTER TABLE users ADD COLUMN current_plan text DEFAULT 'free';
  END IF;

  -- Add subscription_status column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'subscription_status') THEN
    ALTER TABLE users ADD COLUMN subscription_status text DEFAULT 'inactive';
  END IF;
END $$;

-- Now let's see what data is causing the constraint violation
SELECT 
  id, 
  email, 
  current_plan, 
  subscription_status,
  CASE 
    WHEN current_plan IS NULL THEN 'NULL current_plan'
    WHEN current_plan NOT IN ('free', 'trial', 'monthly', 'annual', 'single-use') THEN 'Invalid current_plan: ' || current_plan
    ELSE 'OK'
  END as current_plan_issue,
  CASE 
    WHEN subscription_status IS NULL THEN 'NULL subscription_status'
    WHEN subscription_status NOT IN ('active', 'inactive', 'trialing', 'cancelled') THEN 'Invalid subscription_status: ' || subscription_status
    ELSE 'OK'
  END as subscription_status_issue
FROM users
WHERE 
  current_plan IS NULL 
  OR current_plan NOT IN ('free', 'trial', 'monthly', 'annual', 'single-use')
  OR subscription_status IS NULL 
  OR subscription_status NOT IN ('active', 'inactive', 'trialing', 'cancelled');

-- Fix current_plan violations
UPDATE users 
SET current_plan = 'free' 
WHERE current_plan IS NULL 
   OR current_plan NOT IN ('free', 'trial', 'monthly', 'annual', 'single-use');

-- Fix subscription_status violations  
UPDATE users 
SET subscription_status = 'inactive' 
WHERE subscription_status IS NULL 
   OR subscription_status NOT IN ('active', 'inactive', 'trialing', 'cancelled');

-- Verify the fixes
SELECT 
  current_plan,
  COUNT(*) as count
FROM users 
GROUP BY current_plan;

SELECT 
  subscription_status,
  COUNT(*) as count
FROM users 
GROUP BY subscription_status;

-- Now you can safely add the constraints
-- (This part is already in the main schema.sql file)
