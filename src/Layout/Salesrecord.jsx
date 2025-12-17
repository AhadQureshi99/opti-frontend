import { FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";
import SalesChart from "./SalesChart";
import { FaRegCalendarAlt } from "react-icons/fa";
import DonutCard from "./DonutCard";
import { useState, useEffect } from "react";
import { IoChevronDown } from "react-icons/io5";
import { get } from "../utils/api";
import { formatCurrency } from "../utils/currency";
import { useToast } from "../components/ToastProvider";

export default function Salesrecord() {
  const toast = useToast();
  const incomeData = [
    { day: "Mon", value: 20 },
    { day: "Tue", value: 40 },
    { day: "Wed", value: 35 },
    { day: "Thu", value: 60 },
    { day: "Fri", value: 50 },
    { day: "Sat", value: 90 },
    { day: "Sun", value: 65 },
  ];

  const expenseData = [
    { day: "Mon", value: 10 },
    { day: "Tue", value: 30 },
    { day: "Wed", value: 25 },
    { day: "Thu", value: 55 },
    { day: "Fri", value: 45 },
    { day: "Sat", value: 80 },
    { day: "Sun", value: 55 },
  ];

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

  const quickRanges = [
    { label: "Today", handler: () => handleQuickRange(0) },
    { label: "Last 7 Days", handler: () => handleQuickRange(7) },
    { label: "Last 30 Days", handler: () => handleQuickRange(30) },
  ];

  const handleQuickRange = (days) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days + 1);
    const s = start.toISOString().split("T")[0];
    const e = end.toISOString().split("T")[0];
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

  // helper to build day array from start to end (inclusive)
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

  // fetch orders and expenses for current range
  const fetchData = async (sParam, eParam) => {
    try {
      setLoading(true);
      // default to last 30 days if no range selected
      let s = sParam || startDate;
      let e = eParam || endDate;
      if (!s || !e) {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - 29);
        s = start.toISOString().split("T")[0];
        e = end.toISOString().split("T")[0];
        setStartDate(s);
        setEndDate(e);
        setRangeText(`${s} To ${e}`);
      }

      // orders endpoint: fetch orders for authenticated user (admin will receive all)
      const ordersRes = await get(`/api/orders?startDate=${s}&endDate=${e}`);
      // expenses endpoint requires auth; we pass date filters
      const expensesRes = await get(
        `/api/expenses?startDate=${s}&endDate=${e}`
      );

      const allOrders = Array.isArray(ordersRes)
        ? ordersRes
        : ordersRes.orders || ordersRes;
      const allExpenses = Array.isArray(expensesRes)
        ? expensesRes
        : expensesRes && Array.isArray(expensesRes.expenses)
        ? expensesRes.expenses
        : [];

      console.log(
        "Fetched data - Orders:",
        allOrders,
        "Expenses:",
        allExpenses
      );
      const sDate = new Date(s);
      const eDate = new Date(e);

      const ordersInRange = allOrders.filter((o) => {
        // Only include completed orders as sales
        if (o.status !== "completed") return false;

        const d = new Date(
          o.createdAt ||
            o.deliveryDate ||
            o.updatedAt ||
            o._id?.getTimestamp?.() ||
            o.createdAt
        );
        return d >= sDate && d <= eDate;
      });

      const expensesInRange = (allExpenses || []).filter((exp) => {
        const d = new Date(
          exp.date || exp.createdAt || exp._id?.getTimestamp?.()
        );
        return d >= sDate && d <= eDate;
      });

      // compute totals and daily sums
      const days = buildDayArray(s, e);
      const salesMap = {};
      const expenseMap = {};
      days.forEach((d) => {
        salesMap[d] = 0;
        expenseMap[d] = 0;
      });

      let sTotal = 0;
      ordersInRange.forEach((o) => {
        const d = new Date(
          o.createdAt || o.deliveryDate || o.updatedAt || o.createdAt
        );
        const key = d.toISOString().split("T")[0];
        const amt = Number(o.totalAmount) || 0;
        if (salesMap[key] !== undefined) salesMap[key] += amt;
        sTotal += amt;
      });

      let exTotal = 0;
      expensesInRange.forEach((exp) => {
        const d = new Date(
          exp.date || exp.createdAt || exp._id?.getTimestamp?.()
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
      // set lists for transaction table
      setOrdersList(ordersInRange);
      setExpensesList(expensesInRange || []);
    } catch (err) {
      console.error("Salesrecord fetch error", err);
      console.log("Error details:", {
        status: err?.status,
        body: err?.body,
        message: err?.message,
      });
      toast.addToast(err?.body?.message || "Failed to load sales data", {
        type: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="w-full bg-[white] h-full ">
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
          label="Expense"
          value={expenseTotal}
          total={parseFloat((salesTotal + expenseTotal).toFixed(2)) || 1}
          color="#F97316"
        />
        <DonutCard
          label="Net"
          value={parseFloat((salesTotal - expenseTotal).toFixed(2))}
          total={parseFloat((salesTotal + expenseTotal).toFixed(2)) || 1}
          color="#007A3F"
        />
      </div>

      <div className="px-5 mt-8 md:mx-40 mb-4">
        <div className="flex sm:justify-between items-center gap-4">
          <h2 className="font-semibold text-sm">Chart Type: INCOME</h2>

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

      <div className="px-5 mb-8 flex items-center justify-center">
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <SalesChart data={salesSeries} />
        )}
      </div>
      <div className="px-5 mb-8 md:mx-40">
        <div className="flex sm:justify-between items-center gap-4 ">
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
      <div className="flex justify-center items-center ">
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <SalesChart data={expenseSeries} />
        )}
      </div>

      <div className="px-5 mb-8 sm:mx-40  ">
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
      <div className="flex justify-center items-center ">
        {loading ? (
          <div className="text-center">Loading...</div>
        ) : (
          <SalesChart data={combinedSeries} />
        )}
      </div>
      {/* Transactions table showing sales and expenses in the selected range */}
      <div className="px-5 mb-12 md:mx-40">
        <h2 className="font-semibold mb-3">Transactions</h2>
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="min-w-full divide-y">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Date
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Type
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Reference
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Description
                </th>
                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                  Category
                </th>
                <th className="px-4 py-2 text-right text-sm font-medium text-gray-700">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y">
              {(() => {
                const combined = [
                  ...(ordersList || []).map((o) => ({
                    id: o._id,
                    date: new Date(
                      o.createdAt ||
                        o.deliveryDate ||
                        o.updatedAt ||
                        o.createdAt
                    ),
                    type: "Sale",
                    ref: o._id || o.trackingId,
                    description:
                      o.frameDetails || o.lensType || o.patientName || "Sale",
                    amount: Number(o.totalAmount) || 0,
                  })),
                  ...(expensesList || []).map((e) => ({
                    id: e._id,
                    date: new Date(e.date || e.createdAt),
                    type: "Expense",
                    ref: e._id,
                    description: e.description || "N/A",
                    category: e.category || "N/A",
                    amount: Number(e.amount) || 0,
                  })),
                ].sort((a, b) => b.date - a.date);

                if (combined.length === 0) {
                  return (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-4 py-6 text-center text-sm text-gray-500"
                      >
                        No transactions in this range.
                      </td>
                    </tr>
                  );
                }

                return combined.map((r) => (
                  <tr key={`${r.type}-${r.id}`}>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {r.date.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {r.type}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">{r.ref}</td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {r.description}
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700">
                      {r.type === "Expense" ? r.category : "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-right font-semibold">
                      <span
                        className={
                          r.type === "Expense"
                            ? "text-red-600"
                            : "text-green-600"
                        }
                      >
                        {r.type === "Expense" ? "-" : ""}
                        {formatCurrency(r.amount)}
                      </span>
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
