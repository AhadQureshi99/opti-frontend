import { FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useState } from "react";
import { post } from "../utils/api";
import { useToast } from "../components/ToastProvider";
import CustomDropdown from "../components/CustomDropdown";

export default function Addexpense() {
  const [value, setValue] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");

  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const handleSubmit = async (e) => {
    e?.preventDefault?.();

    // Validate required fields
    if (!amount || !value) {
      toast.addToast("Please fill in amount and category", { type: "error" });
      return;
    }

    setLoading(true);
    try {
      // Format date: if user selected a date, use it; otherwise use today
      let dateValue = date;
      if (date) {
        // If date input gives "2025-12-10", convert to ISO datetime
        dateValue = new Date(date).toISOString();
      } else {
        // Default to today
        dateValue = new Date().toISOString();
      }

      const payload = {
        amount: parseFloat(amount),
        category: value,
        date: dateValue,
        description: description || "",
      };

      console.log("Submitting expense:", payload);
      console.log("Category value:", value, "Type:", typeof value);

      // Additional validation
      const validCategories = [
        "Salary",
        "Frame Vendors",
        "Lens Vendor",
        "Box Vendor",
        "Marketing",
        "Accessories",
        "Repair and Maintenance",
        "New Asset Purchase",
        "Shoprent",
        "Welfare",
        "UtilityBills",
        "Other Expense",
      ];

      if (!validCategories.includes(payload.category)) {
        toast.addToast(
          `Invalid category: "${payload.category}". Please select from the dropdown.`,
          {
            type: "error",
          }
        );
        setLoading(false);
        return;
      }

      await post("/api/expenses", payload, { cacheKey: "expenses" });
      toast.addToast("Expense saved", { type: "success" });
      setAmount("");
      setValue("");
      setDate("");
      setDescription("");
    } catch (err) {
      console.error("Expense error:", err);
      toast.addToast(err?.body?.message || "Failed to save expense", {
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white min-h-screen pb-10">
      <div className="relative flex items-center justify-center px-4 sm:px-10 pt-10">
        <Link to="/home-page">
          <FaArrowLeft
            className="
          absolute left-5 sm:left-18 top-14
          w-7 h-6 
          text-black 
          cursor-pointer 
          transition-all duration-300 
          hover:text-green-600 
          hover:-translate-x-1
        "
          />
        </Link>

        <img
          src="/Optislipimage.png"
          alt="OptiSlip"
          style={{ filter: "invert(1) grayscale(1) brightness(0)" }}
          className="h-[10vh] sm:h-[20vh] ml-4"
        />
      </div>

      <div className="w-full px-4 sm:px-0 mt-4">
        <h1 className="font-semibold text-center text-[20px]">Add Expense</h1>
        <div className="relative w-full flex justify-center my-10">
          <label
            className="
          absolute
          -top-5 
          sm:-top-5 
          left-6 sm:left-60
          bg-white
          px-2
          text-sm
          font-bold
          text-black
          z-20
        "
          >
            Amount
          </label>

          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            type="number"
            step="0.01"
            placeholder="0.00"
            className="
          w-full sm:w-[65%]
          mx-1
          px-5 py-5 sm:py-6
          border-2 border-gray-400
          rounded-[25px]
          text-base font-bold
          bg-white text-black
          min-h-[55px]
          focus:border-green-600
          transition-all
          outline-none
        "
          />
        </div>
        <div className="w-full flex justify-center mb-10">
          <div className="w-full sm:w-[65%]">
            <label className="absolute -top-5 sm:-top-5 left-6 sm:left-0 bg-white px-2 text-sm font-bold">
              Category
            </label>

            <CustomDropdown
              options={[
                "Salary",
                "Frame Vendors",
                "Lens Vendor",
                "Box Vendor",
                "Marketing",
                "Accessories",
                "Repair and Maintenance",
                "New Asset Purchase",
                "Shoprent",
                "Welfare",
                "UtilityBills",
                "Other Expense",
              ]}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              name="category"
              placeholder="Select category"
            />
          </div>
        </div>

        <div className="w-full flex justify-center mb-10">
          <div className="w-full sm:w-[65%]">
            <label className="absolute -top-5 sm:-top-5 left-6 sm:left-0 bg-white px-2 text-sm font-bold">
              Date
            </label>

            <input
              value={date}
              onChange={(e) => setDate(e.target.value)}
              type="date"
              placeholder="03-06-2025"
              className="
            w-full
            border-2 border-gray-400
            rounded-[25px]
            text-black
            py-5 px-5
            bg-white
          "
            />
          </div>
        </div>
        <div className="w-full flex justify-center mb-10">
          <div className="w-full sm:w-[65%]">
            <label className="absolute -top-5 sm:-top-5 left-6 sm:left-0 bg-white px-2 text-sm font-bold">
              Description
            </label>

            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              type="text"
              placeholder="Add description (optional)"
              className="
            w-full
            border-2 border-gray-400
            rounded-[25px]
            text-black
            py-5 px-5
            bg-white
          "
            />
          </div>
        </div>
        <div className="flex justify-center mt-8">
          <button
            onClick={handleSubmit}
            className="bg-[#007A3F] text-[18px] text-white py-4 px-12 font-semibold rounded-[20px]"
          >
            + Save Expense
          </button>
        </div>
      </div>
    </div>
  );
}
