"use server";

import { createClient } from "@/lib/supabase/server";
import { ReportStatus } from "@/types";
import { reportContentSchema, validate } from "@/lib/validations";
import { checkRateLimit, RATE_LIMITS } from "@/lib/utils/rateLimit";

interface ActionResult {
  error?: string;
  success?: boolean;
}

async function requireMod() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase, error: "Not authenticated" as const, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "admin" && profile.role !== "moderator")) {
    return { supabase, error: "Unauthorized" as const, profile: null };
  }

  return { supabase, error: null, profile };
}

// --- Dashboard stats ---

export async function getAdminStats() {
  const { supabase, error } = await requireMod();
  if (error) return null;

  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 86400000).toISOString();

  const [
    totalMembers,
    newMembers,
    totalThreads,
    newThreads,
    totalPosts,
    newPosts,
    totalPhotos,
    newPhotos,
    pendingReports,
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
    supabase.from("threads").select("id", { count: "exact", head: true }).eq("is_deleted", false),
    supabase.from("threads").select("id", { count: "exact", head: true }).eq("is_deleted", false).gte("created_at", weekAgo),
    supabase.from("posts").select("id", { count: "exact", head: true }).eq("is_deleted", false),
    supabase.from("posts").select("id", { count: "exact", head: true }).eq("is_deleted", false).gte("created_at", weekAgo),
    supabase.from("photos").select("id", { count: "exact", head: true }),
    supabase.from("photos").select("id", { count: "exact", head: true }).gte("created_at", weekAgo),
    supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  return {
    totalMembers: totalMembers.count ?? 0,
    newMembers: newMembers.count ?? 0,
    totalThreads: totalThreads.count ?? 0,
    newThreads: newThreads.count ?? 0,
    totalPosts: totalPosts.count ?? 0,
    newPosts: newPosts.count ?? 0,
    totalPhotos: totalPhotos.count ?? 0,
    newPhotos: newPhotos.count ?? 0,
    pendingReports: pendingReports.count ?? 0,
  };
}

export async function getRecentActivity() {
  const { supabase, error } = await requireMod();
  if (error) return [];

  const [threadsRes, usersRes, reportsRes] = await Promise.all([
    supabase
      .from("threads")
      .select("id, title, slug, created_at, profiles:author_id(username)")
      .eq("is_deleted", false)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("profiles")
      .select("id, username, created_at")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("reports")
      .select("id, reason, content_type, created_at, profiles:reporter_id(username)")
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  type ActivityItem = { type: string; description: string; timestamp: string; link?: string };
  const items: ActivityItem[] = [];

  for (const t of (threadsRes.data ?? []) as Record<string, unknown>[]) {
    const profiles = t.profiles as Record<string, unknown> | null;
    items.push({
      type: "thread",
      description: `${profiles?.username ?? "Someone"} created "${t.title as string}"`,
      timestamp: t.created_at as string,
      link: `/t/${t.slug as string}`,
    });
  }

  for (const u of (usersRes.data ?? []) as Record<string, unknown>[]) {
    items.push({
      type: "user",
      description: `${u.username as string} joined the community`,
      timestamp: u.created_at as string,
      link: `/u/${u.username as string}`,
    });
  }

  for (const r of (reportsRes.data ?? []) as Record<string, unknown>[]) {
    const profiles = r.profiles as Record<string, unknown> | null;
    items.push({
      type: "report",
      description: `${profiles?.username ?? "Someone"} reported a ${r.content_type as string}`,
      timestamp: r.created_at as string,
      link: "/admin/reports",
    });
  }

  items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return items.slice(0, 10);
}

// --- Storage monitoring ---

interface StorageUsage {
  totalSizeBytes: number;
  totalSizeMB: number;
  photoCount: number;
  percentUsed: number; // percent of 1GB
}

export async function getStorageUsage(): Promise<StorageUsage | null> {
  const { supabase, error } = await requireMod();
  if (error) return null;

  let totalSize = 0;
  let photoCount = 0;

  // List all objects recursively by paginating through folders
  async function listFolder(prefix: string) {
    const { data, error: listError } = await supabase.storage
      .from("photos")
      .list(prefix, { limit: 1000 });

    if (listError || !data) return;

    for (const item of data) {
      const itemPath = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.metadata && item.metadata.size) {
        // It's a file
        totalSize += Number(item.metadata.size);
        photoCount++;
      } else if (!item.id) {
        // It's a folder — recurse
        await listFolder(itemPath);
      } else if (item.metadata) {
        totalSize += Number(item.metadata.size || 0);
        photoCount++;
      }
    }
  }

  await listFolder("");

  const ONE_GB = 1024 * 1024 * 1024;

  return {
    totalSizeBytes: totalSize,
    totalSizeMB: Math.round((totalSize / (1024 * 1024)) * 10) / 10,
    photoCount,
    percentUsed: Math.round((totalSize / ONE_GB) * 1000) / 10,
  };
}

// --- Reports ---

export async function getReports(statusFilter?: ReportStatus) {
  const { supabase, error } = await requireMod();
  if (error) return [];

  let query = supabase
    .from("reports")
    .select(`
      *,
      reporter:profiles!reports_reporter_id_fkey(id, username, avatar_url)
    `)
    .order("created_at", { ascending: false });

  if (statusFilter) {
    query = query.eq("status", statusFilter);
  }

  const { data } = await query;
  return data ?? [];
}

export async function updateReportStatus(
  reportId: string,
  status: ReportStatus,
  notes?: string
): Promise<ActionResult> {
  const { supabase, error, profile } = await requireMod();
  if (error) return { error };

  const updateData: Record<string, unknown> = {
    status,
    moderator_id: profile!.id,
  };
  if (notes) updateData.moderator_notes = notes;
  if (status === "resolved" || status === "dismissed") {
    updateData.resolved_at = new Date().toISOString();
  }

  const { error: updateError } = await supabase
    .from("reports")
    .update(updateData)
    .eq("id", reportId);

  if (updateError) return { error: "Failed to update report." };
  return { success: true };
}

// --- User management ---

export async function banUser(userId: string, reason: string): Promise<ActionResult> {
  const { supabase, error } = await requireMod();
  if (error) return { error };

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ is_banned: true, ban_reason: reason })
    .eq("id", userId);

  if (updateError) return { error: "Failed to ban user." };
  return { success: true };
}

