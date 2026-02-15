/**
 * Centralized error handling for server actions.
 */

/** Wrap a server action with consistent error handling */
export async function withErrorHandling<T>(
  fn: () => Promise<T>,
  fallbackMessage = "An unexpected error occurred. Please try again."
): Promise<T | { error: string }> {
  try {
    return await fn();
  } catch (err) {
    console.error("[Server Action Error]", err);

    // Supabase errors
    if (err && typeof err === "object" && "code" in err) {
      const code = (err as { code: string }).code;
      if (code === "23505") return { error: "This already exists." };
      if (code === "23503") return { error: "Referenced item not found." };
      if (code === "PGRST116") return { error: "Item not found." };
    }

    return { error: fallbackMessage };
  }
}

/** Standard action result type */
export type ActionResult<T = void> = T extends void
  ? { error?: string; success?: boolean }
  : { error?: string; success?: boolean } & T;
