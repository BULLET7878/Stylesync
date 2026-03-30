export const FALLBACK_IMG = '/assets/fallback.png';

/**
 * Resolves a product image URL.
 *
 * Architecture: Cloudinary for images, MongoDB for text/data.
 * - Full https:// URLs (Cloudinary) → used as-is ✅
 * - Everything else (old GridFS IDs, local paths, null) → fallback ❌
 */
export const imgUrl = (src) => {
  if (!src) return FALLBACK_IMG;
  if (src.startsWith('https://') || src.startsWith('http://')) return src;
  // Old GridFS or local path — not supported anymore. Show fallback.
  return FALLBACK_IMG;
};

