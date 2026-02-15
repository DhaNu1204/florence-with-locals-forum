-- ============================================================================
-- Florence With Locals Forum - Complete Database Schema
-- Migration: 001_initial_schema.sql
-- Copy-paste into Supabase SQL Editor to run
-- ============================================================================

-- ============================================================================
-- 1. CUSTOM TYPES (ENUMs)
-- ============================================================================

CREATE TYPE user_role AS ENUM ('member', 'guide', 'moderator', 'admin');
CREATE TYPE notification_type AS ENUM ('reply', 'like', 'mention', 'badge', 'announcement');

-- ============================================================================
-- 2. TABLES
-- ============================================================================

-- --------------------------------------------------------------------------
-- profiles
-- --------------------------------------------------------------------------
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username VARCHAR(30) UNIQUE NOT NULL
        CONSTRAINT username_format CHECK (username ~ '^[a-z][a-z0-9-]*$'),
    full_name VARCHAR(100),
    avatar_url TEXT,
    bio VARCHAR(500),
    role user_role DEFAULT 'member',
    reputation_points INTEGER DEFAULT 0,
    badges JSONB DEFAULT '[]'::jsonb,
    location VARCHAR(100),
    website VARCHAR(255),
    joined_at TIMESTAMPTZ DEFAULT now(),
    last_seen_at TIMESTAMPTZ DEFAULT now(),
    is_banned BOOLEAN DEFAULT false,
    ban_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- --------------------------------------------------------------------------
-- categories
-- --------------------------------------------------------------------------
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    color VARCHAR(7),
    display_order INTEGER DEFAULT 0,
    thread_count INTEGER DEFAULT 0,
    post_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- --------------------------------------------------------------------------
-- threads
-- --------------------------------------------------------------------------
CREATE TABLE threads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id INTEGER NOT NULL REFERENCES categories(id),
    author_id UUID NOT NULL REFERENCES profiles(id),
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(250) UNIQUE NOT NULL,
    content TEXT NOT NULL,
    is_pinned BOOLEAN DEFAULT false,
    is_locked BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    reply_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    last_reply_at TIMESTAMPTZ,
    last_reply_by UUID REFERENCES profiles(id),
    search_vector tsvector,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- --------------------------------------------------------------------------
-- posts (replies to threads)
-- --------------------------------------------------------------------------
CREATE TABLE posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    thread_id UUID NOT NULL REFERENCES threads(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id),
    content TEXT NOT NULL,
    is_solution BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- --------------------------------------------------------------------------
-- post_likes
-- --------------------------------------------------------------------------
CREATE TABLE post_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
    thread_id UUID REFERENCES threads(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT now(),
    CONSTRAINT like_target_check CHECK (
        (post_id IS NOT NULL AND thread_id IS NULL)
        OR (post_id IS NULL AND thread_id IS NOT NULL)
    )
);

-- Partial unique indexes for post_likes (only enforce uniqueness where column is NOT NULL)
CREATE UNIQUE INDEX idx_post_likes_post_user
    ON post_likes(post_id, user_id) WHERE post_id IS NOT NULL;
CREATE UNIQUE INDEX idx_post_likes_thread_user
    ON post_likes(thread_id, user_id) WHERE thread_id IS NOT NULL;

-- --------------------------------------------------------------------------
-- photos
-- --------------------------------------------------------------------------
CREATE TABLE photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    uploader_id UUID NOT NULL REFERENCES profiles(id),
    thread_id UUID REFERENCES threads(id) ON DELETE SET NULL,
    post_id UUID REFERENCES posts(id) ON DELETE SET NULL,
    storage_path TEXT NOT NULL,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    caption VARCHAR(300),
    location_tag VARCHAR(100),
    width INTEGER,
    height INTEGER,
    file_size INTEGER,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- --------------------------------------------------------------------------
-- notifications
-- --------------------------------------------------------------------------
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(200),
    message TEXT,
    reference_type VARCHAR(50),
    reference_id UUID,
    actor_id UUID REFERENCES profiles(id),
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- --------------------------------------------------------------------------
-- reports (content moderation)
-- --------------------------------------------------------------------------
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES profiles(id),
    content_type VARCHAR(50) NOT NULL,
    content_id UUID NOT NULL,
    reason VARCHAR(500) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending'
        CONSTRAINT report_status_check CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed')),
    moderator_id UUID REFERENCES profiles(id),
    moderator_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    resolved_at TIMESTAMPTZ
);

-- ============================================================================
-- 3. INDEXES
-- ============================================================================

