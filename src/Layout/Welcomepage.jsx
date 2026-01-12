import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Welcome() {
  const navigate = useNavigate();

  React.useEffect(() => {
    // Check if user is logged in and session is still valid
    const isLoggedIn = sessionStorage.getItem("userLoggedIn") === "true";
    const loginTime = localStorage.getItem("loginTime");

    if (isLoggedIn && loginTime) {
      const currentTime = Date.now();
      const elapsed = currentTime - parseInt(loginTime);
      const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

      // If logged in and within 24 hours, redirect to homepage
      if (elapsed < TWENTY_FOUR_HOURS) {
        navigate("/home-page", { replace: true });
      } else {
        // Session expired, clear storage
        localStorage.removeItem("authToken");
        localStorage.removeItem("loginTime");
        localStorage.removeItem("authUser");
        localStorage.removeItem("isSubUser");
        sessionStorage.removeItem("userLoggedIn");
        sessionStorage.removeItem("justLoggedIn");
        sessionStorage.removeItem("promoShownThisSession");
      }
    }
  }, [navigate]);

  return (
    <div
      style={{ background: "rgba(0, 0, 0, 0.5)" }}
      className="fixed inset-0 w-screen h-screen flex justify-center items-center"
    >
      <div
        className="w-[95vw] sm:w-[80vw] md:w-[40vw] h-[90vh] rounded-[22px] flex flex-col items-center justify-center px-2 sm:px-4 md:px-6 gap-3 sm:gap-4"
        style={{
          background: "radial-gradient(closest-side, #20B15A, #0E4B26)",
        }}
      >
        <div className="flex flex-col items-center justify-center w-full h-full py-4 gap-4">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center">
            Welcome
          </h1>
          <p className="text-white/90 text-[12px] sm:text-[14px] text-center max-w-full sm:max-w-xl px-2 sm:px-0">
            Opti Slip Database System, your all-in-one platform for managing
            your optical business efficiently. This website is designed to help
            you easily manage customer information, generate professional
            digital slips, and maintain accurate customer records all in one
            secure place.
          </p>
          <div className="w-full max-w-[500px] sm:max-w-[600px] flex justify-center">
            <img
              src="welcome.png"
              alt="Welcome"
              className="w-[400px] sm:w-[500px] h-auto rounded-lg shadow-lg"
            />
          </div>
          <div className="flex flex-row gap-4 w-full sm:w-[60%] max-w-[400px] justify-center">
            <Link
              to="/signin"
              className="bg-white text-green-600 font-semibold md:py-3 px-6 py-3 rounded-lg hover:bg-gray-100 transition"
            >
              Sign In
            </Link>
            <Link
              to="/signup"
              className="border border-white text-white font-semibold md:py-3 px-6 py-3 rounded-lg hover:bg-white hover:text-green-600 transition"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
