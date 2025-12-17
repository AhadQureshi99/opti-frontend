import { useState, useEffect } from "react";
import { post } from "../utils/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/ToastProvider";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const toast = useToast();

  useEffect(() => {
    const pending = localStorage.getItem("pendingReset");
    if (pending) {
      try {
        const p = JSON.parse(pending);
        setEmail(p.email || "");
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !otp || !newPassword) {
      toast.addToast("Fill all fields", { type: "error" });
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.addToast("Passwords do not match", { type: "error" });
      return;
    }
    setLoading(true);
    try {
      const res = await post("/api/user/reset-password", {
        email,
        otp,
        newPassword,
      });
      localStorage.removeItem("pendingReset");
      toast.addToast(res.message || "Password reset successfully", {
        type: "success",
      });
      navigate("/signin");
    } catch (err) {
      console.error(err);
      toast.addToast(err?.body?.message || "Failed to reset password", {
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#169D53] w-full h-full min-h-screen pb-10">
      <div className="relative flex items-center justify-center px-5 sm:px-10 pt-0">
        <h2 className="text-white text-2xl font-bold mt-8">Reset Password</h2>
      </div>

      <form
        onSubmit={handleSubmit}
        className="w-[90%] sm:w-[40%] mx-auto mt-8 bg-white p-6 rounded-lg"
      >
        <label className="block mb-2 font-semibold text-[#374151]">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
          placeholder="Enter your registered email"
          className="w-full p-3 border rounded mb-4"
        />

        <label className="block mb-2 font-semibold text-[#374151]">OTP</label>
        <input
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          type="text"
          required
          maxLength={6}
          placeholder="6-digit code"
          className="w-full p-3 border rounded mb-4"
        />

        <label className="block mb-2 font-semibold text-[#374151]">
          New Password
        </label>
        <input
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          type="password"
          required
          placeholder="Enter new password"
          className="w-full p-3 border rounded mb-4"
        />

        <label className="block mb-2 font-semibold text-[#374151]">
          Confirm Password
        </label>
        <input
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          type="password"
          required
          placeholder="Confirm new password"
          className="w-full p-3 border rounded mb-4"
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#169D53] text-white py-3 rounded"
        >
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  );
}
