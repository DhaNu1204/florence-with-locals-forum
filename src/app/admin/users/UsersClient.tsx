"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatRelativeTime } from "@/lib/utils/formatDate";
import { banUser, unbanUser, changeUserRole } from "@/app/actions/admin-actions";
import { UserRole } from "@/types";

interface UserRow {
  id: string;
  username: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  reputation_points: number;
  is_banned: boolean;
  ban_reason: string | null;
  joined_at: string;
  created_at: string;
}

interface UsersClientProps {
  initialUsers: UserRow[];
  totalPages: number;
  currentPage: number;
  currentSearch: string;
  currentSort: string;
}

export function UsersClient({
  initialUsers,
  totalPages,
  currentPage,
  currentSearch,
  currentSort,
}: UsersClientProps) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState(currentSearch);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (search) params.set("q", search);
    if (currentSort !== "newest") params.set("sort", currentSort);
    router.push(`/admin/users?${params.toString()}`);
  };

  const handleSort = (sort: string) => {
    const params = new URLSearchParams();
    if (currentSearch) params.set("q", currentSearch);
    if (sort !== "newest") params.set("sort", sort);
    router.push(`/admin/users?${params.toString()}`);
  };

  const handleBan = async (userId: string) => {
    const reason = prompt("Ban reason:");
    if (!reason) return;
    setLoading(true);
    const result = await banUser(userId, reason);
    if (result.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_banned: true, ban_reason: reason } : u))
      );
    }
    setLoading(false);
    setOpenDropdown(null);
  };

  const handleUnban = async (userId: string) => {
    setLoading(true);
    const result = await unbanUser(userId);
    if (result.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, is_banned: false, ban_reason: null } : u))
      );
    }
    setLoading(false);
    setOpenDropdown(null);
  };

  const handleRoleChange = async (userId: string, role: UserRole) => {
    setLoading(true);
    const result = await changeUserRole(userId, role);
    if (result.success) {
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role } : u))
      );
    }
    setLoading(false);
    setOpenDropdown(null);
  };

  return (
    <>
      {/* Search and sort */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <form onSubmit={handleSearch} className="flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by username..."
            className="w-full max-w-sm rounded-lg border border-light-stone bg-white px-3 py-2 text-sm text-dark-text placeholder-dark-text/40 focus:border-terracotta/30 focus:outline-none focus:ring-1 focus:ring-terracotta/20"
          />
        </form>
        <select
          value={currentSort}
          onChange={(e) => handleSort(e.target.value)}
          className="rounded-lg border border-light-stone bg-white px-3 py-2 text-sm text-dark-text focus:border-terracotta/30 focus:outline-none"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="reputation">Highest Reputation</option>
        </select>
      </div>

      {/* Users list */}
      <div className="mt-4 space-y-2">
        {users.map((user) => (
          <div
            key={user.id}
            className={`flex flex-wrap items-center gap-4 rounded-lg border bg-white p-4 ${
              user.is_banned ? "border-red-200 bg-red-50/30" : "border-light-stone"
            }`}
          >
            <Avatar
              src={user.avatar_url}
              name={user.full_name || user.username}
              size="sm"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Link
                  href={`/u/${user.username}`}
                  className="text-sm font-medium text-dark-text hover:text-terracotta"
                >
                  {user.username}
                </Link>
                <Badge
                  color={
                    user.role === "admin"
                      ? "#dc2626"
                      : user.role === "moderator"
                        ? "#d97706"
                        : user.role === "guide"
                          ? "#6B8E23"
                          : "#5D4037"
                  }
                >
                  {user.role}
                </Badge>
                {user.is_banned && (
                  <Badge color="#dc2626">Banned</Badge>
                )}
              </div>
              <p className="text-xs text-dark-text/40">
                {user.reputation_points} rep &middot; Joined{" "}
                {formatRelativeTime(user.joined_at)}
              </p>
            </div>

            {/* Actions dropdown */}
            <div className="relative">
              <Button
                size="sm"
                variant="ghost"
                onClick={() =>
                  setOpenDropdown(openDropdown === user.id ? null : user.id)
                }
              >
                Actions
              </Button>
              {openDropdown === user.id && (
                <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border border-light-stone bg-white py-1 shadow-lg">
                  <Link
                    href={`/u/${user.username}`}
                    className="block px-4 py-2 text-sm text-dark-text/80 hover:bg-light-stone"
                    onClick={() => setOpenDropdown(null)}
                  >
                    View Profile
                  </Link>

                  <div className="my-1 border-t border-light-stone" />
                  <p className="px-4 py-1 text-xs font-semibold uppercase text-dark-text/30">
                    Change Role
                  </p>
                  {(["member", "guide", "moderator", "admin"] as UserRole[]).map((role) => (
                    <button
                      key={role}
                      onClick={() => handleRoleChange(user.id, role)}
                      disabled={loading || user.role === role}
                      className={`block w-full px-4 py-1.5 text-left text-sm transition-colors hover:bg-light-stone ${
                        user.role === role
                          ? "font-semibold text-terracotta"
                          : "text-dark-text/70"
                      }`}
                    >
                      {role}
                    </button>
                  ))}

                  <div className="my-1 border-t border-light-stone" />
                  {user.is_banned ? (
                    <button
                      onClick={() => handleUnban(user.id)}
                      disabled={loading}
                      className="block w-full px-4 py-2 text-left text-sm text-olive-green hover:bg-light-stone"
                    >
                      Unban User
                    </button>
                  ) : (
                    <button
                      onClick={() => handleBan(user.id)}
                      disabled={loading}
                      className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                      Ban User
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {currentPage > 1 && (
            <Link
              href={`/admin/users?page=${currentPage - 1}${currentSearch ? `&q=${currentSearch}` : ""}${currentSort !== "newest" ? `&sort=${currentSort}` : ""}`}
              className="rounded-lg border border-light-stone px-3 py-1.5 text-sm text-dark-text/60 transition-colors hover:bg-light-stone"
            >
              Previous
            </Link>
          )}
          <span className="px-3 py-1.5 text-sm text-dark-text/50">
            Page {currentPage} of {totalPages}
          </span>
          {currentPage < totalPages && (
            <Link
              href={`/admin/users?page=${currentPage + 1}${currentSearch ? `&q=${currentSearch}` : ""}${currentSort !== "newest" ? `&sort=${currentSort}` : ""}`}
              className="rounded-lg border border-light-stone px-3 py-1.5 text-sm text-dark-text/60 transition-colors hover:bg-light-stone"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </>
  );
}
