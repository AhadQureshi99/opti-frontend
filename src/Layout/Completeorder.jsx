import {
  FaArrowLeft,
  FaCalendarAlt,
  FaCheckCircle,
  FaSearch,
  FaPhoneAlt,
} from "react-icons/fa";

import { IoChevronDown } from "react-icons/io5";

import { MdRemoveRedEye, MdEdit } from "react-icons/md";

import { RiDeleteBinLine } from "react-icons/ri";

import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Customerorder from "./Customerorder";
import { get, del } from "../utils/api";
import { formatCurrency } from "../utils/currency";
import { useToast } from "../components/ToastProvider";

export default function Completeorder() {
  const navigate = useNavigate();
  const [showSlip, setShowSlip] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rangeText, setRangeText] = useState("Nov 1 To Nov 30");
  const [currencySymbol, setCurrencySymbol] = useState("₹");

  const quickRanges = [
    { label: "Today", handler: () => handleQuickRange(0) },
    { label: "Last 7 Days", handler: () => handleQuickRange(7) },
    { label: "Last 30 Days", handler: () => handleQuickRange(30) },
  ];

  function handleQuickRange(days) {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days + 1);
    setStartDate(start.toISOString().split("T")[0]);
    setEndDate(end.toISOString().split("T")[0]);
    setRangeText(
      `${start.toLocaleDateString()} To ${end.toLocaleDateString()}`
    );
    setOpen(false);
  }

  const applyFilter = () => {
    if (startDate && endDate) setRangeText(`${startDate} To ${endDate}`);
    setOpen(false);
  };

  const cancelFilter = () => setOpen(false);

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      if (!mounted) return;
      setLoading(true);
      try {
        const [ordersData, profileData] = await Promise.all([
          get("/api/orders/completed", { cacheKey: "orders" }).catch((e) => {
            console.error("Failed to fetch completed orders", e);
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

        // Merge with offline queue orders (completed orders from offline)
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

          // Combine with fetched orders, avoiding duplicates
          const ids = new Set(allOrders.map((o) => o._id || o.id));
          allOrders = [
            ...offlineOrders.filter((o) => !ids.has(o._id)),
            ...allOrders,
          ];
        } catch (e) {
          console.error("Failed to merge offline orders", e);
        }

        setOrders(allOrders);
        const u =
          profileData && profileData.user ? profileData.user : profileData;
        if (u && u.currency) {
          const m = (u.currency || "").match(/\(([^)]+)\)/);
          if (m) setCurrencySymbol(m[1]);
          else setCurrencySymbol((u.currency || "").split(" ")[0] || "₹");
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

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this order?")) return;
    try {
      await del(`/api/orders/${id}`, { id, cacheKey: "orders" });
      setOrders((prev) => prev.filter((o) => o._id !== id));
      toast.addToast("Order deleted", { type: "success" });
      // notify other parts of the app (search) that an order was archived
      try {
        window.dispatchEvent(
          new CustomEvent("order-archived", { detail: { id } })
        );
      } catch (e) {}
    } catch (err) {
      console.error(err);
      toast.addToast(err?.body?.message || "Failed to delete order", {
        type: "error",
      });
    }
  };

  return (
    <div className="w-full bg-[white] h-screen ">
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
            className="flex items-center gap-[12px] ml-12 border-1 border-[#e9ecef] rounded-full px-[14px] py-[10px] shadow-sm bg-[#f8f9fa] hover:shadow-md transition-all"
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

      <h1 className="font-bold text-[25px] text-[#007A3F] text-center">
        Completed Orders
      </h1>

      {loading ? (
        <div className="flex justify-center py-12">Loading...</div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col items-center">
          <div className="bg-white rounded-[12px] shadow-[0_2px_10px_rgba(0,0,0,0.1)] sm:w-[90%] w-full overflow-hidden px-6 flex justify-center items-center">
            <div className="text-center text-gray-600 space-y-4 py-10 px-6">
              <FaCheckCircle className="text-[48px] text-gray-300 mx-auto" />
              <h3 className="text-[1.25rem]">No Completed Orders</h3>
              <p className="text-[#666]">
                You don't have any completed orders at the moment.
              </p>
            </div>
          </div>
        </div>
      ) : (
        orders.map((order, index) => (
          <div
            className="flex justify-center items-center mt-10"
            key={order._id || index}
          >
            <div className="bg-black/10 w-full sm:w-[90%] rounded-[20px] p-4 sm:p-5 shadow-md border border-white/40 mb-10">
              <div className="flex flex-col gap-4 sm:gap-4">
                <div>
                  <h1 className="text-[16px] sm:text-[20px] font-bold text-gray-900 break-words">
                    {order.patientName || order.name || "Unknown"}
                    {String(order._id || "").startsWith("local-") && (
                      <span className="ml-2 inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full font-semibold">
                        Local
                      </span>
                    )}
                  </h1>
                  <p className="text-[12px] sm:text-[14px] text-gray-700 font-medium break-all">
                    {order.trackingId || order._id}
                  </p>
                  <p className="text-[12px] sm:text-[14px] text-gray-700 break-all">
                    {order.whatsappNumber}
                  </p>
                  <p className="text-[12px] sm:text-[14px] text-gray-700">
                    Amount: {formatCurrency(order?.totalAmount, currencySymbol)}
                  </p>
                </div>

                <div className="flex flex-wrap gap-3 items-center justify-start sm:justify-end">
                  {order?.whatsappNumber ? (
                    <a
                      href={`tel:${order.whatsappNumber}`}
                      className="text-[#007A3F] flex-shrink-0"
                      title={`Call ${order.whatsappNumber}`}
                    >
                      <FaPhoneAlt className="cursor-pointer" size={20} />
                    </a>
                  ) : (
                    <FaPhoneAlt
                      className="text-[#007A3F] cursor-not-allowed opacity-50 flex-shrink-0"
                      size={20}
                    />
                  )}

                  <MdRemoveRedEye
                    className="text-[#019AF8] cursor-pointer flex-shrink-0"
                    size={20}
                    onClick={() => {
                      setSelectedOrder(order);
                      setShowSlip(true);
                    }}
                  />

                  <MdEdit
                    className="text-[#FF9101] cursor-pointer flex-shrink-0"
                    size={20}
                    onClick={() => navigate("/new-order", { state: { order } })}
                  />

                  {order?.whatsappNumber ? (
                    <a
                      href={`https://wa.me/${String(
                        order.whatsappNumber
                      ).replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="cursor-pointer flex-shrink-0"
                      title={`Chat ${order.whatsappNumber} on WhatsApp`}
                    >
                      <svg height="20" width="20" viewBox="0 0 32 32">
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
                    <svg
                      height="20"
                      width="20"
                      viewBox="0 0 32 32"
                      className="opacity-50 flex-shrink-0"
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
                  )}

                  <RiDeleteBinLine
                    className="text-[#FF0000] cursor-pointer"
                    size={24}
                    onClick={() => handleDelete(order._id)}
                  />
                </div>
              </div>
            </div>

            {showSlip && (
              <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
                <div className="bg-white max-h-[90vh] w-[90%]  rounded-xl shadow-xl overflow-y-auto relative p-4">
                  <button
                    onClick={() => setShowSlip(false)}
                    className="absolute top-3 right-3 text-black text-[20px] cursor-pointer"
                  >
                    ✕
                  </button>

                  {selectedOrder ? (
                    <Customerorder order={selectedOrder} />
                  ) : (
                    <div className="p-6 text-center">No order selected</div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
