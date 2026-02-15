import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <p className="text-6xl">&#x1F5FA;&#xFE0F;</p>
      <h1 className="mt-6 font-heading text-3xl font-bold text-tuscan-brown">
        Page Not Found
      </h1>
      <p className="mt-3 text-dark-text/60">
        Looks like you&apos;ve wandered off the beaten path! The page you&apos;re
        looking for doesn&apos;t exist or has been moved.
      </p>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Link href="/">
          <Button>Go Back Home</Button>
        </Link>
        <Link href="/search">
          <Button variant="secondary">Search the Forum</Button>
        </Link>
      </div>

      <div className="mt-8 text-sm text-dark-text/40">
        <p>You might also want to:</p>
        <div className="mt-2 flex flex-wrap justify-center gap-4">
          <Link
            href="/"
            className="text-terracotta hover:underline"
          >
            Browse Categories
          </Link>
          <Link
            href="/gallery"
            className="text-terracotta hover:underline"
          >
            View Gallery
          </Link>
        </div>
      </div>
    </div>
  );
}