-- profiles
CREATE INDEX idx_profiles_username ON profiles(username);

-- threads
CREATE INDEX idx_threads_category_id ON threads(category_id);
CREATE INDEX idx_threads_author_id ON threads(author_id);
CREATE INDEX idx_threads_slug ON threads(slug);
CREATE INDEX idx_threads_created_at ON threads(created_at DESC);
CREATE INDEX idx_threads_pinned_reply ON threads(is_pinned DESC, last_reply_at DESC NULLS LAST);

-- posts
CREATE INDEX idx_posts_thread_id ON posts(thread_id);
CREATE INDEX idx_posts_author_id ON posts(author_id);
CREATE INDEX idx_posts_created_at ON posts(created_at);

-- post_likes
CREATE INDEX idx_post_likes_user_id ON post_likes(user_id);

-- photos
CREATE INDEX idx_photos_uploader_id ON photos(uploader_id);
CREATE INDEX idx_photos_thread_id ON photos(thread_id);

-- notifications
CREATE INDEX idx_notifications_user_read_date ON notifications(user_id, is_read, created_at DESC);

-- reports
CREATE INDEX idx_reports_status_date ON reports(status, created_at);

-- ============================================================================
-- 4. FULL TEXT SEARCH
-- ============================================================================

-- GIN index on the search_vector column
CREATE INDEX idx_threads_search ON threads USING GIN(search_vector);

-- Function to build the search vector from title + content
CREATE OR REPLACE FUNCTION threads_search_vector_update()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.content, '')), 'B');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update search_vector on INSERT or UPDATE of title/content
CREATE TRIGGER trg_threads_search_vector
    BEFORE INSERT OR UPDATE OF title, content ON threads
    FOR EACH ROW
    EXECUTE FUNCTION threads_search_vector_update();

-- Search function: searches across threads and posts, returns ranked results
CREATE OR REPLACE FUNCTION search_posts(search_query TEXT)
RETURNS TABLE (
    id UUID,
    result_type TEXT,
    title TEXT,
    content_preview TEXT,
    author_id UUID,
    thread_id UUID,
    thread_slug TEXT,
    created_at TIMESTAMPTZ,
    rank REAL
) AS $$
DECLARE
    tsquery_val tsquery;
BEGIN
    tsquery_val := plainto_tsquery('english', search_query);

    RETURN QUERY
    -- Search threads by title + content
    SELECT
        t.id,
        'thread'::TEXT AS result_type,
        t.title,
        LEFT(t.content, 200) AS content_preview,
        t.author_id,
        t.id AS thread_id,
        t.slug AS thread_slug,
        t.created_at,
        ts_rank(t.search_vector, tsquery_val) AS rank
    FROM threads t
    WHERE t.search_vector @@ tsquery_val
      AND t.is_deleted = false

    UNION ALL

    -- Search posts (replies) by content
    SELECT
        p.id,
        'post'::TEXT AS result_type,
        t.title,
        LEFT(p.content, 200) AS content_preview,
        p.author_id,
        p.thread_id,
        t.slug AS thread_slug,
        p.created_at,
        ts_rank(to_tsvector('english', p.content), tsquery_val) AS rank
    FROM posts p
    JOIN threads t ON t.id = p.thread_id
    WHERE to_tsvector('english', p.content) @@ tsquery_val
      AND p.is_deleted = false
      AND t.is_deleted = false

    ORDER BY rank DESC
    LIMIT 50;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 5. FUNCTIONS & TRIGGERS
-- ============================================================================

-- --------------------------------------------------------------------------
-- 5a. handle_new_user()
-- Auto-create profile when a new user signs up in auth.users
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_username VARCHAR(30);
    base_username VARCHAR(30);
    username_exists BOOLEAN;
    suffix INTEGER;
BEGIN
    -- Extract part before @ from email, lowercase
    base_username := lower(split_part(NEW.email, '@', 1));

    -- Remove characters that aren't lowercase alphanumeric or hyphens
    base_username := regexp_replace(base_username, '[^a-z0-9-]', '', 'g');

    -- Remove leading hyphens or digits (must start with a letter)
    base_username := regexp_replace(base_username, '^[^a-z]+', '', 'g');

    -- If empty after cleanup, use a fallback
    IF base_username = '' OR base_username IS NULL THEN
        base_username := 'user';
    END IF;

    -- Truncate to leave room for a random suffix
    base_username := LEFT(base_username, 24);

    new_username := base_username;

    -- Check if username is taken; if so, append random suffix
    SELECT EXISTS(SELECT 1 FROM profiles WHERE username = new_username) INTO username_exists;

    suffix := 0;
    WHILE username_exists LOOP
        suffix := suffix + 1;
        new_username := base_username || '-' || floor(random() * 10000)::INTEGER::TEXT;
        SELECT EXISTS(SELECT 1 FROM profiles WHERE username = new_username) INTO username_exists;
        -- Safety valve to prevent infinite loop
        IF suffix > 100 THEN
            new_username := base_username || '-' || extract(epoch FROM now())::INTEGER::TEXT;
            EXIT;
        END IF;
    END LOOP;

    INSERT INTO profiles (id, username, full_name, avatar_url)
    VALUES (
        NEW.id,
        new_username,
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'avatar_url', '')
    );

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger on auth.users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION handle_new_user();

