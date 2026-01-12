import Navbar from "../components/Navbar";
import Herosection from "../components/Herosection";
import Actionbuttons from "../components/Actionbuttons";
import { useNavigate } from "react-router-dom";
import Promotionpage from "./Promotionpage";
import { useState, useEffect } from "react";
import { get } from "../utils/api";
import { BASE } from "../utils/offlineApi";
import { preloadImage } from "../utils/imageCache";
import { prefetchData, setCachedData } from "../utils/dataCache";

export default function Homepage() {
  const [showPromo, setShowPromo] = useState(false);
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let mounted = true;

    const checkAndShowPromo = async () => {
      const isUserLoggedIn = sessionStorage.getItem("userLoggedIn") === "true";
      const justLoggedIn = sessionStorage.getItem("justLoggedIn") === "true";

      if (!isUserLoggedIn || !justLoggedIn) return;

      // Clear the just logged in flag
      sessionStorage.removeItem("justLoggedIn");

      // Fetch current promo data with caching
      try {
        const promoData = await prefetchData(
          "promo_data",
          async () => {
            const promoResponse = await fetch(
              `${BASE}/api/promo?ts=${Date.now()}`,
              { cache: "no-store" }
            );
            if (promoResponse.ok) {
              return await promoResponse.json();
            }
            return null;
          },
          10 * 60 * 1000 // Cache for 10 minutes
        );

        if (promoData) {
          setShowPromo(true);

          // Preload promo image in background if exists
          if (promoData.image) {
            const base = (
              import.meta?.env?.VITE_API_BASE || "https://api.optislip.com"
            ).replace(/\/api\/?$/, "");
            const imagePath = promoData.image.startsWith("http")
              ? promoData.image
              : promoData.image.startsWith("/")
              ? promoData.image
              : `/${promoData.image}`;

            preloadImage(imagePath).catch(() => {
              // Try with backend base
              preloadImage(base + imagePath).catch(() => {
                console.debug("Failed to preload promo image");
              });
            });
          }
        }
      } catch (e) {
        console.debug("Failed to fetch promo for homepage check", e);
      }
    };

    checkAndShowPromo();

    // If subuser, load main user's public profile for shop display
    const isSubUser = localStorage.getItem("isSubUser") === "true";
    const mainUserId = localStorage.getItem("mainUserId");
    if (isSubUser && mainUserId) {
      // Fetch main user's public profile
      get(`/api/user/public/${mainUserId}`)
        .then((data) => {
          if (!mounted) return;
          const u = data && data.user ? data.user : data;
          setProfile(u);
          if (u?.image) {
            const base = (
              import.meta?.env?.VITE_API_BASE || "https://api.optislip.com"
            ).replace(/\/api\/?$/, "");
            const imageSrc = u.image.startsWith("http")
              ? u.image
              : base + "/" + u.image.replace(/^\//, "");
            preloadImage(imageSrc).catch(() =>
              console.debug("Failed to preload profile image")
            );
          }
        })
        .catch(() => {});
    } else {
      // Try authenticated profile first (cached), then fallback to public profile
      prefetchData(
        "user_profile",
        () => get("/api/user/profile", { cacheKey: "profile" }),
        15 * 60 * 1000 // Cache for 15 minutes
      )
        .then((data) => {
          if (!mounted) return;
          const u = data && data.user ? data.user : data;
          setProfile(u);
          if (u?.image) {
            const base = (
              import.meta?.env?.VITE_API_BASE || "https://api.optislip.com"
            ).replace(/\/api\/?$/, "");
            const imageSrc = u.image.startsWith("http")
              ? u.image
              : base + "/" + u.image.replace(/^\//, "");
            preloadImage(imageSrc).catch(() =>
              console.debug("Failed to preload profile image")
            );
          }
        })
        .catch(() => {
          // try public profile
          get("/api/user/public-profile")
            .then((data) => {
              if (!mounted) return;
              const u = data && data.user ? data.user : data;
              setProfile(u);
              setCachedData("user_profile", u, 15 * 60 * 1000);
              if (u?.image) {
                const base = (
                  import.meta?.env?.VITE_API_BASE || "https://api.optislip.com"
                ).replace(/\/api\/?$/, "");
                const imageSrc = u.image.startsWith("http")
                  ? u.image
                  : base + "/" + u.image.replace(/^\//, "");
                preloadImage(imageSrc).catch(() =>
                  console.debug("Failed to preload profile image")
                );
              }
            })
            .catch(() => {});
        });
    }

    return () => (mounted = false);
  }, []);

  const closePromo = () => setShowPromo(false);

  const goToLink = () => {
    navigate("https://codesvista.com");
  };

  return (
    <div className="relative">
      {showPromo && (
        <Promotionpage onClose={closePromo} onNavigate={goToLink} />
      )}
      <Navbar />
      {profile && <Herosection profile={profile} />}
      <Actionbuttons />
    </div>
  );
}
