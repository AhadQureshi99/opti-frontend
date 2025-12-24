import { FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";
import { LuPrinter } from "react-icons/lu";
import { BiSave } from "react-icons/bi";
import { IoClose } from "react-icons/io5";
import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useToast } from "../components/ToastProvider";
import { put, get } from "../utils/api";

export default function Customerorder({ order = null }) {
  const toast = useToast();
  const [delivered, setDelivered] = useState(order?.status === "delivered");
  const [shopDetails, setShopDetails] = useState({});

  useEffect(() => {
    let mounted = true;

    const fetchShopProfile = async () => {
      try {
        const data = await get("/api/user/profile");
        if (!mounted) return;
        setShopDetails(data?.user || data || {});
      } catch {
        try {
          const data = await get("/api/user/public-profile");
          if (!mounted) return;
          setShopDetails(data || {}); // ← public-profile returns flat object
        } catch {
          toast.addToast("Failed to load shop details", { type: "error" });
        }
      }
    };

    fetchShopProfile();
    return () => (mounted = false);
  }, [toast]);

  // Debug: log what we actually get
  useEffect(() => {
    console.log("Shop Details loaded:", shopDetails);
  }, [shopDetails]);

  const handlePrint = () => {
    const el = document.querySelector(".print-page");
    el.classList.add("printing");
    window.print();
    el.classList.remove("printing");
  };

  const handleSave = async () => {
    const el = document.querySelector(".print-page");
    if (!el) return;

    const canvas = await html2canvas(el, {
      scale: 3,
      backgroundColor: "#fff",
      useCORS: true,
    });

    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const imgWidth = pdfWidth - 20;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
    pdf.save(`order-${order?._id || "slip"}.pdf`);
  };

  const handleMarkDelivered = async (e) => {
    const checked = e.target.checked;
    try {
      await put(`/api/orders/${order._id}/delivered`, { delivered: checked });
      setDelivered(checked);
      toast.addToast(
        checked ? "Order marked as delivered" : "Order unmarked as delivered",
        { type: "success" }
      );
    } catch {
      toast.addToast("Failed to update delivery status", { type: "error" });
    }
  };

  const getCurrencySymbol = (currencyString) => {
    if (!currencyString) return "₹";
    const match = currencyString.match(/\((.+)\)$/);
    return match && match[1] ? match[1] : "₹";
  };

  const format = (value) => {
    if (value == null || value === "") return "-";
    const num = Number(value);
    if (isNaN(num)) return "-";
    const sign = num > 0 ? "+" : num < 0 ? "-" : "";
    return `${sign}${Math.abs(num).toFixed(2)}`;
  };

  const formatAmount = (amount) => {
    if (!amount && amount !== 0) return "N/A";
    const symbol = getCurrencySymbol(shopDetails?.currency);
    return `${symbol} ${Number(amount).toLocaleString("en-US")}`;
  };

  return (
    <div className="min-h-screen bg-white pb-10">
      {/* HEADER */}
      <div className="print:hidden bg-gradient-to-b from-[#A8E6A3] to-[#E8FFF0] rounded-b-[40px] pb-6">
        <div className="relative flex items-center justify-center px-4 pt-6">
          <Link
            to="/new-order"
            className="absolute left-4 top-6 flex items-center justify-center w-12 h-12 rounded-full hover:bg-white/30 transition-colors duration-200 cursor-pointer"
          >
            <FaArrowLeft className="text-2xl text-black hover:text-gray-800 transition-colors duration-200" />
          </Link>
          <img src="/Optislipimage.png" alt="logo" className="h-[14vh]" />
        </div>
      </div>

      {/* SLIP */}
      <div className="flex justify-center mt-4">
        <div
          className="print-page border rounded-xl p-4 text-[13px] relative"
          style={{ width: "280px" }}
        >
          {/* ...existing code... (removed X/cross button) */}

          <div className="text-center mb-2">
            <h1 className="font-bold text-[18px] uppercase">
              {shopDetails.shopName || "OPTISLIP"}
            </h1>
            <p className="text-[11px]">{shopDetails.address || "N/A"}</p>

            {/* Phone with Country Code */}
            <p className="text-[11px]">
              Phone:{" "}
              {shopDetails.countryCode && shopDetails.phoneNumber
                ? `${shopDetails.countryCode} ${shopDetails.phoneNumber}`
                : shopDetails.phoneNumber || "N/A"}
            </p>

            {/* WhatsApp with Country Code */}
            <p className="text-[11px] font-semibold">
              WhatsApp:{" "}
              {shopDetails.whatsappCode && shopDetails.whatsappNumber
                ? `${shopDetails.whatsappCode} ${shopDetails.whatsappNumber}`
                : shopDetails.whatsappNumber || "N/A"}
            </p>

            {shopDetails.currency && (
              <p className="text-[11px] mt-1 text-gray-700">
                Currency: {shopDetails.currency}
              </p>
            )}
          </div>

          <hr className="border-dashed mb-2" />

          <Row
            label="Tracking ID"
            value={order?.trackingId || "Not saved"}
            bold
          />
          <Row label="Patient Name" value={order?.patientName} bold />
          <Row label="WhatsApp" value={order?.whatsappNumber} bold />

          <hr className="border-dashed my-2" />

          <Row label="Frame" value={order?.frameDetails} bold />
          <Row label="Lens" value={order?.lensType} bold />
          <Row label="Total" value={formatAmount(order?.totalAmount)} bold />
          <Row label="Advance" value={formatAmount(order?.advance)} bold />
          <Row label="Balance" value={formatAmount(order?.balance)} bold />
          <div className="flex justify-between text-[12px] font-bold">
            <span>Delivery Date:</span>
            <span>
              {order?.deliveryDate ? order.deliveryDate.split("T")[0] : "N/A"}
            </span>
          </div>

          <table className="w-full mt-2 font-bold text-[12px]">
            <thead>
              <tr>
                <th className="text-left">Left Eye</th>
                <th className="text-right">Right Eye</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="text-left">
                  <span className="inline-block w-10">SPH:</span>
                  {format(order?.leftEye?.sph)}
                </td>
                <td className="text-right">
                  <span className="inline-block w-10">SPH:</span>
                  {format(order?.rightEye?.sph)}
                </td>
              </tr>
              <tr>
                <td className="text-left">
                  <span className="inline-block w-10">CYL:</span>
                  {format(order?.leftEye?.cyl)}
                </td>
                <td className="text-right">
                  <span className="inline-block w-10">CYL:</span>
                  {format(order?.rightEye?.cyl)}
                </td>
              </tr>
              <tr>
                <td className="text-left">
                  <span className="inline-block w-10">AXIS:</span>
                  {order?.leftEye?.axis ?? "-"}
                </td>
                <td className="text-right">
                  <span className="inline-block w-10">AXIS:</span>
                  {order?.rightEye?.axis ?? "-"}
                </td>
              </tr>
            </tbody>
          </table>

          <div className="text-center mt-4 font-bold">
            <p>ADD</p>
            <p>
              {order?.addInput && order.addInput !== "Select"
                ? order.addInput
                : "-"}
            </p>

            {order?.specialNote && order.specialNote.trim() !== "" && (
              <>
                <p className="mt-4">Special Note</p>
                {order.specialNote.split("\n").map((line, index) => (
                  <p
                    key={index}
                    className="text-[11px] mt-1 leading-tight font-bold text-left"
                    style={{ textIndent: "-16px", paddingLeft: "16px" }}
                  >
                    {line.replace(/^(\d+)\.\s*/, "$1 - ")}
                  </p>
                ))}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="print:hidden flex flex-col items-center gap-4 mt-5">
        <div className="flex gap-4">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 bg-gray-200 px-6 py-2 rounded hover:bg-gray-300 transition-colors"
          >
            <LuPrinter /> Print
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-[#007A3F] text-white px-6 py-2 rounded hover:bg-[#006633] transition-colors"
          >
            <BiSave /> Save
          </button>
        </div>
        <label className="flex items-center gap-2 mt-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={delivered}
            onChange={handleMarkDelivered}
            disabled={delivered}
            className="accent-green-600 w-5 h-5"
          />
          <span
            className={
              delivered ? "text-green-600 font-semibold" : "text-gray-700"
            }
          >
            {delivered ? "✓ Marked as Delivered" : "Mark as Delivered"}
          </span>
        </label>
      </div>

      {/* PRINT STYLES */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            margin: 0;
            background: white;
          }
          body * {
            visibility: hidden;
          }
          .print-page,
          .print-page * {
            visibility: visible;
          }
          .print-page {
            display: none;
          }
          .print-page.printing {
            display: block;
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 280px !important;
            border: 1px solid #000 !important;
            background: white !important;
            page-break-before: always;
            page-break-after: always;
          }
        }
      `}</style>
    </div>
  );
}

function Row({ label, value, bold }) {
  return (
    <div
      className={`flex justify-between text-[12px] ${bold ? "font-bold" : ""}`}
    >
      <span className={bold ? "font-bold" : "font-medium"}>{label}:</span>
      <span className={bold ? "font-bold" : ""}>{value || "N/A"}</span>
    </div>
  );
}