-- --------------------------------------------------------------------------
-- 5b. update_updated_at()
-- Auto-set updated_at = now() on row update
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_threads_updated_at
    BEFORE UPDATE ON threads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_posts_updated_at
    BEFORE UPDATE ON posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- --------------------------------------------------------------------------
-- 5c. increment_thread_counts()
-- When a post is created: increment reply_count on thread, post_count on category
-- When a post is soft-deleted: decrement those counts
-- Also update last_reply_at and last_reply_by on the thread
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION increment_thread_counts()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        -- Increment reply_count on the thread
        UPDATE threads
        SET reply_count = reply_count + 1,
            last_reply_at = NEW.created_at,
            last_reply_by = NEW.author_id
        WHERE id = NEW.thread_id;

        -- Increment post_count on the category
        UPDATE categories
        SET post_count = post_count + 1
        WHERE id = (SELECT category_id FROM threads WHERE id = NEW.thread_id);

        RETURN NEW;
    END IF;

    IF TG_OP = 'UPDATE' THEN
        -- Post soft-deleted (is_deleted changed from false to true)
        IF OLD.is_deleted = false AND NEW.is_deleted = true THEN
            UPDATE threads
            SET reply_count = GREATEST(reply_count - 1, 0)
            WHERE id = NEW.thread_id;

            UPDATE categories
            SET post_count = GREATEST(post_count - 1, 0)
            WHERE id = (SELECT category_id FROM threads WHERE id = NEW.thread_id);

        -- Post un-deleted (is_deleted changed from true to false)
        ELSIF OLD.is_deleted = true AND NEW.is_deleted = false THEN
            UPDATE threads
            SET reply_count = reply_count + 1
            WHERE id = NEW.thread_id;

            UPDATE categories
            SET post_count = post_count + 1
            WHERE id = (SELECT category_id FROM threads WHERE id = NEW.thread_id);
        END IF;

        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_increment_thread_counts
    AFTER INSERT OR UPDATE OF is_deleted ON posts
    FOR EACH ROW
    EXECUTE FUNCTION increment_thread_counts();

-- --------------------------------------------------------------------------
-- 5d. increment_category_thread_count()
-- When a thread is created: increment thread_count on category
-- When a thread is soft-deleted: decrement thread_count on category
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION increment_category_thread_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE categories
        SET thread_count = thread_count + 1
        WHERE id = NEW.category_id;
        RETURN NEW;
    END IF;

    IF TG_OP = 'UPDATE' THEN
        -- Thread soft-deleted
        IF OLD.is_deleted = false AND NEW.is_deleted = true THEN
            UPDATE categories
            SET thread_count = GREATEST(thread_count - 1, 0)
            WHERE id = NEW.category_id;

        -- Thread un-deleted
        ELSIF OLD.is_deleted = true AND NEW.is_deleted = false THEN
            UPDATE categories
            SET thread_count = thread_count + 1
            WHERE id = NEW.category_id;
        END IF;

        RETURN NEW;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_increment_category_thread_count
    AFTER INSERT OR UPDATE OF is_deleted ON threads
    FOR EACH ROW
    EXECUTE FUNCTION increment_category_thread_count();

