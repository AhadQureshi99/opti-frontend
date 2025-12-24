import { FaArrowLeft, FaSearch } from "react-icons/fa";
import { Link } from "react-router-dom";
import { FaPhoneAlt } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { RiDeleteBinLine } from "react-icons/ri";
import { MdRemoveRedEye } from "react-icons/md";
import { useState, useEffect } from "react";
import Customerorder from "./Customerorder";
import { get, del } from "../utils/api";
import { useToast } from "../components/ToastProvider";

export default function Searchrecord() {
  const [showSlip, setShowSlip] = useState(false);
  const [orders, setOrders] = useState([]);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const toast = useToast();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        let isAdmin = false;
        try {
          const profile = await get("/api/user/profile", {
            cacheKey: "profile",
          }).catch(() => null);
          const u = profile && profile.user ? profile.user : profile;
          isAdmin = !!(u && u.isAdmin);
        } catch (e) {}

        let list = [];
        if (isAdmin) {
          const data = await get("/api/orders/all", { cacheKey: "orders" });
          list = Array.isArray(data) ? data : data.orders || data;
        } else {
          const data = await get("/api/orders?includeArchived=true", {
            cacheKey: "orders",
          }).catch(() => []);
          list = Array.isArray(data) ? data : data.orders || data || [];
        }

        setOrders(list || []);
        setResults([]);
      } catch (err) {
        console.error("Failed to load orders", err);
        toast.addToast(err?.body?.message || "Failed to load orders", {
          type: "error",
        });
      } finally {
        setLoading(false);
      }
    })();

    const onArchived = () => {
      (async () => {
        try {
          setLoading(true);
          const data = await get("/api/orders?includeArchived=true", {
            cacheKey: "orders",
          }).catch(() => []);
          const list = Array.isArray(data) ? data : data.orders || data || [];
          setOrders(list || []);
        } catch (e) {
          console.error("Failed to refresh orders after archive", e);
        } finally {
          setLoading(false);
        }
      })();
    };

    window.addEventListener("order-archived", onArchived);

    return () => {
      window.removeEventListener("order-archived", onArchived);
    };
  }, []);

  const handleSearch = async () => {
    try {
      setLoading(true);
      setSearched(true);
      if (orders && orders.length > 0) {
        const q = (query || "").trim().toLowerCase();
        if (!q) {
          setResults(orders);
        } else {
          const filtered = orders.filter((o) => {
            const name = (o.patientName || "").toLowerCase();
            const phone = (o.whatsappNumber || o.whatsapp || "").toLowerCase();
            const id = (o._id || "").toString().toLowerCase();
            const tracking = (o.trackingId || "").toString().toLowerCase();
            return (
              name.includes(q) ||
              phone.includes(q) ||
              id.includes(q) ||
              tracking.includes(q)
            );
          });
          setResults(filtered);
        }
      } else {
        let list = [];
        try {
          const profile = await get("/api/user/profile", {
            cacheKey: "profile",
          }).catch(() => null);
          const u = profile && profile.user ? profile.user : profile;
          const isAdmin = !!(u && u.isAdmin);

          if (isAdmin) {
            const data = await get("/api/orders/all", { cacheKey: "orders" });
            list = Array.isArray(data) ? data : data.orders || data;
          } else {
            const [pending, completed] = await Promise.all([
              get("/api/orders/pending", { cacheKey: "orders" }).catch(
                () => []
              ),
              get("/api/orders/completed", { cacheKey: "orders" }).catch(
                () => []
              ),
            ]);
            const p = Array.isArray(pending)
              ? pending
              : pending.pending || pending || [];
            const c = Array.isArray(completed)
              ? completed
              : completed.completed || completed || [];
            list = [...p, ...c];
          }
        } catch (e) {
          console.error("Failed to fetch orders for search fallback", e);
        }

        setOrders(list);
        const q = (query || "").trim().toLowerCase();
        if (!q) setResults(list);
        else
          setResults(
            list.filter((o) => {
              const name = (o.patientName || "").toLowerCase();
              const phone = (
                o.whatsappNumber ||
                o.whatsapp ||
                ""
              ).toLowerCase();
              const id = (o._id || "").toString().toLowerCase();
              const tracking = (o.trackingId || "").toString().toLowerCase();
              return (
                name.includes(q) ||
                phone.includes(q) ||
                id.includes(q) ||
                tracking.includes(q)
              );
            })
          );
      }
    } catch (err) {
      console.error("Search failed", err);
      toast.addToast(err?.body?.message || "Search failed", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (orderId) => {
    if (!orderId) return;
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      toast.addToast("Deleting...", { type: "info" });
      await del(`/api/orders/${orderId}`, { cacheKey: "orders" });
      setResults((r) => r.filter((o) => (o._id || o.id) !== orderId));
      setOrders((o) => o.filter((x) => (x._id || x.id) !== orderId));
      toast.addToast("Order archived", { type: "success" });
    } catch (err) {
      console.error("Delete failed", err);
      toast.addToast(err?.body?.message || "Failed to delete order", {
        type: "error",
      });
    }
  };

  return (
    <div className="w-full bg-[white] h-screen ">
      <Link
        to="/home-page"
        className="relative flex items-center justify-center px-10 pt-10 mb-10"
      >
        <FaArrowLeft
          className="
            absolute left-10 top-10
            w-7 h-6
            text-black
            cursor-pointer
            transition-all duration-300
            hover:text-green-600
            hover:-translate-x-1
          "
        />
      </Link>

      <div className="flex justify-center items-center mt-10">
        <div className="bg-white/95 w-[90%] rounded-[25px] text-center sm:p-10 p-6 shadow-[0_20px_40px_rgba(0,0,0,0.1)]">
          <h1 className="font-bold text-[25px] text-[#007A3F] text-center">
            Search Records
          </h1>

          <p className="text-[#718096] text-[18px] font-medium mt-4 mb-10">
            Search patient orders by name, tracking ID, or WhatsApp number
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-3xl mx-auto">
            <div className="relative w-full">
              <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-[#169D53] text-[20px]" />

              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                type="text"
                placeholder="Search by Patient Name, Tracking ID, or WhatsApp Number..."
                className="
                  w-full
                  bg-white
                  border-2 border-[#e2e8f0]
                  rounded-[15px]
                  pl-14 pr-6 py-5
                  text-[16px]
                  outline-none
                  focus:border-[#169D53]
                  focus:shadow-lg
                  transition-all duration-300
                "
              />
            </div>

            <button
              onClick={handleSearch}
              disabled={!query.trim()}
              className={`
                flex items-center justify-center gap-3
                w-full sm:w-auto
                px-10 py-5
                rounded-[15px]
                font-bold text-[16px]
                transition-all duration-300
                shadow-lg
                ${
                  !query.trim()
                    ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                    : "bg-[#169D53] text-white hover:bg-green-600"
                }
              `}
            >
              <FaSearch size={20} />
              Search
            </button>
          </div>

          <div className="mt-8 bg-[rgba(22,157,83,0.05)] border-l-4 border-l-[#169D53] rounded-r-lg p-5 max-w-3xl mx-auto">
            <p className="text-[#718096] text-[15px]">
              <strong className="font-semibold">Search Tips:</strong> You can
              search by patient name, tracking ID (e.g., ORD20241225_1234), or
              WhatsApp number.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10 px-4">
        <div className="flex justify-between items-center max-w-5xl mx-auto mb-6">
          <h2 className="text-[#007A3F] font-bold text-2xl">Search Results</h2>
          <div className="text-white font-bold px-6 py-2 rounded-full shadow-lg bg-[#169D53]">
            {loading
              ? "Searching..."
              : searched
              ? `${results.length} Found`
              : "Enter a search term"}
          </div>
        </div>

        {loading && (
          <div className="text-center text-[#007A3F] text-lg mt-10">
            Loading results...
          </div>
        )}

        {!loading && (!searched || (searched && results.length === 0)) && (
          <div className="flex flex-col items-center mt-10">
            <div className="bg-white/95 rounded-2xl shadow-2xl w-full max-w-4xl p-10 text-center">
              <FaSearch className="text-6xl text-gray-300 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-gray-800 mb-4">
                {!searched ? "Ready to Search" : "No Records Found"}
              </h3>
              <p className="text-gray-600 text-lg mb-3">
                {!searched
                  ? "Enter a patient name, tracking ID, or WhatsApp number above to begin."
                  : `No orders found matching "${query}"`}
              </p>
              <p className="text-gray-500">
                Try different keywords or check your spelling.
              </p>
            </div>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="flex flex-col gap-6 mt-6 pb-20 max-w-5xl mx-auto">
            {results.map((order, index) => (
              <div key={order._id || index} className="flex justify-center">
                <div className="bg-white w-full rounded-3xl p-6 shadow-xl border border-gray-200 hover:shadow-2xl transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900">
                        {order.patientName || "Unknown Patient"}
                      </h3>
                      <p className="text-lg text-gray-700 font-medium mt-1">
                        Tracking ID: {order.trackingId || order._id}
                      </p>
                      <p className="text-base text-gray-600 mt-2 flex items-center gap-2">
                        <FaPhoneAlt className="text-[#169D53]" />
                        {order.whatsappNumber || order.whatsapp || "No number"}
                      </p>
                    </div>

                    <div className="flex gap-6 items-center">
                      <FaPhoneAlt
                        className="text-[#007A3F] cursor-pointer hover:scale-110 transition"
                        size={28}
                      />

                      <MdRemoveRedEye
                        className="text-[#019AF8] cursor-pointer hover:scale-110 transition"
                        size={28}
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowSlip(true);
                        }}
                      />

                      <MdEdit
                        className="text-[#FF9101] cursor-pointer hover:scale-110 transition"
                        size={28}
                      />

                      <RiDeleteBinLine
                        className="text-[#FF0000] cursor-pointer hover:scale-110 transition"
                        size={28}
                        onClick={() => handleDelete(order._id || order.id)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {showSlip && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex justify-center items-center z-50 p-4">
            <div className="bg-white max-h-[95vh] w-full max-w-4xl rounded-2xl shadow-2xl overflow-y-auto relative">
              <button
                onClick={() => setShowSlip(false)}
                className="absolute top-4 right-4 text-3xl text-gray-600 hover:text-gray-900 z-10"
              >
                ✕
              </button>
              <div className="p-6">
                <Customerorder order={selectedOrder} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
