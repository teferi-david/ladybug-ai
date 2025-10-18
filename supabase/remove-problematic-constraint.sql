-- Remove problematic constraint temporarily
-- Run this script to remove the constraint that's causing issues

-- Drop the problematic constraint
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_current_plan_check;

-- Drop any other related constraints
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_current_plan;
ALTER TABLE users DROP CONSTRAINT IF EXISTS check_subscription_status;

-- Verify constraints are removed
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'users'::regclass
ORDER BY conname;

-- Show current data to verify it's clean
SELECT 
  current_plan,
  COUNT(*) as count
FROM users 
GROUP BY current_plan
ORDER BY count DESC;

SELECT 
  subscription_status,
  COUNT(*) as count
FROM users 
GROUP BY subscription_status
ORDER BY count DESC;
