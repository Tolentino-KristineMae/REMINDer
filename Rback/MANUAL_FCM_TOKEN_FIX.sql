-- Manual fix for FCM token column
-- Run this directly in Supabase SQL Editor if migrations keep failing

-- Add fcm_token column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'users' 
        AND column_name = 'fcm_token'
    ) THEN
        ALTER TABLE users ADD COLUMN fcm_token VARCHAR(500) NULL;
    END IF;
END $$;

-- Verify the column was added
SELECT column_name, data_type, character_maximum_length, is_nullable
FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'fcm_token';
