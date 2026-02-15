/**
 * Client-side image compression utilities for optimizing photo uploads.
 * Targets ~100-250KB per photo to stay within 1GB Supabase free tier.
 */

const MAX_WIDTH = 1200;
const MAX_HEIGHT = 1200;
const INITIAL_QUALITY = 0.75;
const FALLBACK_QUALITY = 0.6;
const MAX_FILE_SIZE = 500 * 1024; // 500KB
const MAX_INPUT_SIZE = 10 * 1024 * 1024; // 10MB

const THUMB_WIDTH = 400;
const THUMB_QUALITY = 0.5;

export interface CompressedImage {
  blob: Blob;
  thumbnail: Blob;
  originalSize: number;
  compressedSize: number;
  thumbnailSize: number;
  width: number;
  height: number;
  fileName: string;
}

function hasTransparency(file: File): boolean {
  return file.type === "image/png" || file.type === "image/gif";
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
}

function resizeToCanvas(
  img: HTMLImageElement,
  maxWidth: number,
  maxHeight: number
): { canvas: HTMLCanvasElement; width: number; height: number } {
  let { width, height } = img;

  if (width > maxWidth || height > maxHeight) {
    const ratio = Math.min(maxWidth / width, maxHeight / height);
    width = Math.round(width * ratio);
    height = Math.round(height * ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, width, height);

  return { canvas, width, height };
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  mimeType: string,
  quality: number
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Failed to create blob"))),
      mimeType,
      quality
    );
  });
}

/**
 * Checks if a canvas has any transparent pixels.
 * Only samples a subset for performance.
 */
function canvasHasAlpha(canvas: HTMLCanvasElement): boolean {
  const ctx = canvas.getContext("2d")!;
  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  // Sample every 100th pixel for speed
  for (let i = 3; i < data.length; i += 400) {
    if (data[i] < 250) return true;
  }
  return false;
}

export function validateFileSize(file: File): string | null {
  if (file.size > MAX_INPUT_SIZE) {
    return "This file is too large. Please use a photo under 10MB.";
  }
  if (!file.type.startsWith("image/")) {
    return "Only image files are allowed.";
  }
  return null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export async function compressImage(file: File): Promise<CompressedImage> {
  const img = await loadImage(file);

  // Determine output format
  const keepPng = hasTransparency(file);
  const { canvas, width, height } = resizeToCanvas(img, MAX_WIDTH, MAX_HEIGHT);

  let mimeType: string;
  let ext: string;

  if (keepPng && canvasHasAlpha(canvas)) {
    mimeType = "image/png";
    ext = "png";
  } else {
    mimeType = "image/jpeg";
    ext = "jpg";
  }

  // First pass at normal quality
  let blob = await canvasToBlob(
    canvas,
    mimeType,
    mimeType === "image/jpeg" ? INITIAL_QUALITY : 1
  );

  // If still too large and it's JPEG, reduce quality
  if (blob.size > MAX_FILE_SIZE && mimeType === "image/jpeg") {
    blob = await canvasToBlob(canvas, mimeType, FALLBACK_QUALITY);
  }

  // Generate thumbnail
  const { canvas: thumbCanvas } = resizeToCanvas(img, THUMB_WIDTH, THUMB_WIDTH);
  const thumbnail = await canvasToBlob(thumbCanvas, "image/jpeg", THUMB_QUALITY);

  // Revoke the object URL
  URL.revokeObjectURL(img.src);

  const baseName = file.name.replace(/\.[^.]+$/, "").replace(/[^a-z0-9_-]/gi, "-");
  const fileName = `${baseName}.${ext}`;

  return {
    blob,
    thumbnail,
    originalSize: file.size,
    compressedSize: blob.size,
    thumbnailSize: thumbnail.size,
    width,
    height,
    fileName,
  };
}
