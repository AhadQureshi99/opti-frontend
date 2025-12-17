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
import { Link } from "react-router-dom";

export default function Actionbuttons() {
  return (
    <div className="grid grid-cols-3 md:grid-cols-3 gap-3 md:gap-6 mt-6 mx-2 md:mx-5 mb-6">

      {/* BUTTON COMPONENT */}
      <Link
        to="/new-order"
        className="bg-[#169D53] text-white md:text-lg text-sm font-semibold 
          text-center py-4 px-3 md:py-6 md:px-5 rounded-xl whitespace-nowrap
          flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:bg-green-700"
      >
        <LuFileCheck className="text-3xl md:text-4xl" />
        <span>New Order</span>
      </Link>

      <Link
        to="/pending-order"
        className="bg-[#169D53] text-white md:text-lg text-sm font-semibold 
          text-center py-4 px-3 md:py-6 md:px-5 rounded-xl whitespace-nowrap
          flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:bg-green-700"
      >
        <FiShoppingCart className="text-3xl md:text-4xl" />
        <span>Pending Order</span>
      </Link>

      <Link
        to="/complete-order"
        className="bg-[#169D53] text-white md:text-lg text-sm font-semibold 
          text-center py-4 px-3 md:py-6 md:px-5 rounded-xl whitespace-nowrap
          flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:bg-green-700"
      >
        <BiCube className="text-3xl md:text-4xl" />
        <span>Complete Order</span>
      </Link>

      <Link
        to="/search-record"
        className="bg-[#169D53] text-white md:text-lg text-sm font-semibold 
          text-center py-4 px-3 md:py-6 md:px-5 rounded-xl whitespace-nowrap
          flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:bg-green-700"
      >
        <FaSearch className="text-3xl md:text-4xl" />
        <span>Search Record</span>
      </Link>

      <Link
        to="/add-record"
        className="bg-[#169D53] text-white md:text-lg text-sm font-semibold 
          text-center py-4 px-3 md:py-6 md:px-5 rounded-xl whitespace-nowrap
          flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:bg-green-700"
      >
        <AiOutlineFileAdd className="text-3xl md:text-4xl" />
        <span>Add Record</span>
      </Link>

      <Link
        to="/salesrecord"
        className="bg-[#169D53] text-white md:text-lg text-sm font-semibold 
          text-center py-4 px-3 md:py-6 md:px-5 rounded-xl whitespace-nowrap
          flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:bg-green-700"
      >
        <FaArrowTrendUp className="text-3xl md:text-4xl" />
        <span>Sale Record</span>
      </Link>

      <Link
        to="/mynewshop"
        className="bg-[#169D53] text-white md:text-lg text-sm font-semibold 
          text-center py-4 px-3 md:py-6 md:px-5 rounded-xl whitespace-nowrap
          flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:bg-green-700"
      >
        <AiOutlineShop className="text-3xl md:text-4xl" />
        <span>My Shop</span>
      </Link>

      <Link
        to="/calculator"
        className="bg-[#169D53] text-white md:text-lg text-sm font-semibold 
          text-center py-4 px-3 md:py-6 md:px-5 rounded-xl whitespace-nowrap
          flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:bg-green-700"
      >
        <MdSwapHoriz className="text-3xl md:text-4xl" />
        <span>Transpose</span>
      </Link>

      <Link
        to="/addexpense"
        className="bg-[#169D53] text-white md:text-lg text-sm font-semibold 
          text-center py-4 px-3 md:py-6 md:px-5 rounded-xl whitespace-nowrap
          flex flex-col items-center justify-center gap-2 transition-all duration-300 hover:bg-green-700"
      >
        <AiOutlineBarChart className="text-3xl md:text-4xl" />
        <span>Add Expense</span>
      </Link>
    </div>
  );
}
