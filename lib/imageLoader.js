/**
 * Image loader for fast loading and scale (e.g. 300 concurrent users).
 * - NEXT_PUBLIC_CLOUDFRONT_URL: serve images via CloudFront CDN (e.g. https://d1tjlmah25kwg0.cloudfront.net).
 * - NEXT_PUBLIC_IMAGE_LOADER_URL: optional image API/proxy with w/h/q params.
 */

const CARD_WIDTH = 480;
const CARD_HEIGHT = 600;
const PLACEHOLDER_WIDTH = 40;
const DEFAULT_QUALITY = 80;

const urlCache = new Map();

function cacheKey(src, w, h, q, placeholder) {
  return `${src}|${w}|${h}|${q}|${!!placeholder}`;
}

function getCloudFrontBase() {
  if (typeof process === "undefined") return "";
  const base = process.env?.NEXT_PUBLIC_CLOUDFRONT_URL;
  return typeof base === "string" && base.length > 0 ? base.replace(/\/$/, "") : "";
}

/** Rewrite src to CloudFront when NEXT_PUBLIC_CLOUDFRONT_URL is set. */
function rewriteToCloudFront(src) {
  const base = getCloudFrontBase();
  if (!base) return src;
  if (src.startsWith(base)) return src;
  if (src.startsWith("/")) return base + src;
  try {
    const u = new URL(src);
    return base + u.pathname + u.search;
  } catch {
    return src;
  }
}

/**
 * Returns an optimized image URL for fast loading.
 * Uses NEXT_PUBLIC_CLOUDFRONT_URL when set so 300+ users get cached edge responses.
 *
 * @param {string} src - Original image URL
 * @param {{ width?: number, height?: number, quality?: number, placeholder?: boolean }} options
 * @returns {string} URL to use for the img src
 */
export function getOptimizedImageUrl(src, options = {}) {
  if (!src || typeof src !== "string") return src;

  const width = options.width ?? CARD_WIDTH;
  const height = options.height ?? CARD_HEIGHT;
  const quality = options.quality ?? DEFAULT_QUALITY;
  const placeholder = !!options.placeholder;

  const w = placeholder ? PLACEHOLDER_WIDTH : width;
  const h = placeholder ? Math.round((PLACEHOLDER_WIDTH * height) / width) : height;

  const key = cacheKey(src, w, h, quality, placeholder);
  if (urlCache.has(key)) return urlCache.get(key);

  let out = rewriteToCloudFront(src);

  const loaderBase =
    typeof process !== "undefined" && process.env?.NEXT_PUBLIC_IMAGE_LOADER_URL;
  if (loaderBase) {
    const separator = loaderBase.includes("?") ? "&" : "?";
    out = `${loaderBase}${separator}url=${encodeURIComponent(out)}&w=${w}&h=${h}&q=${quality}`;
  }

  urlCache.set(key, out);
  return out;
}

/**
 * Small placeholder URL for blur-up / LQIP (optional).
 */
export function getPlaceholderUrl(src) {
  return getOptimizedImageUrl(src, {
    width: PLACEHOLDER_WIDTH,
    height: PLACEHOLDER_WIDTH,
    quality: 20,
    placeholder: true,
  });
}

/** Sizes suitable for wallpaper cards (4/5 aspect). */
export const CARD_IMAGE_SIZES = { width: CARD_WIDTH, height: CARD_HEIGHT };
