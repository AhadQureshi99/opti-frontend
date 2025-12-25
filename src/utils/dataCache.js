/**
 * Data prefetching and caching utility for optimizing data loading
 */

const DATA_CACHE = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const PREFETCH_PROMISES = new Map();

/**
 * Cache entry structure
 * @typedef {Object} CacheEntry
 * @property {*} data - Cached data
 * @property {number} timestamp - Cache timestamp
 * @property {number} expiresAt - Expiration timestamp
 */

/**
 * Check if cache entry is still valid
 * @param {CacheEntry} entry - Cache entry to check
 * @returns {boolean}
 */
function isCacheValid(entry) {
  return entry && Date.now() < entry.expiresAt;
}

/**
 * Get data from cache if valid
 * @param {string} key - Cache key
 * @returns {*|null} - Cached data or null
 */
export function getCachedData(key) {
  const entry = DATA_CACHE.get(key);
  if (isCacheValid(entry)) {
    return entry.data;
  }
  // Clean up expired entry
  if (entry) {
    DATA_CACHE.delete(key);
  }
  return null;
}

/**
 * Store data in cache
 * @param {string} key - Cache key
 * @param {*} data - Data to cache
 * @param {number} ttl - Time to live in milliseconds (default: 5 minutes)
 */
export function setCachedData(key, data, ttl = CACHE_TTL) {
  DATA_CACHE.set(key, {
    data,
    timestamp: Date.now(),
    expiresAt: Date.now() + ttl,
  });
}

/**
 * Prefetch data with caching
 * @param {string} key - Cache key
 * @param {Function} fetchFn - Function that returns a promise with the data
 * @param {number} ttl - Time to live in milliseconds
 * @returns {Promise<*>} - Promise resolving to the data
 */
export async function prefetchData(key, fetchFn, ttl = CACHE_TTL) {
  // Return cached data if valid
  const cached = getCachedData(key);
  if (cached !== null) {
    return cached;
  }

  // Return existing prefetch promise if already fetching
  if (PREFETCH_PROMISES.has(key)) {
    return PREFETCH_PROMISES.get(key);
  }

  // Create new prefetch promise
  const promise = fetchFn()
    .then((data) => {
      setCachedData(key, data, ttl);
      PREFETCH_PROMISES.delete(key);
      return data;
    })
    .catch((error) => {
      PREFETCH_PROMISES.delete(key);
      throw error;
    });

  PREFETCH_PROMISES.set(key, promise);
  return promise;
}

/**
 * Invalidate cached data
 * @param {string} key - Cache key to invalidate
 */
export function invalidateCache(key) {
  DATA_CACHE.delete(key);
  PREFETCH_PROMISES.delete(key);
}

/**
 * Clear all cached data
 */
export function clearDataCache() {
  DATA_CACHE.clear();
  PREFETCH_PROMISES.clear();
}

/**
 * Get cache statistics
 * @returns {object} - Cache stats
 */
export function getDataCacheStats() {
  const now = Date.now();
  let validEntries = 0;
  let expiredEntries = 0;

  DATA_CACHE.forEach((entry) => {
    if (now < entry.expiresAt) {
      validEntries++;
    } else {
      expiredEntries++;
    }
  });

  return {
    total: DATA_CACHE.size,
    valid: validEntries,
    expired: expiredEntries,
    fetching: PREFETCH_PROMISES.size,
  };
}

/**
 * Clean up expired cache entries
 */
export function cleanupExpiredCache() {
  const now = Date.now();
  const keysToDelete = [];

  DATA_CACHE.forEach((entry, key) => {
    if (now >= entry.expiresAt) {
      keysToDelete.push(key);
    }
  });

  keysToDelete.forEach((key) => DATA_CACHE.delete(key));

  return keysToDelete.length;
}

// Auto cleanup every 5 minutes
if (typeof window !== "undefined") {
  setInterval(cleanupExpiredCache, 5 * 60 * 1000);
}
