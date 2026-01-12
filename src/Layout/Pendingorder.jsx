import { FaArrowLeft, FaCalendarAlt } from "react-icons/fa";
import { IoChevronDown } from "react-icons/io5";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaInbox } from "react-icons/fa6";
import { FaSearch } from "react-icons/fa";
import { FaPhoneAlt } from "react-icons/fa";
import { MdRemoveRedEye } from "react-icons/md";
import { MdEdit } from "react-icons/md";
import { RiDeleteBinLine } from "react-icons/ri";
import Customerorder from "./Customerorder";
import { get, put, del } from "../utils/api";
import { useToast } from "../components/ToastProvider";

function MarkCompleteButton({ id, onComplete }) {
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const mark = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await put(`/api/orders/${id}/complete`, {}, { id, cacheKey: "orders" });
      toast.addToast("Order marked as complete", { type: "success" });
      if (onComplete) onComplete();
    } catch (err) {
      console.error(err);
      toast.addToast(err?.body?.message || "Failed to mark complete", {
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="bg-green-600 text-white px-2 py-1 text-xs sm:text-sm rounded whitespace-nowrap"
      onClick={mark}
      disabled={loading}
    >
      {loading ? "..." : "Mark Complete"}
    </button>
  );
}

export default function Pendingorder() {
  const navigate = useNavigate();
  const [showSlip, setShowSlip] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rangeText, setRangeText] = useState("Nov 1 To Nov 30");
  const [currencySymbol, setCurrencySymbol] = useState("₹");
  const [shopName, setShopName] = useState("");

  // Helper function to format WhatsApp number with country code
  const formatWhatsAppNumber = (number) => {
    if (!number) return "";
    // Remove all non-numeric characters
    const cleaned = String(number).replace(/[^0-9]/g, "");

    // Pakistani numbers are 11 digits with leading 0 (e.g., 03001234567)
    // Remove leading 0 and add country code 92
    if (cleaned.length === 11 && cleaned.startsWith("0")) {
      return "92" + cleaned.substring(1);
    }
    // If 10 digits without leading 0, add 92
    if (cleaned.length === 10) {
      return "92" + cleaned;
    }
    // If already has country code (12+ digits), use as is
    return cleaned;
  };

  const quickRanges = [
    { label: "Today", handler: () => handleQuickRange(0) },
    { label: "Last 7 Days", handler: () => handleQuickRange(7) },
    { label: "Last 30 Days", handler: () => handleQuickRange(30) },
  ];

  const handleQuickRange = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days + 1);
    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
    setRangeText(
      `${start.toLocaleDateString()} To ${end.toLocaleDateString()}`
    );
    setOpen(false);
  };

  const applyFilter = () => {
    if (startDate && endDate) {
      setRangeText(`${startDate} To ${endDate}`);
    }
    setOpen(false);
  };

  const cancelFilter = () => {
    setOpen(false);
  };

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      if (!mounted) return;
      setLoading(true);
      try {
        const [ordersData, profileData] = await Promise.all([
          get("/api/orders/pending", { cacheKey: "orders" }).catch((e) => {
            console.error("Failed to fetch pending orders", e);
            return [];
          }),
          get("/api/user/profile", { cacheKey: "profile" }).catch(() =>
            get("/api/user/public-profile").catch(() => null)
          ),
        ]);
        if (!mounted) return;

        let allOrders = Array.isArray(ordersData)
          ? ordersData
          : ordersData || [];

        // Merge with offline queue orders
        try {
          const queue = JSON.parse(
            localStorage.getItem("offline_api_queue") || "[]"
          );
          const offlineOrders = queue
            .filter(
              (op) => op.method === "POST" && op.path === "/api/orders/create"
            )
            .map((op) => ({
              ...op.body,
              _id: op.body._id || op.tempId,
              isOffline: true,
            }));

          const ids = new Set(allOrders.map((o) => o._id || o.id));
          allOrders = [
            ...offlineOrders.filter((o) => !ids.has(o._id)),
            ...allOrders,
          ];
        } catch (e) {
          console.error("Failed to merge offline orders", e);
        }

        // Sort orders: newest first
        allOrders.sort((a, b) => {
          const dateA = new Date(a.createdAt || a.deliveryDate || 0);
          const dateB = new Date(b.createdAt || b.deliveryDate || 0);
          return dateB - dateA;
        });

        setOrders(allOrders);

        const u =
          profileData && profileData.user ? profileData.user : profileData;

        // Set currency symbol
        if (u && u.currency) {
          const m = (u.currency || "").match(/\(([^)]+)\)/);
          if (m) setCurrencySymbol(m[1]);
          else setCurrencySymbol((u.currency || "").split(" ")[0] || "₹");
        }

        // Set shop name from profile if available
        if (u) {
          const nameCandidate =
            u.shopName || u.businessName || (u.shop && u.shop.name) || u.name;
          if (nameCandidate) setShopName(nameCandidate);
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    fetchData();

    function onProcessed() {
      fetchData();
    }
    window.addEventListener("offline-queue-processed", onProcessed);

    return () => {
      mounted = false;
      window.removeEventListener("offline-queue-processed", onProcessed);
    };
  }, []);

  const toast = useToast();

  const handleMarkComplete = async (id) => {
    try {
      const res = await put(
        `/api/orders/${id}/complete`,
        {},
        { id, cacheKey: "orders" }
      );
      setOrders((prev) => prev.filter((o) => o._id !== id));
      toast.addToast("Order marked as complete", { type: "success" });
    } catch (err) {
      console.error(err);
      toast.addToast(err?.body?.message || "Failed to mark complete", {
        type: "error",
      });
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this order?")) return;
    try {
      await del(`/api/orders/${id}`, { id, cacheKey: "orders" });
      setOrders((prev) => prev.filter((o) => o._id !== id));
      toast.addToast("Order deleted", { type: "success" });
    } catch (err) {
      console.error(err);
      toast.addToast(err?.body?.message || "Failed to delete order", {
        type: "error",
      });
    }
  };

  // Helper to format amount safely
  const formatAmount = (amount) => {
    if (amount == null) return "0.00";
    const num = typeof amount === "string" ? parseFloat(amount) : amount;
    return isNaN(num) ? "0.00" : num.toFixed(2);
  };

  // Helper to calculate balance if not provided
  const getBalance = (order) => {
    if (order.balance != null) return formatAmount(order.balance);
    const total = parseFloat(order.totalAmount || 0);
    const paid = parseFloat(order.paidAmount || 0);
    return isNaN(total - paid) ? "0.00" : (total - paid).toFixed(2);
  };

  // Helper to get advance/paid amount
  const getAdvancePaid = (order) => {
    if (order.advance != null) return formatAmount(order.advance);
    if (order.paidAmount != null) return formatAmount(order.paidAmount);
    return "0.00";
  };

  return (
    <div className="w-full bg-[white] h-screen">
      <div className="pb-10 px-10 pt-10 grid grid-cols-1 sm:grid-cols-3 items-center">
        <Link to="/home-page">
          <FaArrowLeft className="w-7 h-6 text-black cursor-pointer transition-all duration-300 hover:text-green-600 hover:-translate-x-1" />
        </Link>

        <img
          src="/Optislipimage.png"
          alt="OptiSlip"
          style={{ filter: "invert(1) grayscale(1) brightness(0)" }}
          className="sm:h-[20vh] h-[12vh] mx-auto"
        />

        <div className="relative inline-block sm:ml-auto">
          <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-[12px] ml-10 border-1 border-[#e9ecef] rounded-full px-[14px] py-[10px] shadow-sm bg-[#f8f9fa] hover:shadow-md transition-all"
          >
            <FaCalendarAlt className="text-gray-600" />
            <span className="text-[#666] font-medium">{rangeText}</span>
            <IoChevronDown className="text-gray-600" />
          </button>

          {open && (
            <div className="absolute right-0 z-50 mt-2 w-[95%] sm:w-[350px] max-w-[400px] bg-white p-4 sm:p-6 rounded-[15px] shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
              <h3 className="text-lg font-semibold mb-4">Select Date Range</h3>

              <div className="flex flex-col gap-3 mb-4">
                <label className="text-sm font-medium">Start Date:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="border border-gray-300 rounded-md p-2 w-full text-sm"
                />

                <label className="text-sm font-medium">End Date:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="border border-gray-300 rounded-md p-2 w-full text-sm"
                />
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {quickRanges.map((range) => (
                  <button
                    key={range.label}
                    onClick={range.handler}
                    className="bg-gray-100 text-gray-800 px-3 py-1 rounded-md hover:bg-gray-200 transition-all text-xs sm:text-sm"
                  >
                    {range.label}
                  </button>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-2">
                <button
                  onClick={cancelFilter}
                  className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={applyFilter}
                  className="px-4 py-2 rounded-md bg-[#169D53] text-white hover:bg-green-600 transition-all text-sm"
                >
                  Apply Filter
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <h1 className="font-bold text-[25px] text-[#007A3F] text-center">
        Pending Orders
      </h1>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 my-6">
        <div className="relative w-full sm:w-[50%]">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#169D53] text-[18px]" />
          <input
            type="text"
            placeholder="Search by Name or Order ID"
            className="w-full bg-white border border-[#e5e7eb] rounded-[14px] pl-12 pr-4 py-3 sm:text-[16px] text-[12px] outline-none focus:border-[#169D53] focus:border-2 transition-all"
          />
        </div>

        <button className="flex items-center gap-2 bg-[#169D53] text-white font-semibold px-6 py-3 rounded-[14px] shadow-sm hover:opacity-90 transition-all w-full sm:w-auto">
          <FaSearch />
          Search
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">Loading...</div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center">
          <div className="bg-white rounded-[12px] shadow-[0_2px_10px_rgba(0,0,0,0.1)] sm:w-[80%] w-full overflow-hidden px-6 flex justify-center items-center">
            <div className="text-center text-gray-600 space-y-4 py-10 px-6">
              <FaInbox className="text-[48px] text-gray-300 mx-auto" />
              <h3 className="text-[1.25rem]">No Pending Orders</h3>
              <p className="text-[#666]">
                You don't have any pending orders at the moment.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-6 mt-6 pb-20 max-w-5xl mx-auto px-4">
          {orders.map((order, index) => {
            const patientName =
              order.patientName ||
              order.name ||
              order.customerName ||
              (order.patient && order.patient.name) ||
              "Customer";
            const items = order.items || order.orderItems || [];

            const shop = shopName || "Your Shop";
            const deliveryDateStr = order.deliveryDate
              ? new Date(order.deliveryDate).toLocaleDateString("en-IN")
              : "ASAP";
            const totalAmt = formatAmount(order.totalAmount);
            const paidAmt = getAdvancePaid(order);
            const balanceAmt = getBalance(order);

            const specialLines = [];
            if (order.frameDetails)
              specialLines.push(`- Frame: ${order.frameDetails}`);
            if (order.lensType) specialLines.push(`- Lens: ${order.lensType}`);

            const itemsSection =
              items.length > 0
                ? items
                    .map(
                      (item, idx) =>
                        `${idx + 1}. ${
                          item.itemName || item.name || "Lens"
                        } × ${item.quantity || 1}`
                    )
                    .join("\n")
                : "No items specified";

            const whatsappMessage =
              `*Valued Customer ${patientName}!*\n\n` +
              `Thank you for placing your order with *${shop}*.\n\n` +
              `*Order Details:*\n` +
              `*Tracking ID:* ${order.trackingId || order._id}\n` +
              `*Delivery Date:* ${deliveryDateStr}\n\n` +
              `*Total Amount:* ${currencySymbol}${totalAmt}\n` +
              `*Paid Amount:* ${currencySymbol}${paidAmt}\n` +
              `*Balance Due:* ${currencySymbol}${balanceAmt}\n\n` +
              `We'll notify you as soon as your glasses are ready for delivery/collection.\n\n` +
              `Thank you for trusting us!\n` +
              `*${shop}*`;

            return (
              <div key={order._id || index} className="flex justify-center">
                <div className="bg-white w-full rounded-3xl p-6 shadow-xl border border-gray-200 hover:shadow-2xl transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {patientName}
                        {String(order._id || "").startsWith("local-") && (
                          <span className="ml-2 inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full font-semibold">
                            Local
                          </span>
                        )}
                      </h3>
                      <p className="text-lg text-gray-700 font-medium mt-1">
                        Tracking ID: {order.trackingId || order._id}
                      </p>
                      <p className="text-base text-gray-600 mt-2 flex items-center gap-2">
                        <FaPhoneAlt className="text-[#169D53]" />
                        {order.whatsappNumber || "No number"}
                      </p>
                      <p className="text-base text-gray-600 mt-1">
                        Amount: {currencySymbol}
                        {formatAmount(order.totalAmount)}
                      </p>
                    </div>

                    <div className="flex gap-2 sm:gap-4 items-center flex-wrap">
                      {/* Call */}
                      {order?.whatsappNumber ? (
                        <a
                          href={`tel:${order.whatsappNumber}`}
                          className="text-[#007A3F]"
                          title="Call"
                        >
                          <FaPhoneAlt className="cursor-pointer hover:scale-110 transition w-7 h-7" />
                        </a>
                      ) : (
                        <FaPhoneAlt className="text-[#007A3F] cursor-not-allowed opacity-50 w-7 h-7" />
                      )}

                      {/* View Slip */}
                      <MdRemoveRedEye
                        className="text-[#019AF8] cursor-pointer hover:scale-110 transition w-7 h-7"
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowSlip(true);
                        }}
                      />

                      {/* Edit */}
                      <MdEdit
                        className="text-[#FF9101] cursor-pointer hover:scale-110 transition w-7 h-7"
                        onClick={() =>
                          navigate("/new-order", { state: { order } })
                        }
                      />

                      {/* WhatsApp Send Order - FIXED & IMPROVED */}
                      {order?.whatsappNumber ? (
                        <a
                          href={`https://wa.me/${formatWhatsAppNumber(
                            order.whatsappNumber
                          )}?text=${encodeURIComponent(whatsappMessage)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="cursor-pointer hover:scale-110 transition"
                          title="Send order details + balance on WhatsApp"
                        >
                          <svg
                            className="w-7 h-7"
                            viewBox="0 0 32 32"
                            fill="none"
                          >
                            <path
                              fill="#25D366"
                              d="M16 .667C7.64.667.667 7.64.667 16c0 2.82.735 5.555 2.132 7.963L0 32l8.315-2.745A15.26 15.26 0 0016 31.333C24.36 31.333 31.333 24.36 31.333 16S24.36.667 16 .667z"
                            />
                            <path
                              fill="#FFF"
                              d="M23.12 19.64c-.34-.17-2.02-1-2.34-1.11-.32-.12-.55-.17-.78.17-.23.34-.88 1.11-1.08 1.34-.2.23-.4.26-.74.09-.34-.17-1.43-.53-2.72-1.69-1-.9-1.69-2.01-1.88-2.35-.2-.34-.02-.52.15-.69.15-.15.34-.4.51-.61.17-.2.23-.34.34-.57.11-.23.06-.43-.03-.6-.09-.17-.78-1.82-1.08-2.49-.28-.63-.57-.54-.78-.55h-.67c-.23 0-.67.09-1.02.43-.34.34-1.34 1.18-1.34 2.85 0 1.67 1.22 3.29 1.39 3.52.17.23 2.38 3.56 5.97 5 .84.36 1.5.59 2.01.76.84.27 1.61.25 2.2.15.67-.1 2.02-.83 2.31-1.62.29-.79.29-1.45.2-1.58-.09-.13-.34-.23-.73-.4z"
                            />
                          </svg>
                        </a>
                      ) : (
                        <svg viewBox="0 0 32 32" className="opacity-50 w-7 h-7">
                          <path
                            fill="#25D366"
                            d="M16 .667C7.64.667.667 7.64.667 16c0 2.82.735 5.555 2.132 7.963L0 32l8.315-2.745A15.26 15.26 0 0016 31.333C24.36 31.333 31.333 24.36 31.333 16S24.36.667 16 .667z"
                          />
                          <path
                            fill="#FFF"
                            d="M23.12 19.64c-.34-.17-2.02-1-2.34-1.11-.32-.12-.55-.17-.78.17-.23.34-.88 1.11-1.08 1.34-.2.23-.4.26-.74.09-.34-.17-1.43-.53-2.72-1.69-1-.9-1.69-2.01-1.88-2.35-.2-.34-.02-.52.15-.69.15-.15.34-.4.51-.61.17-.2.23-.34.34-.57.11-.23.06-.43-.03-.6-.09-.17-.78-1.82-1.08-2.49-.28-.63-.57-.54-.78-.55h-.67c-.23 0-.67.09-1.02.43-.34.34-1.34 1.18-1.34 2.85 0 1.67 1.22 3.29 1.39 3.52.17.23 2.38 3.56 5.97 5 .84.36 1.5.59 2.01.76.84.27 1.61.25 2.2.15.67-.1 2.02-.83 2.31-1.62.29-.79.29-1.45.2-1.58-.09-.13-.34-.23-.73-.4z"
                          />
                        </svg>
                      )}

                      {/* Delete */}
                      <RiDeleteBinLine
                        className="text-[#FF0000] cursor-pointer hover:scale-110 transition w-7 h-7"
                        onClick={() => handleDelete(order._id)}
                      />

                      {/* Mark Complete */}
                      <MarkCompleteButton
                        id={order._id}
                        onComplete={() =>
                          setOrders((prev) =>
                            prev.filter((o) => o._id !== order._id)
                          )
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showSlip && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white max-h-[90vh] w-[90%] rounded-xl shadow-xl overflow-y-auto relative p-4">
            <button
              onClick={() => setShowSlip(false)}
              className="absolute top-3 right-3 text-black text-[20px] cursor-pointer"
            >
              ✕
            </button>
            {selectedOrder ? (
              <Customerorder order={selectedOrder} showDelivered={false} />
            ) : (
              <div className="p-6 text-center">No order selected</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
