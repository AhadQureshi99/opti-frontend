import { FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";
import { LuPrinter } from "react-icons/lu";
import { BiSave } from "react-icons/bi";
import { IoClose } from "react-icons/io5";
import { useState, useEffect, useRef } from "react";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { useToast } from "../components/ToastProvider";
import { put, get } from "../utils/api";
import { getCachedData, setCachedData, prefetchData } from "../utils/dataCache";
import { createRoot } from "react-dom/client";
import OrderSlip from "../components/OrderSlip";

export default function Customerorder({ order = null, showDelivered = true }) {
  const toast = useToast();
  const [delivered, setDelivered] = useState(order?.status === "delivered");
  const [shopDetails, setShopDetails] = useState({});

  useEffect(() => {
    let mounted = true;

    const fetchShopProfile = async () => {
      const cacheKey = "shop_profile";

      // Check cache first
      const cached = getCachedData(cacheKey);
      if (cached) {
        setShopDetails(cached);
        // Still fetch in background to keep cache fresh
        fetchInBackground();
        return;
      }

      // Fetch with caching
      try {
        const data = await prefetchData(
          cacheKey,
          async () => {
            try {
              const profileData = await get("/api/user/profile");
              return profileData?.user || profileData || {};
            } catch {
              const publicData = await get("/api/user/public-profile");
              return publicData || {};
            }
          },
          15 * 60 * 1000 // Cache for 15 minutes
        );

        if (!mounted) return;
        setShopDetails(data);
      } catch {
        toast.addToast("Failed to load shop details", { type: "error" });
      }
    };

    const fetchInBackground = async () => {
      try {
        const data = await get("/api/user/profile");
        const shopData = data?.user || data || {};
        setCachedData("shop_profile", shopData, 15 * 60 * 1000);
        if (mounted) setShopDetails(shopData);
      } catch {
        try {
          const data = await get("/api/user/public-profile");
          setCachedData("shop_profile", data || {}, 15 * 60 * 1000);
          if (mounted) setShopDetails(data || {});
        } catch (e) {
          console.debug("Background shop fetch failed", e);
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
    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Print Slip</title>
          <style>
            @page {
              size: 80mm auto;
              margin: 5mm;
            }
            body {
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            }
            * {
              box-sizing: border-box;
            }
            #slip-root {
              max-width: 80mm;
              padding: 3mm;
            }
          </style>
          <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
        </head>
        <body>
          <div id="slip-root"></div>
        </body>
      </html>
    `);
    printWindow.document.close();

    const slipRoot = printWindow.document.getElementById("slip-root");
    const root = createRoot(slipRoot);
    root.render(<OrderSlip order={order} shopDetails={shopDetails} />);

    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  const handleSave = async () => {
    const el = document.querySelector(".print-page");
    if (!el) return;

    // Clone the slip so we can safely tweak colors just for html2canvas
    const clone = el.cloneNode(true);

    const colorProps = [
      "color",
      "backgroundColor",
      "borderColor",
      "borderTopColor",
      "borderRightColor",
      "borderBottomColor",
      "borderLeftColor",
      "outlineColor",
      "textDecorationColor",
      "columnRuleColor",
    ];

    const syncAndFixColors = (src, dst) => {
      if (src.nodeType !== 1 || dst.nodeType !== 1) return;
      const cs = window.getComputedStyle(src);
      colorProps.forEach((prop) => {
        const val = cs[prop];
        if (val && typeof val === "string" && val.includes("oklch(")) {
          if (prop === "backgroundColor") {
            dst.style.backgroundColor = "#ffffff";
          } else {
            dst.style[prop] = "#000000";
          }
        }
      });

      const srcChildren = Array.from(src.children);
      const dstChildren = Array.from(dst.children);
      for (let i = 0; i < srcChildren.length; i++) {
        if (dstChildren[i]) syncAndFixColors(srcChildren[i], dstChildren[i]);
      }
    };

    syncAndFixColors(el, clone);

    const wrapper = document.createElement("div");
    wrapper.style.position = "fixed";
    wrapper.style.left = "-99999px";
    wrapper.style.top = "0";
    wrapper.style.backgroundColor = "#ffffff";
    wrapper.appendChild(clone);
    document.body.appendChild(wrapper);

    try {
      const canvas = await html2canvas(clone, {
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
    } finally {
      document.body.removeChild(wrapper);
    }
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
      <div className="flex justify-center mt-4 mb-8 px-2 sm:px-0">
        <div
          className="print-page rounded-xl p-2 sm:p-4 md:p-6 relative bg-white shadow-lg overflow-auto w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-3xl"
          style={{ minWidth: 0 }}
        >
          <div className="w-full flex justify-center">
            <OrderSlip
              order={order}
              shopDetails={shopDetails}
              viewMode={true}
            />
          </div>
        </div>
      </div>

      {/* ACTIONS */}
      <div className="flex flex-col items-center gap-4 mt-5">
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
        {showDelivered && (
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
        )}
      </div>
    </div>
  );
}
