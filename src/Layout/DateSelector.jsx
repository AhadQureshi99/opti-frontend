import { FaRegCalendarAlt } from "react-icons/fa";
import { useState } from "react";
import CustomDropdown from "../components/CustomDropdown";

export default function DateSelector() {
  const [date, setDate] = useState("Jan-2025");

  return (
    <div className="flex items-center gap-2 text-sm bg-white">
      <FaRegCalendarAlt className="text-gray-600" />
      <span>01 Jan - 30 Jan</span>
      <div className="w-32">
        <CustomDropdown
          options={["Jan-2025", "Feb-2025", "Mar-2025"]}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          name="date"
          placeholder="Jan-2025"
        />
      </div>
    </div>
  );
}
