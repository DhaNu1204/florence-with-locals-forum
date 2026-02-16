"use server";

import * as Sentry from "@sentry/nextjs";
import { createClient } from "@/lib/supabase/server";
import { Photo, PhotoWithUploader, UserRole } from "@/types";
import { extractSupabaseImages } from "@/lib/utils/extractImages";

interface UploadResult {
  error?: string;
  photos?: Photo[];
}

interface GalleryResult {
  error?: string;
  photos?: PhotoWithUploader[];
  hasMore?: boolean;
}

interface QuotaResult {
  error?: string;
  totalPhotos?: number;
  maxTotal?: number;
  maxPerThread?: number;
  remaining?: number;
}

const PAGE_SIZE = 24;
const MAX_FILE_SIZE = 500 * 1024; // 500KB after client compression

// Per-role upload limits
const PHOTO_LIMITS: Record<UserRole, { perThread: number; total: number }> = {
  member: { perThread: 5, total: 50 },
  guide: { perThread: 10, total: 200 },
  moderator: { perThread: 15, total: 500 },
  admin: { perThread: 15, total: 500 },
};

export async function getUserPhotoQuota(): Promise<QuotaResult> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (profile?.role as UserRole) || "member";
  const limits = PHOTO_LIMITS[role];

  const { count } = await supabase
    .from("photos")
    .select("id", { count: "exact", head: true })
    .eq("uploader_id", user.id);

  const totalPhotos = count ?? 0;
  const remaining = Math.max(0, limits.total - totalPhotos);

  return {
    totalPhotos,
    maxTotal: limits.total,
    maxPerThread: limits.perThread,
    remaining,
  };
}

