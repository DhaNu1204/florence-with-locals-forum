"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html>
      <body
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          fontFamily: "Inter, sans-serif",
          backgroundColor: "#FFF8E7",
          color: "#2C2C2C",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        <h1
          style={{
            fontSize: "1.5rem",
            color: "#5D4037",
            marginBottom: "1rem",
          }}
        >
          Something went wrong
        </h1>
        <p style={{ marginBottom: "1.5rem", maxWidth: "400px" }}>
          We&apos;ve been notified and are looking into it. Please try again.
        </p>
        <button
          onClick={() => reset()}
          style={{
            backgroundColor: "#C75B39",
            color: "white",
            border: "none",
            padding: "0.75rem 1.5rem",
            borderRadius: "0.5rem",
            cursor: "pointer",
            fontSize: "1rem",
          }}
        >
          Try Again
        </button>
      </body>
    </html>
  );
}
