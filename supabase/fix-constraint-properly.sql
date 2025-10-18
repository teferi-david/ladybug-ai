-- Fix constraint violations properly
-- Run this script in your Supabase SQL editor

-- First, let's see what constraints exist
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'users'::regclass
ORDER BY conname;

-- Drop existing constraints if they exist (to avoid conflicts)
DO $$ 
BEGIN
  -- Drop current_plan constraint if it exists
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'users_current_plan_check') THEN
    ALTER TABLE users DROP CONSTRAINT users_current_plan_check;
    RAISE NOTICE 'Dropped users_current_plan_check constraint';
  END IF;
  
  -- Drop check_current_plan constraint if it exists
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_current_plan') THEN
    ALTER TABLE users DROP CONSTRAINT check_current_plan;
    RAISE NOTICE 'Dropped check_current_plan constraint';
  END IF;
  
  -- Drop subscription_status constraint if it exists
  IF EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_subscription_status') THEN
    ALTER TABLE users DROP CONSTRAINT check_subscription_status;
    RAISE NOTICE 'Dropped check_subscription_status constraint';
  END IF;
END $$;

-- Clean up existing data to ensure it matches our expected values
-- Update any invalid current_plan values
UPDATE users 
SET current_plan = 'free' 
WHERE current_plan IS NULL 
   OR current_plan NOT IN ('free', 'trial', 'monthly', 'annual', 'single-use');

-- Update any invalid subscription_status values
UPDATE users 
SET subscription_status = 'inactive' 
WHERE subscription_status IS NULL 
   OR subscription_status NOT IN ('active', 'inactive', 'trialing', 'cancelled');

-- Set default values for any NULL columns
UPDATE users 
SET uses_left = 0 
WHERE uses_left IS NULL;

UPDATE users 
SET words_used = 0 
WHERE words_used IS NULL;

UPDATE users 
SET updated_at = now() 
WHERE updated_at IS NULL;

-- Now add the correct constraints
ALTER TABLE users 
ADD CONSTRAINT check_current_plan 
CHECK (current_plan IN ('free', 'trial', 'monthly', 'annual', 'single-use'));

ALTER TABLE users 
ADD CONSTRAINT check_subscription_status 
CHECK (subscription_status IN ('active', 'inactive', 'trialing', 'cancelled'));

-- Verify the data is now clean
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

-- Show the final constraints
SELECT 
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint 
WHERE conrelid = 'users'::regclass
  AND contype = 'c'  -- Only check constraints
ORDER BY conname;
