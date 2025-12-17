import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

export default function SalesChart({ data }) {
  const incomeData = [
    { day: "Mon", value: 20 },
    { day: "Tue", value: 40 },
    { day: "Wed", value: 35 },
    { day: "Thu", value: 60 },
    { day: "Fri", value: 50 },
    { day: "Sat", value: 90 },
    { day: "Sun", value: 100 },
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

  return (
    <div className="w-full sm:w-[80%] md:w-[60%] h-64  mx-auto">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="day" />
          <YAxis />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="value"
            stroke="#007A3F"
            strokeWidth={3}
            dot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
