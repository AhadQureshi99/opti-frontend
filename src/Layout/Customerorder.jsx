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
        const data = await get("/api/user/profile");
        if (!mounted) return;
        setShopDetails(data?.user || data || {});
      } catch {
        try {
          const data = await get("/api/user/public-profile");
          if (!mounted) return;
          setShopDetails(data?.user || data || {});
        } catch {
          toast.addToast("Failed to load shop details", { type: "error" });
        }
      }
    };

    fetchShopProfile();
    return () => (mounted = false);
  }, [toast]);

  const handlePrint = () => window.print();

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

  const handleMarkComplete = async () => {
    try {
      await put(`/api/orders/${order._id}/complete`);
      setCompleted(true);
      toast.addToast("Order marked complete", { type: "success" });
    } catch {
      toast.addToast("Failed to complete", { type: "error" });
    }
  };

  const formatAmount = (amount) =>
    amount ? `Rs ${Number(amount).toLocaleString()}` : "N/A";

  return (
    <div className="min-h-screen bg-white pb-10">
      {/* HEADER */}
      <div className="print:hidden bg-gradient-to-b from-[#A8E6A3] to-[#E8FFF0] rounded-b-[40px] pb-6">
        <div className="relative flex items-center justify-center px-4 pt-6">
          <Link to="/new-order">
            <FaArrowLeft className="absolute left-4 text-xl" />
          </Link>
          <img src="/Optislipimage.png" alt="logo" className="h-[14vh]" />
        </div>
      </div>

      {/* SLIP */}
      <div className="flex justify-center mt-4">
        <div
          className="print-page border rounded-xl p-4 text-[13px]"
          style={{ width: "280px" }}
        >
          <div className="text-center mb-2">
            <h1 className="font-bold text-[18px] uppercase">
              {shopDetails.shopName || "OPTISLIP"}
            </h1>
            <p className="text-[11px]">{shopDetails.address}</p>
            <p className="text-[11px]">Phone: {shopDetails.phoneNumber}</p>
            <p className="text-[11px] font-semibold">
              WhatsApp: {shopDetails.whatsappNumber}
            </p>
          </div>

          <hr className="border-dashed mb-2" />

          <Row label="Tracking ID" value={order?.trackingId || order?._id} />
          <Row label="Patient Name" value={order?.patientName} />
          <Row label="WhatsApp" value={order?.whatsappNumber} />

          <hr className="border-dashed my-2" />

          <Row label="Frame" value={order?.frameDetails} />
          <Row label="Lens" value={order?.lensType} />
          <Row label="Total" value={formatAmount(order?.totalAmount)} />
          <Row label="Advance" value={formatAmount(order?.advance)} />
          <Row label="Balance" value={formatAmount(order?.balance)} />

          <div className="flex justify-between mt-2">
            <Eye title="Right Eye" eye={order?.rightEye} />
            <Eye title="Left Eye" eye={order?.leftEye} />
          </div>

          {/* ADD and Special Note */}
          <div className="text-center mt-4">
            <p className="font-semibold">ADD</p>
            <p className="font-bold">
              {order?.addInput && order.addInput !== "Select"
                ? order.addInput
                : "-"}
            </p>

            {order?.specialNote && (
              <>
                <p className="font-semibold mt-2">Special Note</p>
                <p>{order.specialNote}</p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="print:hidden flex justify-center gap-4 mt-5">
        <button onClick={handlePrint} className="bg-gray-200 px-6 py-2 rounded">
          <LuPrinter /> Print
        </button>

        <button
          onClick={handleSave}
          className="bg-[#007A3F] text-white px-6 py-2 rounded"
        >
          <BiSave /> Save
        </button>

        <button
          onClick={handleMarkComplete}
          disabled={completed}
          className={`px-6 py-2 rounded text-white ${
            completed ? "bg-green-500" : "bg-[#007A3F]"
          }`}
        >
          {completed ? "✓ Completed" : "Mark Complete"}
        </button>
      </div>

      {/* ✅ PRINT FIX */}
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
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 280px !important;
            border: 1px solid #000 !important;
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-[12px]">
      <span className="font-medium">{label}:</span>
      <span>{value || "N/A"}</span>
    </div>
  );
}

function Eye({ title, eye = {} }) {
  const format = (v) => (v == null || v === "" ? "-" : Number(v).toFixed(2));
  return (
    <div className="text-[12px]">
      <p className="font-semibold">{title}</p>
      <p>SPH: {format(eye?.sph)}</p>
      <p>CYL: {format(eye?.cyl)}</p>
      <p>AXIS: {eye?.axis ?? "-"}</p>
    </div>
  );
}
