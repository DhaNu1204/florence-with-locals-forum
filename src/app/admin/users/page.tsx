import { createClient } from "@/lib/supabase/server";
import { UsersClient } from "./UsersClient";

interface Props {
  searchParams: { q?: string; page?: string; sort?: string };
}

export default async function UsersPage({ searchParams }: Props) {
  const supabase = createClient();
  const page = Math.max(1, parseInt(searchParams.page || "1", 10));
  const pageSize = 25;
  const offset = (page - 1) * pageSize;
  const search = searchParams.q?.trim() || "";
  const sort = searchParams.sort || "newest";

  let query = supabase
    .from("profiles")
    .select("id, username, full_name, avatar_url, role, reputation_points, is_banned, ban_reason, joined_at, created_at", { count: "exact" });

  if (search) {
    query = query.or(`username.ilike.%${search}%,full_name.ilike.%${search}%`);
  }

  if (sort === "reputation") {
    query = query.order("reputation_points", { ascending: false });
  } else if (sort === "oldest") {
    query = query.order("created_at", { ascending: true });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  query = query.range(offset, offset + pageSize - 1);

  const { data: users, count } = await query;
  const totalPages = Math.ceil((count ?? 0) / pageSize);

  return (
    <div>
      <h1 className="font-heading text-2xl font-bold text-dark-text sm:text-3xl">
        Users
      </h1>
      <UsersClient
        initialUsers={users ?? []}
        totalPages={totalPages}
        currentPage={page}
        currentSearch={search}
        currentSort={sort}
      />
    </div>
  );
}