export async function uploadPhotos(formData: FormData): Promise<UploadResult> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  // Get user role and limits
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = (profile?.role as UserRole) || "member";
  const limits = PHOTO_LIMITS[role];

  // Check total photo quota
  const { count: currentCount } = await supabase
    .from("photos")
    .select("id", { count: "exact", head: true })
    .eq("uploader_id", user.id);

  const currentTotal = currentCount ?? 0;

  const threadId = formData.get("threadId") as string | null;
  const postId = formData.get("postId") as string | null;

  const files = formData.getAll("photos") as File[];
  const thumbnails = formData.getAll("thumbnails") as File[];
  if (files.length === 0) return { error: "No files selected." };
  if (files.length > limits.perThread) {
    return { error: `Maximum ${limits.perThread} photos per upload for your role.` };
  }

  if (currentTotal + files.length > limits.total) {
    const remaining = Math.max(0, limits.total - currentTotal);
    return {
      error: `You can only upload ${remaining} more photo${remaining !== 1 ? "s" : ""}. Your limit is ${limits.total} total photos.`,
    };
  }

  const uploadedPhotos: Photo[] = [];
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const thumbnail = thumbnails[i] as File | undefined;

    if (!file.type.startsWith("image/")) continue;

    // Server-side size verification
    if (file.size > MAX_FILE_SIZE) {
      continue; // Skip files that somehow bypassed client compression
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const baseName = file.name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9_-]/gi, "-");

    // Organized path: photos/{year}/{month}/{user_id}/{filename}
    const path = `photos/${year}/${month}/${user.id}/${baseName}-${timestamp}-${random}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("photos")
      .upload(path, file);

    if (uploadError) continue;

    const { data: urlData } = supabase.storage.from("photos").getPublicUrl(path);

    // Upload thumbnail if provided
    let thumbnailUrl: string | null = null;
    if (thumbnail && thumbnail.size > 0) {
      const thumbPath = `photos/${year}/${month}/${user.id}/thumb-${baseName}-${timestamp}-${random}.jpg`;
      const { error: thumbError } = await supabase.storage
        .from("photos")
        .upload(thumbPath, thumbnail);

      if (!thumbError) {
        const { data: thumbUrlData } = supabase.storage
          .from("photos")
          .getPublicUrl(thumbPath);
        thumbnailUrl = thumbUrlData.publicUrl;
      }
    }

    const caption = formData.get(`caption_${file.name}`) as string | null;
    const locationTag = formData.get(`location_${file.name}`) as string | null;

    const widthStr = formData.get(`width_${file.name}`) as string | null;
    const heightStr = formData.get(`height_${file.name}`) as string | null;

    const { data: photo, error: insertError } = await supabase
      .from("photos")
      .insert({
        uploader_id: user.id,
        storage_path: path,
        url: urlData.publicUrl,
        thumbnail_url: thumbnailUrl,
        caption: caption?.trim() || null,
        location_tag: locationTag?.trim() || null,
        file_size: file.size,
        width: widthStr ? parseInt(widthStr, 10) : null,
        height: heightStr ? parseInt(heightStr, 10) : null,
        thread_id: threadId || null,
        post_id: postId || null,
      })
      .select("*")
      .single();

    if (!insertError && photo) {
      uploadedPhotos.push(photo as Photo);
    }
  }

  if (uploadedPhotos.length === 0) {
    Sentry.captureMessage("Photo upload failed: no photos succeeded", {
      level: "warning",
      tags: { action: "uploadPhotos" },
    });
    return { error: "Failed to upload any photos." };
  }

  return { photos: uploadedPhotos };
}

/**
 * Scan HTML content for Supabase-hosted images and ensure each one has a
 * record in the photos table. Called after creating/updating threads and posts.
 */
export async function trackContentImages(
  htmlContent: string,
  uploaderId: string,
  refs: { threadId?: string; postId?: string }
): Promise<void> {
  const images = extractSupabaseImages(htmlContent);
  if (images.length === 0) return;

  const supabase = createClient();

  for (const { url, storagePath } of images) {
    // Check if this image is already tracked
    const { data: existing } = await supabase
      .from("photos")
      .select("id")
      .eq("storage_path", storagePath)
      .maybeSingle();

    if (existing) {
      // Already tracked — update thread/post references if provided
      if (refs.threadId || refs.postId) {
        await supabase
          .from("photos")
          .update({
            ...(refs.threadId ? { thread_id: refs.threadId } : {}),
            ...(refs.postId ? { post_id: refs.postId } : {}),
          })
          .eq("id", existing.id);
      }
      continue;
    }

    // Insert new photo record
    await supabase.from("photos").insert({
      uploader_id: uploaderId,
      storage_path: storagePath,
      url,
      thread_id: refs.threadId || null,
      post_id: refs.postId || null,
      file_size: null,
    });
  }
}

export async function deletePhoto(
  photoId: string
): Promise<{ error?: string }> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  const { data: photo } = await supabase
    .from("photos")
    .select("id, storage_path, thumbnail_url, uploader_id")
    .eq("id", photoId)
    .single();

  if (!photo) return { error: "Photo not found." };

  // Check ownership or admin/mod
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const isOwner = photo.uploader_id === user.id;
  const isMod = profile?.role === "admin" || profile?.role === "moderator";

  if (!isOwner && !isMod) {
    return { error: "You don't have permission to delete this photo." };
  }

  // Delete from storage (main + thumbnail)
  const pathsToDelete = [photo.storage_path];
  if (photo.thumbnail_url) {
    // Extract storage path from thumbnail URL
    const thumbPath = photo.thumbnail_url.split("/photos/").pop();
    if (thumbPath) pathsToDelete.push(`photos/${thumbPath}`);
  }

  await supabase.storage.from("photos").remove(pathsToDelete);

  // Delete from DB
  const { error: deleteError } = await supabase
    .from("photos")
    .delete()
    .eq("id", photoId);

  if (deleteError) {
    Sentry.captureException(deleteError, { tags: { action: "deletePhoto" } });
    return { error: "Failed to delete photo." };
  }
  return {};
}

export async function getGalleryPhotos(
  filters: {
    locationTag?: string;
    sort?: "newest" | "oldest";
  } = {},
  page = 1
): Promise<GalleryResult> {
  const supabase = createClient();

  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE;

  let query = supabase
    .from("photos")
    .select(
      `
      *,
      uploader:profiles!photos_uploader_id_fkey(id, username, avatar_url)
    `
    );

  if (filters.locationTag) {
    query = query.eq("location_tag", filters.locationTag);
  }

  const ascending = filters.sort === "oldest";
  query = query.order("created_at", { ascending }).range(from, to);

  const { data, error } = await query;

  if (error) {
    Sentry.captureException(error, { tags: { action: "getGalleryPhotos" } });
    return { error: "Failed to load photos." };
  }

  const photos = (data || []) as unknown as PhotoWithUploader[];

  return {
    photos: photos.slice(0, PAGE_SIZE),
    hasMore: photos.length > PAGE_SIZE,
  };
}
