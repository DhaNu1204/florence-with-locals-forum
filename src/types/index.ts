// ============================================================================
// Florence With Locals Forum - Database Types
// Auto-matches the Supabase schema in 001_initial_schema.sql
//
// IMPORTANT: Row/Insert/Update types MUST use `type` (not `interface`) so that
// they satisfy Record<string, unknown> in Supabase's GenericSchema constraint.
// ============================================================================

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export type UserRole = "member" | "guide" | "moderator" | "admin";

export type NotificationType =
  | "reply"
  | "like"
  | "mention"
  | "badge"
  | "announcement";

export type ReportStatus = "pending" | "reviewed" | "resolved" | "dismissed";

export type ContentType = "thread" | "post" | "photo" | "profile";

export type ReferenceType = "thread" | "post" | "profile";

// ---------------------------------------------------------------------------
// Table Row Types (what you get back from SELECT)
// ---------------------------------------------------------------------------

export type Profile = {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: UserRole;
  reputation_points: number;
  badges: unknown[];
  location: string | null;
  website: string | null;
  joined_at: string;
  last_seen_at: string;
  is_banned: boolean;
  ban_reason: string | null;
  email_notifications: boolean;
  created_at: string;
  updated_at: string;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  display_order: number;
  thread_count: number;
  post_count: number;
  is_active: boolean;
  created_at: string;
};

export type Thread = {
  id: string;
  category_id: number;
  author_id: string;
  title: string;
  slug: string;
  content: string;
  is_pinned: boolean;
  is_locked: boolean;
  is_deleted: boolean;
  view_count: number;
  reply_count: number;
  like_count: number;
  last_reply_at: string | null;
  last_reply_by: string | null;
  search_vector: string | null;
  created_at: string;
  updated_at: string;
};

export type Post = {
  id: string;
  thread_id: string;
  author_id: string;
  content: string;
  is_solution: boolean;
  is_deleted: boolean;
  like_count: number;
  created_at: string;
  updated_at: string;
};

export type PostLike = {
  id: string;
  post_id: string | null;
  thread_id: string | null;
  user_id: string;
  created_at: string;
};

export type Photo = {
  id: string;
  uploader_id: string;
  thread_id: string | null;
  post_id: string | null;
  storage_path: string;
  url: string;
  thumbnail_url: string | null;
  caption: string | null;
  location_tag: string | null;
  width: number | null;
  height: number | null;
  file_size: number | null;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string | null;
  message: string | null;
  reference_type: ReferenceType | null;
  reference_id: string | null;
  actor_id: string | null;
  is_read: boolean;
  created_at: string;
};

export type Report = {
  id: string;
  reporter_id: string;
  content_type: ContentType;
  content_id: string;
  reason: string;
  status: ReportStatus;
  moderator_id: string | null;
  moderator_notes: string | null;
  created_at: string;
  resolved_at: string | null;
};

// ---------------------------------------------------------------------------
// Insert Types (what you pass to INSERT — omit auto-generated fields)
// ---------------------------------------------------------------------------

export type ProfileInsert = {
  id: string;
  username: string;
  full_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  role?: UserRole;
  reputation_points?: number;
  badges?: unknown[];
  location?: string | null;
  website?: string | null;
  joined_at?: string;
  last_seen_at?: string;
  is_banned?: boolean;
  ban_reason?: string | null;
  email_notifications?: boolean;
};

export type CategoryInsert = {
  name: string;
  slug: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  display_order?: number;
  thread_count?: number;
  post_count?: number;
  is_active?: boolean;
};

export type ThreadInsert = {
  id?: string;
  category_id: number;
  author_id: string;
  title: string;
  slug: string;
  content: string;
  is_pinned?: boolean;
  is_locked?: boolean;
  is_deleted?: boolean;
  view_count?: number;
  reply_count?: number;
  like_count?: number;
  last_reply_at?: string | null;
  last_reply_by?: string | null;
};

export type PostInsert = {
  id?: string;
  thread_id: string;
  author_id: string;
  content: string;
  is_solution?: boolean;
  is_deleted?: boolean;
  like_count?: number;
};

export type PostLikeInsert = {
  id?: string;
  post_id?: string | null;
  thread_id?: string | null;
  user_id: string;
};

export type PhotoInsert = {
  id?: string;
  uploader_id: string;
  thread_id?: string | null;
  post_id?: string | null;
  storage_path: string;
  url: string;
  thumbnail_url?: string | null;
  caption?: string | null;
  location_tag?: string | null;
  width?: number | null;
  height?: number | null;
  file_size?: number | null;
};

export type NotificationInsert = {
  id?: string;
  user_id: string;
  type: NotificationType;
  title?: string | null;
  message?: string | null;
  reference_type?: ReferenceType | null;
  reference_id?: string | null;
  actor_id?: string | null;
  is_read?: boolean;
};

export type ReportInsert = {
  id?: string;
  reporter_id: string;
  content_type: ContentType;
  content_id: string;
  reason: string;
  status?: ReportStatus;
  moderator_id?: string | null;
  moderator_notes?: string | null;
  resolved_at?: string | null;
};

