import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description: "Cookie Policy for Florence With Locals Community Forum.",
};

export default function CookiePolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-bold text-tuscan-brown">
        Cookie Policy
      </h1>
      <p className="mt-2 text-base text-dark-text/50">
        Last updated: January 1, 2026
      </p>

      <div className="prose mt-8 max-w-none text-dark-text/80">
        <h2>What Are Cookies?</h2>
        <p>
          Cookies are small text files stored on your device by your web
          browser. They are widely used to make websites work efficiently and
          to provide information to site owners.
        </p>

        <h2>Cookies We Use</h2>
        <p>
          The Florence With Locals Forum uses a minimal number of cookies,
          limited to what is strictly necessary for the service to function:
        </p>

        <h3>Essential Cookies (Always Active)</h3>
        <table>
          <thead>
            <tr>
              <th>Cookie</th>
              <th>Purpose</th>
              <th>Duration</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>sb-*-auth-token</td>
              <td>
                Authentication session managed by Supabase. Keeps you logged
                in securely.
              </td>
              <td>Session / 1 week</td>
            </tr>
          </tbody>
        </table>
        <p>
          These cookies are required for the forum to function and cannot be
          disabled. Without them, you would not be able to log in or maintain
          your session.
        </p>

        <h3>Analytics</h3>
        <p>
          We use <strong>Plausible Analytics</strong> for understanding how
          the forum is used. Plausible is a privacy-friendly analytics tool
          that does <strong>not use cookies</strong>, does not collect personal
          data, and does not track individual users across sites. It is fully
          GDPR compliant without requiring cookie consent for analytics.
        </p>

        <h2>Third-Party Cookies</h2>
        <p>
          We do not use any third-party advertising, tracking, or social media
          cookies. No data is shared with advertisers or ad networks.
        </p>

        <h2>Managing Cookies</h2>
        <p>
          You can control cookies through your browser settings. Note that
          disabling essential cookies will prevent you from logging in to the
          forum. For more information about managing cookies, visit{" "}
          <a
            href="https://www.aboutcookies.org"
            target="_blank"
            rel="noopener noreferrer"
            className="text-terracotta hover:underline"
          >
            aboutcookies.org
          </a>
          .
        </p>

        <h2>More Information</h2>
        <p>
          For more details about how we handle your data, see our{" "}
          <Link href="/privacy" className="text-terracotta hover:underline">
            Privacy Policy
          </Link>
          . If you have questions, contact us at{" "}
          <a
            href="mailto:privacy@florencewithlocals.com"
            className="text-terracotta hover:underline"
          >
            privacy@florencewithlocals.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
