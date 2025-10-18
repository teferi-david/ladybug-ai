-- Fix missing columns in users table
-- Run this script in your Supabase SQL editor to add missing columns

-- First, let's check what columns exist in the users table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;

-- Add missing columns if they don't exist
DO $$ 
BEGIN
  -- Add current_plan column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'current_plan') THEN
    ALTER TABLE users ADD COLUMN current_plan text DEFAULT 'free';
    RAISE NOTICE 'Added current_plan column';
  ELSE
    RAISE NOTICE 'current_plan column already exists';
  END IF;

  -- Add plan_expiry column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'plan_expiry') THEN
    ALTER TABLE users ADD COLUMN plan_expiry timestamptz;
    RAISE NOTICE 'Added plan_expiry column';
  ELSE
    RAISE NOTICE 'plan_expiry column already exists';
  END IF;

  -- Add subscription_status column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'subscription_status') THEN
    ALTER TABLE users ADD COLUMN subscription_status text DEFAULT 'inactive';
    RAISE NOTICE 'Added subscription_status column';
  ELSE
    RAISE NOTICE 'subscription_status column already exists';
  END IF;

  -- Add uses_left column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'uses_left') THEN
    ALTER TABLE users ADD COLUMN uses_left int DEFAULT 0;
    RAISE NOTICE 'Added uses_left column';
  ELSE
    RAISE NOTICE 'uses_left column already exists';
  END IF;

  -- Add words_used column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'words_used') THEN
    ALTER TABLE users ADD COLUMN words_used int DEFAULT 0;
    RAISE NOTICE 'Added words_used column';
  ELSE
    RAISE NOTICE 'words_used column already exists';
  END IF;

  -- Add updated_at column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'updated_at') THEN
    ALTER TABLE users ADD COLUMN updated_at timestamptz DEFAULT now();
    RAISE NOTICE 'Added updated_at column';
  ELSE
    RAISE NOTICE 'updated_at column already exists';
  END IF;
END $$;

-- Now let's see what data we have after adding columns
SELECT 
  id, 
  email, 
  current_plan, 
  subscription_status,
  uses_left,
  words_used,
  updated_at
FROM users 
LIMIT 5;

-- Update any NULL values to valid defaults
UPDATE users 
SET current_plan = 'free' 
WHERE current_plan IS NULL;

UPDATE users 
SET subscription_status = 'inactive' 
WHERE subscription_status IS NULL;

UPDATE users 
SET uses_left = 0 
WHERE uses_left IS NULL;

UPDATE users 
SET words_used = 0 
WHERE words_used IS NULL;

UPDATE users 
SET updated_at = now() 
WHERE updated_at IS NULL;

-- Verify the updates
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

-- Show final table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
