import { LuPrinter } from "react-icons/lu";
import { BiSave } from "react-icons/bi";
import { FiShare2 } from "react-icons/fi";

export default function Generateslip() {
  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-transparent p-4 flex flex-col">
      <div className="flex flex-col items-center bg-white w-[90%] sm:w-[350px] md:w-[30%] max-w-md shadow-lg text-[#000000] text-[16px] p-4 sm:p-6">
        <div className="flex items-center justify-center gap-4 mb-1">
          <h2 className="text-[25px] font-bold">OPTI SLIP</h2>
          <FiShare2 size={30} className="text-[#007A3F] ml-4" />
        </div>

        <p className="text-center leading-[1.6] mb-2">
          Civic Center, Mountain View, CA, United
          <br />
          States, California.
        </p>
        <p className="text-center ">
          <strong>Contact #</strong> +92123-1234567
        </p>
        <p className="text-center mb-2">
          <strong>Whatsapp #</strong> +123-12345678
        </p>
        <div className="flex flex-col gap-2 w-full mb-2">
          <div className="flex justify-between">
            <span>Tracking ID:</span>
            <span>ORD20251003_1133</span>
          </div>
          <div className="flex justify-between">
            <span>Patient Name:</span>
            <span>Mr. Ali</span>
          </div>
          <div className="flex justify-between">
            <span>WhatsApp:</span>
            <span>+123-1234567</span>
          </div>
          <div className="flex justify-between">
            <span>Order Details:</span>
            <span>TR90 + HC</span>
          </div>
          <div className="flex justify-between">
            <span>Total Amount:</span>
            <span>0.00</span>
          </div>
          <div className="flex justify-between">
            <span>Advance:</span>
            <span>0.00</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery Date:</span>
            <span>01-05-2025</span>
          </div>
          <div className="flex justify-between">
            <span>Balance:</span>
            <span>0.00</span>
          </div>
        </div>

        <div className="flex justify-center gap-5 mb-2">
          <p>Right Eye:</p>
          <p>Left Eye:</p>
        </div>
        <div className="flex justify-center gap-5 mb-2">
          <p>SPH: N/A</p>
          <p>SPH: N/A</p>
        </div>
        <div className="flex justify-center gap-5 mb-2">
          <p>CYL: N/A</p>
          <p>CYL: N/A</p>
        </div>
        <div className="flex justify-center gap-5 mb-2">
          <p>AXIS: N/A</p>
          <p>AXIS: N/A</p>
        </div>
        <div className="text-center mb-4">
          <p>ADD</p>
          <p>+2.50</p>
        </div>
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-6 mb-2 w-full">
          <button className="flex items-center justify-center gap-2 bg-[#E2E2E2] text-black font-semibold px-6 sm:px-10 py-3 rounded-lg hover:bg-gray-300 transition flex-1 sm:flex-none">
            <LuPrinter size={18} /> Print
          </button>
          <button className="flex items-center justify-center gap-2 bg-[#007A3F] text-white font-semibold px-6 sm:px-10 py-3 rounded-lg hover:bg-green-700 transition flex-1 sm:flex-none">
            <BiSave size={18} /> Save
          </button>
        </div>
      </div>
      <div className="my-10">
        <button className="bg-[#007A3F] text-white py-4 px-6 font-semibold rounded-[20px] mt-2">
          Back to Home
        </button>
      </div>
    </div>
  );
}
