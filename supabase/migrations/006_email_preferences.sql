-- Add email notification preference to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS email_notifications boolean DEFAULT true;
