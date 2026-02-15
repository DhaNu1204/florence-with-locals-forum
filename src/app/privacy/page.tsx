import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for Florence With Locals Community Forum.",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-bold text-tuscan-brown">
        Privacy Policy
      </h1>
      <p className="mt-2 text-base text-dark-text/50">
        Last updated: January 1, 2026
      </p>

      <div className="prose mt-8 max-w-none text-dark-text/80">
        <p>
          Florence With Locals (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;) operates the
          Florence With Locals Community Forum at forum.florencewithlocals.com.
          This Privacy Policy explains how we collect, use, and protect your
          personal data in compliance with the General Data Protection Regulation
          (GDPR) and other applicable EU privacy laws.
        </p>

        <h2>1. What Data We Collect</h2>
        <p>We collect the following categories of personal data:</p>
        <ul>
          <li>
            <strong>Account information:</strong> Email address, username, and
            password (hashed) when you create an account.
          </li>
          <li>
            <strong>Profile information:</strong> Full name, bio, location,
            website, and avatar photo that you voluntarily provide.
          </li>
          <li>
            <strong>Content:</strong> Threads, posts, photos, and other content
            you create on the forum.
          </li>
          <li>
            <strong>Usage data:</strong> Page views and basic analytics
            collected through Plausible Analytics (no personal data or cookies).
          </li>
        </ul>

        <h2>2. How We Use Your Data</h2>
        <ul>
          <li>To provide and maintain the forum service</li>
          <li>To manage your account and enable forum participation</li>
          <li>To send essential notifications (replies, mentions)</li>
          <li>To moderate content and enforce community guidelines</li>
          <li>To improve the forum based on aggregated, anonymous analytics</li>
        </ul>

        <h2>3. Cookies</h2>
        <p>
          We use only essential cookies required for authentication and session
          management through Supabase. We do not use advertising or tracking
          cookies. Our analytics provider, Plausible, is completely
          cookie-free and does not track individual users. For more details,
          see our{" "}
          <Link href="/cookie-policy" className="text-terracotta hover:underline">
            Cookie Policy
          </Link>
          .
        </p>

        <h2>4. Third-Party Services</h2>
        <p>We use the following third-party services that may process data:</p>
        <ul>
          <li>
            <strong>Supabase</strong> (EU region) &mdash; Database, authentication,
            and file storage
          </li>
          <li>
            <strong>Vercel</strong> &mdash; Website hosting and deployment
          </li>
          <li>
            <strong>Plausible Analytics</strong> &mdash; Privacy-friendly,
            GDPR-compliant web analytics (no personal data collected, no cookies)
          </li>
          <li>
            <strong>Resend</strong> &mdash; Transactional email delivery
          </li>
        </ul>

        <h2>5. Data Retention</h2>
        <p>
          We retain your personal data for as long as your account is active.
          If you delete your account, your profile data is anonymized and your
          content is soft-deleted within 30 days. Backup copies may be retained
          for up to 90 days for disaster recovery purposes.
        </p>

        <h2>6. Your Rights</h2>
        <p>
          Under the GDPR, you have the following rights regarding your personal
          data:
        </p>
        <ul>
          <li>
            <strong>Right of access:</strong> Request a copy of your data via
            Settings &gt; Export Data.
          </li>
          <li>
            <strong>Right to rectification:</strong> Update your profile
            information at any time in Settings.
          </li>
          <li>
            <strong>Right to erasure:</strong> Delete your account and all
            associated data via Settings &gt; Delete Account.
          </li>
          <li>
            <strong>Right to data portability:</strong> Export your data in a
            machine-readable JSON format.
          </li>
          <li>
            <strong>Right to object:</strong> Contact us to object to specific
            data processing activities.
          </li>
        </ul>

        <h2>7. Contact Information</h2>
        <p>
          For any privacy-related questions or to exercise your rights, please
          contact us at:{" "}
          <a
            href="mailto:privacy@florencewithlocals.com"
            className="text-terracotta hover:underline"
          >
            privacy@florencewithlocals.com
          </a>
        </p>
      </div>
    </div>
  );
}
