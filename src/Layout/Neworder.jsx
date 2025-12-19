import { FaArrowLeft } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useRef, useEffect } from "react";
import { post, put } from "../utils/api";
import { useToast } from "../components/ToastProvider";
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

export default function Neworder() {
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const editingOrder = location?.state?.order;

  const [isEditing, setIsEditing] = useState(false);
  const [orderId, setOrderId] = useState(null);

  const sphOptions = generateOpticList(24, 24, 0.25);
  const cylOptions = generateOpticList(6, 6, 0.25);
  const addOptions = [
    "Select",
    ...Array.from({ length: 12 }, (_, i) => "+" + ((i + 1) * 0.25).toFixed(2)),
  ];

  // Pre-filled special notes (editable)
  const defaultSpecialNote = `1. Pick Your Glasses Within 7 Days.
2. Order Can't Process Without 50% Advance.
3. Can't Claim If Contact Lens Dries Or Breaks.
4. No Guarantee / Warranty of Any Ordinary Frames.
5. During Fitting & Repairing, We Are Not Responsible for Any Damage.
6. Purchased Frames Or Reading Glasses Can Be Returned or Change within 2 Days`;

  const [form, setForm] = useState({
    patientName: "",
    whatsappNumber: "",
    frameDetail: "",
    lensType: "",
    totalAmount: "",
    advance: "",
    deliveryDate: "",
    specialNote: defaultSpecialNote, // ← Pre-filled here
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

      setForm({
        patientName: editingOrder.patientName || "",
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
        specialNote: editingOrder.specialNote || defaultSpecialNote, // Use existing or default
        rightSph:
          editingOrder.rightEye?.sph != null
            ? String(editingOrder.rightEye.sph)
            : "0.00",
        rightCyl:
          editingOrder.rightEye?.cyl != null
            ? String(editingOrder.rightEye.cyl)
            : "0.00",
        rightAxis:
          editingOrder.rightEye?.axis != null
            ? String(editingOrder.rightEye.axis)
            : "",
        leftSph:
          editingOrder.leftEye?.sph != null
            ? String(editingOrder.leftEye.sph)
            : "0.00",
        leftCyl:
          editingOrder.leftEye?.cyl != null
            ? String(editingOrder.leftEye.cyl)
            : "0.00",
        leftAxis:
          editingOrder.leftEye?.axis != null
            ? String(editingOrder.leftEye.axis)
            : "",
        addInput: editingOrder.addInput || editingOrder.add || "Select",
      });
    }
  }, [editingOrder]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.patientName.trim())
      return toast.addToast("Patient name required", { type: "error" });
    if (!form.whatsappNumber.trim())
      return toast.addToast("WhatsApp number required", { type: "error" });

    try {
      setLoading(true);
      const total = parseFloat(form.totalAmount) || 0;
      const adv = parseFloat(form.advance) || 0;
      const balance = parseFloat((total - adv).toFixed(2));

      const parseNum = (v) => {
        if (!v || v === "Select") return null;
        const n = Number(String(v).replace(/[^0-9+-.]/g, ""));
        return isNaN(n) ? null : n;
      };

      // Generate trackingId on client — same format as server
      let clientTrackingId = null;
      if (!isEditing) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const randomSuffix = String(Math.floor(Math.random() * 10000)).padStart(4, "0");
        clientTrackingId = `ord${year}${month}${day}_${randomSuffix}`;
      }

      const body = {
        patientName: form.patientName.trim(),
        whatsappNumber: form.whatsappNumber.trim(),
        frameDetails: form.frameDetail || "",
        lensType: form.lensType || "",
        totalAmount: total,
        advance: adv,
        balance,
        deliveryDate: form.deliveryDate || new Date().toISOString(),
        specialNote: form.specialNote.trim(), // Save whatever user typed
        rightEye: {
          sph: parseNum(form.rightSph),
          cyl: parseNum(form.rightCyl),
          axis: parseNum(form.rightAxis) || null,
        },
        leftEye: {
          sph: parseNum(form.leftSph),
          cyl: parseNum(form.leftCyl),
          axis: parseNum(form.leftAxis) || null,
        },
        addInput: form.addInput === "Select" ? "" : form.addInput,
        status: editingOrder?.status || "pending",
        ...(clientTrackingId && { trackingId: clientTrackingId }),
      };

      let result;

      if (isEditing && orderId) {
        result = await put(`/api/orders/${orderId}`, body, {
          id: orderId,
          cacheKey: "orders",
        });
        toast.addToast("Order updated successfully", { type: "success" });
      } else {
        result = await post("/api/orders/create", body, { cacheKey: "orders" });
        const finalTrackingId = result.trackingId || clientTrackingId;
        toast.addToast("Order created successfully!", { type: "success" });
        toast.addToast(`Tracking ID: ${finalTrackingId}`, {
          type: "info",
          timeout: 10000,
        });
      }

      navigate("/pending-order");
    } catch (err) {
      toast.addToast(err?.body?.message || "Failed to save order", {
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-white min-h-screen pb-16">
      <div className="relative flex items-center justify-center px-5 pt-6">
        <Link to="/home-page">
          <FaArrowLeft className="absolute left-5 top-6 w-7 h-7 text-black hover:text-green-600 transition-all" />
        </Link>
        <img
          src="/Optislipimage.png"
          alt="OptiSlip"
          className="h-32 sm:h-48"
          style={{ filter: "invert(1) grayscale(1) brightness(0)" }}
        />
      </div>

      <form onSubmit={handleSubmit} className="px-5 sm:px-10 mt-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          {isEditing ? "Edit Order" : "New Order"}
        </h1>

        {/* Patient Info */}
        <div className="space-y-6 mb-8">
          <div>
            <label className="block text-sm font-bold mb-2">Patient Name</label>
            <input
              name="patientName"
              value={form.patientName}
              onChange={handleChange}
              type="text"
              placeholder="Enter patient name"
              className="w-full border-2 border-black rounded-2xl px-5 py-4 text-base font-bold focus:border-green-600 outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold mb-2">
              WhatsApp Number
            </label>
            <input
              name="whatsappNumber"
              value={form.whatsappNumber}
              onChange={handleChange}
              type="tel"
              placeholder="Enter WhatsApp number"
              className="w-full border-2 border-black rounded-2xl px-5 py-4 text-base font-bold focus:border-green-600 outline-none"
              required
            />
          </div>
        </div>

        {/* Frame & Lens */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-bold mb-2">Frame Detail</label>
            <input
              name="frameDetail"
              value={form.frameDetail}
              onChange={handleChange}
              type="text"
              placeholder="Frame details"
              className="w-full border-2 border-black rounded-2xl px-5 py-4 text-base font-bold focus:border-green-600 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Lens Type</label>
            <input
              name="lensType"
              value={form.lensType}
              onChange={handleChange}
              type="text"
              placeholder="Lens type"
              className="w-full border-2 border-black rounded-2xl px-5 py-4 text-base font-bold focus:border-green-600 outline-none"
            />
          </div>
        </div>

        {/* Amounts */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div>
            <label className="block text-sm font-bold mb-2">Total Amount</label>
            <input
              name="totalAmount"
              value={form.totalAmount}
              onChange={handleChange}
              type="number"
              step="0.01"
              placeholder="0.00"
              className="w-full border-2 border-black rounded-2xl px-5 py-4 text-base font-bold focus:border-green-600 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:hidden [&::-webkit-inner-spin-button]:hidden"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Advance</label>
            <input
              name="advance"
              value={form.advance}
              onChange={handleChange}
              type="number"
              step="0.01"
              placeholder="0.00"
              className="w-full border-2 border-black rounded-2xl px-5 py-4 text-base font-bold focus:border-green-600 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:hidden [&::-webkit-inner-spin-button]:hidden"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Balance</label>
            <input
              value={(
                (parseFloat(form.totalAmount) || 0) -
                (parseFloat(form.advance) || 0)
              ).toFixed(2)}
              readOnly
              className="w-full border-2 border-gray-400 rounded-2xl px-5 py-4 text-base font-bold bg-gray-100 cursor-not-allowed"
            />
          </div>
        </div>

        {/* Delivery Date & Note */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-bold mb-2">
              Delivery Date
            </label>
            <input
              name="deliveryDate"
              value={form.deliveryDate}
              onChange={handleChange}
              type="date"
              className="w-full border-2 border-black rounded-2xl px-5 py-4 text-base font-bold focus:border-green-600 outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Special Note</label>
            <textarea
              name="specialNote"
              value={form.specialNote}
              onChange={handleChange}
              rows={6} // Slightly taller to fit pre-filled text comfortably
              placeholder="Any special instructions..."
              className="w-full border-2 border-black rounded-2xl px-5 py-4 text-base font-bold focus:border-green-600 outline-none resize-none"
            />
          </div>
        </div>

        {/* Eyes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10">
          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-white bg-green-600 text-center py-3 rounded-t-2xl -mx-6 -mt-6 mb-6">
              Right Eye
            </h2>
            <div className="space-y-7">
              <div>
                <label className="block text-sm font-semibold mb-2">Sph</label>
                <CustomDropdown
                  options={sphOptions}
                  value={form.rightSph}
                  onChange={handleChange}
                  name="rightSph"
                  placeholder="Select Sph"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Cyl</label>
                <CustomDropdown
                  options={cylOptions}
                  value={form.rightCyl}
                  onChange={handleChange}
                  name="rightCyl"
                  placeholder="Select Cyl"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Axis</label>
                <input
                  name="rightAxis"
                  value={form.rightAxis}
                  onChange={handleChange}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="1 - 180"
                  className="w-full border border-gray-300 rounded-lg px-5 py-3 focus:border-green-600 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-white bg-green-600 text-center py-3 rounded-t-2xl -mx-6 -mt-6 mb-6">
              Left Eye
            </h2>
            <div className="space-y-7">
              <div>
                <label className="block text-sm font-semibold mb-2">Sph</label>
                <CustomDropdown
                  options={sphOptions}
                  value={form.leftSph}
                  onChange={handleChange}
                  name="leftSph"
                  placeholder="Select Sph"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Cyl</label>
                <CustomDropdown
                  options={cylOptions}
                  value={form.leftCyl}
                  onChange={handleChange}
                  name="leftCyl"
                  placeholder="Select Cyl"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Axis</label>
                <input
                  name="leftAxis"
                  value={form.leftAxis}
                  onChange={handleChange}
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  placeholder="1 - 180"
                  className="w-full border border-gray-300 rounded-lg px-5 py-3 focus:border-green-600 outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ADD */}
        <div className="mb-12">
          <label className="block text-sm font-bold mb-2">ADD</label>
          <CustomDropdown
            options={addOptions}
            value={form.addInput}
            onChange={handleChange}
            name="addInput"
            placeholder="Select ADD"
          />
        </div>

        {/* Submit */}
        <div className="text-center">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white font-bold text-lg px-16 py-4 rounded-2xl shadow-lg transition-all disabled:opacity-60"
          >
            {loading
              ? "Saving..."
              : isEditing
              ? "Update Order"
              : "Create Order"}
          </button>
        </div>
      </form>
    </div>
  );
}