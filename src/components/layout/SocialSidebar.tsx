"use client";

import { useState, useEffect } from "react";
import { socialAccounts, socialPosts } from "@/lib/constants/socialPosts";

export function SocialSidebar() {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleCopyLink = async () => {
    const url = "https://forum.florencewithlocals.com";
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Copy link:", url);
    }
  };

  return (
    <div className="rounded-lg border border-light-stone bg-white">
      {/* Follow Us */}
      <div className="p-5">
        <h3 className="font-heading text-lg font-semibold text-tuscan-brown">
          Follow Us
        </h3>

        <div className="mt-3 space-y-3">
          {/* Facebook */}
          <div className="rounded-lg border border-[#1877F2]/15 bg-[#1877F2]/5 p-3">
            <div className="flex items-center gap-2.5">
              <FacebookIcon className="h-8 w-8 shrink-0 text-[#1877F2]" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-dark-text">
                  {socialAccounts.facebook.name}
                </p>
                <p className="text-xs text-dark-text/50">
                  {socialAccounts.facebook.followers} followers
                </p>
              </div>
            </div>
            <a
              href={socialAccounts.facebook.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-[#1877F2] px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-[#1877F2]/90"
            >
              <FacebookIcon className="h-3.5 w-3.5" />
              Follow on Facebook
            </a>
          </div>

          {/* Instagram */}
          <div className="rounded-lg border border-pink-200/50 bg-gradient-to-br from-pink-50/50 to-purple-50/50 p-3">
            <div className="flex items-center gap-2.5">
              <InstagramIcon className="h-8 w-8 shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold text-dark-text">
                  @{socialAccounts.instagram.handle}
                </p>
                <p className="text-xs text-dark-text/50">
                  {socialAccounts.instagram.followers} followers
                </p>
              </div>
            </div>
            <a
              href={socialAccounts.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-[#833AB4] via-[#C13584] to-[#F77737] px-3 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
            >
              <InstagramIcon className="h-3.5 w-3.5 text-white" />
              Follow on Instagram
            </a>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-light-stone" />

      {/* Latest from Social */}
      <div className="p-5">
        <h3 className="font-heading text-lg font-semibold text-tuscan-brown">
          Latest from Our Social
        </h3>
        <div className="mt-3 space-y-2.5">
          {socialPosts.map((post) => (
            <a
              key={post.id}
              href={post.postUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex gap-2.5 rounded-lg p-2 transition-colors hover:bg-light-stone/50"
            >
              <div className="mt-0.5 shrink-0">
                {post.platform === "facebook" ? (
                  <FacebookIcon className="h-4 w-4 text-[#1877F2]" />
                ) : (
                  <InstagramIcon className="h-4 w-4" />
                )}
              </div>
              <div className="min-w-0">
                <p className="line-clamp-2 text-sm text-dark-text/70 group-hover:text-dark-text">
                  {post.text}
                </p>
                <p className="mt-0.5 text-xs text-dark-text/40">
                  {mounted ? formatSocialDate(post.date) : "\u00A0"}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-light-stone" />

      {/* Share the Community */}
      <div className="p-5">
        <h3 className="font-heading text-lg font-semibold text-tuscan-brown">
          Share the Community
        </h3>
        <p className="mt-1 text-sm text-dark-text/50">
          Love Florence? Spread the word!
        </p>
        <div className="mt-3 flex gap-2">
          <a
            href="https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Fforum.florencewithlocals.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#1877F2] px-2 py-2 text-xs font-medium text-white transition-colors hover:bg-[#1877F2]/90"
          >
            <FacebookIcon className="h-3.5 w-3.5" />
            Share
          </a>
          <a
            href="https://api.whatsapp.com/send?text=Join%20the%20Florence%20With%20Locals%20community%20forum!%20https%3A%2F%2Fforum.florencewithlocals.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#25D366] px-2 py-2 text-xs font-medium text-white transition-colors hover:bg-[#25D366]/90"
          >
            <WhatsAppIcon className="h-3.5 w-3.5" />
            WhatsApp
          </a>
          <button
            onClick={handleCopyLink}
            className="relative flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-light-stone px-2 py-2 text-xs font-medium text-dark-text/60 transition-colors hover:bg-light-stone hover:text-dark-text"
          >
            <LinkIcon className="h-3.5 w-3.5" />
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}

function formatSocialDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// --- Inline SVG Icons ---

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <defs>
        <linearGradient id="ig-grad" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#F77737" />
          <stop offset="50%" stopColor="#C13584" />
          <stop offset="100%" stopColor="#833AB4" />
        </linearGradient>
      </defs>
      <path
        fill="url(#ig-grad)"
        d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"
      />
    </svg>
  );
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-2.04a4.5 4.5 0 00-6.364-6.364L5.07 8.398a4.5 4.5 0 001.242 7.244" />
    </svg>
  );
}
