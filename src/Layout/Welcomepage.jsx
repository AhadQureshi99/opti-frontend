import React from "react";
import { Link } from "react-router-dom";

export default function Welcome() {
  return (
    <div
      style={{ background: "rgba(0, 0, 0, 0.5)" }}
      className="fixed inset-0 w-full h-full flex justify-center items-start py-10"
    >
      <div
        className="w-[90%] sm:w-[70%] md:w-[50%] max-h-[90vh] rounded-[22px] overflow-auto flex flex-col items-center justify-start px-4 sm:px-6 md:px-6 gap-6 sm:gap-8"
        style={{
          background: "radial-gradient(closest-side, #20B15A, #0E4B26)",
        }}
      >
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mt-4">
          Welcome
        </h1>

        <p className="text-white/90 text-[12px] sm:text-[14px] text-center max-w-full sm:max-w-xl px-2 sm:px-0">
          Opti Slip Database System, your all-in-one platform for managing your
          optical business efficiently. This website is designed to help you
          easily manage customer information, generate professional digital
          slips, and maintain accurate customer records all in one secure place.
        </p>

        <div className="w-full max-w-full sm:max-w-xl px-2 sm:px-0">
          <img
            src="welcome.png"
            alt="Welcome"
            className="w-full h-auto mx-auto rounded-lg"
          />
        </div>

        <div className="flex flex-col gap-4 w-full sm:w-[20%] max-w-xs mb-6 text-center">
          <Link
            to="/signin"
            className="bg-white text-green-600 font-semibold md:py-3 px-6 py-3 mx-auto rounded-lg hover:bg-gray-100 transition"
          >
            Sign In
          </Link>
          <Link
            to="/signup"
            className="border border-white text-white font-semibold md:py-3 px-6 py-3 mx-auto rounded-lg hover:bg-white hover:text-green-600 transition"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
