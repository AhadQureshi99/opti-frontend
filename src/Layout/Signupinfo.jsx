import { FaArrowLeft, FaGoogle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { RiUserLine } from "react-icons/ri";
import { CiMail } from "react-icons/ci";
import { GoLock } from "react-icons/go";
import { FcGoogle } from "react-icons/fc";
import { FaEye, FaEyeSlash } from "react-icons/fa"; // Added eye icons
import { post } from "../utils/api";
import { useToast } from "../components/ToastProvider";

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
  };

  const handleSubmit = (e) => {
    e.preventDefault();

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

  return (
    <div
      className="flex flex-col md:flex-row min-h-screen bg-white"
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* LEFT GREEN SECTION */}
      <div
        className="w-full md:w-1/2 flex flex-col justify-center items-center px-8 sm:px-10 pb-20 md:pb-[120px] text-white relative"
        style={{
          background: "#169D53",
          clipPath: "var(--clip)",
        }}
      >
        <img
          src="/Optislipimage.png"
          alt="OptiSlip"
          className="w-32 mb-4 invert brightness-0"
        />

        <p
          className="text-center text-white opacity-95 text-sm sm:text-base"
          style={{ maxWidth: "320px" }}
        >
          Opti Slip Database System helps you manage customer records, generate
          digital slips, & organize optical store data efficiently.
        </p>
      </div>

      {/* RIGHT WHITE SECTION (Signup Form) */}
      <div className="w-full md:w-1/2 flex flex-col bg-white px-6 sm:px-10 py-10 md:py-20 items-center">
        <div className="flex items-center justify-between w-full max-w-md mb-8">
          <Link to="/home-page">
            <FaArrowLeft className="text-black w-6 h-6 hover:text-green-600" />
          </Link>

          <h2 className="text-4xl md:text-[45px] text-[#007A3F] font-bold">
            Sign Up
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="w-full max-w-md">
          {/* USERNAME */}
          <label className="block mb-2 font-semibold text-[#374151]">
            Username
          </label>
          <div className="relative">
            <RiUserLine
              className="absolute left-3 top-4 text-[#6B7C6B]"
              size={22}
            />
            <input
              type="text"
              name="username"
              required
              value={formData.username}
              onChange={handleChange}
              placeholder="eg. xyz_optical"
              className="w-full p-4 pl-10 border-2 rounded-xl border-[#e5e7eb] hover:border-[#169D53] outline-none transition-all duration-300"
            />
          </div>

          {/* EMAIL */}
          <label className="block mt-4 mb-2 font-semibold text-[#374151]">
            Email
          </label>
          <div className="relative">
            <CiMail
              className="absolute left-3 top-4 text-[#6B7C6B]"
              size={22}
            />
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className="w-full p-4 pl-10 border-2 rounded-xl border-[#e5e7eb] hover:border-[#169D53] outline-none transition-all duration-300"
            />
          </div>

          {/* PASSWORD */}
          <label className="block mt-4 mb-2 font-semibold text-[#374151]">
            Password
          </label>
          <div className="relative">
            <GoLock
              className="absolute left-3 top-4 text-[#6B7C6B]"
              size={22}
            />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className="w-full p-4 pl-10 pr-12 border-2 rounded-xl border-[#e5e7eb] hover:border-[#169D53] outline-none transition-all duration-300"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-4 text-[#6B7C6B] hover:text-[#374151] transition"
            >
              {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
          </div>

          {/* CONFIRM PASSWORD */}
          <label className="block mt-4 mb-2 font-semibold text-[#374151]">
            Confirm Password
          </label>
          <div className="relative">
            <GoLock
              className="absolute left-3 top-4 text-[#6B7C6B]"
              size={22}
            />
            <input
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              required
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm password"
              className="w-full p-4 pl-10 pr-12 border-2 rounded-xl border-[#e5e7eb] hover:border-[#169D53] outline-none transition-all duration-300"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-4 text-[#6B7C6B] hover:text-[#374151] transition"
            >
              {showConfirmPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
          </div>

          {/* REMEMBER */}
          <label className="flex items-center my-4">
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
            disabled={loading}
            className="w-full bg-[#169D53] py-5 text-white rounded-xl shadow-2xl font-semibold hover:bg-[#0f7a42] transition-all duration-300 disabled:opacity-60"
          >
            {loading ? "Sending OTP..." : "SIGN UP"}
          </button>

          {/* Already have account */}
          <p className="text-center text-[#6b7280] text-sm mt-4">
            Already have an account?
            <Link to="/signin" className="text-[#169D53] font-bold ml-1">
              Login
            </Link>
          </p>

          {/* Divider */}
          <div className="flex items-center w-full my-6">
            <div className="border-b border-[#d1d5db] flex-1"></div>
            <span className="mx-2 text-[#3E3E3E] text-[14px]">OR</span>
            <div className="border-b border-[#d1d5db] flex-1"></div>
          </div>

          {/* GOOGLE */}
          <button
            type="button"
            className="flex items-center py-5 justify-center w-full p-3 rounded-xl border border-[#e5e7eb] text-[#3c4043] bg-white hover:bg-gray-100 transition-all"
          >
            <FcGoogle size={22} className="mr-3" />
            Continue with Google
          </button>
        </form>
      </div>
    </div>
  );
}