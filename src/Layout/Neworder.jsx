import { FaArrowLeft } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { post, put } from "../utils/api";
import { useToast } from "../components/ToastProvider";
import { RiArrowDropDownLine } from "react-icons/ri";

// Generate optic options: starts at 0, minus when scroll up, plus when scroll down
function generateOpticList(maxPlus, maxMinus, step) {
  const arr = [];

  // negative values ↑↑↑ scrolling up
  for (let v = maxMinus; v >= step; v -= step) {
    arr.push("-" + v.toFixed(2));
  }

  // center value
  arr.push("0.00");

  // positive values ↓↓↓ scrolling down
  for (let v = step; v <= maxPlus; v += step) {
    arr.push("+" + v.toFixed(2));
  }

  return arr;
}

// Custom Dropdown Component
function CustomDropdown({
  options,
  value,
  onChange,
  name,
  isScrollable = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll to selected value when dropdown opens
  useEffect(() => {
    if (isOpen && isScrollable && scrollContainerRef.current) {
      setTimeout(() => {
        const selectedElement = scrollContainerRef.current?.querySelector(
          "[data-selected='true']"
        );
        if (selectedElement) {
          selectedElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 0);
    }
  }, [isOpen, isScrollable]);

  const handleScroll = (e) => {
    if (!isScrollable) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    // Get all value buttons
    const buttons = Array.from(container.querySelectorAll("[data-value]"));
    if (buttons.length === 0) return;

    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    const centerY = scrollTop + containerHeight / 2;

    let closestButton = buttons[0];
    let closestDistance = Math.abs(
      closestButton.offsetTop + closestButton.offsetHeight / 2 - centerY
    );

    for (let btn of buttons) {
      const distance = Math.abs(btn.offsetTop + btn.offsetHeight / 2 - centerY);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestButton = btn;
      }
    }

    const option = closestButton.getAttribute("data-value");
    if (option && option !== value) {
      onChange({ target: { name, value: option } });
    }
  };

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border border-gray-300 hover:border-green-600 rounded-lg p-1 sm:p-3 text-xs sm:text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-green-600 transition-all text-left flex justify-between items-center"
      >
        <span className="flex-1 text-left text-black">{value || "Select"}</span>
        <RiArrowDropDownLine
          size={20}
          className={`text-gray-500 flex-shrink-0 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className={`absolute right-0 top-full mt-1 w-1/2 border border-gray-300 bg-white rounded-lg shadow-lg z-10 ${
            isScrollable
              ? "max-h-48 overflow-y-scroll snap-y snap-mandatory"
              : "max-h-48 overflow-y-auto"
          }`}
        >
          {options.map((option) => (
            <button
              key={option}
              type="button"
              data-value={option}
              data-selected={value === option}
              onClick={() => {
                onChange({ target: { name, value: option } });
                setIsOpen(false);
              }}
              className={`w-full text-left px-3 py-2 text-xs sm:text-sm transition-colors snap-center ${
                value === option
                  ? "bg-green-600 text-white font-semibold"
                  : "hover:bg-green-100"
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

export default function Neworder() {
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const editingOrder = location?.state?.order;

  const [isEditing, setIsEditing] = useState(false);
  const [orderId, setOrderId] = useState(null);

  // Generate Sph options (like Calculator - with 0 in center)
  const sphOptions = generateOpticList(24, 24, 0.25);

  // Generate Cyl options (like Calculator - with 0 in center)
  const cylOptions = generateOpticList(6, 6, 0.25);

  // Generate Axis options (1 to 180)
  const axisOptions = [...Array(180)].map((_, i) => (i + 1).toString());

  // Addition options (use same as calculator: +0.25 to +3.00)
  const addOptions = [
    "Select",
    ...Array.from({ length: 12 }, (_, i) => "+" + ((i + 1) * 0.25).toFixed(2)),
  ];

  const [form, setForm] = useState({
    patientName: "",
    whatsappNumber: "",
    frameDetail: "",
    lensType: "",
    totalAmount: "",
    advance: "",
    deliveryDate: "",
    note: "",
    importantNote: "",
    specialNote: "",
    rightSph: "0.00",
    rightCyl: "0.00",
    rightAxis: "",
    leftSph: "0.00",
    leftCyl: "0.00",
    leftAxis: "",
    addInput: "Select",
  });

  useEffect(() => {
    if (editingOrder) {
      setIsEditing(true);
      setOrderId(editingOrder._id || editingOrder.id || null);

      setForm((f) => ({
        ...f,
        patientName:
          editingOrder.patientName ||
          editingOrder.name ||
          editingOrder.customerName ||
          "",
        whatsappNumber: editingOrder.whatsappNumber || "",
        frameDetail:
          editingOrder.frameDetails || editingOrder.frameDetail || "",
        lensType: editingOrder.lensType || "",
        totalAmount:
          editingOrder.totalAmount != null
            ? String(editingOrder.totalAmount)
            : "",
        advance:
          editingOrder.advance != null ? String(editingOrder.advance) : "",
        deliveryDate: editingOrder.deliveryDate
          ? String(editingOrder.deliveryDate).split("T")[0]
          : "",
        note: editingOrder.note || "",
        importantNote: editingOrder.importantNote || editingOrder.note || "",
        rightSph:
          editingOrder.rightEye && editingOrder.rightEye.sph != null
            ? String(editingOrder.rightEye.sph)
            : editingOrder.rightSph || "0.00",
        rightCyl:
          editingOrder.rightEye && editingOrder.rightEye.cyl != null
            ? String(editingOrder.rightEye.cyl)
            : editingOrder.rightCyl || "0.00",
        rightAxis:
          editingOrder.rightEye && editingOrder.rightEye.axis != null
            ? String(editingOrder.rightEye.axis)
            : editingOrder.rightAxis || "",
        leftSph:
          editingOrder.leftEye && editingOrder.leftEye.sph != null
            ? String(editingOrder.leftEye.sph)
            : editingOrder.leftSph || "0.00",
        leftCyl:
          editingOrder.leftEye && editingOrder.leftEye.cyl != null
            ? String(editingOrder.leftEye.cyl)
            : editingOrder.leftCyl || "0.00",
        leftAxis:
          editingOrder.leftEye && editingOrder.leftEye.axis != null
            ? String(editingOrder.leftEye.axis)
            : editingOrder.leftAxis || "",
        addInput: editingOrder.addInput || editingOrder.add || "Select",
        specialNote: editingOrder.specialNote || "",
      }));
    }
  }, [editingOrder]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patientName.trim()) {
      toast.addToast("Please enter patient name", { type: "error" });
      return;
    }
    if (!form.whatsappNumber.trim()) {
      toast.addToast("Please enter WhatsApp number", { type: "error" });
      return;
    }

    try {
      setLoading(true);
      const total = parseFloat(form.totalAmount) || 0;
      const adv = parseFloat(form.advance) || 0;
      const balance = parseFloat((total - adv).toFixed(2)) || 0;
      const parseNum = (v) => {
        if (!v) return null;
        const n = Number(String(v).replace(/[^0-9+-.]/g, ""));
        return isNaN(n) ? null : n;
      };

      const body = {
        patientName: form.patientName,
        whatsappNumber: form.whatsappNumber,
        frameDetails: form.frameDetail || "",
        lensType: form.lensType,
        totalAmount: total,
        advance: adv,
        balance,
        deliveryDate: form.deliveryDate || new Date().toISOString(),
        note: form.note || "",
        importantNote: form.importantNote || form.note || "",
        specialNote: form.specialNote || "",
        rightEye: {
          sph: parseNum(form.rightSph),
          cyl: parseNum(form.rightCyl),
          axis: parseNum(form.rightAxis),
        },
        leftEye: {
          sph: parseNum(form.leftSph),
          cyl: parseNum(form.leftCyl),
          axis: parseNum(form.leftAxis),
        },
        addInput: form.addInput || "",
        status: editingOrder?.status || "pending",
      };

      if (isEditing && orderId) {
        await put(`/api/orders/${orderId}`, body, {
          id: orderId,
          cacheKey: "orders",
        });
        toast.addToast("Order updated", { type: "success" });
        if (
          (editingOrder && editingOrder.status) === "completed" ||
          body.status === "completed"
        ) {
          navigate("/complete-order");
        } else {
          navigate("/pending-order");
        }
      } else {
        await post("/api/orders/create", body, { cacheKey: "orders" });
        toast.addToast("Order created", { type: "success" });
        navigate("/pending-order");
      }
    } catch (err) {
      console.error(err);
      toast.addToast(err?.body?.message || "Failed to create order", {
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const selectClass =
    "w-full border border-gray-300 hover:border-green-600 rounded-lg p-1 sm:p-3 text-xs sm:text-sm md:text-base focus:outline-none focus:ring-2 focus:ring-green-600 transition-all pr-10";

  return (
    <div className="w-full bg-white min-h-screen pb-10">
      <div className="relative flex items-center justify-center px-5 sm:px-10 pt-4">
        <Link to="/home-page">
          <FaArrowLeft className="absolute left-5 sm:left-10 top-5 w-6 h-6 text-black cursor-pointer hover:text-green-600 hover:-translate-x-1 transition-all duration-300" />
        </Link>
        <img
          src="/Optislipimage.png"
          alt="OptiSlip"
          style={{ filter: "invert(1) grayscale(1) brightness(0)" }}
          className="h-[12vh] sm:h-[20vh] sm:ml-8 ml-4"
        />
      </div>

      <form onSubmit={handleSubmit} className="px-4 sm:px-10">
        <h1 className="text-2xl font-bold text-black my-4">
          {isEditing ? "Edit Order" : "New Order"}
        </h1>
        {/* Patient Name */}
        <div className="my-6">
          <label className="block text-sm font-bold text-black mb-1">
            Patient Name
          </label>
          <input
            name="patientName"
            value={form.patientName}
            onChange={handleChange}
            type="text"
            placeholder="Enter patient name"
            className="w-full border-2 border-black rounded-2xl px-5 py-3 text-base font-bold text-black focus:border-green-600 focus:shadow-md outline-none transition-all"
          />
        </div>

        {/* WhatsApp Number */}
        <div className="my-6">
          <label className="block text-sm font-bold text-black mb-1">
            WhatsApp Number
          </label>
          <input
            name="whatsappNumber"
            value={form.whatsappNumber}
            onChange={handleChange}
            type="tel"
            inputMode="numeric"
            pattern="[0-9+\- ]*"
            placeholder="Enter WhatsApp number"
            className="w-full border-2 border-black rounded-2xl px-5 py-3 text-base font-bold text-black focus:border-green-600 focus:shadow-md outline-none transition-all"
          />
        </div>

        {/* Frame Detail */}
        <div className="my-6">
          <label className="block text-sm font-bold text-black mb-1">
            Frame Detail
          </label>
          <input
            name="frameDetail"
            value={form.frameDetail}
            onChange={handleChange}
            type="text"
            placeholder="Frame Detail"
            className="w-full border-2 border-black rounded-2xl px-5 py-3 text-base font-bold text-black focus:border-green-600 focus:shadow-md outline-none transition-all"
          />
        </div>

        {/* Lens Type */}
        <div className="my-6">
          <label className="block text-sm font-bold text-black mb-1">
            Lens Type
          </label>
          <input
            name="lensType"
            value={form.lensType}
            onChange={handleChange}
            type="text"
            placeholder="Lens Type"
            className="w-full border-2 border-black rounded-2xl px-5 py-3 text-base font-bold text-black focus:border-green-600 focus:shadow-md outline-none transition-all"
          />
        </div>

        {/* Amounts */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 my-6">
            <label className="block text-sm font-bold text-black mb-1">
              Total Amount
            </label>
            <input
              name="totalAmount"
              value={form.totalAmount}
              onChange={handleChange}
              type="number"
              step="0.01"
              min="0"
              placeholder="Total Amount"
              className="w-full border-2 border-black rounded-2xl px-5 py-3 text-base font-bold text-black focus:border-green-600 focus:shadow-md outline-none transition-all"
            />
          </div>

          <div className="flex-1 my-6">
            <label className="text-sm font-bold text-black mb-1">Advance</label>
            <input
              name="advance"
              value={form.advance}
              onChange={handleChange}
              type="number"
              step="0.01"
              min="0"
              placeholder="Advance"
              className="w-full border-2 border-black rounded-2xl px-5 py-3 text-base font-bold text-black focus:border-green-600 focus:shadow-md outline-none transition-all"
            />
          </div>

          <div className="flex-1 my-6">
            <label className="block text-sm font-bold text-black mb-1">
              Balance
            </label>
            <input
              name="balance"
              value={(
                (parseFloat(form.totalAmount) || 0) -
                (parseFloat(form.advance) || 0)
              ).toFixed(2)}
              readOnly
              className="w-full border-2 border-gray-300 rounded-2xl px-5 py-3 text-base font-bold text-gray-600 bg-gray-100 cursor-not-allowed outline-none transition-all"
            />
          </div>
        </div>

        {/* Delivery Date */}
        <div className="my-6">
          <label className="block text-sm font-bold text-black mb-1">
            Delivery Date
          </label>
          <input
            name="deliveryDate"
            value={form.deliveryDate}
            onChange={handleChange}
            type="date"
            className="w-full border-2 border-black rounded-2xl px-5 py-3 text-base font-bold text-black focus:border-green-600 focus:shadow-md outline-none transition-all"
          />
        </div>

        {/* Special Note */}
        <div className="my-6">
          <label className="block text-sm font-bold text-black mb-1">
            Special Note
          </label>
          <textarea
            name="specialNote"
            value={form.specialNote}
            onChange={handleChange}
            placeholder="Add any special instructions or notes for this order"
            rows={3}
            className="w-full border-2 border-black rounded-2xl px-5 py-3 text-base font-bold text-black focus:border-green-600 focus:shadow-md outline-none transition-all resize-none"
          />
        </div>

        {/* Right & Left Eye */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Right Eye */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 md:w-1/2 p-4">
            <div className="bg-green-600 text-white text-center font-semibold py-2 rounded-t-lg mb-4">
              Right Eye
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Sph</label>
                <CustomDropdown
                  options={sphOptions}
                  value={form.rightSph}
                  onChange={handleChange}
                  name="rightSph"
                  isScrollable={true}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Cyl</label>
                <CustomDropdown
                  options={cylOptions}
                  value={form.rightCyl}
                  onChange={handleChange}
                  name="rightCyl"
                  isScrollable={true}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Axis</label>
                <input
                  name="rightAxis"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={form.rightAxis}
                  onChange={handleChange}
                  placeholder="1 to 180"
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>
            </div>
          </div>

          {/* Left Eye */}
          <div className="bg-white rounded-2xl shadow-md border border-gray-100 md:w-1/2 p-4">
            <div className="bg-green-600 text-white text-center font-semibold py-2 rounded-t-lg mb-4">
              Left Eye
            </div>
            <div className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Sph</label>
                <CustomDropdown
                  options={sphOptions}
                  value={form.leftSph}
                  onChange={handleChange}
                  name="leftSph"
                  isScrollable={true}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Cyl</label>
                <CustomDropdown
                  options={cylOptions}
                  value={form.leftCyl}
                  onChange={handleChange}
                  name="leftCyl"
                  isScrollable={true}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Axis</label>
                <input
                  name="leftAxis"
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={form.leftAxis}
                  onChange={handleChange}
                  placeholder="1 to 180"
                  className="w-full border border-gray-300 rounded-lg p-2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ADD Input */}
        <div className="my-6">
          <label className="block text-sm font-bold text-black mb-1">ADD</label>
          <CustomDropdown
            options={addOptions}
            value={form.addInput}
            onChange={handleChange}
            name="addInput"
            isScrollable={true}
          />
        </div>

        <div className="flex justify-center my-10">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 text-white font-bold px-10 py-3 rounded-2xl hover:bg-green-700 transition-all disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Order"}
          </button>
        </div>
      </form>
    </div>
  );
}
