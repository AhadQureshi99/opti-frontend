import { FaArrowLeft, FaGoogle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { RiUserLine } from "react-icons/ri";
import { CiMail } from "react-icons/ci";
import { GoLock } from "react-icons/go";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Added eye icons
import { post, get } from "../utils/api";
import { useToast } from "../components/ToastProvider";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";

export default function Signupinfo() {
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    remember: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [emailStatus, setEmailStatus] = useState({
    checking: false,
    available: true,
    message: "",
  });
  const [emailCheckTimeout, setEmailCheckTimeout] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      document.body.style.setProperty(
        "--clip",
        window.innerWidth < 768
          ? "polygon(0 0, 100% 0, 100% 100%, 0% 100%)"
          : "polygon(0 0, 100% 0, 70% 100%, 0% 100%)"
      );
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Check email availability with debounce
    if (name === "email" && value.trim()) {
      if (emailCheckTimeout) {
        clearTimeout(emailCheckTimeout);
      }

      setEmailStatus({
        checking: true,
        available: true,
        message: "Checking...",
      });

      const timeout = setTimeout(() => {
        checkEmailAvailability(value.trim());
      }, 800); // 800ms debounce

      setEmailCheckTimeout(timeout);
    } else if (name === "email" && !value.trim()) {
      setEmailStatus({ checking: false, available: true, message: "" });
    }
  };

  const checkEmailAvailability = async (email) => {
    try {
      const response = await get(
        `/api/user/check-email?email=${encodeURIComponent(email)}`,
        { noOffline: true }
      );

      if (response.available) {
        setEmailStatus({ checking: false, available: true, message: "" });
      } else {
        setEmailStatus({
          checking: false,
          available: false,
          message: "Email already registered. Please login instead.",
        });
      }
    } catch (error) {
      setEmailStatus({ checking: false, available: true, message: "" });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!emailStatus.available) {
      toast.addToast("Email already registered. Please login instead.", {
        type: "error",
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.addToast("Passwords do not match", { type: "error" });
      return;
    }

    setLoading(true);

    post(
      "/api/user/send-otp",
      {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      },
      { noOffline: true }
    )
      .then((res) => {
        localStorage.setItem(
          "pendingSignup",
          JSON.stringify({
            username: formData.username,
            email: formData.email,
            password: formData.password,
          })
        );
        toast.addToast(res?.message || "OTP sent", { type: "success" });
        navigate("/verifyemail");
      })
      .catch((err) => {
        toast.addToast(err?.body?.message || "Failed to send OTP", {
          type: "error",
        });
      })
      .finally(() => setLoading(false));
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const response = await post(
        "/api/user/google-auth",
        {
          token: credentialResponse.credential,
        },
        { noOffline: true }
      );

      toast.addToast(response?.message || "Google signup successful", {
        type: "success",
      });

      // Store token and user info
      localStorage.setItem("token", response.token);
      localStorage.setItem("user", JSON.stringify(response.user));

      navigate("/home-page");
    } catch (error) {
      toast.addToast(error?.body?.message || "Google signup failed", {
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    toast.addToast("Google signup was cancelled or failed", { type: "error" });
  };

  return (
    <div
      className="flex flex-col md:flex-row h-screen bg-white overflow-hidden"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* LEFT GREEN SECTION */}
      <div
        className="w-full md:w-1/2 flex flex-col justify-center items-center px-8 sm:px-10 py-8 md:py-12 text-white relative overflow-hidden"
        style={{
          background: "#169D53",
          clipPath: "var(--clip)",
        }}
      >
        <img
          src="/Optislipimage.png"
          alt="OptiSlip"
          className="w-24 h-auto mb-3 invert brightness-0 object-contain"
        />

        <p
          className="text-center text-white opacity-95 text-xs sm:text-sm"
          style={{ maxWidth: "320px" }}
        >
          Opti Slip Database System helps you manage customer records, generate
          digital slips, & organize optical store data efficiently.
        </p>
      </div>

      {/* RIGHT WHITE SECTION (Signup Form) */}
      <div className="w-full md:w-1/2 flex flex-col bg-white px-6 sm:px-8 py-6 md:py-8 items-center overflow-y-auto">
        <div className="flex items-center justify-between w-full max-w-md mb-4">
          <Link to="/signin">
            <FaArrowLeft className="text-black w-5 h-5 hover:text-green-600" />
          </Link>

          <h2 className="text-3xl md:text-4xl text-[#007A3F] font-bold flex-1 text-center mr-6">
            Sign Up
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-md">
          {/* USERNAME */}
          <label className="block mb-1 font-semibold text-[#374151] text-sm">
            Username
          </label>
          <div className="relative">
            <RiUserLine
              className="absolute left-3 top-3 text-[#6B7C6B]"
              size={20}
            />
            <input
              type="text"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              placeholder="eg. xyz_optical"
              className="w-full p-3 pl-10 border-2 rounded-xl border-[#e5e7eb] hover:border-[#169D53] outline-none transition-all duration-300 text-sm"
            />
          </div>

          {/* EMAIL */}
          <label className="block mt-3 mb-1 font-semibold text-[#374151] text-sm">
            Email
          </label>
          <div className="relative">
            <CiMail
              className="absolute left-3 top-3 text-[#6B7C6B]"
              size={20}
            />
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={`w-full p-3 pl-10 border-2 rounded-xl ${
                !emailStatus.available && formData.email
                  ? "border-red-500"
                  : "border-[#e5e7eb] hover:border-[#169D53]"
              } outline-none transition-all duration-300 text-sm`}
            />
          </div>
          {emailStatus.checking && (
            <p className="text-xs text-gray-500 mt-1">
              Checking availability...
            </p>
          )}
          {!emailStatus.available &&
            formData.email &&
            !emailStatus.checking && (
              <p className="text-xs text-red-500 mt-1 font-semibold">
                {emailStatus.message}
              </p>
            )}

          {/* PASSWORD */}
          <label className="block mt-3 mb-1 font-semibold text-[#374151] text-sm">
            Password
          </label>
          <div className="relative">
            <GoLock
              className="absolute left-3 top-3 text-[#6B7C6B]"
              size={20}
            />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full p-3 pl-10 pr-12 border-2 rounded-xl border-[#e5e7eb] hover:border-[#169D53] outline-none transition-all duration-300 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-[#6B7C6B] hover:text-[#374151] transition"
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>

          {/* CONFIRM PASSWORD */}
          <label className="block mt-3 mb-1 font-semibold text-[#374151] text-sm">
            Confirm Password
          </label>
          <div className="relative">
            <GoLock
              className="absolute left-3 top-3 text-[#6B7C6B]"
              size={20}
            />
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              className="w-full p-3 pl-10 pr-12 border-2 rounded-xl border-[#e5e7eb] hover:border-[#169D53] outline-none transition-all duration-300 text-sm"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3 text-[#6B7C6B] hover:text-[#374151] transition"
            >
              {showConfirmPassword ? (
                <FaEyeSlash size={18} />
              ) : (
                <FaEye size={18} />
              )}
            </button>
          </div>

          {/* REMEMBER */}
          <label className="flex items-center my-3 text-sm">
            <input
              type="checkbox"
              name="remember"
              checked={formData.remember}
              onChange={handleChange}
              className="mr-2"
            />
            Remember me
          </label>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={loading || !emailStatus.available || emailStatus.checking}
            className="w-full bg-[#169D53] py-3 text-white rounded-xl shadow-2xl font-semibold hover:bg-[#0f7a42] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Sending OTP..." : "SIGN UP"}
          </button>

          {/* Already have account */}
          <p className="text-center text-[#6b7280] text-xs mt-3">
            Already have an account?
            <Link to="/signin" className="text-[#169D53] font-bold ml-1">
              Login
            </Link>
          </p>

          {/* Divider */}
          <div className="flex items-center w-full my-4">
            <div className="border-b border-[#d1d5db] flex-1"></div>
            <span className="mx-2 text-[#3E3E3E] text-xs">OR</span>
            <div className="border-b border-[#d1d5db] flex-1"></div>
          </div>

          {/* GOOGLE */}
          <GoogleOAuthProvider clientId="689191660857-tf2q7e7e9923h0k6jm3gatgpvpnffhag.apps.googleusercontent.com">
            <div className="flex justify-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                text="signup_with"
                shape="rectangular"
                size="large"
                width="100%"
              />
            </div>
          </GoogleOAuthProvider>
        </form>
      </div>
    </div>
  );
}
