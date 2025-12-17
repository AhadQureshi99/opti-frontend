import { FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { get, put } from "../utils/api";
import { useToast } from "../components/ToastProvider";

export default function Myshop() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const toast = useToast();
  const fileRef = useRef(null);

  const [form, setForm] = useState({
    shopName: "",
    address: "",
    phoneNumber: "",
    username: "",
    password: "",
    currency: "INR - Indian Rupee (₹)",
    whatsappNumber: "",
    facebookId: "",
    instagramId: "",
    website: "",
  });

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    get("/api/user/profile", { cacheKey: "profile" })
      .then((data) => {
        if (!mounted) return;
        const u = data && data.user ? data.user : data;
        // map backend user fields to form
        setForm((f) => ({
          ...f,
          shopName: u.shopName || u.shopname || "",
          address: u.address || "",
          phoneNumber: u.phoneNumber || u.phone || "",
          username: u.username || u.email || "",
          currency: u.currency || f.currency,
          whatsappNumber: u.whatsappNumber || "",
          facebookId: u.facebookId || "",
          instagramId: u.instagramId || "",
          website: u.website || "",
        }));
      })
      .catch((err) => {
        console.error("Failed to load profile", err);
        toast.addToast(err?.body?.message || "Failed to load shop data", {
          type: "error",
        });
      })
      .finally(() => setLoading(false));
    return () => (mounted = false);
  }, [toast]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = {
        shopName: form.shopName,
        address: form.address,
        phoneNumber: form.phoneNumber,
        username: form.username,
        password: form.password || undefined,
        currency: form.currency,
        whatsappNumber: form.whatsappNumber,
        facebookId: form.facebookId,
        instagramId: form.instagramId,
        website: form.website,
      };
      await put("/api/user/profile", body, { cacheKey: "profile" });
      toast.addToast("Shop settings saved", { type: "success" });
      setForm((s) => ({ ...s, password: "" }));
    } catch (err) {
      console.error("Failed to save profile", err);
      toast.addToast(err?.body?.message || "Failed to save shop data", {
        type: "error",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    // reload profile from server
    setLoading(true);
    get("/user/profile", { cacheKey: "profile" })
      .then((data) => {
        const u = data && data.user ? data.user : data;
        setForm((f) => ({
          ...f,
          shopName: u.shopName || u.shopname || "",
          address: u.address || "",
          phoneNumber: u.phoneNumber || u.phone || "",
          username: u.username || u.email || "",
          currency: u.currency || f.currency,
          whatsappNumber: u.whatsappNumber || "",
          facebookId: u.facebookId || "",
          instagramId: u.instagramId || "",
          website: u.website || "",
        }));
        toast.addToast("Form reset to saved values", { type: "success" });
      })
      .catch((err) => {
        console.error(err);
        toast.addToast(err?.body?.message || "Failed to reset form", {
          type: "error",
        });
      })
      .finally(() => setLoading(false));
  };

  const handleLogoUpload = async (file) => {
    if (!file) return;
    setUploading(true);
    try {
      const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");
      const fd = new FormData();
      fd.append("image", file);
      const base =
        (typeof import.meta !== "undefined" &&
          import.meta.env &&
          import.meta.env.VITE_API_BASE) ||
        "https://api.optislip.com";
      const res = await fetch(base + "/api/user/upload-image", {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: fd,
      });
      const text = await res.text();
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        data = text;
      }
      if (!res.ok) throw { status: res.status, body: data };
      toast.addToast("Logo uploaded", { type: "success" });
    } catch (err) {
      console.error("Upload failed", err);
      toast.addToast(err?.body?.message || "Failed to upload logo", {
        type: "error",
      });
    } finally {
      setUploading(false);
    }
  };
  return (
    <>
      <div className="w-full bg-white h-fullscreen pb-20">
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

        <div className="flex flex-row items-center justify-center mt-2">
          <p className="">👤</p>
          <p className="text-green-600 font-semibold text-sm pl-[8px]">
            Sub User Access
          </p>
        </div>

        <div className="relative w-full flex flex-row justify-center my-10">
          <label
            className="
      absolute
      -top-5
      left-20
      sm:left-60
      bg-white
      px-2
      text-sm
      font-bold
      text-black
      z-20
    "
          >
            Shop Name
          </label>

          <input
            name="shopName"
            value={form.shopName}
            onChange={handleChange}
            type="text"
            placeholder="Enter shop name"
            className="
     w-[65%]
      px-5 
      py-6
      border-2 
      border-black
      rounded-[25px]
      text-base
      font-bold
      bg-white
      text-black       
    placeholder:text-gray-400 
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
      -top-5
      left-20
      sm:left-60
      bg-white
      px-2
      text-sm
      font-bold
      text-black
      z-20
    "
          >
            Shop Address
          </label>

          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            type="text"
            placeholder="Enter shop address"
            className="
     w-[65%]
      px-5 
      py-6
      rows-3
      border-2 
      border-black
      rounded-[25px]
      text-base
      font-bold
      bg-white
       text-black       
    placeholder:text-gray-400 
      min-h-[60px]
      transition-all
      duration-300
      focus:border-green-600
      focus:shadow-md
      outline-none
    "
          />
        </div>

        <div className="relative w-full flex flex-row justify-center my-10">
          <label
            className="
      absolute
      -top-5
      left-20
      sm:left-60
      bg-white
      px-2
      text-sm
      font-bold
      text-black
      z-20
    "
          >
            Phone Number
          </label>

          <input
            name="phoneNumber"
            value={form.phoneNumber}
            onChange={handleChange}
            type="tel"
            placeholder="Enter phone number"
            className="
     w-[65%]
      px-5 
      py-6
      border-2 
      border-black
      rounded-[25px]
      text-base
      font-bold
      bg-white
       text-black       
    placeholder:text-gray-400
      min-h-[60px]
      transition-all
      duration-300
      focus:border-green-600
      focus:shadow-md
      outline-none
    "
          />
        </div>

        <div className="relative w-full flex flex-row justify-center my-10">
          <label
            className="
      absolute
      -top-5
      left-20
      sm:left-60
      bg-white
      px-2
      text-sm
      font-bold
      text-black
      z-20
    "
          >
            User Name
          </label>

          <input
            name="username"
            value={form.username}
            onChange={handleChange}
            type="text"
            placeholder="Enter user name"
            className="
     w-[65%]
      px-5 
      py-6
      border-2 
      border-black
      rounded-[25px]
      text-base
      font-bold
      bg-white
       text-black       
    placeholder:text-gray-400
      min-h-[60px]
      transition-all
      duration-300
      focus:border-green-600
      focus:shadow-md
      outline-none
    "
          />
        </div>

        <div className="relative w-full flex flex-row justify-center my-10">
          <label
            className="
      absolute
      -top-5
      left-20
      sm:left-60
      bg-white
      px-2
      text-sm
      font-bold
      text-black
      z-20
    "
          >
            Password
          </label>

          <input
            name="password"
            value={form.password}
            onChange={handleChange}
            type="password"
            placeholder="Enter new password(optional)"
            className="
     w-[65%]
      px-5 
      py-6
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

        <div className="relative w-full flex flex-row justify-center my-10">
          <label className="absolute -top-0 left-20 sm:left-60 bg-white px-2 text-sm font-bold text-black z-20">
            Upload Logo
          </label>

          <div className="w-[65%] flex flex-col mt-8 sm:mt-0">
            <input
              id="uploadLogo"
              ref={fileRef}
              type="file"
              className="peer hidden"
              onChange={(e) => handleLogoUpload(e.target.files?.[0])}
            />

            <div
              className="
        w-full
        border-2
        border-black
        rounded-t-[25px]
        overflow-hidden
        bg-white
        px-5 py-4
        text-gray-400 font-bold
        flex items-center
      "
            >
              Choose file...
            </div>

            <button
              type="button"
              onClick={() => fileRef.current && fileRef.current.click()}
              className="
        w-full
        bg-[#128a43]
        text-white
        font-semibold
        py-4
        rounded-b-[25px]
        mt-0
        hover:bg-green-700
        transition-all duration-300
      "
            >
              Upload
            </button>
          </div>
        </div>

        <div className="relative w-full flex flex-row justify-center my-10">
          <label
            className="
      absolute
      -top-5
      left-20
      sm:left-60
      bg-white
      px-2
      text-sm
      font-bold
      text-black
      z-20
    "
          >
            Currency
          </label>

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
            value={form.currency}
            onChange={handleChange}
            name="currency"
            placeholder="Select Currency"
          />
        </div>

        <div className="relative w-full flex flex-row justify-center my-10">
          <label
            className="
      absolute
      -top-5
      left-20
      sm:left-60
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
            value={form.whatsappNumber}
            onChange={handleChange}
            type="tel"
            placeholder="Enter WhatsApp number"
            className="
     w-[65%]
      px-5 
      py-6
      border-2 
      border-black
      rounded-[25px]
      text-base
      font-bold
      bg-white
      text:black
       placeholder:text-gray-400
      min-h-[60px]
      transition-all
      duration-300
      focus:border-green-600
      focus:shadow-md
      outline-none
    "
          />
        </div>
        <div className="relative w-full flex flex-row justify-center my-10">
          <label
            className="
      absolute
      -top-5
      left-20
      sm:left-60
      bg-white
      px-2
      text-sm
      font-bold
      text-black
      z-20
    "
          >
            Facebook ID
          </label>

          <input
            name="facebookId"
            value={form.facebookId}
            onChange={handleChange}
            type="text"
            placeholder="Enter Facebook ID"
            className="
     w-[65%]
      px-5 
      py-6
      border-2 
      border-black
      rounded-[25px]
      text-base
      font-bold
      bg-white
      text:black
      placeholde:text-gray-400
      min-h-[60px]
      transition-all
      duration-300
      focus:border-green-600
      focus:shadow-md
      outline-none
    "
          />
        </div>

        <div className="relative w-full flex flex-row justify-center my-10">
          <label
            className="
      absolute
      -top-5
      left-20
      sm:left-60
      bg-white
      px-2
      text-sm
      font-bold
      text-black
      z-20
    "
          >
            Instagram ID
          </label>

          <input
            name="instagramId"
            value={form.instagramId}
            onChange={handleChange}
            type="text"
            placeholder="Enter Instagram ID"
            className="
     w-[65%]
      px-5 
      py-6
      border-2 
      border-black
      rounded-[25px]
      text-base
      font-bold
      bg-white
       text:black
      placeholde:text-gray-400
      min-h-[60px]
      transition-all
      duration-300
      focus:border-green-600
      focus:shadow-md
      outline-none
    "
          />
        </div>
        <div className="relative w-full flex flex-row justify-center my-10">
          <label
            className="
      absolute
      -top-5
     left-20
      sm:left-60
      bg-white
      px-2
      text-sm
      font-bold
      text-black
      z-20
    "
          >
            Website
          </label>

          <input
            name="website"
            value={form.website}
            onChange={handleChange}
            type="url"
            placeholder="Enter Website URL"
            className="
     w-[65%]
      px-5 
      py-6
      border-2 
      border-black
      rounded-[25px]
      text-base
      font-bold
      bg-white
       text:black
      placeholde:text-gray-400
      min-h-[60px]
      transition-all
      duration-300
      focus:border-green-600
      focus:shadow-md
      outline-none
    "
          />
        </div>

        <div className="flex justify-center space-x-6 sm:mt-20 mt-20">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="bg-[#169D53] text-white font-bold sm:px-10 sm:py-4 px-10 py-2 rounded-lg hover:bg-green-700 transition-all duration-300 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>

          <button
            type="button"
            onClick={handleReset}
            className="bg-white text-green-600 font-bold sm:px-10 sm:py-4 px-8 py-2 rounded-lg border-2 border-green-600 hover:bg-[#169D53] hover:text-white transition-all duration-300"
          >
            Reset
          </button>
        </div>
      </div>
    </>
  );
}
