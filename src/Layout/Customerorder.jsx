import { FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";
import { LuPrinter } from "react-icons/lu";
import { BiSave } from "react-icons/bi";
import { FiShare2 } from "react-icons/fi";
import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useToast } from "../components/ToastProvider";
import { put, get } from "../utils/api";

export default function Customerorder({ order = null }) {
  const toast = useToast();
  const [completed, setCompleted] = useState(false);
  const [shopDetails, setShopDetails] = useState({});

  useEffect(() => {
    let mounted = true;

    const fetchShopProfile = async () => {
      try {
        // First: Try authenticated profile (with cache if available)
        const data = await get("/api/user/profile", { cacheKey: "profile" });
        if (!mounted) return;

        const user = data && data.user ? data.user : data;
        setShopDetails(user || {});
      } catch (err) {
        // Fallback: Try public profile
        try {
          const data = await get("/api/user/public-profile");
          if (!mounted) return;

          const user = data && data.user ? data.user : data;
          setShopDetails(user || {});
        } catch (err2) {
          console.error("Failed to fetch shop profile", err2);
          toast.addToast("Failed to load shop details", { type: "error" });
        }
      }
    };

    fetchShopProfile();

    return () => {
      mounted = false;
    };
  }, [toast]);

  /* ===== PRINT ===== */
  const handlePrint = () => window.print();

  /* ===== SAVE PDF ===== */
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

    const pageWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * pageWidth) / canvas.width;

    pdf.addImage(imgData, "PNG", 0, 10, pageWidth, imgHeight);
    pdf.save(`order-${order?._id || "slip"}.pdf`);
  };

  /* ===== SHARE ===== */
  const handleShare = () => {
    const phone = order?.whatsappNumber?.replace(/[^0-9]/g, "");
    if (!phone) {
      toast.addToast("No WhatsApp number available", { type: "error" });
      return;
    }

    window.open(
      `https://wa.me/${phone}?text=${encodeURIComponent(
        `Order ${order?._id}\nPatient: ${order?.patientName}\nTotal: ${order?.totalAmount}`
      )}`,
      "_blank"
    );
  };

  /* ===== MARK COMPLETE ===== */
  const handleMarkComplete = async () => {
    try {
      await put(`/api/orders/${order._id}/complete`);
      setCompleted(true);
      toast.addToast("Order marked complete", { type: "success" });
    } catch {
      toast.addToast("Failed to complete", { type: "error" });
    }
  };

  // Derive display values exactly like in Herosection
  const displayAddress =
    shopDetails.address ||
    "Civic Center, Mountain View, CA, United States, California";

  const displayWhatsApp =
    shopDetails.whatsappNumber ||
    shopDetails.phoneNumber ||
    "N/A";

  return (
    <div className="min-h-screen bg-white pb-10">
      {/* ===== HEADER (SCREEN ONLY) ===== */}
      <div className="print:hidden bg-gradient-to-b from-[#A8E6A3] to-[#E8FFF0] rounded-b-[40px] pb-6">
        <div className="relative flex items-center justify-center px-4 pt-6">
          <Link to="/new-order">
            <FaArrowLeft className="absolute left-4 text-xl" />
          </Link>
          <img
            src="/Optislipimage.png"
            alt="logo"
            className="h-[14vh]"
            style={{ filter: "brightness(0)" }}
          />
        </div>
      </div>

      {/* ===== SLIP ===== */}
      <div className="flex justify-center mt-4">
        <div
          className="print-page border rounded-xl p-4 text-[13px]"
          style={{ width: "280px" }}
        >
          {/* HEADER */}
          <div className="text-center mb-2">
            <h1 className="font-bold text-[18px] uppercase">
              OPTISLIP
            </h1>
            <p className="text-[11px] leading-tight">
              {displayAddress}
            </p>
            <p className="text-[11px]">
              Phone: {shopDetails.phoneNumber || "N/A"}
            </p>
            <p className="text-[11px] font-semibold">
              WhatsApp: 0{displayWhatsApp}
            </p>
          </div>

          <hr className="border-dashed mb-2" />

          {/* BASIC INFO */}
          <Row label="Tracking ID" value={order?.trackingId || order?._id} />
          <Row label="Patient Name" value={order?.patientName} />
          <Row label="WhatsApp" value={order?.whatsappNumber} />

          <hr className="border-dashed my-2" />

          {/* ORDER INFO */}
          <Row label="Frame" value={order?.frameDetails} />
          <Row label="Lens" value={order?.lensType} />
          <Row label="Total" value={order?.totalAmount} />
          <Row label="Advance" value={order?.advance} />
          <Row
            label="Delivery"
            value={
              order?.deliveryDate
                ? new Date(order.deliveryDate).toLocaleDateString()
                : "N/A"
            }
          />
          <Row label="Balance" value={order?.balance} />

          {/* EYES */}
          <div className="flex justify-between mt-2">
            <Eye title="Right Eye" eye={order?.rightEye} />
            <Eye title="Left Eye" eye={order?.leftEye} />
          </div>

          {/* ADD + NOTE */}
          <div className="text-center mt-4">
            <p className="font-semibold">ADD</p>
            <p className="font-bold">{order?.addInput || "+0.75"}</p>

            {order?.specialNote && (
              <>
                <p className="font-semibold mt-2">Special Note</p>
                <p>{order.specialNote}</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ===== ACTION BUTTONS (SCREEN ONLY) ===== */}
      <div className="print:hidden flex justify-center gap-4 mt-5">
        <button
          onClick={handlePrint}
          className="flex items-center gap-2 bg-gray-200 px-6 py-2 rounded"
        >
          <LuPrinter /> Print
        </button>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 bg-[#007A3F] text-white px-6 py-2 rounded"
        >
          <BiSave /> Save
        </button>
      </div>

      <div className="print:hidden flex justify-center gap-4 mt-4">
        <button onClick={handleShare}>
          <FiShare2 size={22} />
        </button>

        <button
          onClick={handleMarkComplete}
          disabled={completed}
          className={`px-4 py-2 rounded text-white ${
            completed ? "bg-green-500" : "bg-[#007A3F]"
          }`}
        >
          {completed ? "✓ Completed" : "Mark Complete"}
        </button>
      </div>

      {/* ===== PRINT STYLES ===== */}
      <style>{`
        @media print {
          html, body {
            margin: 0;
            padding: 0;
            background: #fff;
          }

          body * {
            visibility: hidden;
          }

          .print-page,
          .print-page * {
            visibility: visible;
          }

          .print-page {
            position: fixed;
            left: 50%;
            top: 25mm;
            transform: translateX(-50%);
            width: 280px !important;
            padding: 10px !important;
            border: 1px solid #000 !important;
            box-sizing: border-box;
            page-break-inside: avoid;
            break-inside: avoid;
            border-radius: 0 !important;
            background: #fff;
          }

          hr {
            border-top: 1px dashed #000;
          }

          @page {
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
}

/* ===== SMALL COMPONENTS ===== */
function Row({ label, value }) {
  return (
    <div className="flex justify-between text-[12px]">
      <span className="font-medium">{label}:</span>
      <span>{value || "N/A"}</span>
    </div>
  );
}

function Eye({ title, eye = {} }) {
  return (
    <div className="text-[12px]">
      <p className="font-semibold">{title}</p>
      <p>SPH: {eye?.sph ?? "-"}</p>
      <p>CYL: {eye?.cyl ?? "-"}</p>
      <p>AXIS: {eye?.axis ?? "-"}</p>
    </div>
  );
}