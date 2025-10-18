-- Debug constraints in users table
-- Run this script to see what constraints exist and their definitions

-- Check what constraints exist on the users table
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'users'::regclass
ORDER BY conname;

-- Check the current data in users table
SELECT 
  id,
  email,
  current_plan,
  subscription_status,
  plan_expiry,
  uses_left,
  words_used
FROM users
ORDER BY created_at DESC
LIMIT 10;

-- Check what values are currently in current_plan column
SELECT 
  current_plan,
  COUNT(*) as count
FROM users 
GROUP BY current_plan
ORDER BY count DESC;

-- Check what values are currently in subscription_status column
SELECT 
  subscription_status,
  COUNT(*) as count
FROM users 
GROUP BY subscription_status
ORDER BY count DESC;
