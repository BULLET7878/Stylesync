const API = import.meta.env.VITE_API_URL || '';

// A tiny transparent placeholder so onError fires cleanly for missing images
export const FALLBACK_IMG = '/assets/fallback.png';

/**
 * Resolves a product image URL.
 * - Full http/https URLs (Cloudinary, etc.) → returned as-is
 * - Relative paths like /api/upload/image/:id → prefixed with API base
 * - Null/undefined → FALLBACK_IMG (your own branded fallback.png)
 */
export const imgUrl = (src) => {
  if (!src) return FALLBACK_IMG;
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  // Relative path — prefix with API base, avoid double slashes
  return `${API.replace(/\/$/, '')}/${src.replace(/^\//, '')}`;
};
