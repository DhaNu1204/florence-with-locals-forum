"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";

interface ErrorProps {
  error: Error;
  reset: () => void;
}

export default function ErrorPage({ reset }: ErrorProps) {
  return (
    <div className="mx-auto max-w-2xl px-4 py-20 text-center">
      <p className="text-5xl">&#x26A0;&#xFE0F;</p>
      <h1 className="mt-6 font-heading text-3xl font-bold text-tuscan-brown">
        Something Went Wrong
      </h1>
      <p className="mt-3 text-dark-text/60">
        We encountered an unexpected error. Please try again or return to the
        homepage.
      </p>

      <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button onClick={reset}>Try Again</Button>
        <Link href="/">
          <Button variant="secondary">Go Home</Button>
        </Link>
      </div>
    </div>
  );
}
