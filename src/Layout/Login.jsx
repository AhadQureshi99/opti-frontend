import { FaGoogle, FaEye, FaEyeSlash, FaWhatsapp } from "react-icons/fa6";
import { useState, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { post } from "../utils/api";
import { invalidateCache, clearDataCache } from "../utils/dataCache";
import { useToast } from "../components/ToastProvider";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const toast = useToast();
  const emailRef = useRef();
  const passwordRef = useRef();

  // Handle Google OAuth login/signup
  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const data = await post(
        "/api/user/google-auth",
        {
          token: credentialResponse.credential,
        },
        { noOffline: true }
      );

      const token = data.token;
      if (token) {
        localStorage.setItem("authToken", token);
      }

      // Store user info
      if (data.user) {
        localStorage.setItem("authUser", JSON.stringify(data.user));
        if (data.user.isSubUser) localStorage.setItem("isSubUser", "true");
        else localStorage.removeItem("isSubUser");
      } else {
        localStorage.removeItem("authUser");
        localStorage.removeItem("isSubUser");
      }

      // Invalidate cached user data so home loads fresh profile
      try {
        invalidateCache("user_profile");
        clearDataCache();
        localStorage.removeItem("offline_api_cache:profile");
      } catch (e) {}

      // Session flags
      sessionStorage.setItem("userLoggedIn", "true");
      sessionStorage.setItem("justLoggedIn", "true");
      sessionStorage.removeItem("promoShownThisSession");

      toast.addToast(data?.message || "Google login successful", {
        type: "success",
      });
      navigate("/home-page");
    } catch (err) {
      console.error("Google login error:", err);
      toast.addToast(err?.body?.message || "Google login failed", {
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.addToast("Google login cancelled or failed", { type: "error" });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const identifier = form.querySelector('input[name="email"]').value;
    const password = form.querySelector('input[name="password"]').value;

    try {
      setLoading(true);
      const data = await post("/api/user/login", {
        email: identifier,
        password,
      });
      const token = data.token;
      if (token) {
        localStorage.setItem("authToken", token);
        // Store login timestamp for 24-hour auto logout
        localStorage.setItem("loginTime", Date.now().toString());
      }

      // Store user info
      try {
        if (data.user) {
          localStorage.setItem("authUser", JSON.stringify(data.user));
          if (data.user.isSubUser) {
            localStorage.setItem("isSubUser", "true");
            if (data.user.mainUser) {
              localStorage.setItem("mainUserId", data.user.mainUser);
            }
          } else {
            localStorage.removeItem("isSubUser");
            localStorage.removeItem("mainUserId");
          }
        } else {
          localStorage.removeItem("authUser");
          localStorage.removeItem("isSubUser");
          localStorage.removeItem("mainUserId");
        }
      } catch (e) {}

      // Invalidate cached user data so home loads fresh profile
      try {
        invalidateCache("user_profile");
        clearDataCache();
        localStorage.removeItem("offline_api_cache:profile");
      } catch (e) {}

      // Session flags
      sessionStorage.setItem("userLoggedIn", "true");
      sessionStorage.setItem("justLoggedIn", "true");
      sessionStorage.removeItem("promoShownThisSession");

      toast.addToast("Login successful", { type: "success" });
      navigate("/home-page");
    } catch (err) {
      console.error("Login error", err);
      // Show custom message for deactivated user
      const msg = err?.body?.message || "Login failed";
      if (msg.toLowerCase().includes("deactivated")) {
        toast.addToast("User deactivated. Contact admin.", { type: "error" });
      } else {
        toast.addToast(msg, { type: "error" });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex flex-col md:flex-row min-h-screen bg-white"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div className="w-full md:w-1/2 flex flex-col justify-center items-center px-8 sm:px-10 pb-20 md:pb-[120px] text-white relative bg-[#169D53] login-clip">
        <img
          src="/Optislipimage.png"
          alt="Opti Slip"
          className="w-32 mb-6"
          style={{ filter: "invert(1) grayscale(1) brightness(0)" }}
        />
        <p
          className="text-center text-white opacity-95 text-sm sm:text-base leading-relaxed px-4"
          style={{ maxWidth: "380px", lineHeight: "1.7" }}
        >
          Opti Slip Database System, your all-in-one platform for managing your
          optical business efficiently. This website is designed to help you
          easily manage customer information, generate professional digital
          slips, and maintain accurate customer records all in one secure place.
        </p>
      </div>

      <div className="w-full md:w-1/2 flex flex-col bg-white px-6 sm:px-10 py-10 md:py-20">
        <h2 className="text-3xl sm:text-4xl md:text-[45px] text-[#1f2937] font-bold mb-8 sm:mb-12 text-center">
          Welcome!
        </h2>
        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <label className="block mb-2 font-semibold text-[#374151]">
            Email or Username
          </label>
          <input
            name="email"
            type="text"
            required
            placeholder="Enter your email or username"
            className="w-full sm:w-[90%] p-4 border-2 rounded-xl mb-4 border-[#e5e7eb] hover:border-[#169D53] outline-none transition-all duration-300"
            ref={emailRef}
          />

          <label className="block my-2 font-semibold text-[#374151]">
            Password
          </label>
          <div className="relative w-full sm:w-[90%]">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="Enter your password"
              className="w-full p-4 pr-12 border-2 rounded-xl mb-4 border-[#e5e7eb] hover:border-[#169D53] outline-none transition-all duration-300"
              ref={passwordRef}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 transform -mt-2 flex items-center justify-center text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
          </div>

          <div className="flex flex-row flex-wrap items-center justify-between my-6 w-full sm:w-[90%] gap-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-2 text-[#6b7280] text-[14px]"
              />
              Remember me
            </label>
            <Link
              to="/forgot-password"
              className="text-[#169D53] font-semibold"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Primary sign-in action */}
          <div className="w-full sm:w-[90%] mb-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#169D53] py-5 text-white rounded-xl shadow-2xl font-semibold disabled:opacity-60"
            >
              {loading ? "Signing in..." : "SIGN IN"}
            </button>
          </div>

          {/* Subtle help link for WhatsApp support */}
          <div className="w-full sm:w-[90%] mb-6 flex items-center justify-center gap-2 text-sm text-[#169D53] font-semibold">
            <FaWhatsapp size={18} />
            <a
              href="https://wa.me/966594467583"
              target="_blank"
              rel="noreferrer"
              className="hover:opacity-80"
              title="Contact Admin via WhatsApp"
              aria-label="Contact Admin via WhatsApp"
            >
              Need help? WhatsApp us
            </a>
          </div>

          <div className="flex items-center w-full sm:w-[90%] my-6">
            <div className="border-b border-[#d1d5db] flex-1 h-0.5"></div>
            <span className="mx-2 text-[#6b7280] text-[14px]">OR</span>
            <div className="border-b border-[#d1d5db] flex-1 h-0.5"></div>
          </div>

          <GoogleOAuthProvider clientId="689191660857-tf2q7e7e9923h0k6jm3gatgpvpnffhag.apps.googleusercontent.com">
            <div className="my-4 w-full sm:w-[90%] flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                text="signin_with"
                shape="rectangular"
                size="large"
              />
            </div>
          </GoogleOAuthProvider>

          <div className="p-3 w-full sm:w-[90%]">
            <p className="text-[#6b7280] text-sm sm:text-base text-center">
              Don't have an account?
              <Link to="/signup" className="text-[#169D53] font-bold ml-1">
                Sign Up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
