"use server";

import { createClient } from "@/lib/supabase/server";
import { sanitizeHtml } from "@/lib/utils/sanitizeHtml";

interface ActionResult {
  error?: string;
  success?: boolean;
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

  const { error: updateError } = await supabase
    .from("profiles")
    .update({
      username,
      full_name,
      bio: sanitizedBio,
      location,
      website,
    })
    .eq("id", user.id);

  if (updateError) return { error: "Failed to update profile." };
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

  if (uploadError) return { error: "Failed to upload avatar." };

  const { data: urlData } = supabase.storage.from("avatars").getPublicUrl(path);

  const avatarUrl = urlData.publicUrl;

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: avatarUrl })
    .eq("id", user.id);

  if (updateError) return { error: "Failed to update profile avatar." };
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

  if (updateError) return { error: "Failed to update password." };
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
