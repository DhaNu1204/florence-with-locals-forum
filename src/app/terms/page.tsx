import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms of Service for Florence With Locals Community Forum.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="font-heading text-3xl font-bold text-tuscan-brown">
        Terms of Service
      </h1>
      <p className="mt-2 text-base text-dark-text/50">
        Last updated: January 1, 2026
      </p>

      <div className="prose mt-8 max-w-none text-dark-text/80">
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using the Florence With Locals Community Forum
          (&ldquo;the Service&rdquo;), you agree to be bound by these Terms of Service.
          If you do not agree to these terms, please do not use the Service.
        </p>

        <h2>2. User Accounts</h2>
        <ul>
          <li>You must be at least 16 years old to create an account.</li>
          <li>
            You are responsible for maintaining the security of your account
            credentials.
          </li>
          <li>
            You may not create accounts for the purpose of spam, impersonation,
            or any unlawful activity.
          </li>
          <li>
            We reserve the right to suspend or terminate accounts that violate
            these terms.
          </li>
        </ul>

        <h2>3. Content Guidelines</h2>
        <p>When posting content on the forum, you agree to:</p>
        <ul>
          <li>Be respectful and constructive in discussions</li>
          <li>Not post illegal, harmful, or harassing content</li>
          <li>Not post spam, unsolicited advertisements, or self-promotion</li>
          <li>Not share personal information of others without consent</li>
          <li>
            Not upload content that infringes on intellectual property rights
          </li>
          <li>Follow topic-specific guidelines within each category</li>
        </ul>
        <p>
          Moderators reserve the right to edit, move, or remove content that
          violates these guidelines. Repeated violations may result in
          temporary or permanent suspension of your account.
        </p>

        <h2>4. Intellectual Property</h2>
        <p>
          You retain ownership of the content you post on the forum. By posting
          content, you grant Florence With Locals a non-exclusive, royalty-free
          license to display, distribute, and promote your content within the
          Service. You may delete your content at any time.
        </p>
        <p>
          Photos uploaded to the forum remain the intellectual property of
          the uploader. Other users may not use these photos outside the forum
          without explicit permission.
        </p>

        <h2>5. Limitation of Liability</h2>
        <p>
          The Service is provided &ldquo;as is&rdquo; without warranties of any kind.
          Florence With Locals shall not be liable for any indirect,
          incidental, special, or consequential damages resulting from your use
          of the Service. We do not guarantee the accuracy of user-generated
          content, including travel advice and recommendations.
        </p>

        <h2>6. Governing Law</h2>
        <p>
          These Terms of Service are governed by the laws of Italy and the
          European Union. Any disputes arising from these terms shall be
          subject to the jurisdiction of the courts of Florence, Italy.
        </p>

        <h2>7. Changes to Terms</h2>
        <p>
          We may update these Terms of Service from time to time. We will
          notify users of significant changes via a forum announcement or
          email. Continued use of the Service after changes constitutes
          acceptance of the updated terms.
        </p>

        <h2>8. Contact</h2>
        <p>
          If you have questions about these terms, please contact us at:{" "}
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
