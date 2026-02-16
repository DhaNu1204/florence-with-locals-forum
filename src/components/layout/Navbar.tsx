"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/supabase/auth-context";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Category } from "@/types";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { SearchInput } from "@/components/search/SearchInput";

const EXPLORE_SLUGS = ["tourist-info", "tuscan-recipes", "what-to-do", "traveling-tuscany"];

interface NavbarProps {
  categories: Pick<Category, "id" | "name" | "slug" | "icon" | "color">[];
}

export function Navbar({ categories }: NavbarProps) {
  const { user, profile, isLoading, signOut } = useAuth();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);
  const [exploreDropdownOpen, setExploreDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileCatOpen, setMobileCatOpen] = useState(false);
  const [mobileExploreOpen, setMobileExploreOpen] = useState(false);
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  const catRef = useRef<HTMLDivElement>(null);
  const exploreRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  // Split categories into forum categories vs explore categories
  const forumCategories = categories.filter((c) => !EXPLORE_SLUGS.includes(c.slug));
  const exploreCategories = categories.filter((c) => EXPLORE_SLUGS.includes(c.slug));

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (catRef.current && !catRef.current.contains(e.target as Node)) {
        setCatDropdownOpen(false);
      }
      if (exploreRef.current && !exploreRef.current.contains(e.target as Node)) {
        setExploreDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  // Loading timeout — show auth buttons after 2s if still loading
  useEffect(() => {
    if (!isLoading) return;
    const timer = setTimeout(() => setLoadingTimedOut(true), 2000);
    return () => clearTimeout(timer);
  }, [isLoading]);

  const handleSignOut = async () => {
    await signOut();
    setUserDropdownOpen(false);
    setMobileOpen(false);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b-2 border-terracotta/20 bg-white shadow-sm">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center gap-2 shrink-0 min-w-0">
          <div className="min-w-0">
            <span className="font-heading text-lg font-bold text-tuscan-brown sm:text-2xl">
              <span className="hidden min-[400px]:inline">Florence With Locals</span>
              <span className="min-[400px]:hidden">FWL Forum</span>
            </span>
            <span className="ml-2 hidden text-sm text-terracotta sm:inline">
              Community Forum
            </span>
          </div>
        </Link>

        {/* Center: Desktop nav links */}
        <div className="hidden items-center gap-1 lg:flex">
          <NavLink href="/">Home</NavLink>

          {/* Categories dropdown */}
          <div ref={catRef} className="relative">
            <button
              onClick={() => {
                setCatDropdownOpen(!catDropdownOpen);
                setExploreDropdownOpen(false);
              }}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-base font-medium text-dark-text/70 transition-colors hover:bg-light-stone hover:text-dark-text"
            >
              Categories
              <ChevronDownIcon
                className={`h-4 w-4 transition-transform ${catDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>
            {catDropdownOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 min-w-[280px] w-auto rounded-lg border border-gray-100 bg-white py-2 shadow-lg">
                {forumCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/c/${cat.slug}`}
                    onClick={() => setCatDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-base text-dark-text/80 whitespace-nowrap transition-colors hover:bg-warm-cream"
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <span>{cat.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Explore dropdown */}
          <div ref={exploreRef} className="relative">
            <button
              onClick={() => {
                setExploreDropdownOpen(!exploreDropdownOpen);
                setCatDropdownOpen(false);
              }}
              className="flex items-center gap-1 rounded-lg px-3 py-2 text-base font-medium text-dark-text/70 transition-colors hover:bg-light-stone hover:text-dark-text"
            >
              Explore
              <ChevronDownIcon
                className={`h-4 w-4 transition-transform ${exploreDropdownOpen ? "rotate-180" : ""}`}
              />
            </button>
            {exploreDropdownOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 min-w-[250px] w-auto rounded-lg border border-gray-100 bg-white py-2 shadow-lg">
                {exploreCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/c/${cat.slug}`}
                    onClick={() => setExploreDropdownOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 text-base text-dark-text/80 whitespace-nowrap transition-colors hover:bg-warm-cream"
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <span>{cat.name}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <NavLink href="/gallery">Gallery</NavLink>

          <SearchInput />

          <a
            href="https://www.florencewithlocals.com"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 inline-flex items-center gap-1.5 rounded-full bg-olive-green px-5 py-2 text-sm font-bold text-white shadow-md transition-all duration-200 hover:bg-olive-green/90 hover:shadow-lg hover:scale-105 hover:animate-cta-glow"
          >
            <CompassIcon className="h-4 w-4" />
            Book a Tour
          </a>
        </div>

        {/* Right: Auth area */}
        <div className="flex items-center gap-2">
          {/* Desktop auth */}
          <div className="hidden lg:flex lg:items-center lg:gap-2">
            {isLoading && !loadingTimedOut ? (
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 animate-pulse rounded-full bg-light-stone" />
              </div>
            ) : user && profile ? (
              <>
                {/* Notification bell */}
                <NotificationBell />

                {/* User dropdown */}
                <div ref={userRef} className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-light-stone"
                  >
                    <Avatar
                      src={profile.avatar_url}
                      name={profile.full_name || profile.username}
                      size="sm"
                    />
                    <ChevronDownIcon
                      className={`h-4 w-4 text-dark-text/50 transition-transform ${userDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {userDropdownOpen && (
                    <div className="absolute right-0 top-full z-50 mt-1 min-w-[220px] w-auto rounded-lg border border-gray-100 bg-white py-2 shadow-lg">
                      <div className="border-b border-light-stone px-4 pb-2 mb-1">
                        <p className="text-base font-medium text-dark-text whitespace-nowrap">
                          {profile.full_name || profile.username}
                        </p>
                        <p className="text-sm text-dark-text/50 whitespace-nowrap">
                          @{profile.username}
                        </p>
                      </div>
                      <DropdownLink
                        href={`/u/${profile.username}`}
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        Profile
                      </DropdownLink>
                      <DropdownLink
                        href="/settings"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        Settings
                      </DropdownLink>
                      <div className="my-1 border-t border-light-stone" />
                      <button
                        onClick={handleSignOut}
                        className="w-full px-4 py-3 text-left text-base text-red-600 whitespace-nowrap transition-colors hover:bg-red-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : user && !profile ? (
              <>
                <NotificationBell />
                <div ref={userRef} className="relative">
                  <button
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                    className="flex items-center gap-1.5 rounded-lg p-1.5 transition-colors hover:bg-light-stone"
                  >
                    <Avatar
                      name={user.email?.split("@")[0] || "U"}
                      size="sm"
                    />
                    <ChevronDownIcon
                      className={`h-4 w-4 text-dark-text/50 transition-transform ${userDropdownOpen ? "rotate-180" : ""}`}
                    />
                  </button>
                  {userDropdownOpen && (
                    <div className="absolute right-0 top-full z-50 mt-1 min-w-[220px] w-auto rounded-lg border border-gray-100 bg-white py-2 shadow-lg">
                      <div className="border-b border-light-stone px-4 pb-2 mb-1">
                        <p className="text-base font-medium text-dark-text whitespace-nowrap">
                          {user.email?.split("@")[0] || "User"}
                        </p>
                        <p className="text-sm text-dark-text/50 whitespace-nowrap">
                          {user.email || ""}
                        </p>
                      </div>
                      <DropdownLink
                        href="/settings"
                        onClick={() => setUserDropdownOpen(false)}
                      >
                        Settings
                      </DropdownLink>
                      <div className="my-1 border-t border-light-stone" />
                      <button
                        onClick={handleSignOut}
                        className="w-full px-4 py-3 text-left text-base text-red-600 whitespace-nowrap transition-colors hover:bg-red-50"
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => router.push("/auth/login")}
                >
                  Log In
                </Button>
                <Button
                  size="md"
                  onClick={() => router.push("/auth/register")}
                >
                  Sign Up
                </Button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="flex items-center justify-center min-h-[44px] min-w-[44px] rounded-lg text-dark-text/70 transition-colors hover:bg-light-stone lg:hidden"
            aria-label="Open menu"
          >
            <HamburgerIcon className="h-6 w-6" />
          </button>
        </div>
      </nav>

      {/* Mobile slide-in menu */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-sm bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-light-stone px-4">
              <span className="font-heading text-xl font-bold text-tuscan-brown">
                Menu
              </span>
              <button
                onClick={() => setMobileOpen(false)}
                className="rounded-lg p-2 text-dark-text/70 transition-colors hover:bg-light-stone"
              >
                <CloseIcon className="h-6 w-6" />
              </button>
            </div>

            <div className="overflow-y-auto px-4 py-4" style={{ maxHeight: 'calc(100vh - 4rem)' }}>
              {/* Mobile auth header */}
              {isLoading && !loadingTimedOut ? (
                <div className="mb-4 flex items-center gap-3 rounded-lg bg-light-stone p-4">
                  <div className="h-10 w-10 animate-pulse rounded-full bg-dark-text/10" />
                  <div className="space-y-2">
                    <div className="h-4 w-24 animate-pulse rounded bg-dark-text/10" />
                    <div className="h-3 w-16 animate-pulse rounded bg-dark-text/10" />
                  </div>
                </div>
              ) : user && !profile ? (
                <div className="mb-4 flex items-center gap-3 rounded-lg bg-light-stone p-4">
                  <Avatar
                    name={user.email?.split("@")[0] || "U"}
                    size="md"
                  />
                  <div>
                    <p className="text-base font-medium text-dark-text">
                      {user.email?.split("@")[0] || "User"}
                    </p>
                    <p className="text-sm text-dark-text/50">Loading profile...</p>
                  </div>
                </div>
              ) : user && profile ? (
                <div className="mb-4 flex items-center gap-3 rounded-lg bg-light-stone p-4">
                  <Avatar
                    src={profile.avatar_url}
                    name={profile.full_name || profile.username}
                    size="md"
                  />
                  <div>
                    <p className="text-base font-medium text-dark-text">
                      {profile.full_name || profile.username}
                    </p>
                    <p className="text-sm text-dark-text/50">
                      @{profile.username}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="mb-4 flex gap-2">
                  <Button
                    variant="secondary"
                    fullWidth
                    onClick={() => {
                      setMobileOpen(false);
                      router.push("/auth/login");
                    }}
                  >
                    Log In
                  </Button>
                  <Button
                    fullWidth
                    onClick={() => {
                      setMobileOpen(false);
                      router.push("/auth/register");
                    }}
                  >
                    Sign Up
                  </Button>
                </div>
              )}

              {/* Book a Tour CTA - top of mobile menu */}
              <a
                href="https://www.florencewithlocals.com"
                target="_blank"
                rel="noopener noreferrer"
                className="mb-4 flex items-center justify-center gap-2 rounded-full bg-olive-green px-5 py-3 text-base font-bold text-white shadow-md transition-all duration-200 active:scale-95"
              >
                <CompassIcon className="h-5 w-5" />
                Book a Tour
              </a>

              {/* Mobile nav links */}
              <MobileNavLink
                href="/"
                onClick={() => setMobileOpen(false)}
              >
                Home
              </MobileNavLink>

              {/* Mobile Categories - expandable */}
              <div className="mb-2">
                <button
                  onClick={() => setMobileCatOpen(!mobileCatOpen)}
                  className="flex w-full items-center justify-between min-h-[48px] rounded-lg px-3 py-3 text-base font-semibold uppercase tracking-wider text-dark-text/60 transition-colors hover:bg-light-stone"
                >
                  <span>Categories</span>
                  <ChevronDownIcon
                    className={`h-4 w-4 transition-transform ${mobileCatOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {mobileCatOpen && (
                  <div className="ml-2">
                    {forumCategories.map((cat) => (
                      <MobileNavLink
                        key={cat.id}
                        href={`/c/${cat.slug}`}
                        onClick={() => setMobileOpen(false)}
                      >
                        <span className="mr-2">{cat.icon}</span>
                        {cat.name}
                      </MobileNavLink>
                    ))}
                  </div>
                )}
              </div>

              {/* Mobile Explore - expandable */}
              <div className="mb-2">
                <button
                  onClick={() => setMobileExploreOpen(!mobileExploreOpen)}
                  className="flex w-full items-center justify-between min-h-[48px] rounded-lg px-3 py-3 text-base font-semibold uppercase tracking-wider text-olive-green/70 transition-colors hover:bg-light-stone"
                >
                  <span>Explore</span>
                  <ChevronDownIcon
                    className={`h-4 w-4 transition-transform ${mobileExploreOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {mobileExploreOpen && (
                  <div className="ml-2">
                    {exploreCategories.map((cat) => (
                      <MobileNavLink
                        key={cat.id}
                        href={`/c/${cat.slug}`}
                        onClick={() => setMobileOpen(false)}
                      >
                        <span className="mr-2">{cat.icon}</span>
                        {cat.name}
                      </MobileNavLink>
                    ))}
                  </div>
                )}
              </div>

              <MobileNavLink
                href="/gallery"
                onClick={() => setMobileOpen(false)}
              >
                Gallery
              </MobileNavLink>
              <MobileNavLink
                href="/search"
                onClick={() => setMobileOpen(false)}
              >
                Search
              </MobileNavLink>

              {/* Mobile user links */}
              {user && profile && (
                <>
                  <div className="my-3 border-t border-light-stone" />
                  <MobileNavLink
                    href={`/u/${profile.username}`}
                    onClick={() => setMobileOpen(false)}
                  >
                    Profile
                  </MobileNavLink>
                  <MobileNavLink
                    href="/settings"
                    onClick={() => setMobileOpen(false)}
                  >
                    Settings
                  </MobileNavLink>
                  <button
                    onClick={handleSignOut}
                    className="w-full min-h-[48px] rounded-lg px-3 py-3 text-left text-base text-red-600 transition-colors hover:bg-red-50"
                  >
                    Sign Out
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

// --- Sub-components ---

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg px-3 py-2 text-base font-medium text-dark-text/70 transition-colors hover:bg-light-stone hover:text-dark-text"
    >
      {children}
    </Link>
  );
}

function DropdownLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="block px-4 py-3 text-base text-dark-text/80 whitespace-nowrap transition-colors hover:bg-warm-cream"
    >
      {children}
    </Link>
  );
}

function MobileNavLink({
  href,
  onClick,
  children,
}: {
  href: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center min-h-[48px] rounded-lg px-3 py-3 text-base font-medium text-dark-text/80 transition-colors hover:bg-light-stone"
    >
      {children}
    </Link>
  );
}

// --- Icons (inline SVGs to avoid external deps) ---

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  );
}

function HamburgerIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  );
}

function CloseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

function CompassIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <circle cx="12" cy="12" r="9.75" strokeLinecap="round" strokeLinejoin="round" />
      <polygon fill="currentColor" stroke="none" points="12,3.5 13.5,10.5 12,12 10.5,10.5" opacity="0.9" />
      <polygon fill="currentColor" stroke="none" points="12,20.5 10.5,13.5 12,12 13.5,13.5" opacity="0.4" />
      <polygon fill="currentColor" stroke="none" points="3.5,12 10.5,10.5 12,12 10.5,13.5" opacity="0.4" />
      <polygon fill="currentColor" stroke="none" points="20.5,12 13.5,13.5 12,12 13.5,10.5" opacity="0.9" />
    </svg>
  );
}
