import { FaArrowLeft, FaGoogle } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function Signup() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault(); 
    navigate("/verifyemail"); 
  };

  return (
    <div className="bg-[#169D53] w-full h-full min-h-screen">
      <div className="relative flex items-center justify-center px-5 sm:px-10 pt-0">
        <Link to="/signin">
          <FaArrowLeft
            className="absolute left-5 sm:left-8 top-9 w-7 h-6 text-white cursor-pointer transition-all duration-300 hover:-translate-x-1"
          />
        </Link>

        <img
          src="/Optislipimage.png"
          alt="OptiSlip"
          className="h-[12vh] sm:ml-4 ml-4 sm:mt-10 mt-18 sm:h-[34vh]"
        />
      </div>

      <form onSubmit={handleSubmit} className="mx-auto text-white text-center max-w-[500px] w-full p-[25px_20px] mt-4">
        <p className="text-white text-[14px] text-center leading-[1.6] mb-[40px] opacity-90">
          Opti Slip Database System, your all-in-one platform for managing your
          optical business efficiently. This website is designed to help you easily
          manage customer information, generate professional digital slips, and
          maintain accurate customer records all in one secure place.
        </p>

        <label className="block mb-2 font-bold text-white">Email</label>
        <input
          type="text"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email or username"
          className="w-[90%] p-4 bg-[rgba(255,255,255,0.1)] border-2 rounded-xl mb-4 border-[rgba(255,255,255,0.3)] hover:border-[#e5e7eb] outline-none transition-all duration-300"
        />

        <button
          type="submit"
          className="w-[90%] p-4 mt-2 mb-4 border-2 rounded-xl bg-white text-[#169D53] font-bold text-[18px] active:bg-[#0d6efd] active:text-white"
        >
          VERIFY
        </button>

        <Link to="/signin" className="w-[90%] p-4 underline text-[14px] block mx-auto">
          Back
        </Link>

        <div className="flex justify-center my-6">
          <button
            type="button"
            className="flex items-center gap-[5px] px-[20px] py-[12px] rounded-[12px] border-2 border-[rgba(255,255,255,0.3)] bg-[rgba(255,255,255,0.1)] text-white text-[14px] whitespace-nowrap cursor-pointer transition-all duration-300 ease-in-out hover:bg-[rgba(255,255,255,0.2)]"
          >
            <FaGoogle className="text-white" size={20} />
            Sign Up with Google
          </button>
        </div>
      </form>
    </div>
  );
}
