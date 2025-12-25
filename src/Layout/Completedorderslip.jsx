import { FaArrowLeft } from "react-icons/fa";
import { Link, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import Customerorder from "./Customerorder";
import { get } from "../utils/api";
import { LuPrinter } from "react-icons/lu";
import { BiSave } from "react-icons/bi";
import { FiShare2 } from "react-icons/fi";
import { getCachedData, setCachedData, prefetchData } from "../utils/dataCache";
import { preloadImage } from "../utils/imageCache";

export default function Completedorderslip() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  // Preload the OptiSlip logo
  useEffect(() => {
    preloadImage("/Optislipimage.png").catch(() => {
      console.debug("Failed to preload logo");
    });
  }, []);

  useEffect(() => {
    let mounted = true;

    async function load() {
      if (!id) return setLoading(false);

      // Check cache first
      const cacheKey = `order_${id}`;
      const cached = getCachedData(cacheKey);

      if (cached) {
        setOrder(cached);
        setLoading(false);
        // Still fetch in background to update cache
        fetchInBackground(cacheKey);
        return;
      }

      // Fetch with prefetch utility
      try {
        setLoading(true);
        const data = await prefetchData(
          cacheKey,
          () => get(`/api/orders/${id}`),
          10 * 60 * 1000 // Cache for 10 minutes
        );

        if (!mounted) return;
        setOrder(data);
      } catch (e) {
        console.error("Failed to load order", e);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    async function fetchInBackground(cacheKey) {
      try {
        const data = await get(`/api/orders/${id}`);
        setCachedData(cacheKey, data, 10 * 60 * 1000);
        if (mounted) setOrder(data);
      } catch (e) {
        console.debug("Background fetch failed", e);
      }
    }

    load();
    return () => (mounted = false);
  }, [id]);

  return (
    <div className="w-full bg-white h-full pb-10 ">
      <div className="relative flex items-center justify-center px-5 sm:px-10 pt-0">
        <Link to="/complete-order">
          <FaArrowLeft
            className="
        absolute left-5 sm:left-18 top-8
        w-7 h-6 
        text-black 
        cursor-pointer 
        transition-all duration-300 
        hover:text-green-600 
        hover:-translate-x-1
      "
          />
        </Link>

        <img
          src="/Optislipimage.png"
          alt="OptiSlip"
          style={{ filter: "invert(1) grayscale(1) brightness(0)" }}
          className="h-[12vh] sm:ml-8 ml-4 sm:h-[20vh]"
        />
      </div>

      <div className=" flex flex-col items-center ">
        <h1 className="font-bold text-[25px] text-[#007A3F] text-center">
          Complete Orders
        </h1>
        {loading ? (
          <div className="flex justify-center py-12">Loading order...</div>
        ) : order ? (
          <div className="bg-[#F6F6F6] border-2 border-[#00000038] px-4 sm:px-10 py-10 rounded-[20px] w-[95%] sm:w-[85%] md:w-[60%] max-w-4xl">
            <div className="p-0">
              <Customerorder order={order} />
            </div>
          </div>
        ) : (
          <div className="flex justify-center py-12">Order not found</div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 my-2 px-4">
        <button className="flex items-center justify-center gap-2 bg-[#E2E2E2] text-black font-semibold px-6 sm:px-10 py-3 rounded-lg hover:bg-gray-300 transition w-full sm:w-auto">
          <LuPrinter size={18} /> Print
        </button>
        <button className="flex items-center justify-center gap-2 bg-[#007A3F] text-white font-semibold px-6 sm:px-10 py-3 rounded-lg hover:bg-green-700 transition w-full sm:w-auto">
          <BiSave size={18} /> Save
        </button>
      </div>
    </div>
  );
}
