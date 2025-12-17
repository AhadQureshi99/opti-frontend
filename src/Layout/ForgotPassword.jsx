import { useState } from "react";
import { post } from "../utils/api";
import { useNavigate } from "react-router-dom";
import { useToast } from "../components/ToastProvider";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.addToast("Enter your email", { type: "error" });
      return;
    }
    setLoading(true);
    try {
      const res = await post("/api/user/forgot-password", { email });
      // store pending reset so ResetPassword can prefill
      localStorage.setItem("pendingReset", JSON.stringify({ email }));
      toast.addToast(res.message || "OTP sent to your email", {
        type: "success",
      });
      navigate("/reset-password");
    } catch (err) {
      console.error(err);
      toast.addToast(err?.body?.message || "Failed to send OTP", {
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#169D53] w-full h-full min-h-screen pb-10">
      <div className="relative flex items-center justify-center px-5 sm:px-10 pt-0">
        <h2 className="text-white text-2xl font-bold mt-8">Forgot Password</h2>
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

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#169D53] text-white py-3 rounded"
        >
          {loading ? "Sending..." : "Send OTP"}
        </button>
      </form>
    </div>
  );
}
