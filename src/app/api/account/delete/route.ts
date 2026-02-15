import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { Database } from "@/types";

export async function POST(request: NextRequest) {
  // Verify the requesting user is authenticated
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { userId } = body;

  // Only allow users to delete their own account
  if (userId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Use service role client for admin operations
  const serviceClient = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  try {
    // 1. Anonymize profile
    await serviceClient
      .from("profiles")
      .update({
        username: `deleted_${userId.substring(0, 8)}`,
        full_name: null,
        avatar_url: null,
        bio: null,
        location: null,
        website: null,
        is_banned: true,
        ban_reason: "Account deleted by user (GDPR)",
      })
      .eq("id", userId);

    // 2. Soft-delete all threads
    await serviceClient
      .from("threads")
      .update({ is_deleted: true })
      .eq("author_id", userId);

    // 3. Soft-delete all posts
    await serviceClient
      .from("posts")
      .update({ is_deleted: true })
      .eq("author_id", userId);

    // 4. Delete notifications
    await serviceClient
      .from("notifications")
      .delete()
      .eq("user_id", userId);

    // 5. Delete photos from storage
    const { data: photos } = await serviceClient
      .from("photos")
      .select("storage_path")
      .eq("uploader_id", userId);

    if (photos && photos.length > 0) {
      const paths = photos.map((p) => p.storage_path);
      await serviceClient.storage.from("photos").remove(paths);
    }

    // 6. Delete photo records
    await serviceClient.from("photos").delete().eq("uploader_id", userId);

    // 7. Delete avatar from storage
    const { data: avatarFiles } = await serviceClient.storage
      .from("avatars")
      .list(`avatars/${userId}`);

    if (avatarFiles && avatarFiles.length > 0) {
      const avatarPaths = avatarFiles.map((f) => `avatars/${userId}/${f.name}`);
      await serviceClient.storage.from("avatars").remove(avatarPaths);
    }

    // 8. Delete auth user
    const { error: deleteAuthError } = await serviceClient.auth.admin.deleteUser(
      userId
    );

    if (deleteAuthError) {
      return NextResponse.json(
        { error: "Failed to delete auth account." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Account deletion failed. Please contact support." },
      { status: 500 }
    );
  }
}