export async function unbanUser(userId: string): Promise<ActionResult> {
  const { supabase, error } = await requireMod();
  if (error) return { error };

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ is_banned: false, ban_reason: null })
    .eq("id", userId);

  if (updateError) return { error: "Failed to unban user." };
  return { success: true };
}

export async function changeUserRole(
  userId: string,
  role: "member" | "guide" | "moderator" | "admin"
): Promise<ActionResult> {
  const { supabase, error, profile } = await requireMod();
  if (error) return { error };

  // Only admins can change roles
  if (profile!.role !== "admin") return { error: "Only admins can change roles." };

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (updateError) return { error: "Failed to change role." };
  return { success: true };
}

export async function deleteContent(
  contentType: "thread" | "post",
  contentId: string
): Promise<ActionResult> {
  const { supabase, error } = await requireMod();
  if (error) return { error };

  const table = contentType === "thread" ? "threads" : "posts";
  const { error: updateError } = await supabase
    .from(table)
    .update({ is_deleted: true })
    .eq("id", contentId);

  if (updateError) return { error: `Failed to delete ${contentType}.` };
  return { success: true };
}

// --- Category management ---

export async function createCategory(data: {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  display_order?: number;
}): Promise<ActionResult> {
  const { supabase, error, profile } = await requireMod();
  if (error) return { error };
  if (profile!.role !== "admin") return { error: "Only admins can create categories." };

  const { error: insertError } = await supabase.from("categories").insert({
    name: data.name,
    slug: data.slug,
    description: data.description || null,
    icon: data.icon || null,
    color: data.color || null,
    display_order: data.display_order ?? 0,
  });

  if (insertError) return { error: "Failed to create category." };
  return { success: true };
}

export async function updateCategory(
  categoryId: number,
  data: {
    name?: string;
    slug?: string;
    description?: string;
    icon?: string;
    color?: string;
    display_order?: number;
  }
): Promise<ActionResult> {
  const { supabase, error, profile } = await requireMod();
  if (error) return { error };
  if (profile!.role !== "admin") return { error: "Only admins can update categories." };

  const { error: updateError } = await supabase
    .from("categories")
    .update(data)
    .eq("id", categoryId);

  if (updateError) return { error: "Failed to update category." };
  return { success: true };
}

export async function reorderCategories(orderedIds: number[]): Promise<ActionResult> {
  const { supabase, error, profile } = await requireMod();
  if (error) return { error };
  if (profile!.role !== "admin") return { error: "Only admins can reorder categories." };

  for (let i = 0; i < orderedIds.length; i++) {
    await supabase
      .from("categories")
      .update({ display_order: i })
      .eq("id", orderedIds[i]);
  }

  return { success: true };
}

export async function toggleCategoryActive(categoryId: number): Promise<ActionResult> {
  const { supabase, error, profile } = await requireMod();
  if (error) return { error };
  if (profile!.role !== "admin") return { error: "Only admins can toggle categories." };

  const { data: cat } = await supabase
    .from("categories")
    .select("is_active")
    .eq("id", categoryId)
    .single();

  if (!cat) return { error: "Category not found." };

  const { error: updateError } = await supabase
    .from("categories")
    .update({ is_active: !cat.is_active })
    .eq("id", categoryId);

  if (updateError) return { error: "Failed to toggle category." };
  return { success: true };
}

// --- Report content (user-facing) ---

export async function reportContent(
  contentType: "thread" | "post" | "photo" | "profile",
  contentId: string,
  reason: string
): Promise<ActionResult> {
  // Validate input
  const validation = validate(reportContentSchema, { contentType, contentId, reason });
  if (validation.error) return { error: validation.error };

  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "You must be logged in." };

  // Rate limit reports
  const rateCheck = checkRateLimit(
    `report:${user.id}`,
    RATE_LIMITS.REPORT.maxRequests,
    RATE_LIMITS.REPORT.windowMs
  );
  if (!rateCheck.allowed) {
    return { error: "You've submitted too many reports. Please wait a bit." };
  }

  const { error: insertError } = await supabase.from("reports").insert({
    reporter_id: user.id,
    content_type: contentType,
    content_id: contentId,
    reason: reason.trim(),
  });

  if (insertError) return { error: "Failed to submit report." };
  return { success: true };
}
