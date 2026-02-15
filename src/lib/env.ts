/**
 * Environment variable validation.
 * Imported at app startup to fail fast if required vars are missing.
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. ` +
        `Check your .env.local file or Vercel environment settings.`
    );
  }
  return value;
}

function optionalEnv(name: string, fallback: string): string {
  return process.env[name] || fallback;
}

/** Public (safe for client-side) */
export const env = {
  NEXT_PUBLIC_SUPABASE_URL: requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
  NEXT_PUBLIC_SITE_URL: optionalEnv(
    "NEXT_PUBLIC_SITE_URL",
    "https://forum.florencewithlocals.com"
  ),
} as const;

/** Server-only (never exposed to client) */
export const serverEnv = {
  SUPABASE_SERVICE_ROLE_KEY: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  RESEND_API_KEY: optionalEnv("RESEND_API_KEY", ""),
  PLAUSIBLE_DOMAIN: optionalEnv(
    "PLAUSIBLE_DOMAIN",
    "forum.florencewithlocals.com"
  ),
} as const;
