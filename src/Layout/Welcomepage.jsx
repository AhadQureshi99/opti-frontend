import React from "react";
import { Link } from "react-router-dom";

export default function Welcome() {
  return (
    <div
      style={{ background: "rgba(0, 0, 0, 0.5)" }}
      className="fixed inset-0 w-screen h-screen flex justify-center items-center"
    >
      <div
        className="w-[95vw] sm:w-[80vw] md:w-[40vw] h-[80vh] rounded-[22px] flex flex-col items-center justify-center px-2 sm:px-4 md:px-6 gap-3 sm:gap-4"
        style={{
          background: "radial-gradient(closest-side, #20B15A, #0E4B26)",
        }}
      >
        <div className="flex flex-col flex-grow items-center justify-between w-full h-full">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white text-center mt-4 mb-2">
            Welcome
          </h1>
          <p className="text-white/90 text-[12px] sm:text-[14px] text-center max-w-full sm:max-w-xl px-2 sm:px-0 mb-2">
            Opti Slip Database System, your all-in-one platform for managing
            your optical business efficiently. This website is designed to help
            you easily manage customer information, generate professional
            digital slips, and maintain accurate customer records all in one
            secure place.
          </p>
          <div className="w-full max-w-[180px] sm:max-w-[220px] px-2 sm:px-0 mb-2 flex justify-center">
            <img
              src="welcome.png"
              alt="Welcome"
              className="w-[120px] sm:w-[180px] h-auto mx-auto rounded-lg"
            />
          </div>
          <div className="flex flex-col gap-3 w-full sm:w-[60%] max-w-[220px] mb-4 text-center">
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
    </div>
  );
}
