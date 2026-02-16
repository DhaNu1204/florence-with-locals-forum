"use server";

import * as Sentry from "@sentry/nextjs";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sanitizeHtml } from "@/lib/utils/sanitizeHtml";
import type { Profile } from "@/types";
import { sendWelcomeEmail } from "@/lib/email/send-notifications";

interface ActionResult {
  error?: string;
  success?: boolean;
}

/**
 * Ensures a profile exists for the current user.
 * If no profile row exists (e.g. OAuth user where trigger didn't fire),
 * creates one using the service role client to bypass RLS.
 */
export async function ensureProfile(): Promise<{ profile: Profile | null; error?: string }> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { profile: null, error: "Not authenticated" };

  // Try to fetch existing profile
  const { data: existing } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (existing) return { profile: existing as Profile };

  // No profile exists — create one using admin client (bypasses RLS)
  console.warn("ensureProfile: No profile found for", user.id, "— creating one");

  const admin = createAdminClient();
  const metadata = user.user_metadata || {};

  // Generate username from email prefix (must match DB constraint: ^[a-z][a-z0-9-]*$)
  let baseUsername = (user.email?.split("@")[0] || "user")
    .replace(/[^a-z0-9]/gi, "")
    .toLowerCase()
    .replace(/^[^a-z]+/, "") // strip leading non-letters
    .slice(0, 24) || "user";
  if (!baseUsername || !/^[a-z]/.test(baseUsername)) baseUsername = "user";
  const suffix = Math.random().toString(36).slice(2, 6);
  const username = baseUsername + "-" + suffix;

  const { data: newProfile, error } = await admin
    .from("profiles")
    .insert({
      id: user.id,
      username,
      full_name: metadata.full_name || metadata.name || null,
      avatar_url: metadata.avatar_url || metadata.picture || null,
    })
    .select()
    .single();

  if (error) {
    Sentry.captureException(error, { tags: { action: "ensureProfile" } });
    console.error("ensureProfile: Failed to create profile:", error.message);
    return { profile: null, error: error.message };
  }

  console.log("ensureProfile: Created profile", newProfile?.username, "for", user.id);

  // Send welcome email (fire-and-forget)
  sendWelcomeEmail(user.id, username).catch(() => {});

  return { profile: newProfile as Profile };
}

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const username = (formData.get("username") as string)?.trim().toLowerCase();
  const full_name = (formData.get("full_name") as string)?.trim() || null;
  const bio = (formData.get("bio") as string)?.trim() || null;
  const location = (formData.get("location") as string)?.trim() || null;
  const website = (formData.get("website") as string)?.trim() || null;
  const emailNotificationsRaw = formData.get("email_notifications");
  const email_notifications =
    emailNotificationsRaw !== null ? emailNotificationsRaw === "true" : undefined;

  if (!username || username.length < 3 || username.length > 30) {
    return { error: "Username must be between 3 and 30 characters." };
  }

  if (!/^[a-z0-9_]+$/.test(username)) {
    return { error: "Username can only contain letters, numbers, and underscores." };
  }

  // Check username uniqueness (if changed)
  const { data: currentProfile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  if (currentProfile && currentProfile.username !== username) {
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("username", username)
      .neq("id", user.id)
      .single();

    if (existing) return { error: "This username is already taken." };
  }

  // Sanitize bio
  const sanitizedBio = bio ? sanitizeHtml(bio) : null;

  // Validate website URL
  if (website && !/^https?:\/\/.+/.test(website)) {
    return { error: "Website must start with http:// or https://" };
  }

  const updateData: Record<string, unknown> = {
    username,
    full_name,
    bio: sanitizedBio,
    location,
    website,
  };
  if (email_notifications !== undefined) {
    updateData.email_notifications = email_notifications;
  }

  const { error: updateError } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", user.id);

  if (updateError) {
    Sentry.captureException(updateError, { tags: { action: "updateProfile" } });
    return { error: "Failed to update profile." };
  }
  return { success: true };
}

export async function uploadAvatar(formData: FormData): Promise<ActionResult & { avatarUrl?: string }> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const file = formData.get("avatar") as File;
  if (!file || file.size === 0) return { error: "No file selected." };

  if (file.size > 2 * 1024 * 1024) {
    return { error: "Avatar must be under 2MB." };
  }

  if (!file.type.startsWith("image/")) {
    return { error: "File must be an image." };
  }

  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `avatars/${user.id}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true });

  if (uploadError) {
    Sentry.captureException(uploadError, { tags: { action: "uploadAvatar" } });
    return { error: "Failed to upload avatar." };
  }

  const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);

  const avatarUrl = urlData.publicUrl;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id);

  if (updateError) {
    Sentry.captureException(updateError, { tags: { action: "uploadAvatar" } });
    return { error: "Failed to update profile avatar." };
  }
  return { success: true, avatarUrl };
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<ActionResult> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user || !user.email) return { error: "You must be logged in." };

  if (newPassword.length < 8) {
    return { error: "New password must be at least 8 characters." };
  }

  // Verify current password by attempting sign-in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (signInError) return { error: "Current password is incorrect." };

  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (updateError) {
    Sentry.captureException(updateError, { tags: { action: "changePassword" } });
    return { error: "Failed to update password." };
  }
  return { success: true };
}

export async function exportUserData(): Promise<{ error?: string; data?: string }> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const [profileRes, threadsRes, postsRes, photosRes] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase
      .from("threads")
      .select("id, title, content, created_at")
      .eq("author_id", user.id)
      .eq("is_deleted", false),
    supabase
      .from("posts")
      .select("id, content, created_at, thread_id")
      .eq("author_id", user.id)
      .eq("is_deleted", false),
    supabase
      .from("photos")
      .select("id, caption, url, location_tag, created_at")
      .eq("uploader_id", user.id),
  ]);

  const exportData = {
    exported_at: new Date().toISOString(),
    profile: profileRes.data,
    threads: threadsRes.data || [],
    posts: postsRes.data || [],
    photos: photosRes.data || [],
  };

  return { data: JSON.stringify(exportData, null, 2) };
}

export async function requestAccountDeletion(): Promise<ActionResult> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  // Call the API route that uses service role key for deletion
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://forum.florencewithlocals.com";
  const res = await fetch(`${siteUrl}/api/account/delete`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId: user.id }),
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    return { error: body.error || "Failed to delete account." };
  }

  return { success: true };
}
