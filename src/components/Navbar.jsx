import { useState } from "react";
import { FaSearch, FaBars, FaTimes } from "react-icons/fa";
import { IoMdSettings } from "react-icons/io";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
  const [menu, setMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    try {
      // clear auth tokens / session (adjust keys if your app uses different keys)
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("authToken");
      localStorage.removeItem("loginTime");
      // Clear session storage for login and promo flags
      sessionStorage.removeItem("userLoggedIn");
      sessionStorage.removeItem("justLoggedIn");
      sessionStorage.removeItem("promoShownThisSession");
    } catch (e) {
      // ignore
    }
    navigate("/");
  };

  const isSubUser =
    typeof window !== "undefined" &&
    localStorage.getItem("isSubUser") === "true";

  return (
    <>
      {/* Blurred Background Overlay */}
      {menu && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMenu(false)}
        ></div>
      )}

      <nav className="relative bg-white border-b-2  border-gray-200 shadow-md px-3 py-5">
        <div className="relative flex justify-between items-center">
          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button onClick={() => setMenu(!menu)}>
              <FaBars size={25} />
            </button>
          </div>

          {/* Desktop Links */}
          <div className="hidden md:flex space-x-4">
            <Link
              to="/home-page"
              className="text-white font-semibold bg-[#169D53] px-[10px] py-[6px] rounded-[6px] text-lg"
            >
              Home
            </Link>
            <Link
              to="/termsandconditions"
              className="text-green-600 font-semibold hover:bg-[#169D53] hover:text-white text-lg px-[8px] py-[6px] rounded-[6px]"
            >
              Terms & Conditions
            </Link>
            <Link
              to="/privacy-policy"
              className="text-green-600 font-semibold hover:bg-[#169D53] hover:text-white text-lg px-[8px] py-[6px] rounded-[6px]"
            >
              Privacy Policy
            </Link>
          </div>

          {/* LOGO — Center on Mobile, Normal on Desktop */}
          <div className="absolute left-1/2 -translate-x-1/2 md:static md:translate-x-0 flex justify-center">
            <img
              src="/Optislipimage.png"
              alt="OptiSlip"
              style={{ filter: "invert(1) grayscale(1) brightness(0)" }}
              className="h-[60px] w-auto object-contain md:h-[80px]"
            />
          </div>

          {/* Right Side Buttons */}
          <div className="flex items-center space-x-4 md:space-x-6">
            {!isSubUser && (
              <Link
                to="/setting"
                className="hidden md:flex text-green-600 font-semibold hover:bg-[#169D53] hover:text-white text-lg px-[8px] py-[6px] rounded-[6px]"
              >
                <IoMdSettings size={30} />
              </Link>
            )}

            <div className="hidden md:flex items-center space-x-6">
              <Link
                to="/calculator"
                className="bg-[#169D53] text-white px-4 py-2 rounded-md font-semibold text-xl"
              >
                Calculator
              </Link>

              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-md font-semibold text-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* MOBILE MENU */}
        {menu && (
          <div className="fixed top-0 left-0 h-full w-64 max-w-[280px] bg-white shadow-md flex flex-col items-start space-y-0 pt-4 md:hidden z-50 overflow-auto">
            <div className="flex flex-row justify-between items-center w-full px-4 py-2">
              <img
                src="/Optislipimage.png"
                alt="OptiSlip"
                style={{ filter: "invert(1) grayscale(1) brightness(0)" }}
                className="h-12 w-auto object-contain"
              />

              <button onClick={() => setMenu(!menu)}>
                <FaTimes size={20} />
              </button>
            </div>

            <div className="border-t border-gray-200 w-full"></div>

            <Link
              to="/home-page"
              className="text-white font-semibold bg-[#169D53] py-2 text-base w-full px-4 text-left"
            >
              Home
            </Link>
            {/* My Shop - HIDDEN FOR SUB-USERS */}
            {!isSubUser && (
              <Link
                to="/my-shop"
                className="text-[#169D53] font-semibold py-2 text-base w-full px-4 text-left"
              >
                My Shop
              </Link>
            )}

            <div className="border-t border-gray-200 w-full"></div>

            <Link
              to="/termsandconditions"
              className="text-[#169D53] font-semibold py-2 text-base w-full px-4 text-left"
            >
              Terms & Conditions
            </Link>

            <div className="border-t border-gray-200 w-full"></div>

            <Link
              to="/promotionpage"
              className="text-[#169D53] font-semibold py-2 text-base w-full px-4 text-left"
            >
              Promotion
            </Link>

            <div className="border-t border-gray-200 w-full"></div>

            {!isSubUser && (
              <>
                <Link
                  to="/setting"
                  className="text-[#169D53] font-semibold py-2 text-base w-full px-4 text-left"
                >
                  Settings
                </Link>
                <div className="border-t border-gray-200 w-full"></div>
              </>
            )}

            <Link
              to="/privacy-policy"
              className="text-[#169D53] font-semibold py-2 text-base w-full px-4 text-left"
            >
              Privacy Policy
            </Link>

            <div className="border-t border-gray-200 w-full mt-2"></div>

            <div className="w-full flex flex-col items-center px-3 pb-4">
              <Link
                to="/calculator"
                className="bg-[#169D53] text-white px-4 py-2 rounded-md font-semibold w-full text-base text-center"
              >
                Calculator
              </Link>

              <button
                onClick={() => {
                  setMenu(false);
                  handleLogout();
                }}
                className="bg-[#dc3545] text-white px-4 py-2 rounded-md font-semibold text-base mt-2 w-full text-center"
              >
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>
    </>
  );
}