-- --------------------------------------------------------------------------
-- 5e. update_reputation()
-- Add (or subtract) reputation points for a user
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_reputation(target_user_id UUID, points INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE profiles
    SET reputation_points = GREATEST(reputation_points + points, 0)
    WHERE id = target_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- --------------------------------------------------------------------------
-- 5f. protect_profile_fields()
-- Prevent non-admin users from changing protected profile columns
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION protect_profile_fields()
RETURNS TRIGGER AS $$
DECLARE
    current_user_role user_role;
BEGIN
    -- Look up the role of the user making the request
    SELECT role INTO current_user_role FROM profiles WHERE id = auth.uid();

    -- If not admin or moderator, reset protected fields to their old values
    IF current_user_role IS NULL OR current_user_role NOT IN ('admin', 'moderator') THEN
        NEW.role := OLD.role;
        NEW.reputation_points := OLD.reputation_points;
        NEW.badges := OLD.badges;
        NEW.is_banned := OLD.is_banned;
        NEW.ban_reason := OLD.ban_reason;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_protect_profile_fields
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION protect_profile_fields();

-- --------------------------------------------------------------------------
-- 5g. update_like_count()
-- Keep like_count in sync on threads and posts when post_likes change
-- --------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION update_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.post_id IS NOT NULL THEN
            UPDATE posts SET like_count = like_count + 1 WHERE id = NEW.post_id;
        END IF;
        IF NEW.thread_id IS NOT NULL THEN
            UPDATE threads SET like_count = like_count + 1 WHERE id = NEW.thread_id;
        END IF;
        RETURN NEW;
    END IF;

    IF TG_OP = 'DELETE' THEN
        IF OLD.post_id IS NOT NULL THEN
            UPDATE posts SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.post_id;
        END IF;
        IF OLD.thread_id IS NOT NULL THEN
            UPDATE threads SET like_count = GREATEST(like_count - 1, 0) WHERE id = OLD.thread_id;
        END IF;
        RETURN OLD;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_update_like_count
    AFTER INSERT OR DELETE ON post_likes
    FOR EACH ROW
    EXECUTE FUNCTION update_like_count();

-- ============================================================================
-- 6. ROW LEVEL SECURITY
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE threads ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- --------------------------------------------------------------------------
-- profiles policies
-- --------------------------------------------------------------------------

-- Anyone can read any profile
CREATE POLICY "Profiles are viewable by everyone"
    ON profiles FOR SELECT
    USING (true);

-- Users can update their own profile (protected fields handled by trigger)
CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- No INSERT policy: profiles are created only by the handle_new_user trigger (SECURITY DEFINER)

-- --------------------------------------------------------------------------
-- categories policies
-- --------------------------------------------------------------------------

-- Anyone can read active categories
CREATE POLICY "Active categories are viewable by everyone"
    ON categories FOR SELECT
    USING (is_active = true);

-- Only admins can insert categories
CREATE POLICY "Admins can insert categories"
    ON categories FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
        )
    );

-- Only admins can update categories
CREATE POLICY "Admins can update categories"
    ON categories FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
        )
    );

-- Only admins can delete categories
CREATE POLICY "Admins can delete categories"
    ON categories FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role = 'admin'
        )
    );

-- --------------------------------------------------------------------------
-- threads policies
-- --------------------------------------------------------------------------

-- Anyone can read non-deleted threads
CREATE POLICY "Non-deleted threads are viewable by everyone"
    ON threads FOR SELECT
    USING (is_deleted = false);

-- Admins/mods can also see deleted threads
CREATE POLICY "Admins and mods can view deleted threads"
    ON threads FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role IN ('admin', 'moderator')
        )
    );

-- Authenticated non-banned users can create threads
CREATE POLICY "Authenticated non-banned users can create threads"
    ON threads FOR INSERT
    WITH CHECK (
        auth.uid() = author_id
        AND NOT EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
              AND profiles.is_banned = true
        )
    );

-- Authors can update their own threads
CREATE POLICY "Authors can update own threads"
    ON threads FOR UPDATE
    USING (auth.uid() = author_id AND is_deleted = false)
    WITH CHECK (auth.uid() = author_id);

-- Admins and mods can update any thread
CREATE POLICY "Admins and mods can update any thread"
    ON threads FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role IN ('admin', 'moderator')
        )
    );

-- Soft delete: author can set is_deleted=true on their own thread
CREATE POLICY "Authors can soft-delete own threads"
    ON threads FOR UPDATE
    USING (auth.uid() = author_id)
    WITH CHECK (auth.uid() = author_id);

-- --------------------------------------------------------------------------
-- posts policies
-- --------------------------------------------------------------------------

-- Anyone can read non-deleted posts
CREATE POLICY "Non-deleted posts are viewable by everyone"
    ON posts FOR SELECT
    USING (is_deleted = false);

-- Admins/mods can see deleted posts
CREATE POLICY "Admins and mods can view deleted posts"
    ON posts FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role IN ('admin', 'moderator')
        )
    );

