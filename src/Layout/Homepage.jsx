import Navbar from "../components/Navbar";
import Herosection from "../components/Herosection";
import Actionbuttons from "../components/Actionbuttons";
import { useNavigate } from "react-router-dom";
import Promotionpage from "./Promotionpage";
import { useState, useEffect } from "react";
import { get } from "../utils/api";
import { BASE } from "../utils/offlineApi";

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

      // Fetch current promo data
      try {
        const promoResponse = await fetch(
          `${BASE}/api/promo?ts=${Date.now()}`,
          {
            cache: "no-store",
          }
        );
        if (promoResponse.ok) {
          const promoData = await promoResponse.json();
          if (promoData) {
            // Show promo only after login
            setShowPromo(true);
          }
        }
      } catch (e) {
        console.debug("Failed to fetch promo for homepage check", e);
      }
    };

    checkAndShowPromo();

    // Try authenticated profile first (cached), then fallback to public profile
    get("/api/user/profile", { cacheKey: "profile" })
      .then((data) => {
        if (!mounted) return;
        const u = data && data.user ? data.user : data;
        setProfile(u);
      })
      .catch(() => {
        // try public profile
        get("/api/user/public-profile")
          .then((data) => {
            if (!mounted) return;
            const u = data && data.user ? data.user : data;
            setProfile(u);
          })
          .catch(() => {});
      });
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
      <Herosection profile={profile} />
      <Actionbuttons />
    </div>
  );
}
