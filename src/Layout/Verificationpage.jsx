import { FaArrowLeft } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { post } from "../utils/api";
import { useToast } from "../components/ToastProvider";

export default function Verificationpage() {
  const navigate = useNavigate();
  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    const pending = localStorage.getItem("pendingSignup");
    if (pending) {
      try {
        const p = JSON.parse(pending);
        setEmail(p.email || "");
      } catch (e) {
        setEmail("");
      }
    }
  }, []);

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      toast.addToast("Enter 6-digit OTP", { type: "error" });
      return;
    }
    setLoading(true);
    try {
      const res = await post("/api/user/verify-otp", { email, otp });
      if (res.token) localStorage.setItem("authToken", res.token);
      localStorage.removeItem("pendingSignup");
      toast.addToast(res.message || "Verified", { type: "success" });
      navigate("/home-page");
    } catch (err) {
      console.error(err);
      toast.addToast(err?.body?.message || "Verification failed", {
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    const pending = localStorage.getItem("pendingSignup");
    if (!pending) {
      toast.addToast("No pending signup found", { type: "error" });
      return;
    }
    try {
      const p = JSON.parse(pending);
      await post(
        "/api/user/send-otp",
        {
          username: p.username,
          email: p.email,
          password: p.password,
        },
        { noOffline: true }
      );
      toast.addToast("OTP resent", { type: "success" });
    } catch (err) {
      console.error(err);
      toast.addToast(err?.body?.message || "Failed to resend OTP", {
        type: "error",
      });
    }
  };

  return (
    <div className="bg-[#169D53] w-full h-full pb-10">
      <div className="relative flex items-center justify-center px-5 sm:px-10 pt-0">
        <Link to="/signin">
          <FaArrowLeft className="absolute left-5 sm:left-20 top-9 w-7 h-6 text-white cursor-pointer transition-all duration-300 hover:-translate-x-1" />
        </Link>

        <img
          src="/Optislipimage.png"
          alt="OptiSlip"
          className="h-[12vh] sm:ml-4 ml-4 sm:mt-10 mt-18 sm:h-[34vh]"
        />
      </div>

      <p className="text-[#FFFFFF] text-[16px] w-[90%] sm:w-[40%] text-center mx-auto mt-6">
        Check your inbox and enter the 6-digit code below to verify your
        account.
      </p>

      <div className="bg-white/10 text-white/60 rounded-[20px] w-[90%] sm:w-[40%] mx-auto py-4 px-6 leading-[2] text-center mt-6">
        <p className="text-[18px]">Verification code sent to:</p>
        <h1 className="text-[20px] text-[#FFFFFF]">
          {email || "your@email.com"}
        </h1>
      </div>

      <form
        onSubmit={handleVerify}
        className=" w-[90%] sm:w-[32%] mx-auto mt-6"
      >
        <input
          type="text"
          required
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
          className="bg-[#FFFFFF] h-14 text-black text-[24px] rounded-[12px] py-3 px-4 leading-[2] text-center mt-6 w-full"
        />

        <div className="mt-8  flex justify-center">
          <button
            type="submit"
            disabled={loading}
            className="bg-white text-center text-[20px] text-[#007A3F] py-3 px-8 font-semibold rounded-[12px] mb-8 w-full"
          >
            {loading ? "Verifying..." : "PROCEED"}
          </button>
        </div>
      </form>

      <div className="w-[90%] sm:w-[32%] mx-auto text-center mt-4">
        <p className="text-white/60">Didn’t receive the code?</p>
        <button
          onClick={handleResend}
          className="text-[#FFFFFF] underline text-center cursor-pointer text-[16px] my-4"
        >
          Resend Code
        </button>
      </div>
    </div>
  );
}
