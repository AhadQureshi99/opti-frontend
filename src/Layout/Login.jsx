import { FaGoogle } from "react-icons/fa6";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { post } from "../utils/api";
import { useToast } from "../components/ToastProvider";

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const toast = useToast();
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
      }

      // Store user info (so UI can know if this is a sub-user)
      try {
        if (data.user) {
          localStorage.setItem("authUser", JSON.stringify(data.user));
          if (data.user.isSubUser) localStorage.setItem("isSubUser", "true");
          else localStorage.removeItem("isSubUser");
        } else {
          localStorage.removeItem("authUser");
          localStorage.removeItem("isSubUser");
        }
      } catch (e) {}

      // Mark user as logged in so promotion shows once on homepage
      sessionStorage.setItem("userLoggedIn", "true");
      sessionStorage.setItem("justLoggedIn", "true");
      sessionStorage.removeItem("promoShownThisSession"); // Reset promo flag for fresh login
      toast.addToast("Login successful", { type: "success" });
      navigate("/home-page");
    } catch (err) {
      console.error("Login error", err);
      toast.addToast(err.body?.message || "Login failed", { type: "error" });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div
      className="flex flex-col md:flex-row min-h-screen bg-white"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      <div
        className="w-full md:w-1/2 flex flex-col justify-center items-center px-8 sm:px-10 pb-20 md:pb-[120px] text-white relative"
        style={{
          background: "#169D53",
          clipPath:
            window.innerWidth < 768
              ? "polygon(0 0, 100% 0, 100% 100%, 0% 100%)"
              : "polygon(0 0, 100% 0, 70% 100%, 0% 100%)",
        }}
      >
        <img src="/Optislipimage.png" alt="Opti Slip" className="w-32 mb-4" />
        <p
          className="text-center text-white opacity-95 text-sm sm:text-base"
          style={{ maxWidth: "320px" }}
        >
          Opti Slip Database System, your all-in-one platform for managing your
          optical business efficiently. This website is designed to help you
          easily manage customer information, generate professional digital
          slips, and maintain accurate customer records all in one secure place.
        </p>
      </div>

      <div className="w-full md:w-1/2 flex flex-col bg-white px-6 sm:px-10 py-10 md:py-20">
        <h2 className="text-3xl sm:text-4xl md:text-[45px] text-[#1f2937] font-bold mb-8 sm:mb-12 text-left">
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
          />

          <label className="block my-2 font-semibold text-[#374151]">
            Password
          </label>
          <input
            name="password"
            type="password"
            required
            placeholder="Enter your password"
            className="w-full sm:w-[90%] p-4 border-2 rounded-xl mb-4 border-[#e5e7eb] hover:border-[#169D53] outline-none transition-all duration-300"
          />

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between my-6 w-full sm:w-[90%] gap-2 sm:gap-0">
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

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-[90%] bg-[#169D53] py-5 text-white rounded-xl shadow-2xl font-semibold mb-6 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "SIGN IN"}
          </button>

          <div className="flex items-center w-full sm:w-[90%] my-6">
            <div className="border-b border-[#d1d5db] flex-1 h-0.5"></div>
            <span className="mx-2 text-[#6b7280] text-[14px]">OR</span>
            <div className="border-b border-[#d1d5db] flex-1 h-0.5"></div>
          </div>

          <div className="my-4">
            <button className="flex items-center py-5 justify-center w-full sm:w-[90%] p-3 rounded-xl border border-[#e5e7eb] text-[#3c4043] bg-white hover:bg-gray-100 transition-colors mb-6">
              <FaGoogle className="text-red-600 mr-3" size={20} />
              Sign In with Google
            </button>
          </div>

          <div className="p-3 w-full sm:w-[90%] text-center">
            <p className="text-[#6b7280] text-sm sm:text-base">
              Don't have an account?
              <Link to="/signup" className="text-[#169D53] font-bold">
                Sign Up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
