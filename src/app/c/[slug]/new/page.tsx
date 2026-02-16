"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PhotoUploader } from "@/components/ui/PhotoUploader";
import { createThread } from "@/app/actions/thread-actions";
import { uploadPhotos, getUserPhotoQuota } from "@/app/actions/photo-actions";
import { useAuth } from "@/lib/supabase/auth-context";
import type { CompressedImage } from "@/lib/utils/imageCompression";

const RichTextEditor = dynamic(
  () => import("@/components/editor/RichTextEditor").then((mod) => mod.RichTextEditor),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-lg border border-light-stone p-4 min-h-[200px] flex items-center justify-center">
        <p className="text-dark-text/40 text-sm">Loading editor...</p>
      </div>
    ),
  }
);

export default function NewThreadPage() {
  const params = useParams<{ slug: string }>();
  const router = useRouter();
  const { user, profile, isLoading } = useAuth();
  const categorySlug = params.slug;

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<CompressedImage[]>([]);
  const [remainingQuota, setRemainingQuota] = useState<number | null>(null);
  const [maxPerThread, setMaxPerThread] = useState(5);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(`/auth/login?redirectTo=/c/${categorySlug}/new`);
    }
  }, [isLoading, user, router, categorySlug]);

  // Fetch photo quota on mount
  useEffect(() => {
    if (user) {
      getUserPhotoQuota().then((quota) => {
        if (!quota.error) {
          setRemainingQuota(quota.remaining ?? null);
          setMaxPerThread(quota.maxPerThread ?? 5);
        }
      });
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setError("Please enter a title for your thread.");
      return;
    }
    if (trimmedTitle.length > 200) {
      setError("Title must be 200 characters or less.");
      return;
    }

    const trimmedContent = content.trim();
    if (!trimmedContent || trimmedContent === "<p></p>") {
      setError("Please write some content for your thread.");
      return;
    }

    setIsSubmitting(true);

    // 1. Create the thread first (this also tracks inline editor images)
    const result = await createThread(categorySlug, trimmedTitle, trimmedContent, []);

    if (result.error) {
      setError(result.error);
      setIsSubmitting(false);
      return;
    }

    // 2. Upload attached photos if any
    if (selectedPhotos.length > 0 && result.threadId) {
      const formData = new FormData();
      if (result.threadId) formData.append("threadId", result.threadId);
      for (const photo of selectedPhotos) {
        const file = new File([photo.blob], photo.fileName, { type: photo.blob.type });
        formData.append("photos", file);
        const thumb = new File([photo.thumbnail], `thumb-${photo.fileName}`, { type: "image/jpeg" });
        formData.append("thumbnails", thumb);
        formData.append(`width_${photo.fileName}`, String(photo.width));
        formData.append(`height_${photo.fileName}`, String(photo.height));
      }

      await uploadPhotos(formData);
    }

    if (result.slug) {
      router.push(`/t/${result.slug}`);
    }
  };

  // Show loading while auth is being checked or profile is loading
  if (isLoading || !user || !profile) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="space-y-4">
          <div className="h-4 w-48 animate-pulse rounded bg-light-stone" />
          <div className="h-8 w-72 animate-pulse rounded bg-light-stone" />
          <div className="rounded-lg border border-light-stone bg-white p-6">
            <div className="space-y-4">
              <div className="h-10 w-full animate-pulse rounded bg-light-stone" />
              <div className="h-48 w-full animate-pulse rounded bg-light-stone" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6 lg:px-8">
      {/* Breadcrumbs */}
      <nav className="mb-4 text-sm text-dark-text/50">
        <Link href="/" className="hover:text-terracotta transition-colors">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/c/${categorySlug}`}
          className="hover:text-terracotta transition-colors"
        >
          {categorySlug}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-dark-text/70">New Thread</span>
      </nav>

      <h1 className="mb-6 font-heading text-2xl font-bold text-tuscan-brown sm:text-3xl">
        Start a New Discussion
      </h1>

      <form onSubmit={handleSubmit}>
        <div className="space-y-5 rounded-lg border border-light-stone bg-white p-5 sm:p-6">
          {error && (
            <div className="rounded-lg bg-red-50 px-4 py-3 text-base text-red-600">
              {error}
            </div>
          )}

          <Input
            label="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What's your discussion about?"
            maxLength={200}
          />

          <div className="text-right text-sm text-dark-text/40">
            {title.length}/200
          </div>

          <div>
            <label className="mb-1.5 block text-base font-medium text-dark-text">
              Content
            </label>
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Share your thoughts, questions, or experiences..."
            />
          </div>

          {/* Photo Upload Section */}
          <div>
            <div className="mb-3">
              <h3 className="flex items-center gap-2 text-base font-medium text-dark-text">
                <CameraIcon className="h-5 w-5 text-dark-text/40" />
                Attach Photos
              </h3>
              <p className="mt-0.5 text-sm text-dark-text/40">
                Share your Florence photos with the community
              </p>
            </div>
            <PhotoUploader
              onUpload={setSelectedPhotos}
              maxFiles={maxPerThread}
              remainingQuota={remainingQuota}
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <Link
              href={`/c/${categorySlug}`}
              className="text-base text-dark-text/50 transition-colors hover:text-dark-text"
            >
              Cancel
            </Link>
            <Button type="submit" isLoading={isSubmitting}>
              Create Thread
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}

function CameraIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
    </svg>
  );
}
