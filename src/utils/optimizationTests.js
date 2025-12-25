/**
 * Test utility for verifying image and data cache optimizations
 * Use this in browser console to test the optimization implementations
 */

import {
  preloadImage,
  preloadImages,
  isImageCached,
  getCacheStats as getImageCacheStats,
  clearImageCache,
} from "../utils/imageCache";

import {
  prefetchData,
  getCachedData,
  setCachedData,
  getDataCacheStats,
  clearDataCache,
  cleanupExpiredCache,
} from "../utils/dataCache";

/**
 * Run all optimization tests
 */
export async function runOptimizationTests() {
  console.log("🚀 Starting Optimization Tests...\n");

  const results = {
    passed: 0,
    failed: 0,
    tests: [],
  };

  // Test 1: Image Preloading
  console.log("Test 1: Image Preloading");
  try {
    await preloadImage("/Optislipimage.png");
    const isCached = isImageCached("/Optislipimage.png");
    if (isCached) {
      console.log("✅ Image preloading works");
      results.passed++;
      results.tests.push({ name: "Image Preloading", status: "PASS" });
    } else {
      throw new Error("Image not cached after preload");
    }
  } catch (e) {
    console.log("❌ Image preloading failed:", e.message);
    results.failed++;
    results.tests.push({
      name: "Image Preloading",
      status: "FAIL",
      error: e.message,
    });
  }

  // Test 2: Multiple Image Preloading
  console.log("\nTest 2: Multiple Image Preloading");
  try {
    const images = ["/Optislipimage.png", "/logo.png"];
    await preloadImages(images);
    console.log("✅ Multiple image preloading works");
    results.passed++;
    results.tests.push({ name: "Multiple Image Preloading", status: "PASS" });
  } catch (e) {
    console.log("❌ Multiple image preloading failed:", e.message);
    results.failed++;
    results.tests.push({
      name: "Multiple Image Preloading",
      status: "FAIL",
      error: e.message,
    });
  }

  // Test 3: Image Cache Stats
  console.log("\nTest 3: Image Cache Stats");
  try {
    const stats = getImageCacheStats();
    console.log("Image Cache Stats:", stats);
    if (stats.cached >= 0 && stats.loading >= 0) {
      console.log("✅ Image cache stats working");
      results.passed++;
      results.tests.push({ name: "Image Cache Stats", status: "PASS" });
    } else {
      throw new Error("Invalid cache stats");
    }
  } catch (e) {
    console.log("❌ Image cache stats failed:", e.message);
    results.failed++;
    results.tests.push({
      name: "Image Cache Stats",
      status: "FAIL",
      error: e.message,
    });
  }

  // Test 4: Data Caching
  console.log("\nTest 4: Data Caching");
  try {
    const testData = { id: 1, name: "Test Order" };
    setCachedData("test_order", testData, 60000);
    const cached = getCachedData("test_order");
    if (JSON.stringify(cached) === JSON.stringify(testData)) {
      console.log("✅ Data caching works");
      results.passed++;
      results.tests.push({ name: "Data Caching", status: "PASS" });
    } else {
      throw new Error("Cached data does not match");
    }
  } catch (e) {
    console.log("❌ Data caching failed:", e.message);
    results.failed++;
    results.tests.push({
      name: "Data Caching",
      status: "FAIL",
      error: e.message,
    });
  }

  // Test 5: Data Prefetching
  console.log("\nTest 5: Data Prefetching");
  try {
    const fetchFn = () => Promise.resolve({ id: 2, name: "Prefetched Order" });
    const data = await prefetchData("test_prefetch", fetchFn, 60000);
    if (data && data.id === 2) {
      console.log("✅ Data prefetching works");
      results.passed++;
      results.tests.push({ name: "Data Prefetching", status: "PASS" });
    } else {
      throw new Error("Prefetched data invalid");
    }
  } catch (e) {
    console.log("❌ Data prefetching failed:", e.message);
    results.failed++;
    results.tests.push({
      name: "Data Prefetching",
      status: "FAIL",
      error: e.message,
    });
  }

  // Test 6: Cache Expiration
  console.log("\nTest 6: Cache Expiration");
  try {
    const testData = { id: 3, name: "Expiring Order" };
    setCachedData("test_expire", testData, 100); // 100ms TTL

    // Wait for expiration
    await new Promise((resolve) => setTimeout(resolve, 150));

    const expired = getCachedData("test_expire");
    if (expired === null) {
      console.log("✅ Cache expiration works");
      results.passed++;
      results.tests.push({ name: "Cache Expiration", status: "PASS" });
    } else {
      throw new Error("Expired cache still returning data");
    }
  } catch (e) {
    console.log("❌ Cache expiration failed:", e.message);
    results.failed++;
    results.tests.push({
      name: "Cache Expiration",
      status: "FAIL",
      error: e.message,
    });
  }

  // Test 7: Data Cache Stats
  console.log("\nTest 7: Data Cache Stats");
  try {
    const stats = getDataCacheStats();
    console.log("Data Cache Stats:", stats);
    if (stats.total >= 0 && stats.valid >= 0) {
      console.log("✅ Data cache stats working");
      results.passed++;
      results.tests.push({ name: "Data Cache Stats", status: "PASS" });
    } else {
      throw new Error("Invalid data cache stats");
    }
  } catch (e) {
    console.log("❌ Data cache stats failed:", e.message);
    results.failed++;
    results.tests.push({
      name: "Data Cache Stats",
      status: "FAIL",
      error: e.message,
    });
  }

  // Test 8: Cache Cleanup
  console.log("\nTest 8: Cache Cleanup");
  try {
    const cleaned = cleanupExpiredCache();
    console.log(`Cleaned ${cleaned} expired entries`);
    console.log("✅ Cache cleanup works");
    results.passed++;
    results.tests.push({ name: "Cache Cleanup", status: "PASS" });
  } catch (e) {
    console.log("❌ Cache cleanup failed:", e.message);
    results.failed++;
    results.tests.push({
      name: "Cache Cleanup",
      status: "FAIL",
      error: e.message,
    });
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 TEST SUMMARY");
  console.log("=".repeat(50));
  console.log(`Total Tests: ${results.passed + results.failed}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(
    `Success Rate: ${(
      (results.passed / (results.passed + results.failed)) *
      100
    ).toFixed(1)}%`
  );
  console.log("=".repeat(50) + "\n");

  // Detailed Results
  console.table(results.tests);

  // Cleanup
  console.log("\n🧹 Cleaning up test data...");
  clearImageCache();
  clearDataCache();
  console.log("✅ Cleanup complete\n");

  return results;
}

/**
 * Performance benchmark for optimizations
 */
export async function runPerformanceBenchmark() {
  console.log("⚡ Starting Performance Benchmark...\n");

  // Benchmark 1: Image Loading Performance
  console.log("Benchmark 1: Image Loading");
  const imageUrl = "/Optislipimage.png";

  // Without cache (clear first)
  clearImageCache();
  const start1 = performance.now();
  await preloadImage(imageUrl);
  const end1 = performance.now();
  const timeWithoutCache = end1 - start1;
  console.log(`First load (no cache): ${timeWithoutCache.toFixed(2)}ms`);

  // With cache
  const start2 = performance.now();
  await preloadImage(imageUrl);
  const end2 = performance.now();
  const timeWithCache = end2 - start2;
  console.log(`Second load (cached): ${timeWithCache.toFixed(2)}ms`);
  console.log(
    `Speed improvement: ${(
      ((timeWithoutCache - timeWithCache) / timeWithoutCache) *
      100
    ).toFixed(1)}%\n`
  );

  // Benchmark 2: Data Fetching Performance
  console.log("Benchmark 2: Data Fetching");
  clearDataCache();

  const mockFetch = () =>
    new Promise((resolve) => {
      setTimeout(() => resolve({ id: 1, data: "test" }), 50);
    });

  // Without cache
  const start3 = performance.now();
  await prefetchData("bench_test", mockFetch, 60000);
  const end3 = performance.now();
  const dataTimeWithoutCache = end3 - start3;
  console.log(`First fetch (no cache): ${dataTimeWithoutCache.toFixed(2)}ms`);

  // With cache
  const start4 = performance.now();
  getCachedData("bench_test");
  const end4 = performance.now();
  const dataTimeWithCache = end4 - start4;
  console.log(`Second fetch (cached): ${dataTimeWithCache.toFixed(2)}ms`);
  console.log(
    `Speed improvement: ${(
      ((dataTimeWithoutCache - dataTimeWithCache) / dataTimeWithoutCache) *
      100
    ).toFixed(1)}%\n`
  );

  // Cleanup
  clearImageCache();
  clearDataCache();

  console.log("✅ Benchmark complete\n");
}

/**
 * Monitor cache performance in real-time
 */
export function monitorCachePerformance(intervalMs = 5000) {
  console.log("📊 Starting Cache Performance Monitor...\n");

  const interval = setInterval(() => {
    console.log("=".repeat(50));
    console.log("Cache Performance Snapshot");
    console.log("=".repeat(50));
    console.log("Image Cache:", getImageCacheStats());
    console.log("Data Cache:", getDataCacheStats());
    console.log("Timestamp:", new Date().toLocaleTimeString());
    console.log("=".repeat(50) + "\n");
  }, intervalMs);

  // Return function to stop monitoring
  return () => {
    clearInterval(interval);
    console.log("⏹️ Cache monitoring stopped\n");
  };
}

// Export for use in browser console
if (typeof window !== "undefined") {
  window.optimizationTests = {
    runTests: runOptimizationTests,
    runBenchmark: runPerformanceBenchmark,
    monitor: monitorCachePerformance,
    imageCache: {
      getStats: getImageCacheStats,
      clear: clearImageCache,
      preload: preloadImage,
      preloadMultiple: preloadImages,
      isImageCached,
    },
    dataCache: {
      getStats: getDataCacheStats,
      clear: clearDataCache,
      cleanup: cleanupExpiredCache,
      prefetch: prefetchData,
      get: getCachedData,
      set: setCachedData,
    },
  };

  console.log("✅ Optimization test utilities loaded!");
  console.log("Run window.optimizationTests.runTests() to test");
  console.log("Run window.optimizationTests.runBenchmark() to benchmark");
  console.log("Run window.optimizationTests.monitor() to monitor");
}
