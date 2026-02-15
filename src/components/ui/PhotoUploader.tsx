"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "./Button";
import {
  compressImage,
  validateFileSize,
  formatFileSize,
  type CompressedImage,
} from "@/lib/utils/imageCompression";

interface PhotoUploaderProps {
  onUpload: (files: CompressedImage[]) => void;
  maxFiles?: number;
  multiple?: boolean;
  remainingQuota?: number | null;
}

interface PreviewItem {
  compressed: CompressedImage;
  previewUrl: string;
}

export function PhotoUploader({
  onUpload,
  maxFiles = 10,
  multiple = true,
  remainingQuota = null,
}: PhotoUploaderProps) {
  const [previews, setPreviews] = useState<PreviewItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  const effectiveMax =
    remainingQuota !== null ? Math.min(maxFiles, remainingQuota) : maxFiles;

  const processFiles = useCallback(
    async (fileList: FileList | File[]) => {
      const files = Array.from(fileList);
      const slotsLeft = effectiveMax - previews.length;

      if (slotsLeft <= 0) {
        setErrors(["You've reached the photo limit."]);
        return;
      }

      const newErrors: string[] = [];
      setProcessing(true);

      const toProcess = files.slice(0, slotsLeft);
      const results: PreviewItem[] = [];

      for (const file of toProcess) {
        const validationError = validateFileSize(file);
        if (validationError) {
          newErrors.push(`${file.name}: ${validationError}`);
          continue;
        }

        try {
          const compressed = await compressImage(file);
          results.push({
            compressed,
            previewUrl: URL.createObjectURL(compressed.blob),
          });
        } catch {
          newErrors.push(`${file.name}: Failed to process image.`);
        }
      }

      setErrors(newErrors);
      setPreviews((prev) => [...prev, ...results].slice(0, effectiveMax));
      setProcessing(false);
    },
    [effectiveMax, previews.length]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      processFiles(e.dataTransfer.files);
    },
    [processFiles]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files) processFiles(e.target.files);
      if (inputRef.current) inputRef.current.value = "";
    },
    [processFiles]
  );

  const removeFile = (index: number) => {
    setPreviews((prev) => {
      URL.revokeObjectURL(prev[index].previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleUpload = async () => {
    if (previews.length === 0) return;
    setUploading(true);
    try {
      onUpload(previews.map((p) => p.compressed));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Remaining quota */}
      {remainingQuota !== null && (
        <p className="text-sm text-dark-text/50">
          You can upload {remainingQuota} more photo
          {remainingQuota !== 1 ? "s" : ""}
        </p>
      )}

      {/* Drop zone */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 transition-colors ${
          isDragging
            ? "border-terracotta bg-terracotta/5"
            : "border-light-stone hover:border-terracotta/40"
        }`}
      >
        <UploadIcon className="mb-2 h-8 w-8 text-dark-text/30" />
        {processing ? (
          <p className="text-base font-medium text-dark-text/60">
            Optimizing photos...
          </p>
        ) : (
          <>
            <p className="text-base font-medium text-dark-text/60">
              Drag & drop photos here, or click to browse
            </p>
            <p className="mt-1 text-sm text-dark-text/40">
              Max 10MB per file, up to {effectiveMax} photos. Auto-compressed
              for fast uploads.
            </p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple={multiple}
          onChange={handleChange}
          className="hidden"
        />
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="space-y-1">
          {errors.map((err, i) => (
            <p key={i} className="text-sm text-red-600">
              {err}
            </p>
          ))}
        </div>
      )}

      {/* Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6">
          {previews.map((preview, index) => (
            <div key={index} className="group relative">
              <div className="relative aspect-square overflow-hidden rounded-lg">
                <img
                  src={preview.previewUrl}
                  alt={`Preview ${index + 1}`}
                  className="h-full w-full object-cover"
                />
                {/* Size overlay */}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-1.5 pb-1 pt-4">
                  <p className="text-[10px] leading-tight text-white/90">
                    {formatFileSize(preview.compressed.originalSize)} &rarr;{" "}
                    {formatFileSize(preview.compressed.compressedSize)}
                  </p>
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeFile(index);
                }}
                className="absolute -right-1.5 -top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-sm text-white shadow opacity-100 sm:h-6 sm:w-6 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100"
                aria-label="Remove photo"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload button */}
      {previews.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-dark-text/50">
            {previews.length} photo{previews.length !== 1 ? "s" : ""} selected
          </span>
          <Button onClick={handleUpload} isLoading={uploading} size="sm">
            Upload
          </Button>
        </div>
      )}
    </div>
  );
}

function UploadIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth="1.5"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
      />
    </svg>
  );
}
