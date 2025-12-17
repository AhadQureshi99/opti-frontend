import { FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";
import { RiArrowDropDownLine } from "react-icons/ri";
import { useRef, useState, useEffect } from "react";
import { get, put } from "../utils/api";
import { useToast } from "../components/ToastProvider";
import { useNavigate } from "react-router-dom";
import CustomDropdown from "../components/CustomDropdown";

export default function Settings() {
  const [value, setValue] = useState("");
  const [facebook, setFacebook] = useState("");
  const [instagram, setInstagram] = useState("");
  const [website, setWebsite] = useState("");
  const toast = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    get("/api/user/profile", { cacheKey: "profile" })
      .then((data) => {
        if (!mounted) return;
        const u = data && data.user ? data.user : data;
        setValue(u.currency || "");
        setFacebook(u.facebookId || "");
        setInstagram(u.instagramId || "");
        setWebsite(u.website || "");
      })
      .catch(() => {
        // not logged in or profile fetch failed — keep defaults
      });
    return () => (mounted = false);
  }, []);

  return (
    <div className="w-full bg-white min-h-screen">
      <div className="relative flex items-center justify-center px-5 sm:px-10 pt-10">
        <Link to="/home-page">
          <FaArrowLeft className="absolute left-5 sm:left-18 top-14 w-7 h-6 text-black cursor-pointer transition-all duration-300 hover:text-green-600 hover:-translate-x-1" />
        </Link>

        <img
          src="/Optislipimage.png"
          alt="OptiSlip"
          style={{ filter: "invert(1) grayscale(1) brightness(0)" }}
          className="h-[12vh] sm:ml-8 ml-4 sm:h-[20vh]"
        />
      </div>

      <div>
        <h1 className="font-semibold text-center text-[20px] sm:text-[24px]">
          Settings
        </h1>
      </div>

      {["Facebook", "Instagram", "Website"].map((label, i) => (
        <div
          key={i}
          className="relative w-full flex justify-center my-6 sm:my-10 px-2 sm:px-0"
        >
          <label className="absolute sm:-top-5 -top-4 sm:left-60 left-4 bg-white px-2 text-sm font-bold text-black z-20">
            {label}
          </label>

          <input
            type="text"
            placeholder={label === "Website" ? "eg. optislip.com" : "ID Name"}
            className="w-full sm:w-[65%] py-3 sm:py-6 px-4 sm:px-5 border-2 border-gray-400 rounded-[25px] text-base font-bold bg-white text-black min-h-[60px] mx-0 sm:mx-4 transition-all duration-300 focus:border-green-600 focus:shadow-md outline-none"
            value={
              label === "Facebook"
                ? facebook
                : label === "Instagram"
                ? instagram
                : website
            }
            onChange={(e) => {
              if (label === "Facebook") setFacebook(e.target.value);
              else if (label === "Instagram") setInstagram(e.target.value);
              else setWebsite(e.target.value);
            }}
          />
        </div>
      ))}

      <div className="w-full flex justify-center mt-6 sm:mt-10 px-2 sm:px-0 relative">
        <label className="block mb-1 font-semibold absolute left-4 sm:left-60 bottom-6 text-[15px]">
          Set Currency
        </label>

        <div className="w-full sm:w-[65%] mx-auto">
          <CustomDropdown
            options={[
              "USD - US Dollar ($)",
              "EUR - Euro (€)",
              "GBP - British Pound (£)",
              "PKR - Pakistani Rupee (₨)",
              "INR - Indian Rupee (₹)",
              "AED - Dirham (د.إ)",
              "SAR - Saudi Riyal (﷼)",
              "CAD - Canadian Dollar (C$)",
              "AUD - Australian Dollar (A$)",
              "JPY - Japanese Yen (¥)",
              "CNY - Chinese Yuan (¥)",
              "CHF - Swiss Franc (CHF)",
              "SGD - Singapore Dollar (S$)",
              "MYR - Malaysian Ringgit (RM)",
              "BDT - Bangladeshi Taka (৳)",
              "THB - Thai Baht (฿)",
              "KRW - South Korean Won (₩)",
              "ZAR - South African Rand (R)",
              "TRY - Turkish Lira (₺)",
              "BRL - Brazilian Real (R$)",
              "MXN - Mexican Peso ($)",
              "NZD - New Zealand Dollar (NZ$)",
              "RUB - Russian Ruble (₽)",
            ]}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            name="currency"
            placeholder="Select Currency"
          />
        </div>
      </div>
      <div className="mt-8 flex justify-center">
        <button
          className="bg-[#007A3F] text-[18px] text-white py-3 px-14 font-semibold rounded-[28px]"
          onClick={async () => {
            try {
              await put(
                "/api/user/profile",
                {
                  currency: value,
                  facebookId: facebook,
                  instagramId: instagram,
                  website,
                },
                { cacheKey: "profile" }
              );
              toast.addToast("Settings saved", { type: "success" });
              navigate("/home-page");
            } catch (err) {
              if (err && err.status === 401) {
                toast.addToast("Please log in to save settings", {
                  type: "error",
                });
                navigate("/login");
              } else {
                toast.addToast(err?.body?.message || "Save failed", {
                  type: "error",
                });
              }
            }
          }}
        >
          Save Changes
        </button>
      </div>

      <div className="flex items-center gap-2 mt-4 mx-auto w-full sm:w-[65%] px-4">
        <input
          type="checkbox"
          id="delete-account"
          className="w-5 h-5 cursor-pointer"
        />
        <label
          htmlFor="delete-account"
          className="text-[16px] cursor-pointer text-black"
        >
          Delete My Shop Account
        </label>
      </div>

      <div className="mt-8 flex justify-center">
        <button className="bg-[#FF0000] text-[18px] text-white py-3 px-20 font-semibold rounded-[28px] mb-8">
          Confirm
        </button>
      </div>
    </div>
  );
}
