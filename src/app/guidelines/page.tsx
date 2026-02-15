import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Community Guidelines | Florence With Locals Forum",
  description:
    "Our community guidelines help keep this forum a warm, helpful, and respectful space for all Florence lovers.",
  openGraph: {
    title: "Community Guidelines | Florence With Locals Forum",
    description:
      "Our community guidelines help keep this forum a warm, helpful, and respectful space for all Florence lovers.",
  },
};

const guidelines = [
  {
    icon: "🤝",
    title: "Be Respectful & Kind",
    points: [
      "Treat every member like a fellow traveler sharing a table at a Florentine trattoria.",
      "No harassment, personal attacks, or disrespectful language.",
      "Show extra patience with first-time travelers \u2014 we all started somewhere.",
      "Disagree politely \u2014 different opinions make our community richer.",
    ],
  },
  {
    icon: "🎯",
    title: "Stay On Topic",
    points: [
      "Keep posts relevant to Florence, Tuscany, travel, food, culture, and our tours.",
      "Post in the appropriate category to help others find useful information.",
      "Avoid political discussions and controversial topics unrelated to travel.",
    ],
  },
  {
    icon: "💬",
    title: "Share Genuinely",
    points: [
      "Share your real experiences, tips, and photos.",
      "Don\u2019t post fake reviews or misleading information.",
      "Trip reports with photos are especially valued by our community.",
      "If you\u2019re unsure about something, say so \u2014 someone here will know the answer!",
    ],
  },
  {
    icon: "🚫",
    title: "No Spam or Self-Promotion",
    points: [
      "Don\u2019t advertise your business, blog, or services.",
      "Don\u2019t post affiliate links or promotional content.",
      "Genuine recommendations of places you\u2019ve enjoyed are welcome \u2014 just don\u2019t have a financial interest.",
      "Our guides may share professional tips \u2014 they\u2019ll be marked with a \u201CLocal Expert\u201D badge.",
    ],
  },
  {
    icon: "🔒",
    title: "Respect Privacy",
    points: [
      "Don\u2019t share other people\u2019s personal information.",
      "Ask permission before posting photos of other travelers.",
      "Don\u2019t impersonate other community members or our staff.",
    ],
  },
  {
    icon: "🚩",
    title: "Report, Don\u2019t React",
    points: [
      "If you see a guideline violation, use the Report button \u2014 don\u2019t engage with trolls.",
      "Our moderators will review all reports promptly.",
      "Don\u2019t respond to negativity with more negativity.",
    ],
  },
  {
    icon: "📸",
    title: "Photo Guidelines",
    points: [
      "Share your own photos or photos you have permission to use.",
      "Photos should be related to Florence, Tuscany, or your travel experience.",
      "No offensive, violent, or inappropriate images.",
      "By uploading photos, you grant us permission to display them on the forum.",
    ],
  },
  {
    icon: "🛡️",
    title: "Moderation",
    points: [
      "Our team monitors the forum to keep it safe and welcoming.",
      "We may edit or remove content that violates these guidelines.",
      "Repeated violations may result in account suspension.",
      "Moderator decisions are final.",
    ],
  },
  {
    icon: "📝",
    title: "Content Ownership",
    points: [
      "You own your content but grant us a license to display it on the forum.",
      "We may feature exceptional trip reports and photos on our social media (with credit).",
      "You can request deletion of your content at any time via Settings.",
    ],
  },
];

export default function GuidelinesPage() {
  return (
    <div className="min-h-screen bg-warm-cream">
      {/* Header */}
      <section className="border-b border-light-stone bg-white">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center sm:px-6 lg:px-8">
          <h1 className="font-heading text-4xl font-bold text-tuscan-brown sm:text-5xl">
            Community Guidelines
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-dark-text/60">
            Welcome to our community! These guidelines help us keep this forum a
            warm, helpful, and respectful space for all Florence lovers.
          </p>
        </div>
      </section>

      {/* Guidelines */}
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="space-y-8">
          {guidelines.map((section, index) => (
            <div
              key={index}
              className="rounded-lg border border-light-stone bg-white p-6 sm:p-8"
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-light-stone text-xl">
                  {section.icon}
                </span>
                <h2 className="font-heading text-xl font-bold text-tuscan-brown sm:text-2xl">
                  {index + 1}. {section.title}
                </h2>
              </div>
              <ul className="space-y-2.5 ml-1">
                {section.points.map((point, pointIndex) => (
                  <li
                    key={pointIndex}
                    className="flex items-start gap-2.5 text-base text-dark-text/80 leading-relaxed"
                  >
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-terracotta/60" />
                    {point}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer note */}
        <div className="mt-10 rounded-lg border border-terracotta/20 bg-terracotta/5 p-6 text-center">
          <p className="text-base text-dark-text/60 leading-relaxed">
            These guidelines may be updated from time to time. Last updated:
            February 2026.
            <br />
            Questions? Contact us at{" "}
            <a
              href="mailto:community@florencewithlocals.com"
              className="font-medium text-terracotta hover:underline"
            >
              community@florencewithlocals.com
            </a>
          </p>
        </div>

        {/* Back link */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-base font-medium text-terracotta hover:underline"
          >
            &larr; Back to Forum
          </Link>
        </div>
      </div>
    </div>
  );
}
