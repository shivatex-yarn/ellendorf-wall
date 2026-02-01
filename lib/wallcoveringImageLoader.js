/**
 * Wallcovering Collections Image Loader
 * Auto-converts MB images to KB via Next.js Image Optimization while preserving clarity.
 * Use the returned URL for display/preload; keep original URL for download/PDF/full-size.
 */

// Display sizes: card thumbnails and lightbox get optimized dimensions (KB output)
const CARD_WIDTH = 828;   // Fits grid cards; Next.js serves ~KB
const LIGHTBOX_WIDTH = 1200; // Lightbox; still KB range
const QUALITY = 88;       // High clarity, small size (WebP/AVIF)

/**
 * Returns Next.js Image Optimization URL for a given image.
 * Next.js server fetches the image, resizes, compresses to WebP/AVIF → KB instead of MB.
 * @param {string} url - Original image URL (can be MB)
 * @param {'card'|'lightbox'} size - 'card' for grid/thumb, 'lightbox' for modal
 * @returns {string} Optimized URL (/_next/image?url=...&w=...&q=88) or original if invalid
 */
export function getOptimizedWallcoveringImageUrl(url, size = 'card') {
  if (!url || typeof url !== 'string' || url.startsWith('data:') || url.startsWith('blob:')) {
    return url || '';
  }
  if (url === '/placeholder.jpg') return url;

  const w = size === 'lightbox' ? LIGHTBOX_WIDTH : CARD_WIDTH;
  const q = QUALITY;
  const encoded = encodeURIComponent(url);
  return `/_next/image?url=${encoded}&w=${w}&q=${q}`;
}

/**
 * Preload helper: returns the optimized URL for a given original URL.
 * Use with existing preloadImage(optimizedUrl) so cache keys stay consistent.
 */
export function getOptimizedUrlForPreload(originalUrl, size = 'card') {
  return getOptimizedWallcoveringImageUrl(originalUrl, size);
}

export default getOptimizedWallcoveringImageUrl;
