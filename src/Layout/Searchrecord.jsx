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
    // load recent orders on mount — for non-admins combine pending+completed, for admin use /orders/all
    (async () => {
      try {
        setLoading(true);
        // detect admin flag from profile
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
          // fetch user-scoped orders including archived so deleted/archived items are searchable
          const data = await get("/api/orders?includeArchived=true", {
            cacheKey: "orders",
          }).catch(() => []);
          list = Array.isArray(data) ? data : data.orders || data || [];
        }

        setOrders(list || []);
        // do not auto-populate results; require user to search
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

    // Listen for archive events so we can refresh search list to include archived items
    const onArchived = () => {
      (async () => {
        try {
          setLoading(true);
          // fetch user-scoped orders including archived so deleted/archived items are searchable
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSearch = async () => {
    try {
      setLoading(true);
      setSearched(true);
      // if we already have orders loaded, filter on client
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
        // fallback: fetch pending and completed, then filter
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
      // remove from local results and orders
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
    <div className="bg-[linear-gradient(135deg,#169D53_0%,#128a43_100%)] w-full h-full min-h-screen">
      <Link
        to="/home-page"
        className="relative flex items-center justify-center px-10 pt-10 mb-10"
      >
        <FaArrowLeft
          className="
            absolute left-10 top-10
            w-12 h-12
            text-[#169D53]
            bg-[rgba(255,255,255,0.9)]
            p-4
            rounded-[12px]
            cursor-pointer
            transition-all duration-300
            hover:bg-white
            hover:-translate-x-1
          "
        />
      </Link>

      <div className="flex justify-center items-center mt-10">
        <div className="bg-white/95 w-[90%] rounded-[25px] text-center sm:p-8 p-4 shadow-[0_4px_15px_rgba(0,0,0,0.05)] mt-10">
          <h1 className="font-extrabold text-[32px] text-[#169D53]">
            Search Records
          </h1>

          <p className="text-[#718096] sm:text-[18px] text-[14px] text-center font-semibold mt-2 flex justify-center items-center ">
            Search patient orders by name, tracking ID, or WhatsApp number
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
            <div className="relative w-full sm:w-[50%]">
              <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#169D53] text-[18px]" />

              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSearch();
                }}
                type="text"
                placeholder="Enter patient name, tracking ID, or phone number..."
                className="
                  w-full
                  bg-white
                  border border-[#e5e7eb]
                  rounded-[14px]
                  pl-12 pr-4 py-3
                  sm:text-[16px]
                  text-[12px]
                  outline-none
                  focus:border-[#169D53]
                  focus:border-2
                  transition-all
                "
              />
            </div>

            <button
              onClick={handleSearch}
              disabled={!query.trim()}
              className={`
                flex items-center gap-2
                ${
                  !query.trim()
                    ? "bg-gray-300 text-gray-600"
                    : "bg-[#169D53] text-white"
                }
                font-semibold
                px-6 py-3
                rounded-[14px]
                shadow-sm
                hover:opacity-90
                transition-all
                w-full sm:w-auto
              `}
            >
              <FaSearch />
              Search
            </button>
          </div>

          <div
            className="
              bg-[rgba(22,157,83,0.05)]
              sm:mt-8 mt-3
              md:p-[20px] p-[8px]
              rounded-[12px]
              border-l-[4px] border-l-[#169D53]
              w-full sm:w-[90%] md:w-[60%]
              mx-auto
            "
          >
            <p className="text-[#718096] sm:text-[15px] text-[12px]">
              <strong className="font-semibold">Search Tips:</strong>
              You can search by patient name, tracking ID (e.g.,
              ORD20241225_1234), or WhatsApp number.
            </p>
          </div>
        </div>
      </div>

      <div className="mt-8 px-4">
        <div className="flex justify-between items-center sm:w-[90%] mx-auto">
          <h2 className="text-white font-semibold text-xl">Search Results</h2>
          <div
            className="text-white text-sm font-semibold px-4 py-1 rounded-full shadow"
            style={{ background: "linear-gradient(135deg, #169D53, #128a43)" }}
          >
            {loading
              ? "Loading..."
              : searched
              ? `${results.length} Found`
              : "Enter a search term"}
          </div>
        </div>

        {loading && (
          <div className="text-center text-white mt-6">Loading results...</div>
        )}

        {!loading && (!searched || (searched && results.length === 0)) && (
          <div className="flex flex-col items-center mt-6">
            <div className="bg-white/95 rounded-[12px] shadow-[0_2px_10px_rgba(0,0,0,0.1)] sm:w-[90%] w-full overflow-hidden px-6 py-10 mx-auto">
              <div className="text-center text-gray-600 space-y-4">
                <FaSearch className="text-[48px] text-gray-300 mx-auto" />
                <h3 className="text-[1.25rem]">
                  {!searched ? "Search Orders" : "No Records Found"}
                </h3>
                <p>
                  {!searched
                    ? "Enter a patient name, tracking ID or phone number to search orders."
                    : `No orders found matching "${query || ""}"`}
                </p>
                <p className="text-[#666]">
                  Try searching with different keywords or check your spelling.
                </p>
              </div>
            </div>
          </div>
        )}

        {!loading && results.length > 0 && (
          <div className="flex flex-col gap-6 mt-6 pb-20">
            {results.map((order, index) => (
              <div
                className="flex justify-center items-center mt-0 px-3"
                key={order._id || index}
              >
                <div className="bg-white/30 w-full sm:w-[90%] rounded-[20px] p-5 shadow-md border border-white/40">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                      <h3 className="text-[18px] sm:text-[20px] font-bold text-gray-900">
                        {order.patientName || "-"}
                      </h3>
                      <p className="text-[13px] sm:text-[14px] text-gray-700 font-medium">
                        {order.trackingId || order._id}
                      </p>
                      <p className="text-sm text-gray-600">
                        {order.whatsappNumber || order.whatsapp || ""}
                      </p>
                    </div>

                    <div className="flex flex-row gap-5 items-center justify-start sm:justify-end">
                      <FaPhoneAlt
                        className="text-[#007A3F] cursor-pointer"
                        size={24}
                      />

                      <MdRemoveRedEye
                        className="text-[#019AF8] cursor-pointer"
                        size={24}
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowSlip(true);
                        }}
                      />

                      <MdEdit
                        className="text-[#FF9101] cursor-pointer"
                        size={24}
                      />

                      <RiDeleteBinLine
                        className="text-[#FF0000] cursor-pointer"
                        size={24}
                        onClick={() => handleDelete(order._id || order.id)}
                      />
                    </div>
                  </div>
                </div>

                {showSlip && (
                  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex justify-center items-center z-50">
                    <div className="bg-white max-h-[90vh] w-[90%] rounded-xl shadow-xl overflow-y-auto relative p-4">
                      <button
                        onClick={() => setShowSlip(false)}
                        className="absolute top-3 right-3 text-black text-[20px] cursor-pointer"
                      >
                        ✕
                      </button>
                      <Customerorder order={selectedOrder} />
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
