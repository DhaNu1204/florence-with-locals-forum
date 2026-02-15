import { z } from "zod";

// --- Auth ---

export const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters.")
    .max(72, "Password must be under 72 characters."),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters.")
    .max(30, "Username must be under 30 characters.")
    .regex(
      /^[a-z0-9_]+$/,
      "Username can only contain lowercase letters, numbers, and underscores."
    ),
});

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

// --- Profile ---

export const updateProfileSchema = z.object({
  username: z
    .string()
    .min(3, "Username must be at least 3 characters.")
    .max(30, "Username must be under 30 characters.")
    .regex(
      /^[a-z0-9_]+$/,
      "Username can only contain lowercase letters, numbers, and underscores."
    ),
  full_name: z.string().max(100, "Name must be under 100 characters.").nullable(),
  bio: z.string().max(500, "Bio must be under 500 characters.").nullable(),
  location: z.string().max(100, "Location must be under 100 characters.").nullable(),
  website: z
    .string()
    .url("Please enter a valid URL.")
    .nullable()
    .or(z.literal("")),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters.")
      .max(72, "Password must be under 72 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

// --- Thread ---

export const createThreadSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required.")
    .max(200, "Title must be under 200 characters."),
  content: z
    .string()
    .min(1, "Content is required.")
    .max(50000, "Content is too long."),
  categorySlug: z.string().min(1, "Category is required."),
  photoIds: z.array(z.string().uuid()).max(20, "Maximum 20 photos per thread."),
});

export const updateThreadSchema = z.object({
  threadId: z.string().uuid("Invalid thread ID."),
  title: z
    .string()
    .min(1, "Title is required.")
    .max(200, "Title must be under 200 characters."),
  content: z
    .string()
    .min(1, "Content is required.")
    .max(50000, "Content is too long."),
});

// --- Post / Reply ---

export const createPostSchema = z.object({
  threadId: z.string().uuid("Invalid thread ID."),
  content: z
    .string()
    .min(1, "Reply cannot be empty.")
    .max(50000, "Reply is too long."),
});

export const updatePostSchema = z.object({
  postId: z.string().uuid("Invalid post ID."),
  content: z
    .string()
    .min(1, "Content cannot be empty.")
    .max(50000, "Content is too long."),
});

// --- Report ---

export const reportContentSchema = z.object({
  contentType: z.enum(["thread", "post", "photo", "profile"]),
  contentId: z.string().min(1, "Content ID is required."),
  reason: z
    .string()
    .min(10, "Please provide a detailed reason (at least 10 characters).")
    .max(2000, "Reason must be under 2000 characters."),
});

// --- Search ---

export const searchSchema = z.object({
  query: z
    .string()
    .min(2, "Search query must be at least 2 characters.")
    .max(200, "Search query is too long."),
});

// --- Admin ---

export const categorySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required.")
    .max(100, "Name must be under 100 characters."),
  slug: z
    .string()
    .min(1, "Slug is required.")
    .max(100, "Slug must be under 100 characters.")
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens."),
  description: z.string().max(500, "Description must be under 500 characters.").optional(),
  icon: z.string().max(10).optional(),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Color must be a valid hex code.")
    .optional(),
  display_order: z.number().int().min(0).optional(),
});

export const banUserSchema = z.object({
  userId: z.string().uuid("Invalid user ID."),
  reason: z
    .string()
    .min(1, "Ban reason is required.")
    .max(1000, "Reason must be under 1000 characters."),
});

export const changeRoleSchema = z.object({
  userId: z.string().uuid("Invalid user ID."),
  role: z.enum(["member", "guide", "moderator", "admin"]),
});

// --- Helpers ---

/** Validate data against a schema, returning first error or null */
export function validate<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { data: T; error: null } | { data: null; error: string } {
  const result = schema.safeParse(data);
  if (result.success) {
    return { data: result.data, error: null };
  }
  const firstError = result.error.issues[0]?.message || "Validation failed.";
  return { data: null, error: firstError };
}
