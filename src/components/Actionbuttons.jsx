import {
  AiOutlineFileAdd,
  AiOutlineShop,
  AiOutlineBarChart,
} from "react-icons/ai";
import { LuFileCheck } from "react-icons/lu";
import { FiShoppingCart } from "react-icons/fi";
import { FaSearch } from "react-icons/fa";
import { FaArrowTrendUp } from "react-icons/fa6";
import { MdSwapHoriz } from "react-icons/md";
import { BiCube } from "react-icons/bi";
import { MdInventory, MdAddBox } from "react-icons/md";
import { HiClipboardDocumentCheck } from "react-icons/hi2";
import { IoMdClose } from "react-icons/io";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function Actionbuttons() {
  // Check if current user is a sub-user
  const isSubUser =
    typeof window !== "undefined" &&
    localStorage.getItem("isSubUser") === "true";

  const [showPaidFeatureOverlay, setShowPaidFeatureOverlay] = useState(false);

  const handlePaidFeatureClick = (e) => {
    e.preventDefault();
    setShowPaidFeatureOverlay(true);
  };

  return (
    <div className="grid grid-cols-3 md:grid-cols-3 gap-3 md:gap-6 mt-6 mx-2 md:mx-5 mb-6">
      {/* New Order */}
      <Link
        to="/new-order"
        className="bg-[#169D53] text-white md:text-lg text-sm font-semibold 
          text-center py-4 px-3 md:py-6 md:px-5 rounded-xl whitespace-nowrap
          flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:bg-green-700"
      >
        <LuFileCheck className="text-3xl md:text-4xl" />
        <span>New Order</span>
      </Link>

      {/* Pending Order */}
      <Link
        to="/pending-order"
        className="bg-[#169D53] text-white md:text-lg text-sm font-semibold 
          text-center py-4 px-3 md:py-6 md:px-5 rounded-xl whitespace-nowrap
          flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:bg-green-700"
      >
        <FiShoppingCart className="text-3xl md:text-4xl" />
        <span>Pending Order</span>
      </Link>

      {/* Complete Order */}
      <Link
        to="/complete-order"
        className="bg-[#169D53] text-white md:text-lg text-sm font-semibold 
          text-center py-4 px-3 md:py-6 md:px-5 rounded-xl whitespace-nowrap
          flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:bg-green-700"
      >
        <BiCube className="text-3xl md:text-4xl" />
        <span>Complete Order</span>
      </Link>

      {/* Search Record - always visible */}
      <Link
        to="/search-record"
        className="bg-[#169D53] text-white md:text-lg text-sm font-semibold 
          text-center py-4 px-3 md:py-6 md:px-5 rounded-xl whitespace-nowrap
          flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:bg-green-700"
      >
        <FaSearch className="text-3xl md:text-4xl" />
        <span>Search Record</span>
      </Link>

      {/* Add Record */}
      <Link
        to="/add-record"
        className="bg-[#169D53] text-white md:text-lg text-sm font-semibold 
          text-center py-4 px-3 md:py-6 md:px-5 rounded-xl whitespace-nowrap
          flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:bg-green-700"
      >
        <AiOutlineFileAdd className="text-3xl md:text-4xl" />
        <span>Add Record</span>
      </Link>

      {/* Sale Record - HIDDEN FOR SUB-USERS */}
      {!isSubUser && (
        <Link
          to="/salesrecord"
          className="bg-[#169D53] text-white md:text-lg text-sm font-semibold 
            text-center py-4 px-3 md:py-6 md:px-5 rounded-xl whitespace-nowrap
            flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:bg-green-700"
        >
          <AiOutlineBarChart className="text-3xl md:text-4xl" />
          <span>Sales Record</span>
        </Link>
      )}

      {/* My Shop - HIDDEN FOR SUB-USERS */}
      {!isSubUser && (
        <Link
          to="/my-shop"
          className="bg-[#169D53] text-white md:text-lg text-sm font-semibold 
            text-center py-4 px-3 md:py-6 md:px-5 rounded-xl whitespace-nowrap
            flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:bg-green-700"
        >
          <AiOutlineShop className="text-3xl md:text-4xl" />
          <span>My Shop</span>
        </Link>
      )}

      {/* Transpose Calculator */}
      <Link
        to="/calculator"
        className="bg-[#169D53] text-white md:text-lg text-sm font-semibold 
          text-center py-4 px-3 md:py-6 md:px-5 rounded-xl whitespace-nowrap
          flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:bg-green-700"
      >
        <MdSwapHoriz className="text-3xl md:text-4xl" />
        <span>Transpose</span>
      </Link>

      {/* Add Expense */}
      <Link
        to="/addexpense"
        className="bg-[#169D53] text-white md:text-lg text-sm font-semibold 
          text-center py-4 px-3 md:py-6 md:px-5 rounded-xl whitespace-nowrap
          flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:bg-green-700"
      >
        <AiOutlineBarChart className="text-3xl md:text-4xl" />
        <span>Add Expense</span>
      </Link>

      {/* Add Stock - Paid Feature */}
      <button
        onClick={handlePaidFeatureClick}
        className="bg-[#169D53] text-white md:text-lg text-sm font-semibold 
          text-center py-4 px-3 md:py-6 md:px-5 rounded-xl whitespace-nowrap
          flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:bg-green-700 cursor-pointer"
      >
        <MdAddBox className="text-3xl md:text-4xl" />
        <span>Add Stock</span>
      </button>

      {/* View Stock - Paid Feature */}
      <button
        onClick={handlePaidFeatureClick}
        className="bg-[#169D53] text-white md:text-lg text-sm font-semibold 
          text-center py-4 px-3 md:py-6 md:px-5 rounded-xl whitespace-nowrap
          flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:bg-green-700 cursor-pointer"
      >
        <MdInventory className="text-3xl md:text-4xl" />
        <span>View Stock</span>
      </button>

      {/* Self Audit - Paid Feature */}
      <button
        onClick={handlePaidFeatureClick}
        className="bg-[#169D53] text-white md:text-lg text-sm font-semibold 
          text-center py-4 px-3 md:py-6 md:px-5 rounded-xl whitespace-nowrap
          flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:bg-green-700 cursor-pointer"
      >
        <HiClipboardDocumentCheck className="text-3xl md:text-4xl" />
        <span>Self Audit</span>
      </button>

      {/* Paid Feature Overlay */}
      {showPaidFeatureOverlay && (
        <div className="fixed inset-0 backdrop-blur-sm bg-white/10 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 md:p-10 max-w-md mx-4 shadow-2xl relative">
            <button
              onClick={() => setShowPaidFeatureOverlay(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <IoMdClose className="text-2xl" />
            </button>
            <div className="text-center">
              <div className="bg-[#169D53] text-white rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">💎</span>
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-3">
                Paid Feature
              </h2>
              <p className="text-gray-600 mb-6">
                This feature is available in our premium plan. Upgrade to unlock
                advanced functionality!
              </p>
              <button
                onClick={() => setShowPaidFeatureOverlay(false)}
                className="bg-[#169D53] text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-all duration-300"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
