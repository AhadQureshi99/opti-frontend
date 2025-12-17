import { FaArrowLeft } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import React, { useRef } from "react";
import { useToast } from "../components/ToastProvider";
import { post } from "../utils/api";

export default function Addrecord() {
  const formRef = useRef(null);
  const navigate = useNavigate();
  const toast = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const form = formRef.current;
      const data = {
        patientName:
          form.querySelector('input[name="patientName"]').value || undefined,
        whatsappNumber:
          form.querySelector('input[name="whatsappNumber"]').value || undefined,
        frameDetails:
          form.querySelector('input[name="frameDetails"]').value || undefined,
        lensType:
          form.querySelector('input[name="lensType"]').value || undefined,
        deliveryDate:
          form.querySelector('input[name="deliveryDate"]').value || undefined,
        totalAmount:
          form.querySelector('input[name="totalAmount"]').value || undefined,
        importantNote:
          form.querySelector('textarea[name="importantNote"]').value ||
          undefined,
      };
      // use auth-aware helper which will attach Authorization header
      await post("/api/orders/create", data, { cacheKey: "orders" });
      toast.addToast("Record added", { type: "success" });
      // clear the form but stay on Add Record page so user can add more
      try {
        const f = formRef.current;
        if (f && typeof f.reset === "function") f.reset();
      } catch (e) {}
    } catch (err) {
      console.error(err);
      toast.addToast(err.message || "Create order failed", { type: "error" });
    }
  };

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      className="w-full bg-white h-fullscreen pb-10"
    >
      <div className="relative flex items-center justify-center px-5 sm:px-10 pt-0">
        <Link to="/home-page">
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

      <div className="relative w-full flex flex-row justify-center  my-10">
        <label
          className="
          absolute
          sm:-top-4
      -top-4
      sm:left-60
      left-6
          bg-white
          px-2
          text-sm
          font-bold
          text-black
          z-20
        "
        >
          Patient Name
        </label>
        <input
          name="patientName"
          type="text"
          placeholder="XXXXXXXXXX"
          className="
          sm:w-[65%]
      sm:px-5 
      sm:py-6
      py-2
      px-5
      w-full
       mx-4
          border-2 
          border-black
          rounded-[25px]
          text-base
          font-bold
          bg-white
          text-gray-400
          min-h-[60px]
          transition-all
          duration-300
          focus:border-green-600
          focus:shadow-md
          outline-none
        "
        />
      </div>

      <div className="relative w-full flex flex-row justify-center  my-10">
        <label
          className="
          absolute
          sm:-top-4
      -top-4
      sm:left-60
      left-6
          bg-white
          px-2
          text-sm
          font-bold
          text-black
          z-20
        "
        >
          WhatsApp Number
        </label>

        <input
          name="whatsappNumber"
          type="text"
          placeholder="XXXXXXXXXX"
          className="
           sm:w-[65%]
      sm:px-5 
      sm:py-6
      py-2
      px-5
      w-full
       mx-4
          border-2 
          border-black
          rounded-[25px]
          text-base
          font-bold
          bg-white
          text-gray-400
          min-h-[60px]
          transition-all
          duration-300
          focus:border-green-600
          focus:shadow-md
          outline-none
        "
        />
      </div>

      <div className="relative w-full flex flex-row justify-center  my-10">
        <label
          className="
          absolute
          sm:-top-4
      -top-4
      sm:left-60
      left-6
          bg-white
          px-2
          text-sm
          font-bold
          text-black
          z-20
        "
        >
          Frame Detail
        </label>

        <input
          name="frameDetails"
          type="text"
          placeholder="XXXXXXXXXX"
          className="
          sm:w-[65%]
      sm:px-5 
      sm:py-6
      py-2
      px-5
      w-full
       mx-4
          border-2 
          border-black
          rounded-[25px]
          text-base
          font-bold
          bg-white
          text-gray-400
          min-h-[60px]
          transition-all
          duration-300
          focus:border-green-600
          focus:shadow-md
          outline-none
        "
        />
      </div>

      <div className="relative w-full flex flex-row justify-center  my-10">
        <label
          className="
          absolute
          sm:-top-4
      -top-4
      sm:left-60
      left-6
          bg-white
          px-2
          text-sm
          font-bold
          text-black
          z-20
        "
        >
          Lens Type
        </label>

        <input
          name="lensType"
          type="text"
          placeholder="XXXXXXXXXX"
          className="
          sm:w-[65%]
      sm:px-5 
      sm:py-6
      py-2
      px-5
      w-full
       mx-4
          border-2 
          border-black
          rounded-[25px]
          text-base
          font-bold
          bg-white
          text-gray-400
          min-h-[60px]
          transition-all
          duration-300
          focus:border-green-600
          focus:shadow-md
          outline-none
        "
        />
      </div>

      <div className="relative w-full flex flex-row justify-center  my-10">
        <label
          className="
          absolute
         sm:-top-4
      -top-4
      sm:left-60
      left-6
          bg-white
          px-2
          text-sm
          font-bold
          text-black
          z-20
        "
        >
          Delivery Date
        </label>

        <input
          name="deliveryDate"
          type="date"
          placeholder="Advance"
          className="
          sm:w-[65%]
      sm:px-5 
      sm:py-6
      py-2
      px-5
      w-full
       mx-4
          border-2 
          border-black
          rounded-[25px]
          text-sm
          font-bold
          text-black
          bg-white
          min-h-[60px]
          transition-all
          duration-300
          focus:border-green-600
          focus:shadow-md
          outline-none
        "
        />
      </div>

      <div className="relative w-full flex flex-row justify-center  my-10">
        <label
          className="
          absolute
          sm:-top-4
      -top-4
      sm:left-60
      left-6
          bg-white
          px-2
          text-sm
          font-bold
          text-black
          z-20
        "
        >
          Total Amount
        </label>

        <input
          name="totalAmount"
          type="text"
          placeholder="Total Amount"
          className="
           sm:w-[65%]
      sm:px-5 
      sm:py-6
      py-2
      px-5
      w-full
       mx-4
          border-2 
          border-black
          rounded-[25px]
          text-base
          font-bold
          bg-white
          text-gray-400
          min-h-[60px]
          transition-all
          duration-300
          focus:border-green-600
          focus:shadow-md
          outline-none
        "
        />
      </div>

      <div className="relative w-full flex flex-row justify-center">
        <label
          className="
      absolute
      sm:-top-4
      -top-4
      sm:left-60
      left-6
      bg-white
      px-2
      text-sm
      font-bold
      text-black
      z-20
    "
        >
          Special Note
        </label>

        <textarea
          name="importantNote"
          type="text"
          placeholder="Type Here..."
          className="
       sm:w-[65%]
      sm:px-5 
      sm:py-6
      py-8
      px-5
      w-full
       mx-4
      rows-6
      col-8
      border-2 
      border-black
      sm:rounded-[25px]
      rounded-[22px]
      text-base
      font-bold
      bg-white
      resize-y
       text-black
      min-h-[60px]
      transition-all
      duration-300
      focus:border-green-600
      focus:shadow-md
      outline-none
    "
        />
      </div>

      <div className="flex flex-col md:flex-row gap-6 w-full justify-center mt-10 ">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 md:w-[31%] mx-4 pb-6 overflow-hidden">
          <div className="flex-1 bg-[#169D53]  py-[12px]  text-white font-semibold text-[16px] text-center mb-6">
            Right Eye
          </div>

          <div className="flex flex-col gap-4 px-6">
            <div>
              <label className="block text-sm text-left text-[#666] font-semibold mb-1">
                Sph
              </label>
              <select className="w-full border border-gray-300 hover:border-[#169D53] hover:border-2 rounded-md p-2">
                <option>Select</option>
                <option>+24.00</option>
                <option>+23.75</option>
                <option>+23.50</option>
                <option>+23.25</option>
                <option>+23.00</option>
                <option>+22.75</option>
                <option>+22.50</option>
                <option>+22.25</option>
                <option>+22.00</option>
                <option>+21.75</option>
                <option>+21.50</option>
                <option>+21.25</option>
                <option>+21.00</option>
                <option>+20.75</option>
                <option>+20.50</option>
                <option>+20.25</option>
                <option>+20.00</option>
                <option>+19.75</option>
                <option>+19.50</option>
                <option>+19.25</option>
                <option>+19.00</option>
                <option>+18.75</option>
                <option>+18.50</option>
                <option>+18.25</option>
                <option>+18.00</option>
                <option>+17.75</option>
                <option>+17.50</option>
                <option>+17.25</option>
                <option>+17.00</option>
                <option>+16.75</option>
                <option>+16.50</option>
                <option>+16.25</option>
                <option>+16.00</option>
                <option>+15.75</option>
                <option>+15.50</option>
                <option>+15.25</option>
                <option>+15.00</option>
                <option>+14.75</option>
                <option>+14.50</option>
                <option>+14.25</option>
                <option>+14.00</option>
                <option>+13.75</option>
                <option>+13.50</option>
                <option>+13.25</option>
                <option>+13.00</option>
                <option>+12.75</option>
                <option>+12.50</option>
                <option>+12.25</option>
                <option>+12.00</option>
                <option>+11.75</option>
                <option>+11.50</option>
                <option>+11.25</option>
                <option>+11.00</option>
                <option>+10.75</option>
                <option>+10.50</option>
                <option>+10.25</option>
                <option>+10.00</option>
                <option>+9.75</option>
                <option>+9.50</option>
                <option>+9.25</option>
                <option>+9.00</option>
                <option>+8.75</option>
                <option>+8.50</option>
                <option>+8.25</option>
                <option>+8.00</option>
                <option>+7.75</option>
                <option>+7.50</option>
                <option>+7.25</option>
                <option>+7.00</option>
                <option>+6.75</option>
                <option>+6.50</option>
                <option>+6.25</option>
                <option>+6.00</option>
                <option>+5.75</option>
                <option>+5.50</option>
                <option>+5.25</option>
                <option>+5.00</option>
                <option>+4.75</option>
                <option>+4.50</option>
                <option>+4.25</option>
                <option>+4.00</option>
                <option>+3.75</option>
                <option>+3.50</option>
                <option>+3.25</option>
                <option>+3.00</option>
                <option>+2.75</option>
                <option>+2.50</option>
                <option>+2.25</option>
                <option>+2.00</option>
                <option>+1.75</option>
                <option>+1.50</option>
                <option>+1.25</option>
                <option>+1.00</option>
                <option>+0.75</option>
                <option>+0.50</option>
                <option>+0.25</option>
                <option>0.00</option>
                <option>-0.25</option>
                <option>-0.50</option>
                <option>-0.75</option>
                <option>-1.00</option>
                <option>-1.25</option>
                <option>-1.50</option>
                <option>-1.75</option>
                <option>-2.00</option>
                <option>-2.25</option>
                <option>-2.50</option>
                <option>-2.75</option>
                <option>-3.00</option>
                <option>-3.25</option>
                <option>-3.50</option>
                <option>-3.75</option>
                <option>-4.00</option>
                <option>-4.25</option>
                <option>-4.50</option>
                <option>-4.75</option>
                <option>-5.00</option>
                <option>-5.25</option>
                <option>-5.50</option>
                <option>-5.75</option>
                <option>-6.00</option>
                <option>-6.25</option>
                <option>-6.50</option>
                <option>-6.75</option>
                <option>-7.00</option>
                <option>-7.25</option>
                <option>-7.50</option>
                <option>-7.75</option>
                <option>-8.00</option>
                <option>-8.25</option>
                <option>-8.50</option>
                <option>-8.75</option>
                <option>-9.00</option>
                <option>-9.25</option>
                <option>-9.50</option>
                <option>-9.75</option>
                <option>-10.00</option>
                <option>-10.25</option>
                <option>-10.50</option>
                <option>-10.75</option>
                <option>-11.00</option>
                <option>-11.25</option>
                <option>-11.50</option>
                <option>-11.75</option>
                <option>-12.00</option>
                <option>-12.25</option>
                <option>-12.50</option>
                <option>-12.75</option>
                <option>-13.00</option>
                <option>-13.25</option>
                <option>-13.50</option>
                <option>-13.75</option>
                <option>-14.00</option>
                <option>-14.25</option>
                <option>-14.50</option>
                <option>-14.75</option>
                <option>-15.00</option>
                <option>-15.25</option>
                <option>-15.50</option>
                <option>-15.75</option>
                <option>-16.00</option>
                <option>-16.25</option>
                <option>-16.50</option>
                <option>-16.75</option>
                <option>-17.00</option>
                <option>-17.25</option>
                <option>-17.50</option>
                <option>-17.75</option>
                <option>-18.00</option>
                <option>-18.25</option>
                <option>-18.50</option>
                <option>-18.75</option>
                <option>-19.00</option>
                <option>-19.25</option>
                <option>-19.50</option>
                <option>-19.75</option>
                <option>-19.00</option>
                <option>-19.25</option>
                <option>-19.50</option>
                <option>-19.75</option>
                <option>-20.00</option>
                <option>-20.25</option>
                <option>-20.50</option>
                <option>-20.75</option>
                <option>-21.00</option>
                <option>-21.25</option>
                <option>-21.50</option>
                <option>-21.75</option>
                <option>-22.00</option>
                <option>-22.25</option>
                <option>-22.50</option>
                <option>-22.75</option>
                <option>-23.00</option>
                <option>-23.25</option>
                <option>-23.50</option>
                <option>-23.75</option>
                <option>-24.00</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-left text-[#666] font-semibold mb-1">
                Cyl
              </label>
              <select className="w-full border border-gray-300 hover:border-[#169D53] hover:border-2 rounded-md p-2">
                <option>Select</option>
                <option>+6.00</option>
                <option>+5.75</option>
                <option>+5.50</option>
                <option>+5.25</option>
                <option>+5.00</option>
                <option>+4.75</option>
                <option>+4.50</option>
                <option>+4.25</option>
                <option>+4.00</option>
                <option>+3.75</option>
                <option>+3.50</option>
                <option>+3.25</option>
                <option>+3.00</option>
                <option>+2.75</option>
                <option>+2.50</option>
                <option>+2.25</option>
                <option>+2.00</option>
                <option>+1.75</option>
                <option>+1.50</option>
                <option>+1.25</option>
                <option>+1.00</option>
                <option>+0.75</option>
                <option>+0.50</option>
                <option>+0.25</option>
                <option>0.00</option>
                <option>-0.25</option>
                <option>-0.50</option>
                <option>-0.75</option>
                <option>-1.00</option>
                <option>-1.25</option>
                <option>-1.50</option>
                <option>-1.75</option>
                <option>-2.00</option>
                <option>-2.25</option>
                <option>-2.50</option>
                <option>-2.75</option>
                <option>-3.00</option>
                <option>-3.25</option>
                <option>-3.50</option>
                <option>-3.75</option>
                <option>-4.00</option>
                <option>-4.25</option>
                <option>-4.50</option>
                <option>-4.75</option>
                <option>-5.00</option>
                <option>-5.25</option>
                <option>-5.50</option>
                <option>-5.75</option>
                <option>-6.00</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-left text-[#666] font-semibold mb-1">
                Axis
              </label>
              <input
                type="number"
                placeholder="1 to 180"
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl  shadow-md border border-gray-100 md:w-[31%] mx-4 overflow-hidden">
          <div className="flex-1 bg-[#169D53]  py-[12px]  text-white font-semibold text-[16px] text-center mb-6 ">
            Left Eye
          </div>

          <div className="flex flex-col gap-4 px-6 pb-6">
            <div>
              <label className="block text-sm text-left text-[#666] font-semibold mb-1">
                Sph
              </label>
              <select className="w-full border border-gray-300 hover:border-[#169D53] hover:border-2 rounded-md p-2">
                <option>Select</option>
                <option>+24.00</option>
                <option>+23.75</option>
                <option>+23.50</option>
                <option>+23.25</option>
                <option>+23.00</option>
                <option>+22.75</option>
                <option>+22.50</option>
                <option>+22.25</option>
                <option>+22.00</option>
                <option>+21.75</option>
                <option>+21.50</option>
                <option>+21.25</option>
                <option>+21.00</option>
                <option>+20.75</option>
                <option>+20.50</option>
                <option>+20.25</option>
                <option>+20.00</option>
                <option>+19.75</option>
                <option>+19.50</option>
                <option>+19.25</option>
                <option>+19.00</option>
                <option>+18.75</option>
                <option>+18.50</option>
                <option>+18.25</option>
                <option>+18.00</option>
                <option>+17.75</option>
                <option>+17.50</option>
                <option>+17.25</option>
                <option>+17.00</option>
                <option>+16.75</option>
                <option>+16.50</option>
                <option>+16.25</option>
                <option>+16.00</option>
                <option>+15.75</option>
                <option>+15.50</option>
                <option>+15.25</option>
                <option>+15.00</option>
                <option>+14.75</option>
                <option>+14.50</option>
                <option>+14.25</option>
                <option>+14.00</option>
                <option>+13.75</option>
                <option>+13.50</option>
                <option>+13.25</option>
                <option>+13.00</option>
                <option>+12.75</option>
                <option>+12.50</option>
                <option>+12.25</option>
                <option>+12.00</option>
                <option>+11.75</option>
                <option>+11.50</option>
                <option>+11.25</option>
                <option>+11.00</option>
                <option>+10.75</option>
                <option>+10.50</option>
                <option>+10.25</option>
                <option>+10.00</option>
                <option>+9.75</option>
                <option>+9.50</option>
                <option>+9.25</option>
                <option>+9.00</option>
                <option>+8.75</option>
                <option>+8.50</option>
                <option>+8.25</option>
                <option>+8.00</option>
                <option>+7.75</option>
                <option>+7.50</option>
                <option>+7.25</option>
                <option>+7.00</option>
                <option>+6.75</option>
                <option>+6.50</option>
                <option>+6.25</option>
                <option>+6.00</option>
                <option>+5.75</option>
                <option>+5.50</option>
                <option>+5.25</option>
                <option>+5.00</option>
                <option>+4.75</option>
                <option>+4.50</option>
                <option>+4.25</option>
                <option>+4.00</option>
                <option>+3.75</option>
                <option>+3.50</option>
                <option>+3.25</option>
                <option>+3.00</option>
                <option>+2.75</option>
                <option>+2.50</option>
                <option>+2.25</option>
                <option>+2.00</option>
                <option>+1.75</option>
                <option>+1.50</option>
                <option>+1.25</option>
                <option>+1.00</option>
                <option>+0.75</option>
                <option>+0.50</option>
                <option>+0.25</option>
                <option>0.00</option>
                <option>-0.25</option>
                <option>-0.50</option>
                <option>-0.75</option>
                <option>-1.00</option>
                <option>-1.25</option>
                <option>-1.50</option>
                <option>-1.75</option>
                <option>-2.00</option>
                <option>-2.25</option>
                <option>-2.50</option>
                <option>-2.75</option>
                <option>-3.00</option>
                <option>-3.25</option>
                <option>-3.50</option>
                <option>-3.75</option>
                <option>-4.00</option>
                <option>-4.25</option>
                <option>-4.50</option>
                <option>-4.75</option>
                <option>-5.00</option>
                <option>-5.25</option>
                <option>-5.50</option>
                <option>-5.75</option>
                <option>-6.00</option>
                <option>-6.25</option>
                <option>-6.50</option>
                <option>-6.75</option>
                <option>-7.00</option>
                <option>-7.25</option>
                <option>-7.50</option>
                <option>-7.75</option>
                <option>-8.00</option>
                <option>-8.25</option>
                <option>-8.50</option>
                <option>-8.75</option>
                <option>-9.00</option>
                <option>-9.25</option>
                <option>-9.50</option>
                <option>-9.75</option>
                <option>-10.00</option>
                <option>-10.25</option>
                <option>-10.50</option>
                <option>-10.75</option>
                <option>-11.00</option>
                <option>-11.25</option>
                <option>-11.50</option>
                <option>-11.75</option>
                <option>-12.00</option>
                <option>-12.25</option>
                <option>-12.50</option>
                <option>-12.75</option>
                <option>-13.00</option>
                <option>-13.25</option>
                <option>-13.50</option>
                <option>-13.75</option>
                <option>-14.00</option>
                <option>-14.25</option>
                <option>-14.50</option>
                <option>-14.75</option>
                <option>-15.00</option>
                <option>-15.25</option>
                <option>-15.50</option>
                <option>-15.75</option>
                <option>-16.00</option>
                <option>-16.25</option>
                <option>-16.50</option>
                <option>-16.75</option>
                <option>-17.00</option>
                <option>-17.25</option>
                <option>-17.50</option>
                <option>-17.75</option>
                <option>-18.00</option>
                <option>-18.25</option>
                <option>-18.50</option>
                <option>-18.75</option>
                <option>-19.00</option>
                <option>-19.25</option>
                <option>-19.50</option>
                <option>-19.75</option>
                <option>-19.00</option>
                <option>-19.25</option>
                <option>-19.50</option>
                <option>-19.75</option>
                <option>-20.00</option>
                <option>-20.25</option>
                <option>-20.50</option>
                <option>-20.75</option>
                <option>-21.00</option>
                <option>-21.25</option>
                <option>-21.50</option>
                <option>-21.75</option>
                <option>-22.00</option>
                <option>-22.25</option>
                <option>-22.50</option>
                <option>-22.75</option>
                <option>-23.00</option>
                <option>-23.25</option>
                <option>-23.50</option>
                <option>-23.75</option>
                <option>-24.00</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-left text-[#666] font-semibold mb-1">
                Cyl
              </label>
              <select className="w-full border border-gray-300 hover:border-[#169D53] hover:border-2 rounded-md p-2">
                <option>Select</option>
                <option>+6.00</option>
                <option>+5.75</option>
                <option>+5.50</option>
                <option>+5.25</option>
                <option>+5.00</option>
                <option>+4.75</option>
                <option>+4.50</option>
                <option>+4.25</option>
                <option>+4.00</option>
                <option>+3.75</option>
                <option>+3.50</option>
                <option>+3.25</option>
                <option>+3.00</option>
                <option>+2.75</option>
                <option>+2.50</option>
                <option>+2.25</option>
                <option>+2.00</option>
                <option>+1.75</option>
                <option>+1.50</option>
                <option>+1.25</option>
                <option>+1.00</option>
                <option>+0.75</option>
                <option>+0.50</option>
                <option>+0.25</option>
                <option>0.00</option>
                <option>-0.25</option>
                <option>-0.50</option>
                <option>-0.75</option>
                <option>-1.00</option>
                <option>-1.25</option>
                <option>-1.50</option>
                <option>-1.75</option>
                <option>-2.00</option>
                <option>-2.25</option>
                <option>-2.50</option>
                <option>-2.75</option>
                <option>-3.00</option>
                <option>-3.25</option>
                <option>-3.50</option>
                <option>-3.75</option>
                <option>-4.00</option>
                <option>-4.25</option>
                <option>-4.50</option>
                <option>-4.75</option>
                <option>-5.00</option>
                <option>-5.25</option>
                <option>-5.50</option>
                <option>-5.75</option>
                <option>-6.00</option>
              </select>
            </div>

            <div>
              <label className="block text-sm text-left text-[#666] font-semibold mb-1">
                Axis
              </label>
              <input
                type="number"
                placeholder="1 to 180"
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="bg-[#f8f9fa] p-5 rounded-[20px] shadow-md border-1 border-[#e5e5e5] sm:w-[65%] w-full mx-4   my-10  ">
          <h1 className="text-sm font-semibold text-black  mb-4">ADD</h1>

          <select
            className="
       w-full p-4 rounded-[19px] border-2
       border-black
        hover:border-[#169D53]
    outline-none
    transition-all duration-300
    cursor-pointer
    mb-10
    "
          >
            <option>Select</option>
            <option>0.00</option>
            <option>+0.25</option>
            <option>+0.50</option>
            <option>+0.75</option>
            <option>+1.00</option>
            <option>+1.25</option>
            <option>+1.50</option>
            <option>+1.75</option>
            <option>+2.00</option>
            <option>+2.25</option>
            <option>+2.50</option>
            <option>+2.75</option>
            <option>+3.00</option>
            <option>+3.25</option>
            <option>+3.50</option>
          </select>
        </div>
      </div>

      <div className="flex justify-center sm:my-9 my-1">
        <button
          type="submit"
          className="bg-[#169D53] text-white font-bold px-[30px] text-[18px] py-[15px] rounded-lg shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
        >
          Save Record
        </button>
      </div>
    </form>
  );
}
