import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login?redirectTo=/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "admin" && profile.role !== "moderator")) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center">
        <div className="rounded-lg bg-red-50 p-8">
          <h1 className="font-heading text-xl font-bold text-red-800">
            Access Denied
          </h1>
          <p className="mt-2 text-base text-red-600">
            You don&apos;t have permission to access the admin dashboard.
          </p>
          <Link
            href="/"
            className="mt-4 inline-block text-base font-medium text-terracotta hover:underline"
          >
            Go back home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="lg:flex lg:gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden shrink-0 lg:block lg:w-56">
          <nav className="sticky top-20 space-y-1">
            <h2 className="mb-3 font-heading text-lg font-bold text-tuscan-brown">
              Admin
            </h2>
            <SidebarLink href="/admin" icon="📊">
              Dashboard
            </SidebarLink>
            <SidebarLink href="/admin/reports" icon="🚩">
              Reports
            </SidebarLink>
            <SidebarLink href="/admin/users" icon="👥">
              Users
            </SidebarLink>
            <SidebarLink href="/admin/categories" icon="📁">
              Categories
            </SidebarLink>
          </nav>
        </aside>

        {/* Mobile top tabs */}
        <div className="mb-6 flex gap-1 overflow-x-auto border-b border-light-stone pb-2 lg:hidden">
          <TabLink href="/admin">Dashboard</TabLink>
          <TabLink href="/admin/reports">Reports</TabLink>
          <TabLink href="/admin/users">Users</TabLink>
          <TabLink href="/admin/categories">Categories</TabLink>
        </div>

        {/* Main content */}
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}

function SidebarLink({
  href,
  icon,
  children,
}: {
  href: string;
  icon: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-base font-medium text-dark-text/70 transition-colors hover:bg-light-stone hover:text-dark-text"
    >
      <span className="text-base">{icon}</span>
      {children}
    </Link>
  );
}

function TabLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="shrink-0 rounded-lg px-4 py-2.5 text-base font-medium text-dark-text/60 transition-colors hover:bg-light-stone hover:text-dark-text"
    >
      {children}
    </Link>
  );
}
