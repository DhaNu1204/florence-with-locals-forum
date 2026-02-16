"use client";

export default function SentryTestPage() {
  return (
    <div style={{ padding: "2rem", textAlign: "center" }}>
      <h1>Sentry Test Page</h1>
      <p>Click the button to trigger a test error and verify Sentry is working.</p>
      <button
        onClick={() => {
          throw new Error("Sentry Frontend Test Error - Florence Forum");
        }}
        style={{
          backgroundColor: "#C75B39",
          color: "white",
          border: "none",
          padding: "0.75rem 1.5rem",
          borderRadius: "0.5rem",
          cursor: "pointer",
          margin: "0.5rem",
        }}
      >
        Throw Frontend Error
      </button>
      <button
        onClick={async () => {
          const response = await fetch("/api/sentry-test");
          const data = await response.json();
          alert(data.message || "Check Sentry dashboard");
        }}
        style={{
          backgroundColor: "#5D4037",
          color: "white",
          border: "none",
          padding: "0.75rem 1.5rem",
          borderRadius: "0.5rem",
          cursor: "pointer",
          margin: "0.5rem",
        }}
      >
        Throw API Error
      </button>
    </div>
  );
}
