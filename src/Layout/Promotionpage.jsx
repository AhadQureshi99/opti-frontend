import { FaTimes } from "react-icons/fa";
import { useEffect, useState } from "react";

export default function Promotionpage({ onClose }) {
  const [promo, setPromo] = useState(null);
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    let mounted = true;
    // resolve backend base: prefer VITE_API_BASE, otherwise use current origin
    const envBase =
      (import.meta && import.meta.env && import.meta.env.VITE_API_BASE) || "";
    const baseCandidates = [];
    // prefer backend promo (if deployed) then fall back to public/promo.json
    if (envBase) baseCandidates.push(envBase.replace(/\/$/, ""));
    // default backend (production) — try optislip API first, then fallbacks
    baseCandidates.push("https://api.optislip.com/api");
    if (
      typeof window !== "undefined" &&
      window.location &&
      window.location.origin
    )
      baseCandidates.push(window.location.origin + "/api");

    const fetchPromoFromBackend = async () => {
      for (const candidate of baseCandidates) {
        try {
          const url = `${candidate}/promo?ts=${Date.now()}`;
          console.debug("Promotionpage: trying backend promo url", url);
          const res = await fetch(url, { cache: "no-store" });
          if (!res.ok) {
            console.debug(
              "Promotionpage: backend promo not available at",
              url,
              "status",
              res.status
            );
            continue;
          }
          return await res.json();
        } catch (e) {
          console.debug(
            "Promotionpage: backend promo fetch failed for candidate",
            candidate,
            e
          );
        }
      }
      return null;
    };

    (async () => {
      try {
        let data = null;
        // try backend promo candidates first
        data = await fetchPromoFromBackend();

        // if backend not found, fallback to frontend static promo.json
        if (!data) {
          const r = await fetch(`/promo.json?ts=${Date.now()}`, {
            cache: "no-store",
            cacheControl: "no-cache",
          });
          if (r.ok) data = await r.json();
        }

        if (!mounted) return;
        setPromo(data);
        // attempt to resolve image
        if (data && data.image) {
          // Normalize image path: prefer absolute /data URIs, ensure leading slash for relative
          let imagePath = data.image;
          if (typeof imagePath === "string" && !/^\s*data:/i.test(imagePath)) {
            imagePath = imagePath.trim();
            // normalize backslashes -> forward slashes
            imagePath = imagePath.replace(/\\/g, "/");
            if (
              !/^https?:\/\//i.test(imagePath) &&
              !imagePath.startsWith("/")
            ) {
              imagePath = "/" + imagePath;
            }
          }

          // try resolving the image (frontend public first, then backend candidates)
          const tryResolveImageLocal = async (path, cacheBust = false) => {
            const isAbsolute = /^(https?:)?\/\//i.test(path);

            const loadOne = (src) =>
              new Promise((resolve) => {
                const img = new Image();
                img.onload = () => resolve(src);
                img.onerror = () => resolve(null);
                img.src = src;
              });

            if (isAbsolute) {
              const url = cacheBust ? appendTs(path) : path;
              return await loadOne(url);
            }

            // try frontend public (relative)
            const rel = path.startsWith("/") ? path : `/${path}`;
            const relUrl = cacheBust ? appendTs(rel) : rel;
            let ok = await loadOne(relUrl);
            if (ok) return ok;

            // try backend candidates
            for (const candidate of baseCandidates) {
              try {
                const backendOrigin = candidate.replace(/\/api\/?$/, "");
                const candidateUrl = `${backendOrigin}${rel}`;
                const candidateUrlTs = cacheBust
                  ? appendTs(candidateUrl)
                  : candidateUrl;
                console.debug(
                  "Promotionpage: trying backend direct url",
                  candidateUrlTs
                );
                ok = await loadOne(candidateUrlTs);
                if (ok) return ok;
              } catch (e) {
                console.debug("Promotionpage: backend direct failed", e);
              }
            }

            return null;
          };

          tryResolveImageLocal(imagePath, true).then((src) => {
            if (mounted) setImageSrc(src);
          });
        }
      } catch (e) {
        if (!mounted) return;
        setPromo(null);
      }
    })();
    return () => (mounted = false);
  }, []);

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

  // nothing else here — image resolution handled inside the effect (uses baseCandidates)

  function appendTs(url) {
    try {
      const hasQ = url.includes("?");
      return `${url}${hasQ ? "&" : "?"}ts=${Date.now()}`;
    } catch (e) {
      return `${url}?ts=${Date.now()}`;
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="relative w-full max-w-[350px] sm:max-w-[420px] md:max-w-[500px] lg:max-w-[600px] max-h-[90vh] flex flex-col items-center justify-center text-center gap-4">
        {imageSrc ? (
          <div className="relative">
            <img
              src={imageSrc}
              alt={promo?.title || "Promotion"}
              className="w-full h-auto max-h-[70vh] object-contain rounded-md cursor-pointer"
              onClick={handleClick}
            />
            <FaTimes
              className="absolute top-3 right-3 bg-[#1C1C1C82] p-1 rounded-full text-white text-[18px] cursor-pointer hover:bg-black transition z-10"
              onClick={onClose}
            />
          </div>
        ) : promo && promo.image ? (
          <div className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] flex items-center justify-center">
            <p className="text-gray-500 text-sm sm:text-base">
              Unable to load promo image.
            </p>
            <FaTimes
              className="absolute top-3 right-3 bg-[#1C1C1C82] p-1 rounded-full text-white text-[18px] cursor-pointer hover:bg-black transition z-10"
              onClick={onClose}
            />
          </div>
        ) : (
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
