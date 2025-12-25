import { FaArrowLeft } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import React, { useRef, useState, useEffect } from "react";
import { useToast } from "../components/ToastProvider";
import { post } from "../utils/api";
import { RiArrowDropDownLine } from "react-icons/ri";

function generateOpticList(maxPlus, maxMinus, step) {
  const arr = [];
  for (let v = maxPlus; v >= step; v -= step) {
    arr.push("+" + v.toFixed(2));
  }
  arr.push("0.00");
  for (let v = step; v <= maxMinus; v += step) {
    arr.push("-" + v.toFixed(2));
  }
  return arr;
}

function CustomDropdown({
  options,
  value,
  onChange,
  name,
  placeholder = "Select",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && listRef.current) {
      const zeroItem = listRef.current.querySelector('[data-value="0.00"]');
      if (zeroItem) {
        zeroItem.scrollIntoView({ block: "center" });
        setTimeout(() => {
          if (listRef.current) {
            const itemHeight = zeroItem.offsetHeight || 48;
            listRef.current.scrollTop -= itemHeight * 1.5;
          }
        }, 0);
      }
    }
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border border-gray-300 hover:border-green-600 rounded-lg px-4 py-3 text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-green-600 transition-all text-left flex justify-between items-center bg-white"
      >
        <span className="text-black">{value || placeholder}</span>
        <RiArrowDropDownLine
          size={22}
          className={`text-gray-600 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          ref={listRef}
          className="absolute left-0 right-0 top-full mt-2 max-h-96 overflow-y-auto border border-gray-300 bg-white rounded-lg shadow-xl z-50"
        >
          {options.map((option) => (
            <button
              key={option}
              type="button"
              data-value={option}
              onClick={() => {
                onChange({ target: { name, value: option } });
                setIsOpen(false);
              }}
              className={`w-full text-left px-5 py-3 text-sm transition-colors ${
                value === option
                  ? "bg-green-600 text-white font-semibold"
                  : "hover:bg-green-50"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Addrecord() {
  const formRef = useRef(null);
  const navigate = useNavigate();
  const toast = useToast();

  // Same options as Neworder.jsx
  const sphOptions = generateOpticList(24, 24, 0.25);
  const cylOptions = generateOpticList(6, 6, 0.25);
  const addOptions = [
    "Select",
    ...Array.from({ length: 12 }, (_, i) => "+" + ((i + 1) * 0.25).toFixed(2)),
  ];

  const [rightSph, setRightSph] = useState("0.00");
  const [rightCyl, setRightCyl] = useState("0.00");
  const [rightAxis, setRightAxis] = useState("");
  const [leftSph, setLeftSph] = useState("0.00");
  const [leftCyl, setLeftCyl] = useState("0.00");
  const [leftAxis, setLeftAxis] = useState("");
  const [addValue, setAddValue] = useState("Select");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = formRef.current;
      const data = {
        patientName:
          form.querySelector('input[name="patientName"]').value || undefined,
        whatsappNumber:
          form.querySelector('input[name="whatsappNumber"]').value || undefined,
        frameDetails:
          form.querySelector('input[name="frameDetails"]').value || undefined,
        lensType:
          form.querySelector('input[name="lensType"]').value || undefined,
        deliveryDate:
          form.querySelector('input[name="deliveryDate"]').value || undefined,
        totalAmount:
          form.querySelector('input[name="totalAmount"]').value || undefined,
        importantNote:
          form.querySelector('textarea[name="importantNote"]').value ||
          undefined,
        rightEye: {
          sph: rightSph === "Select" ? null : parseFloat(rightSph),
          cyl: rightCyl === "Select" ? null : parseFloat(rightCyl),
          axis: rightAxis ? parseInt(rightAxis) : null,
        },
        leftEye: {
          sph: leftSph === "Select" ? null : parseFloat(leftSph),
          cyl: leftCyl === "Select" ? null : parseFloat(leftCyl),
          axis: leftAxis ? parseInt(leftAxis) : null,
        },
        addInput: addValue === "Select" ? "" : addValue,
        isDirectRecord: true,
      };

      await post("/api/orders/create", data, { cacheKey: "orders" });
      toast.addToast("Record added", { type: "success" });

      // Reset form
      try {
        form.reset();
        setRightSph("0.00");
        setRightCyl("0.00");
        setRightAxis("");
        setLeftSph("0.00");
        setLeftCyl("0.00");
        setLeftAxis("");
        setAddValue("Select");
      } catch (err) {}
    } catch (err) {
      console.error(err);
      toast.addToast(err.message || "Create order failed", { type: "error" });
    }
  };

  const handleDropdownChange = (setter) => (e) => {
    setter(e.target.value);
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="w-full bg-white h-fullscreen pb-10"
    >
      <div className="relative flex items-center justify-center px-5 sm:px-10 pt-0">
        <Link to="/home-page">
          <FaArrowLeft
            className="
            absolute left-5 sm:left-18 top-8
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
          className="h-[12vh] sm:ml-8 ml-4 sm:h-[20vh]"
        />
      </div>

      {/* Patient Info */}
      <div className="relative w-full flex flex-row justify-center my-10">
        <label
          className="
          absolute
          sm:-top-4
          -top-4
          sm:left-60
          left-6
          bg-white
          px-2
          text-sm
          font-bold
          text-black
          z-20
        "
        >
          Patient Name
        </label>
        <input
          name="patientName"
          type="text"
          placeholder="Enter patient name"
          className="
          sm:w-[65%]
          sm:px-5 
          sm:py-6
          py-2
          px-5
          w-full
          mx-4
          border-2 
          border-black
          rounded-[25px]
          text-base
          font-bold
          bg-white
          text-gray-400
          min-h-[60px]
          transition-all
          duration-300
          focus:border-green-600
          focus:shadow-md
          outline-none
        "
        />
      </div>

      <div className="relative w-full flex flex-row justify-center my-10">
        <label
          className="
          absolute
          sm:-top-4
          -top-4
          sm:left-60
          left-6
          bg-white
          px-2
          text-sm
          font-bold
          text-black
          z-20
        "
        >
          WhatsApp Number
        </label>
        <input
          name="whatsappNumber"
          type="text"
          placeholder="Enter WhatsApp number"
          className="
          sm:w-[65%]
          sm:px-5 
          sm:py-6
          py-2
          px-5
          w-full
          mx-4
          border-2 
          border-black
          rounded-[25px]
          text-base
          font-bold
          bg-white
          text-gray-400
          min-h-[60px]
          transition-all
          duration-300
          focus:border-green-600
          focus:shadow-md
          outline-none
        "
        />
      </div>

      {/* Frame & Lens */}
      <div className="relative w-full flex flex-row justify-center my-10">
        <label
          className="
          absolute
          sm:-top-4
          -top-4
          sm:left-60
          left-6
          bg-white
          px-2
          text-sm
          font-bold
          text-black
          z-20
        "
        >
          Frame Detail
        </label>
        <input
          name="frameDetails"
          type="text"
          placeholder="Enter frame details"
          className="
          sm:w-[65%]
          sm:px-5 
          sm:py-6
          py-2
          px-5
          w-full
          mx-4
          border-2 
          border-black
          rounded-[25px]
          text-base
          font-bold
          bg-white
          text-gray-400
          min-h-[60px]
          transition-all
          duration-300
          focus:border-green-600
          focus:shadow-md
          outline-none
        "
        />
      </div>

      <div className="relative w-full flex flex-row justify-center my-10">
        <label
          className="
          absolute
          sm:-top-4
          -top-4
          sm:left-60
          left-6
          bg-white
          px-2
          text-sm
          font-bold
          text-black
          z-20
        "
        >
          Lens Type
        </label>
        <input
          name="lensType"
          type="text"
          placeholder="Enter lens type"
          className="
          sm:w-[65%]
          sm:px-5 
          sm:py-6
          py-2
          px-5
          w-full
          mx-4
          border-2 
          border-black
          rounded-[25px]
          text-base
          font-bold
          bg-white
          text-gray-400
          min-h-[60px]
          transition-all
          duration-300
          focus:border-green-600
          focus:shadow-md
          outline-none
        "
        />
      </div>

      {/* Amounts */}
      <div className="relative w-full flex flex-row justify-center my-10">
        <label
          className="
          absolute
          sm:-top-4
          -top-4
          sm:left-60
          left-6
          bg-white
          px-2
          text-sm
          font-bold
          text-black
          z-20
        "
        >
          Total Amount
        </label>
        <input
          name="totalAmount"
          type="text"
          placeholder="Enter total amount"
          className="
          sm:w-[65%]
          sm:px-5 
          sm:py-6
          py-2
          px-5
          w-full
          mx-4
          border-2 
          border-black
          rounded-[25px]
          text-base
          font-bold
          bg-white
          text-gray-400
          min-h-[60px]
          transition-all
          duration-300
          focus:border-green-600
          focus:shadow-md
          outline-none
        "
        />
      </div>

      {/* Delivery Date */}
      <div className="relative w-full flex flex-row justify-center my-10">
        <label
          className="
          absolute
          sm:-top-4
          -top-4
          sm:left-60
          left-6
          bg-white
          px-2
          text-sm
          font-bold
          text-black
          z-20
        "
        >
          Delivery Date
        </label>
        <input
          name="deliveryDate"
          type="date"
          placeholder="Select delivery date"
          className="
          sm:w-[65%]
          sm:px-5 
          sm:py-6
          py-2
          px-5
          w-full
          mx-4
          border-2 
          border-black
          rounded-[25px]
          text-sm
          font-bold
          text-black
          bg-white
          min-h-[60px]
          transition-all
          duration-300
          focus:border-green-600
          focus:shadow-md
          outline-none
        "
        />
      </div>

      {/* Special Note */}
      <div className="relative w-full flex flex-row justify-center">
        <label
          className="
          absolute
          sm:-top-4
          -top-4
          sm:left-60
          left-6
          bg-white
          px-2
          text-sm
          font-bold
          text-black
          z-20
        "
        >
          Special Note
        </label>
        <textarea
          name="importantNote"
          placeholder="Enter any special notes or instructions..."
          className="
          sm:w-[65%]
          sm:px-5 
          sm:py-6
          py-8
          px-5
          w-full
          mx-4
          rows-6
          border-2 
          border-black
          sm:rounded-[25px]
          rounded-[22px]
          text-base
          font-bold
          bg-white
          resize-y
          text-black
          min-h-[60px]
          transition-all
          duration-300
          focus:border-green-600
          focus:shadow-md
          outline-none
        "
        />
      </div>

      {/* Eyes Section - Now matches Neworder exactly */}
      <div className="flex flex-col md:flex-row gap-6 w-full justify-center mt-10 px-4 sm:px-0">
        {/* Right Eye */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 md:w-[45%]">
          <h2 className="text-xl font-bold text-white bg-green-600 text-center py-3 rounded-t-2xl -mx-6 -mt-6 mb-6">
            Right Eye
          </h2>
          <div className="space-y-7">
            <div>
              <label className="block text-sm font-semibold mb-2">Sph</label>
              <CustomDropdown
                options={sphOptions}
                value={rightSph}
                onChange={handleDropdownChange(setRightSph)}
                name="rightSph"
                placeholder="Select Sph"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Cyl</label>
              <CustomDropdown
                options={cylOptions}
                value={rightCyl}
                onChange={handleDropdownChange(setRightCyl)}
                name="rightCyl"
                placeholder="Select Cyl"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Axis</label>
              <input
                type="number"
                placeholder="1 - 180"
                value={rightAxis}
                onChange={(e) => setRightAxis(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-5 py-3 focus:border-green-600 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Left Eye */}
        <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 md:w-[45%]">
          <h2 className="text-xl font-bold text-white bg-green-600 text-center py-3 rounded-t-2xl -mx-6 -mt-6 mb-6">
            Left Eye
          </h2>
          <div className="space-y-7">
            <div>
              <label className="block text-sm font-semibold mb-2">Sph</label>
              <CustomDropdown
                options={sphOptions}
                value={leftSph}
                onChange={handleDropdownChange(setLeftSph)}
                name="leftSph"
                placeholder="Select Sph"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Cyl</label>
              <CustomDropdown
                options={cylOptions}
                value={leftCyl}
                onChange={handleDropdownChange(setLeftCyl)}
                name="leftCyl"
                placeholder="Select Cyl"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Axis</label>
              <input
                type="number"
                placeholder="1 - 180"
                value={leftAxis}
                onChange={(e) => setLeftAxis(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-5 py-3 focus:border-green-600 outline-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ADD - Same style as Neworder */}
      <div className="flex justify-center mt-10 px-4 sm:px-0">
        <div className="w-full max-w-2xl">
          <label className="block text-sm font-bold mb-2">ADD</label>
          <CustomDropdown
            options={addOptions}
            value={addValue}
            onChange={handleDropdownChange(setAddValue)}
            name="addInput"
            placeholder="Select ADD"
          />
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-center sm:my-9 my-1">
        <button
          type="submit"
          className="bg-[#169D53] text-white font-bold px-[30px] text-[18px] py-[15px] rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
        >
          Save Record
        </button>
      </div>
    </form>
  );
}
