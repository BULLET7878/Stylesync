const API = import.meta.env.VITE_API_URL || '';
const FALLBACK = '/assets/fallback.png';

/**
 * Resolves a product image URL.
 * - Full http/https URLs (Cloudinary, Unsplash, etc.) → returned as-is
 * - Relative paths → prefixed with API base URL
 * - Null/undefined → fallback image
 */
export const imgUrl = (src) => {
  if (!src) return FALLBACK;
  if (src.startsWith('http://') || src.startsWith('https://')) return src;
  // Relative path — prefix with API base, avoid double slashes
  return `${API.replace(/\/$/, '')}/${src.replace(/^\//, '')}`;
};

export const FALLBACK_IMG = FALLBACK;
