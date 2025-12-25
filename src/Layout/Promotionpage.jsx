import { FaTimes } from "react-icons/fa";
import { useEffect, useState } from "react";
import { preloadImage, isImageCached } from "../utils/imageCache";
import { getCachedData, setCachedData } from "../utils/dataCache";

export default function Promotionpage({ onClose }) {
  const [promo, setPromo] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function fetchPromoData() {
      // resolve backend base: prefer VITE_API_BASE, otherwise use current origin
      const envBase =
        (import.meta && import.meta.env && import.meta.env.VITE_API_BASE) || "";
      const baseCandidates = [];

      if (envBase) baseCandidates.push(envBase.replace(/\/$/, ""));
      baseCandidates.push("https://api.optislip.com/api");
      if (
        typeof window !== "undefined" &&
        window.location &&
        window.location.origin
      )
        baseCandidates.push(window.location.origin + "/api");

      // Try backend first
      for (const candidate of baseCandidates) {
        try {
          const url = `${candidate}/promo?ts=${Date.now()}`;
          const res = await fetch(url, { cache: "no-store" });
          if (res.ok) {
            return await res.json();
          }
        } catch (e) {
          console.debug("Backend promo fetch failed", e);
        }
      }

      // Fallback to frontend static
      try {
        const r = await fetch(`/promo.json?ts=${Date.now()}`, {
          cache: "no-store",
        });
        if (r.ok) return await r.json();
      } catch (e) {
        console.debug("Static promo fetch failed", e);
      }

      return null;
    }

    async function fetchPromoInBackground() {
      try {
        const data = await fetchPromoData();
        if (mounted && data) {
          setCachedData("promo_data", data, 10 * 60 * 1000); // Cache for 10 minutes
        }
      } catch (e) {
        console.debug("Background promo fetch failed", e);
      }
    }

    async function fetchAndSetPromo() {
      try {
        const data = await fetchPromoData();
        if (!mounted) return;

        if (data) {
          setPromo(data);
          setCachedData("promo_data", data, 10 * 60 * 1000); // Cache for 10 minutes
        }
      } catch (e) {
        console.debug("Promo fetch failed", e);
        if (mounted) {
          setPromo(null);
          setImageLoading(false);
        }
      }
    }

    // Check if promo data is cached
    const cachedPromo = getCachedData("promo_data");
    if (cachedPromo) {
      setPromo(cachedPromo);
      // Still fetch in background to update cache
      fetchPromoInBackground();
    } else {
      fetchAndSetPromo();
    }

    return () => (mounted = false);
  }, []);

  // Separate effect for image loading with preloading optimization
  useEffect(() => {
    if (!promo?.image) {
      setImageLoading(false);
      return;
    }

    let mounted = true;

    async function loadImage() {
      // Set loading to false immediately to show image
      setImageLoading(false);

      // Normalize image path
      let imagePath = promo.image;
      if (typeof imagePath === "string" && !/^\s*data:/i.test(imagePath)) {
        imagePath = imagePath.trim().replace(/\\/g, "/");
        if (!/^https?:\/\//i.test(imagePath) && !imagePath.startsWith("/")) {
          imagePath = "/" + imagePath;
        }
      }

      // Resolve full URL for image
      const base = (
        import.meta?.env?.VITE_API_BASE || "https://api.optislip.com"
      ).replace(/\/api\/?$/, "");

      let fullImageUrl = imagePath;
      if (!/^https?:\/\//i.test(imagePath)) {
        fullImageUrl = base + imagePath;
      }

      // Set image immediately to show it
      if (mounted) {
        setImageSrc(fullImageUrl);
      }

      // Check if already cached - if so, we're done
      if (isImageCached(fullImageUrl)) {
        return;
      }

      // Preload in background for caching (don't block display)
      preloadImage(fullImageUrl).catch((err) => {
        console.debug("Failed to preload promo image:", err);
        // Try alternate path if full URL failed
        if (fullImageUrl !== imagePath) {
          preloadImage(imagePath).catch(() => {
            console.debug("Promo image preload failed for both URLs");
          });
        }
      });
    }

    loadImage();
    return () => (mounted = false);
  }, [promo?.image]);

  const formatExternalUrl = (raw) => {
    if (!raw) return null;
    const str = String(raw).trim();
    // If already has scheme (http/https/ftp/etc) or starts with protocol-relative //, use as-is
    if (/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//.test(str) || str.startsWith("//"))
      return str;
    // Otherwise, assume https
    return `https://${str}`;
  };

  const handleClick = () => {
    if (promo && promo.link) {
      const url = formatExternalUrl(promo.link);
      if (url) window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-[350px] sm:max-w-[420px] md:max-w-[500px] lg:max-w-[600px] max-h-[90vh] flex flex-col items-center justify-center text-center gap-4">
        {imageLoading && (
          <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] bg-gray-200 animate-pulse rounded-md flex items-center justify-center">
            <div className="text-gray-500">Loading promotion...</div>
            <FaTimes
              className="absolute top-3 right-3 bg-[#1C1C1C82] p-1 rounded-full text-white text-[18px] cursor-pointer hover:bg-black transition z-10"
              onClick={onClose}
            />
          </div>
        )}
        {!imageLoading && imageSrc && (
          <div className="relative">
            <img
              src={imageSrc}
              alt={promo?.title || "Promotion"}
              className="w-full h-auto max-h-[70vh] object-contain rounded-md cursor-pointer"
              onClick={handleClick}
              loading="eager"
              onError={(e) => {
                console.debug("Promo image failed to load:", imageSrc);
                e.target.style.display = "none";
                setImageSrc(null);
              }}
            />
            <FaTimes
              className="absolute top-3 right-3 bg-[#1C1C1C82] p-1 rounded-full text-white text-[18px] cursor-pointer hover:bg-black transition z-10"
              onClick={onClose}
            />
          </div>
        )}
        {!imageLoading && !imageSrc && promo?.image && (
          <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] flex items-center justify-center bg-gray-100 rounded-md">
            <p className="text-gray-500 text-sm sm:text-base">
              Unable to load promo image.
            </p>
            <FaTimes
              className="absolute top-3 right-3 bg-[#1C1C1C82] p-1 rounded-full text-white text-[18px] cursor-pointer hover:bg-black transition z-10"
              onClick={onClose}
            />
          </div>
        )}
        {!imageLoading && !imageSrc && !promo?.image && (
          <div className="relative bg-[#BF0000] w-full h-[300px] sm:h-[400px] md:h-[500px] rounded-[16px] flex flex-col items-center justify-center text-center p-4 sm:p-6 gap-2 sm:gap-4">
            <FaTimes
              className="absolute top-3 right-3 bg-[#1C1C1C82] p-1 rounded-full text-white text-[18px] cursor-pointer hover:bg-black transition z-10"
              onClick={onClose}
            />
            <h1 className="text-white text-[24px] sm:text-[32px] md:text-[40px] font-bold leading-tight">
              DISCOUNT
            </h1>
            <p className="text-white text-[14px] sm:text-[16px] md:text-[20px] font-medium">
              UP TO
            </p>
            <h1 className="text-white text-[36px] sm:text-[48px] md:text-[60px] font-bold leading-none">
              50%
            </h1>
            <p className="text-white text-[14px] sm:text-[16px] md:text-[20px] font-medium">
              OFF
            </p>
            <button
              className="mt-4 sm:mt-6 bg-white text-black font-bold text-[14px] sm:text-[16px] md:text-[18px] py-2 px-4 sm:px-6 rounded-[61px] hover:bg-black hover:text-white transition-all"
              onClick={handleClick}
            >
              CLICK HERE
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