// ---------------------------------------------------------------------------
// Update Types (all fields optional)
// ---------------------------------------------------------------------------

export type ProfileUpdate = {
  username?: string;
  full_name?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  role?: UserRole;
  reputation_points?: number;
  badges?: unknown[];
  location?: string | null;
  website?: string | null;
  last_seen_at?: string;
  is_banned?: boolean;
  ban_reason?: string | null;
  email_notifications?: boolean;
};

export type CategoryUpdate = {
  name?: string;
  slug?: string;
  description?: string | null;
  icon?: string | null;
  color?: string | null;
  display_order?: number;
  thread_count?: number;
  post_count?: number;
  is_active?: boolean;
};

export type ThreadUpdate = {
  category_id?: number;
  title?: string;
  slug?: string;
  content?: string;
  is_pinned?: boolean;
  is_locked?: boolean;
  is_deleted?: boolean;
  view_count?: number;
  reply_count?: number;
  like_count?: number;
  last_reply_at?: string | null;
  last_reply_by?: string | null;
};

export type PostUpdate = {
  content?: string;
  is_solution?: boolean;
  is_deleted?: boolean;
  like_count?: number;
};

export type PhotoUpdate = {
  thread_id?: string | null;
  post_id?: string | null;
  caption?: string | null;
  location_tag?: string | null;
};

export type NotificationUpdate = {
  is_read?: boolean;
};

export type ReportUpdate = {
  status?: ReportStatus;
  moderator_id?: string | null;
  moderator_notes?: string | null;
  resolved_at?: string | null;
};

// ---------------------------------------------------------------------------
// Supabase Database Type (for createClient<Database>() type safety)
// ---------------------------------------------------------------------------

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: ProfileInsert;
        Update: ProfileUpdate;
        Relationships: [];
      };
      categories: {
        Row: Category;
        Insert: CategoryInsert;
        Update: CategoryUpdate;
        Relationships: [];
      };
      threads: {
        Row: Thread;
        Insert: ThreadInsert;
        Update: ThreadUpdate;
        Relationships: [
          {
            foreignKeyName: "threads_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "threads_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "categories";
            referencedColumns: ["id"];
          },
        ];
      };
      posts: {
        Row: Post;
        Insert: PostInsert;
        Update: PostUpdate;
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey";
            columns: ["author_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "posts_thread_id_fkey";
            columns: ["thread_id"];
            isOneToOne: false;
            referencedRelation: "threads";
            referencedColumns: ["id"];
          },
        ];
      };
      post_likes: {
        Row: PostLike;
        Insert: PostLikeInsert;
        Update: Record<string, never>;
        Relationships: [
          {
            foreignKeyName: "post_likes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      photos: {
        Row: Photo;
        Insert: PhotoInsert;
        Update: PhotoUpdate;
        Relationships: [
          {
            foreignKeyName: "photos_uploader_id_fkey";
            columns: ["uploader_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: Notification;
        Insert: NotificationInsert;
        Update: NotificationUpdate;
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      reports: {
        Row: Report;
        Insert: ReportInsert;
        Update: ReportUpdate;
        Relationships: [
          {
            foreignKeyName: "reports_reporter_id_fkey";
            columns: ["reporter_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      search_posts: {
        Args: { search_query: string };
        Returns: SearchResult[];
      };
      update_reputation: {
        Args: { target_user_id: string; points: number };
        Returns: undefined;
      };
    };
    Enums: {
      user_role: UserRole;
      notification_type: NotificationType;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

// ---------------------------------------------------------------------------
// Function return types
// ---------------------------------------------------------------------------

export type SearchResult = {
  id: string;
  result_type: "thread" | "post";
  title: string;
  content_preview: string;
  author_id: string;
  thread_id: string;
  thread_slug: string;
  created_at: string;
  rank: number;
};

// ---------------------------------------------------------------------------
// Utility types for common joins
// ---------------------------------------------------------------------------

export type ThreadWithAuthor = Thread & {
  author: Pick<Profile, "id" | "username" | "avatar_url" | "role">;
};

export type ThreadWithDetails = ThreadWithAuthor & {
  category: Pick<Category, "id" | "name" | "slug" | "icon" | "color">;
  last_reply_by_profile: Pick<
    Profile,
    "id" | "username" | "avatar_url"
  > | null;
};

export type PostWithAuthor = Post & {
  author: Pick<
    Profile,
    "id" | "username" | "avatar_url" | "role" | "reputation_points"
  >;
};

export type NotificationWithActor = Notification & {
  actor: Pick<Profile, "id" | "username" | "avatar_url"> | null;
};

// ---------------------------------------------------------------------------
// Profile & gallery utility types
// ---------------------------------------------------------------------------

export type ProfileStats = {
  thread_count: number;
  reply_count: number;
  reputation_points: number;
};

export type PhotoWithUploader = Photo & {
  uploader: Pick<Profile, "id" | "username" | "avatar_url">;
};

export type NotificationGroup = {
  label: string;
  notifications: NotificationWithActor[];
};

export type SearchResultWithAuthor = SearchResult & {
  author: Pick<Profile, "id" | "username" | "avatar_url"> | null;
  category_name?: string;
  category_slug?: string;
};
