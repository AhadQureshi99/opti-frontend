import { FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";
import SalesChart from "./SalesChart";
import { FaRegCalendarAlt } from "react-icons/fa";
import { FaRedo } from "react-icons/fa";
import { FaTrash } from "react-icons/fa";
import DonutCard from "./DonutCard";
import { useState, useEffect, useMemo } from "react";
import { IoChevronDown } from "react-icons/io5";
import { get, del } from "../utils/api";
import { formatCurrency } from "../utils/currency";
import { useToast } from "../components/ToastProvider";

export default function Salesrecord() {
  const toast = useToast();

  const formatLocalDate = (d) => {
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [open, setOpen] = useState(false);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [rangeText, setRangeText] = useState("Last 30 Days");
  const [loading, setLoading] = useState(false);
  const [salesSeries, setSalesSeries] = useState([]);
  const [expenseSeries, setExpenseSeries] = useState([]);
  const [combinedSeries, setCombinedSeries] = useState([]);
  const [salesTotal, setSalesTotal] = useState(0);
  const [expenseTotal, setExpenseTotal] = useState(0);
  const [ordersList, setOrdersList] = useState([]);
  const [expensesList, setExpensesList] = useState([]);

  const getOrderSalesDate = (o) => {
    if (!o) return null;
    if (o.isDirectRecord) {
      return new Date(
        o.deliveryDate || o.createdAt || o.updatedAt || o.createdAt
      );
    }
    return new Date(
      o.createdAt || o.deliveryDate || o.updatedAt || o.createdAt
    );
  };

  const finalCashInHand = useMemo(() => {
    return formatCurrency(salesTotal - expenseTotal);
  }, [salesTotal, expenseTotal]);

  const quickRanges = [
    { label: "Today", handler: () => handleQuickRange(0) },
    { label: "Last 7 Days", handler: () => handleQuickRange(7) },
    { label: "Last 30 Days", handler: () => handleQuickRange(30) },
  ];

  const handleQuickRange = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days + 1);
    const s = formatLocalDate(start);
    const e = formatLocalDate(end);
    setStartDate(s);
    setEndDate(e);
    setRangeText(
      `${start.toLocaleDateString()} To ${end.toLocaleDateString()}`
    );
    setOpen(false);
    fetchData(s, e);
  };

  const applyFilter = () => {
    if (startDate && endDate) {
      setRangeText(`${startDate} To ${endDate}`);
    }
    setOpen(false);
    if (startDate && endDate) fetchData(startDate, endDate);
  };

  const cancelFilter = () => {
    setOpen(false);
  };

  const buildDayArray = (start, end) => {
    const s = new Date(start);
    const e = new Date(end);
    const days = [];
    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
      const copy = new Date(d);
      days.push(copy.toISOString().split("T")[0]);
    }
    return days;
  };

  const fetchData = async (sParam, eParam) => {
    try {
      setLoading(true);
      let s = sParam || startDate;
      let e = eParam || endDate;
      if (!s || !e) {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 29);
        s = formatLocalDate(start);
        e = formatLocalDate(end);
        setStartDate(s);
        setEndDate(e);
        setRangeText(`${s} To ${e}`);
      }

      // Fetch all orders for sales record
      const ordersRes = await get(
        `/api/orders?startDate=${s}&endDate=${e}&t=${Date.now()}`
      );
      let allOrders = Array.isArray(ordersRes) ? ordersRes : ordersRes || [];

      // Fetch expenses (assuming you have this endpoint)
      const expensesRes = await get(
        `/api/expenses?startDate=${s}&endDate=${e}&t=${Date.now()}`
      );
      const allExpenses = Array.isArray(expensesRes)
        ? expensesRes
        : expensesRes?.expenses || [];

      // Backend already filters by date range, but we'll double-check with proper date handling
      const filterStartDate = new Date(s);
      filterStartDate.setHours(0, 0, 0, 0);
      const filterEndDate = new Date(e);
      filterEndDate.setHours(23, 59, 59, 999);

      const ordersInRange = allOrders.filter((o) => {
        const d = getOrderSalesDate(o);
        if (!d) return false;
        return d >= filterStartDate && d <= filterEndDate;
      });

      const expensesInRange = allExpenses.filter((exp) => {
        const d = new Date(
          exp.date || exp.createdAt || exp.updatedAt || exp.createdAt
        );
        return d >= filterStartDate && d <= filterEndDate;
      });

      const days = buildDayArray(s, e);
      const salesMap = {};
      const expenseMap = {};
      days.forEach((d) => {
        salesMap[d] = 0;
        expenseMap[d] = 0;
      });

      let sTotal = 0;
      ordersInRange.forEach((o) => {
        const d = getOrderSalesDate(o);
        if (!d) return;
        const key = d.toISOString().split("T")[0];
        const amt = Number(o.totalAmount) || 0;
        if (salesMap[key] !== undefined) salesMap[key] += amt;
        sTotal += amt;
      });

      let exTotal = 0;
      expensesInRange.forEach((exp) => {
        const d = new Date(
          exp.date || exp.createdAt || exp.updatedAt || exp.createdAt
        );
        const key = d.toISOString().split("T")[0];
        const amt = Number(exp.amount) || 0;
        if (expenseMap[key] !== undefined) expenseMap[key] += amt;
        exTotal += amt;
      });

      const salesSeriesData = days.map((d) => ({
        day: d,
        value: parseFloat((salesMap[d] || 0).toFixed(2)),
      }));
      const expenseSeriesData = days.map((d) => ({
        day: d,
        value: parseFloat((expenseMap[d] || 0).toFixed(2)),
      }));
      const combinedSeriesData = days.map((d) => ({
        day: d,
        value: parseFloat(
          ((salesMap[d] || 0) - (expenseMap[d] || 0)).toFixed(2)
        ),
      }));

      setSalesSeries(salesSeriesData);
      setExpenseSeries(expenseSeriesData);
      setCombinedSeries(combinedSeriesData);
      setSalesTotal(parseFloat(sTotal.toFixed(2)));
      setExpenseTotal(parseFloat(exTotal.toFixed(2)));
      setOrdersList(ordersInRange);
      setExpensesList(expensesInRange);
    } catch (err) {
      console.error("Salesrecord fetch error:", err);
      toast.addToast(err?.body?.message || "Failed to load sales data", {
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (type, id) => {
    if (
      !window.confirm(
        `Are you sure you want to delete this ${type.toLowerCase()}?`
      )
    ) {
      return;
    }

    try {
      setLoading(true);

      if (type === "Sale" || type === "Delivery") {
        // For delivery rows, extract the actual order ID
        const orderId = id.startsWith("delivery-")
          ? id.replace("delivery-", "")
          : id;
        await del(`/api/orders/${orderId}`);
        toast.addToast("Order deleted successfully", { type: "success" });
      } else if (type === "Expense") {
        await del(`/api/expenses/${id}`);
        toast.addToast("Expense deleted successfully", { type: "success" });
      }

      // Refresh the data
      await fetchData();
    } catch (err) {
      console.error("Delete error:", err);
      toast.addToast(
        err?.body?.message || `Failed to delete ${type.toLowerCase()}`,
        {
          type: "error",
        }
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!startDate && !endDate) {
      handleQuickRange(30);
    } else {
      fetchData();
    }
  }, []);

  useEffect(() => {
    const handleFocus = () => {
      if (startDate && endDate) {
        fetchData();
      }
    };
    const handleVisibilityChange = () => {
      if (!document.hidden && startDate && endDate) {
        fetchData();
      }
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [startDate, endDate]);

  return (
    <div className="w-full bg-[white] h-full">
      <div className="relative flex items-center justify-center px-5 sm:px-10 pt-10">
        <Link to="/home-page">
          <FaArrowLeft
            className="
            absolute left-5 sm:left-18 top-14
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

      <div className="">
        <h1 className="font-semibold text-center text-[20px]">Sale Records</h1>
      </div>

      <div className="flex justify-center gap-3 mt-5 px-5">
        <DonutCard
          label="Sales"
          value={salesTotal}
          total={parseFloat((salesTotal + expenseTotal).toFixed(2)) || 1}
          color="#007A3F"
        />
        <DonutCard
          label="Expense (Paid Out)"
          value={expenseTotal}
          total={parseFloat((salesTotal + expenseTotal).toFixed(2)) || 1}
          color="#F97316"
        />
        <DonutCard
          label="Cash in Hand"
          value={parseFloat((salesTotal - expenseTotal).toFixed(2))}
          total={parseFloat((salesTotal + expenseTotal).toFixed(2)) || 1}
          color="#007A3F"
        />
      </div>

      <div className="px-5 mt-8 md:mx-40 mb-4">
        <div className="flex sm:justify-between items-center gap-4">
          <h2 className="font-semibold text-sm">Chart Type: INCOME</h2>
          <div className="relative inline-block sm:ml-auto flex items-center gap-2">
            <button
              onClick={() => fetchData()}
              className="flex items-center justify-center w-10 h-10 border border-[#e9ecef] rounded-lg shadow-sm bg-[#f8f9fa] hover:shadow-md transition-all"
              title="Refresh Data"
            >
              <FaRedo className="text-gray-600" />
            </button>
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center md:gap-[12px] border-1 border-[#e9ecef] rounded-lg px-[14px] py-[10px] shadow-sm bg-[#f8f9fa] hover:shadow-md transition-all"
            >
              <FaRegCalendarAlt className="text-gray-600" />
              <span className="text-[#666] font-medium">{rangeText}</span>
              <IoChevronDown className="text-gray-600" />
            </button>

            {open && (
              <div className="absolute right-0 z-50 mt-2 min-w-[250px] w-[350px] max-w-[400px] bg-white p-6 rounded-[15px] shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
                <h3 className="text-lg font-semibold mb-4">
                  Select Date Range
                </h3>
                <div className="flex flex-col gap-3 mb-4">
                  <label className="text-sm font-medium">Start Date:</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 w-full"
                  />
                  <label className="text-sm font-medium">End Date:</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 w-full"
                  />
                </div>
                <div className="flex gap-2 mb-4">
                  {quickRanges.map((range) => (
                    <button
                      key={range.label}
                      onClick={range.handler}
                      className="bg-gray-100 text-gray-800 px-3 py-1 rounded-md hover:bg-gray-200 transition-all text-sm"
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={cancelFilter}
                    className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={applyFilter}
                    className="px-4 py-2 rounded-md bg-[#169D53] text-white hover:bg-green-600 transition-all"
                  >
                    Apply Filter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-5 mb-8 flex items-center justify-center">
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <SalesChart data={salesSeries} />
        )}
      </div>

      <div className="px-5 mb-8 md:mx-40">
        <div className="flex sm:justify-between items-center gap-4">
          <h2 className="font-semibold mb-2">Chart Type: EXPENSE</h2>
          <div className="relative inline-block sm:ml-auto">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center md:gap-[12px] md:ml-12 border-1 border-[#e9ecef] rounded-lg px-[14px] py-[10px] shadow-sm bg-[#f8f9fa] hover:shadow-md transition-all"
            >
              <FaRegCalendarAlt className="text-gray-600" />
              <span className="text-[#666] font-medium">{rangeText}</span>
              <IoChevronDown className="text-gray-600" />
            </button>

            {open && (
              <div className="absolute right-0 z-50 mt-2 min-w-[250px] w-[350px] max-w-[400px] bg-white p-6 rounded-[15px] shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
                <h3 className="text-lg font-semibold mb-4">
                  Select Date Range
                </h3>
                <div className="flex flex-col gap-3 mb-4">
                  <label className="text-sm font-medium">Start Date:</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 w-full"
                  />
                  <label className="text-sm font-medium">End Date:</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 w-full"
                  />
                </div>
                <div className="flex gap-2 mb-4">
                  {quickRanges.map((range) => (
                    <button
                      key={range.label}
                      onClick={range.handler}
                      className="bg-gray-100 text-gray-800 px-3 py-1 rounded-md hover:bg-gray-200 transition-all text-sm"
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={cancelFilter}
                    className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={applyFilter}
                    className="px-4 py-2 rounded-md bg-[#169D53] text-white hover:bg-green-600 transition-all"
                  >
                    Apply Filter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center mb-8">
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <SalesChart data={expenseSeries} />
        )}
      </div>

      <div className="px-5 mb-8 md:mx-40">
        <div className="flex sm:justify-between items-center gap-4">
          <h2 className="font-semibold mb-2">Chart Type: NET</h2>
          <div className="relative inline-block sm:ml-auto">
            <button
              onClick={() => setOpen(!open)}
              className="flex items-center md:gap-[12px] md:ml-12 border-1 border-[#e9ecef] rounded-lg px-[14px] py-[10px] shadow-sm bg-[#f8f9fa] hover:shadow-md transition-all"
            >
              <FaRegCalendarAlt className="text-gray-600" />
              <span className="text-[#666] font-medium">{rangeText}</span>
              <IoChevronDown className="text-gray-600" />
            </button>

            {open && (
              <div className="absolute right-0 z-50 mt-2 min-w-[250px] w-[350px] max-w-[400px] bg-white p-6 rounded-[15px] shadow-[0_10px_30px_rgba(0,0,0,0.3)]">
                <h3 className="text-lg font-semibold mb-4">
                  Select Date Range
                </h3>
                <div className="flex flex-col gap-3 mb-4">
                  <label className="text-sm font-medium">Start Date:</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 w-full"
                  />
                  <label className="text-sm font-medium">End Date:</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="border border-gray-300 rounded-md p-2 w-full"
                  />
                </div>
                <div className="flex gap-2 mb-4">
                  {quickRanges.map((range) => (
                    <button
                      key={range.label}
                      onClick={range.handler}
                      className="bg-gray-100 text-gray-800 px-3 py-1 rounded-md hover:bg-gray-200 transition-all text-sm"
                    >
                      {range.label}
                    </button>
                  ))}
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={cancelFilter}
                    className="px-4 py-2 rounded-md border border-gray-300 hover:bg-gray-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={applyFilter}
                    className="px-4 py-2 rounded-md bg-[#169D53] text-white hover:bg-green-600 transition-all"
                  >
                    Apply Filter
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-center items-center mb-8">
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <SalesChart data={combinedSeries} />
        )}
      </div>

      {/* Transactions table */}
      <div className="px-5 mb-12">
        <h2 className="font-semibold mb-3">Transactions</h2>
        <div className="bg-white rounded shadow">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">
                  Date
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">
                  Type
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">
                  Reference
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">
                  Category
                </th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-700 border border-gray-300">
                  Total Amount
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 border border-gray-300">
                  Description
                </th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-700 border border-gray-300">
                  Cash Received
                </th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-700 border border-gray-300">
                  Cash Paid Out
                </th>
                <th className="px-4 py-2 text-center text-sm font-medium text-gray-700 border border-gray-300">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y">
              {(() => {
                const combined = [
                  ...(ordersList || []).map((o) => {
                    console.log(
                      "Order:",
                      o._id,
                      "isDirectRecord:",
                      o.isDirectRecord
                    );
                    return {
                      id: o._id,
                      date: getOrderSalesDate(o),
                      type: "Sale",
                      ref: o.trackingId || o._id,
                      description:
                        o.isDirectRecord === true ? "balance" : "advance",
                      category: "-",
                      advance: Number(o.advance) || 0,
                      totalAmount: Number(o.totalAmount) || 0,
                      balance: Number(o.balance) || 0,
                      cashReceived:
                        o.isDirectRecord === true
                          ? Number(o.totalAmount) || 0
                          : Number(o.advance) || 0,
                      delivered: o.status === "delivered",
                    };
                  }),
                  ...(ordersList || [])
                    .filter((o) => o.status === "delivered")
                    .map((o) => ({
                      id: `delivery-${o._id}`,
                      date: new Date(
                        o.updatedAt || o.deliveryDate || o.createdAt
                      ),
                      type: "Delivery",
                      ref: o.trackingId || o._id,
                      description: "balance",
                      category: "-",
                      totalAmount: 0,
                      cashReceived: Number(o.balance) || 0,
                    })),
                  ...(expensesList || []).map((e) => ({
                    id: e._id,
                    date: new Date(
                      e.date || e.createdAt || e.updatedAt || e.createdAt
                    ),
                    type: "Expense",
                    ref: "-",
                    description: e.description || "N/A",
                    category: e.category || "N/A",
                    amount: Number(e.amount) || 0,
                    cashPaid: Number(e.cashPaid) || 0,
                    cashInHand: Number(e.cashInHand) || 0,
                  })),
                ].sort((a, b) => b.date - a.date);

                if (combined.length === 0) {
                  return (
                    <tr>
                      <td
                        colSpan={10}
                        className="px-4 py-6 text-center text-sm text-gray-500 border border-gray-300"
                      >
                        No transactions in this range.
                      </td>
                    </tr>
                  );
                }

                // Calculate cash in hand for each row (now using final)
                return combined.map((r) => {
                  let cashPaidOut = "-";
                  let cashInHand = finalCashInHand;
                  let cashReceived = "-";
                  if (r.type === "Sale" || r.type === "Delivery") {
                    cashPaidOut = "-";
                    cashReceived = formatCurrency(r.cashReceived);
                  } else if (r.type === "Expense") {
                    cashPaidOut = formatCurrency(r.amount);
                    cashReceived = "-";
                  }
                  return (
                    <tr key={`${r.type}-${r.id}`}>
                      <td className="px-4 py-3 text-sm text-gray-700 border border-gray-300">
                        {r.date.toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 border border-gray-300">
                        {r.type}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 border border-gray-300">
                        {r.ref}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 border border-gray-300">
                        {r.category}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-semibold border border-gray-300">
                        <span
                          className={
                            r.type === "Sale" || r.type === "Delivery"
                              ? "text-green-600"
                              : "text-red-600"
                          }
                        >
                          {r.type === "Sale"
                            ? formatCurrency(r.totalAmount)
                            : r.type === "Delivery"
                            ? "-"
                            : `-${formatCurrency(r.amount)}`}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 border border-gray-300">
                        {r.description}
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-semibold border border-gray-300">
                        <span className="text-green-600">{cashReceived}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-right font-semibold border border-gray-300">
                        <span
                          className={
                            r.type === "Expense"
                              ? "text-orange-600"
                              : "text-green-600"
                          }
                        >
                          {cashPaidOut}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center border border-gray-300">
                        <button
                          onClick={() => handleDelete(r.type, r.id)}
                          className="text-red-600 hover:text-red-800 transition-colors duration-200"
                          title={`Delete ${r.type}`}
                        >
                          <FaTrash className="inline-block w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                });
              })()}
              {/* Summary row for total sales */}
              <tr className="bg-gray-100 font-bold">
                <td colSpan={7} className="border border-gray-300"></td>
                <td className="px-4 py-3 text-right text-sm text-gray-700 border border-gray-300">
                  Total Sales:
                </td>
                <td className="px-4 py-3 text-sm text-right text-green-700 border border-gray-300">
                  {formatCurrency(salesTotal)}
                </td>
                <td className="border border-gray-300"></td>
              </tr>
              {/* Summary row for total expenses */}
              <tr className="bg-gray-100 font-bold">
                <td colSpan={7} className="border border-gray-300"></td>
                <td className="px-4 py-3 text-right text-sm text-gray-700 border border-gray-300">
                  Total Expenses:
                </td>
                <td className="px-4 py-3 text-sm text-right text-red-700 border border-gray-300">
                  {formatCurrency(expenseTotal)}
                </td>
                <td className="border border-gray-300"></td>
              </tr>
              {/* Summary row for net amount */}
              <tr className="bg-gray-100 font-bold">
                <td colSpan={7} className="border border-gray-300"></td>
                <td className="px-4 py-3 text-right text-sm text-gray-700 border border-gray-300">
                  Current Cash:
                </td>
                <td className="px-4 py-3 text-sm text-right text-blue-700 border border-gray-300">
                  {finalCashInHand}
                </td>
                <td className="border border-gray-300"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
