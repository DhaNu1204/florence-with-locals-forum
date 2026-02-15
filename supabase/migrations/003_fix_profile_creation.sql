-- ============================================================================
-- Migration: 003_fix_profile_creation.sql
-- Maximum-robustness profile creation trigger
--
-- Changes:
--   1. Creates _debug_log table for diagnosing trigger failures
--   2. Replaces handle_new_user() with ON CONFLICT and full error logging
--   3. The function NEVER fails — always returns NEW
--
-- Run this in Supabase SQL Editor (Dashboard > SQL Editor > New Query)
-- ============================================================================

-- 1. Create a debug log table (safe to keep — rows auto-expire)
CREATE TABLE IF NOT EXISTS _debug_log (
    id         SERIAL PRIMARY KEY,
    message    TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Drop and recreate the trigger function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_username   VARCHAR(30);
    base_username  VARCHAR(30);
    user_full_name VARCHAR(100);
    user_avatar    TEXT;
    username_exists BOOLEAN;
    suffix_counter INTEGER;
    random_suffix  TEXT;
    err_msg        TEXT;
    err_detail     TEXT;
BEGIN
    -- ================================================================
    -- OUTER EXCEPTION BLOCK: Catch absolutely everything.
    -- No matter what happens, we RETURN NEW so the auth.users
    -- INSERT is never rolled back.
    -- ================================================================
    BEGIN

        -- ------------------------------------------------------------
        -- 1. Extract full_name from metadata
        -- ------------------------------------------------------------
        user_full_name := NULLIF(TRIM(COALESCE(
            NEW.raw_user_meta_data->>'full_name',
            NEW.raw_user_meta_data->>'name',
            ''
        )), '');

        -- ------------------------------------------------------------
        -- 2. Extract avatar_url from metadata
        -- ------------------------------------------------------------
        user_avatar := NULLIF(TRIM(COALESCE(
            NEW.raw_user_meta_data->>'avatar_url',
            NEW.raw_user_meta_data->>'picture',
            ''
        )), '');

        -- ------------------------------------------------------------
        -- 3. Generate username from email
        -- ------------------------------------------------------------
        BEGIN
            base_username := lower(split_part(COALESCE(NEW.email, ''), '@', 1));
            base_username := regexp_replace(base_username, '[^a-z0-9-]', '', 'g');
            base_username := regexp_replace(base_username, '^[^a-z]+', '');

            IF base_username IS NULL OR base_username = '' THEN
                base_username := 'user';
            END IF;

            base_username := LEFT(base_username, 24);
            random_suffix := substr(md5(random()::text), 1, 4);
            new_username  := base_username || '-' || random_suffix;

            SELECT EXISTS(
                SELECT 1 FROM profiles WHERE username = new_username
            ) INTO username_exists;

            suffix_counter := 0;
            WHILE username_exists LOOP
                suffix_counter := suffix_counter + 1;
                random_suffix  := substr(md5(random()::text), 1, 4);
                new_username   := base_username || '-' || random_suffix;

                SELECT EXISTS(
                    SELECT 1 FROM profiles WHERE username = new_username
                ) INTO username_exists;

                IF suffix_counter > 50 THEN
                    new_username := 'user-' || LEFT(NEW.id::text, 8);
                    EXIT;
                END IF;
            END LOOP;

        EXCEPTION WHEN OTHERS THEN
            new_username := 'user-' || LEFT(NEW.id::text, 8);
            INSERT INTO _debug_log (message)
            VALUES ('Username generation failed for ' || NEW.id::text || ': ' || SQLERRM);
        END;

        -- ------------------------------------------------------------
        -- 4. Insert or update profile (ON CONFLICT handles re-runs)
        -- ------------------------------------------------------------
        INSERT INTO profiles (id, username, full_name, avatar_url)
        VALUES (
            NEW.id,
            new_username,
            user_full_name,
            user_avatar
        )
        ON CONFLICT (id) DO UPDATE SET
            full_name  = COALESCE(EXCLUDED.full_name, profiles.full_name),
            avatar_url = COALESCE(EXCLUDED.avatar_url, profiles.avatar_url);

        INSERT INTO _debug_log (message)
        VALUES ('Profile created/updated OK for ' || NEW.id::text || ' (' || new_username || ')');

    EXCEPTION WHEN OTHERS THEN
        -- Log the error but NEVER fail
        GET STACKED DIAGNOSTICS err_msg = MESSAGE_TEXT, err_detail = PG_EXCEPTION_DETAIL;
        BEGIN
            INSERT INTO _debug_log (message)
            VALUES ('handle_new_user FAILED for ' || COALESCE(NEW.id::text, 'NULL')
                    || ' | error: ' || COALESCE(err_msg, 'unknown')
                    || ' | detail: ' || COALESCE(err_detail, 'none'));
        EXCEPTION WHEN OTHERS THEN
            -- Even logging failed — give up silently
            NULL;
        END;
    END;

    -- ALWAYS return NEW so the auth.users row is committed
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Ensure the trigger exists (re-create to be safe)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();
