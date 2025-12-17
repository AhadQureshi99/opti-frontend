import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

export default function DonutCard({ label, value, total, color }) {
  const data = [
    { name: "value", value },
    { name: "remaining", value: total - value },
  ];

  return (
    <div
      className="
        bg-white rounded-xl border-[#007A3F] border-2 shadow-md p-4
        flex flex-col items-center 
        w-[10%] 
        md:w-[120px] 
        sm:w-[150px] 
        w-[40%] 
      "
    >
      <div className="w-16 h-16 sm:w-20 sm:h-20">
        <ResponsiveContainer>
          <PieChart>
            <Pie data={data} innerRadius={18} outerRadius={33} dataKey="value">
              <Cell fill={color} />
              <Cell fill="#D9D9D9" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      <p className="text-xs sm:text-sm font-semibold mt-2 text-center">
        {label}
      </p>
    </div>
  );
}
