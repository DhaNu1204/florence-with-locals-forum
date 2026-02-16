import * as Sentry from "@sentry/nextjs";

export async function GET() {
  try {
    throw new Error("Sentry API Test Error - Florence Forum");
  } catch (error) {
    Sentry.captureException(error);
    return Response.json({
      message: "Error sent to Sentry! Check your dashboard.",
    });
  }
}
