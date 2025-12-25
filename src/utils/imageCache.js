/**
 * Image caching and preloading utility
 * Optimizes image loading performance by caching loaded images
 * and providing preloading capabilities
 */

const IMAGE_CACHE = new Map();
const LOADING_PROMISES = new Map();

/**
 * Preload an image and cache it
 * @param {string} src - Image URL to preload
 * @returns {Promise<string>} - Resolves with the image src when loaded
 */
export function preloadImage(src) {
  if (!src) return Promise.reject(new Error("No image source provided"));

  // Return cached image immediately
  if (IMAGE_CACHE.has(src)) {
    return Promise.resolve(src);
  }

  // Return existing loading promise if already loading
  if (LOADING_PROMISES.has(src)) {
    return LOADING_PROMISES.get(src);
  }

  // Create new loading promise
  const loadingPromise = new Promise((resolve, reject) => {
    const img = new Image();

    img.onload = () => {
      IMAGE_CACHE.set(src, true);
      LOADING_PROMISES.delete(src);
      resolve(src);
    };

    img.onerror = () => {
      LOADING_PROMISES.delete(src);
      reject(new Error(`Failed to load image: ${src}`));
    };

    // Only set crossOrigin for external URLs
    if (src.startsWith("http") && !src.includes(window.location.hostname)) {
      img.crossOrigin = "anonymous";
    }
    img.src = src;
  });

  LOADING_PROMISES.set(src, loadingPromise);
  return loadingPromise;
}

/**
 * Preload multiple images in parallel
 * @param {string[]} sources - Array of image URLs to preload
 * @returns {Promise<string[]>} - Resolves when all images are loaded
 */
export function preloadImages(sources) {
  const validSources = sources.filter(Boolean);
  return Promise.all(
    validSources.map((src) => preloadImage(src).catch(() => src))
  );
}

/**
 * Check if an image is already cached
 * @param {string} src - Image URL to check
 * @returns {boolean}
 */
export function isImageCached(src) {
  return IMAGE_CACHE.has(src);
}

/**
 * Clear all cached images
 */
export function clearImageCache() {
  IMAGE_CACHE.clear();
  LOADING_PROMISES.clear();
}

/**
 * Remove a specific image from cache
 * @param {string} src - Image URL to remove
 */
export function removeFromCache(src) {
  IMAGE_CACHE.delete(src);
  LOADING_PROMISES.delete(src);
}

/**
 * Invalidate cache for images matching a pattern
 * Useful when uploading new images to force reload
 * @param {string|RegExp} pattern - Pattern to match against image URLs
 * @returns {number} - Number of cache entries removed
 */
export function invalidateImageCache(pattern) {
  let removed = 0;
  const regex = typeof pattern === "string" ? new RegExp(pattern) : pattern;

  const keysToDelete = [];
  IMAGE_CACHE.forEach((_, key) => {
    if (regex.test(key)) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach((key) => {
    IMAGE_CACHE.delete(key);
    LOADING_PROMISES.delete(key);
    removed++;
  });

  return removed;
}

/**
 * Get cache statistics
 * @returns {object} - Cache stats
 */
export function getCacheStats() {
  return {
    cached: IMAGE_CACHE.size,
    loading: LOADING_PROMISES.size,
  };
}