-- Authenticated non-banned users can create posts (thread must not be locked)
CREATE POLICY "Authenticated non-banned users can create posts"
    ON posts FOR INSERT
    WITH CHECK (
        auth.uid() = author_id
        AND NOT EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
              AND profiles.is_banned = true
        )
        AND NOT EXISTS (
            SELECT 1 FROM threads
            WHERE threads.id = thread_id
              AND threads.is_locked = true
        )
    );

-- Authors can update their own posts
CREATE POLICY "Authors can update own posts"
    ON posts FOR UPDATE
    USING (auth.uid() = author_id AND is_deleted = false)
    WITH CHECK (auth.uid() = author_id);

-- Admins and mods can update any post
CREATE POLICY "Admins and mods can update any post"
    ON posts FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role IN ('admin', 'moderator')
        )
    );

-- --------------------------------------------------------------------------
-- post_likes policies
-- --------------------------------------------------------------------------

-- Anyone can read likes
CREATE POLICY "Likes are viewable by everyone"
    ON post_likes FOR SELECT
    USING (true);

-- Authenticated users can like (cannot like own content)
CREATE POLICY "Authenticated users can like others content"
    ON post_likes FOR INSERT
    WITH CHECK (
        auth.uid() = user_id
        AND (
            -- If liking a post, the user must not be the post author
            (post_id IS NOT NULL AND NOT EXISTS (
                SELECT 1 FROM posts WHERE posts.id = post_id AND posts.author_id = auth.uid()
            ))
            OR
            -- If liking a thread, the user must not be the thread author
            (thread_id IS NOT NULL AND NOT EXISTS (
                SELECT 1 FROM threads WHERE threads.id = thread_id AND threads.author_id = auth.uid()
            ))
        )
    );

-- Users can remove their own likes
CREATE POLICY "Users can remove own likes"
    ON post_likes FOR DELETE
    USING (auth.uid() = user_id);

-- --------------------------------------------------------------------------
-- photos policies
-- --------------------------------------------------------------------------

-- Anyone can view photos
CREATE POLICY "Photos are viewable by everyone"
    ON photos FOR SELECT
    USING (true);

-- Authenticated users can upload photos
CREATE POLICY "Authenticated users can upload photos"
    ON photos FOR INSERT
    WITH CHECK (auth.uid() = uploader_id);

-- Uploader or admin/mod can delete photos
CREATE POLICY "Uploaders can delete own photos"
    ON photos FOR DELETE
    USING (auth.uid() = uploader_id);

CREATE POLICY "Admins and mods can delete any photo"
    ON photos FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role IN ('admin', 'moderator')
        )
    );

-- --------------------------------------------------------------------------
-- notifications policies
-- --------------------------------------------------------------------------

-- Users can only see their own notifications
CREATE POLICY "Users can view own notifications"
    ON notifications FOR SELECT
    USING (auth.uid() = user_id);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
    ON notifications FOR DELETE
    USING (auth.uid() = user_id);

-- --------------------------------------------------------------------------
-- reports policies
-- --------------------------------------------------------------------------

-- Authenticated users can create reports
CREATE POLICY "Authenticated users can create reports"
    ON reports FOR INSERT
    WITH CHECK (auth.uid() = reporter_id);

-- Only admin/mod can view reports
CREATE POLICY "Admins and mods can view reports"
    ON reports FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role IN ('admin', 'moderator')
        )
    );

-- Only admin/mod can update reports
CREATE POLICY "Admins and mods can update reports"
    ON reports FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM profiles
            WHERE profiles.id = auth.uid()
              AND profiles.role IN ('admin', 'moderator')
        )
    );

-- ============================================================================
-- 7. STORAGE BUCKET
-- ============================================================================

-- Create the photos storage bucket with public read access
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'photos',
    'photos',
    true,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
);

-- Public read access for the photos bucket
CREATE POLICY "Public read access for photos bucket"
    ON storage.objects FOR SELECT
    USING (bucket_id = 'photos');

-- Authenticated users can upload to the photos bucket
CREATE POLICY "Authenticated users can upload photos"
    ON storage.objects FOR INSERT
    WITH CHECK (
        bucket_id = 'photos'
        AND auth.role() = 'authenticated'
    );

-- Users can update their own uploaded files
CREATE POLICY "Users can update own photos in storage"
    ON storage.objects FOR UPDATE
    USING (
        bucket_id = 'photos'
        AND auth.uid()::TEXT = (storage.foldername(name))[1]
    );

-- Users can delete their own uploaded files
CREATE POLICY "Users can delete own photos in storage"
    ON storage.objects FOR DELETE
    USING (
        bucket_id = 'photos'
        AND auth.uid()::TEXT = (storage.foldername(name))[1]
    );
