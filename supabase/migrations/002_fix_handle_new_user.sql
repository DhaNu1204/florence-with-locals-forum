-- ============================================================================
-- Migration: 002_fix_handle_new_user.sql
-- Fix: handle_new_user() trigger failing with "Database error saving new user"
--
-- Root causes:
--   1. No EXCEPTION handler — any error in profile INSERT rolls back the
--      auth.users INSERT, killing the entire signup
--   2. Empty strings stored instead of NULL for nullable columns
--   3. Google OAuth metadata uses 'name' and 'picture', not 'full_name'/'avatar_url'
--
-- Copy-paste into Supabase SQL Editor to run
-- ============================================================================

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
BEGIN
    -- ----------------------------------------------------------------
    -- 1. Extract full_name from metadata
    --    Email signup sends 'full_name', Google OAuth sends 'name'
    -- ----------------------------------------------------------------
    user_full_name := NULLIF(TRIM(COALESCE(
        NEW.raw_user_meta_data->>'full_name',
        NEW.raw_user_meta_data->>'name',
        ''
    )), '');

    -- ----------------------------------------------------------------
    -- 2. Extract avatar_url from metadata
    --    Google OAuth uses 'picture', email signup may send 'avatar_url'
    -- ----------------------------------------------------------------
    user_avatar := NULLIF(TRIM(COALESCE(
        NEW.raw_user_meta_data->>'avatar_url',
        NEW.raw_user_meta_data->>'picture',
        ''
    )), '');

    -- ----------------------------------------------------------------
    -- 3. Generate username from email
    -- ----------------------------------------------------------------
    BEGIN
        -- Take part before @, lowercase
        base_username := lower(split_part(COALESCE(NEW.email, ''), '@', 1));

        -- Remove characters that aren't lowercase alphanumeric or hyphens
        base_username := regexp_replace(base_username, '[^a-z0-9-]', '', 'g');

        -- Remove leading hyphens or digits (CHECK requires start with letter)
        base_username := regexp_replace(base_username, '^[^a-z]+', '');

        -- If empty after cleanup, prepend 'u-' won't help, use 'user' fallback
        IF base_username IS NULL OR base_username = '' THEN
            base_username := 'user';
        END IF;

        -- Truncate to 24 chars to leave room for suffix
        base_username := LEFT(base_username, 24);

        -- Generate a random 4-char alphanumeric suffix for uniqueness
        random_suffix := substr(md5(random()::text), 1, 4);
        new_username  := base_username || '-' || random_suffix;

        -- Ensure the generated username is not taken
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

            -- Safety valve
            IF suffix_counter > 50 THEN
                new_username := 'user-' || LEFT(NEW.id::text, 8);
                EXIT;
            END IF;
        END LOOP;

    EXCEPTION WHEN OTHERS THEN
        -- If anything goes wrong generating the username, fall back to UUID-based
        new_username := 'user-' || LEFT(NEW.id::text, 8);
    END;

    -- ----------------------------------------------------------------
    -- 4. Insert the profile row with full exception handling
    -- ----------------------------------------------------------------
    BEGIN
        INSERT INTO profiles (id, username, full_name, avatar_url)
        VALUES (
            NEW.id,
            new_username,
            user_full_name,
            user_avatar
        );
    EXCEPTION
        WHEN unique_violation THEN
            -- Username race condition — retry with UUID fallback
            BEGIN
                INSERT INTO profiles (id, username, full_name, avatar_url)
                VALUES (
                    NEW.id,
                    'user-' || LEFT(NEW.id::text, 8),
                    user_full_name,
                    user_avatar
                );
            EXCEPTION WHEN OTHERS THEN
                -- Last resort: absolute minimum profile
                INSERT INTO profiles (id, username)
                VALUES (NEW.id, 'u-' || LEFT(replace(NEW.id::text, '-', ''), 12));
            END;
        WHEN OTHERS THEN
            -- Catch any other error — still create a minimal profile
            BEGIN
                INSERT INTO profiles (id, username)
                VALUES (NEW.id, 'user-' || LEFT(NEW.id::text, 8));
            EXCEPTION WHEN OTHERS THEN
                -- Absolute last resort
                INSERT INTO profiles (id, username)
                VALUES (NEW.id, 'u-' || LEFT(replace(NEW.id::text, '-', ''), 12));
            END;
    END;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
