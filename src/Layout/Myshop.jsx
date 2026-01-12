import { FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import { CiCalendar } from "react-icons/ci";
import { LuPhone } from "react-icons/lu";
import { MdOutlineEmail } from "react-icons/md";
import { RiDeleteBinLine } from "react-icons/ri";
import { MdEdit } from "react-icons/md";
import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { get, put, post, del } from "../utils/api";
import { useToast } from "../components/ToastProvider";
import CustomDropdown from "../components/CustomDropdown";

const countries = [
  { code: "+1", name: "USA", flag: "🇺🇸" },
  { code: "+91", name: "India", flag: "🇮🇳" },
  { code: "+44", name: "UK", flag: "🇬🇧" },
  { code: "+61", name: "Australia", flag: "🇦🇺" },
  { code: "+81", name: "Japan", flag: "🇯🇵" },
  { code: "+86", name: "China", flag: "🇨🇳" },
  { code: "+49", name: "Germany", flag: "🇩🇪" },
  { code: "+33", name: "France", flag: "🇫🇷" },
  { code: "+39", name: "Italy", flag: "🇮🇹" },
  { code: "+7", name: "Russia", flag: "🇷🇺" },
  { code: "+55", name: "Brazil", flag: "🇧🇷" },
  { code: "+27", name: "South Africa", flag: "🇿🇦" },
  { code: "+82", name: "South Korea", flag: "🇰🇷" },
  { code: "+65", name: "Singapore", flag: "🇸🇬" },
  { code: "+60", name: "Malaysia", flag: "🇲🇾" },
  { code: "+66", name: "Thailand", flag: "🇹🇭" },
  { code: "+84", name: "Vietnam", flag: "🇻🇳" },
  { code: "+63", name: "Philippines", flag: "🇵🇭" },
  { code: "+62", name: "Indonesia", flag: "🇮🇩" },
  { code: "+20", name: "Egypt", flag: "🇪🇬" },
  { code: "+971", name: "UAE", flag: "🇦🇪" },
  { code: "+966", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+90", name: "Turkey", flag: "🇹🇷" },
  { code: "+48", name: "Poland", flag: "🇵🇱" },
  { code: "+31", name: "Netherlands", flag: "🇳🇱" },
  { code: "+46", name: "Sweden", flag: "🇸🇪" },
  { code: "+47", name: "Norway", flag: "🇳🇴" },
  { code: "+45", name: "Denmark", flag: "🇩🇰" },
  { code: "+358", name: "Finland", flag: "🇫🇮" },
  { code: "+41", name: "Switzerland", flag: "🇨🇭" },
  { code: "+43", name: "Austria", flag: "🇦🇹" },
  { code: "+32", name: "Belgium", flag: "🇧🇪" },
  { code: "+34", name: "Spain", flag: "🇪🇸" },
  { code: "+351", name: "Portugal", flag: "🇵🇹" },
  { code: "+30", name: "Greece", flag: "🇬🇷" },
  { code: "+36", name: "Hungary", flag: "🇭🇺" },
  { code: "+420", name: "Czech Republic", flag: "🇨🇿" },
  { code: "+40", name: "Romania", flag: "🇷🇴" },
  { code: "+380", name: "Ukraine", flag: "🇺🇦" },
  { code: "+7", name: "Kazakhstan", flag: "🇰🇿" },
  { code: "+994", name: "Azerbaijan", flag: "🇦🇿" },
  { code: "+374", name: "Armenia", flag: "🇦🇲" },
  { code: "+995", name: "Georgia", flag: "🇬🇪" },
  { code: "+98", name: "Iran", flag: "🇮🇷" },
  { code: "+964", name: "Iraq", flag: "🇮🇶" },
  { code: "+962", name: "Jordan", flag: "🇯🇴" },
  { code: "+961", name: "Lebanon", flag: "🇱🇧" },
  { code: "+970", name: "Palestine", flag: "🇵🇸" },
  { code: "+972", name: "Israel", flag: "🇮🇱" },
  { code: "+968", name: "Oman", flag: "🇴🇲" },
  { code: "+974", name: "Qatar", flag: "🇶🇦" },
  { code: "+965", name: "Kuwait", flag: "🇰🇼" },
  { code: "+973", name: "Bahrain", flag: "🇧🇭" },
  { code: "+92", name: "Pakistan", flag: "🇵🇰" },
  { code: "+880", name: "Bangladesh", flag: "🇧🇩" },
  { code: "+94", name: "Sri Lanka", flag: "🇱🇰" },
  { code: "+95", name: "Myanmar", flag: "🇲🇲" },
  { code: "+856", name: "Laos", flag: "🇱🇦" },
  { code: "+855", name: "Cambodia", flag: "🇰🇭" },
  { code: "+84", name: "Vietnam", flag: "🇻🇳" },
  { code: "+856", name: "Laos", flag: "🇱🇦" },
  { code: "+855", name: "Cambodia", flag: "🇰🇭" },
  { code: "+670", name: "Timor-Leste", flag: "🇹🇱" },
  { code: "+675", name: "Papua New Guinea", flag: "🇵🇬" },
  { code: "+676", name: "Tonga", flag: "🇹🇴" },
  { code: "+677", name: "Solomon Islands", flag: "🇸🇧" },
  { code: "+678", name: "Vanuatu", flag: "🇻🇺" },
  { code: "+679", name: "Fiji", flag: "🇫🇯" },
  { code: "+680", name: "Palau", flag: "🇵🇼" },
  { code: "+681", name: "Wallis and Futuna", flag: "🇼🇫" },
  { code: "+682", name: "Cook Islands", flag: "🇨🇰" },
  { code: "+683", name: "Niue", flag: "🇳🇺" },
  { code: "+684", name: "American Samoa", flag: "🇦🇸" },
  { code: "+685", name: "Samoa", flag: "🇼🇸" },
  { code: "+686", name: "Kiribati", flag: "🇰🇮" },
  { code: "+687", name: "New Caledonia", flag: "🇳🇨" },
  { code: "+688", name: "Tuvalu", flag: "🇹🇻" },
  { code: "+689", name: "French Polynesia", flag: "🇵🇫" },
  { code: "+690", name: "Tokelau", flag: "🇹🇰" },
  { code: "+691", name: "Micronesia", flag: "🇫🇲" },
  { code: "+692", name: "Marshall Islands", flag: "🇲🇭" },
  { code: "+850", name: "North Korea", flag: "🇰🇵" },
  { code: "+852", name: "Hong Kong", flag: "🇭🇰" },
  { code: "+853", name: "Macau", flag: "🇲🇴" },
  { code: "+855", name: "Cambodia", flag: "🇰🇭" },
  { code: "+856", name: "Laos", flag: "🇱🇦" },
  { code: "+880", name: "Bangladesh", flag: "🇧🇩" },
  { code: "+886", name: "Taiwan", flag: "🇹🇼" },
  { code: "+960", name: "Maldives", flag: "🇲🇻" },
  { code: "+961", name: "Lebanon", flag: "🇱🇧" },
  { code: "+962", name: "Jordan", flag: "🇯🇴" },
  { code: "+963", name: "Syria", flag: "🇸🇾" },
  { code: "+964", name: "Iraq", flag: "🇮🇶" },
  { code: "+965", name: "Kuwait", flag: "🇰🇼" },
  { code: "+966", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "+967", name: "Yemen", flag: "🇾🇪" },
  { code: "+968", name: "Oman", flag: "🇴🇲" },
  { code: "+970", name: "Palestine", flag: "🇵🇸" },
  { code: "+971", name: "UAE", flag: "🇦🇪" },
  { code: "+972", name: "Israel", flag: "🇮🇱" },
  { code: "+973", name: "Bahrain", flag: "🇧🇭" },
  { code: "+974", name: "Qatar", flag: "🇶🇦" },
  { code: "+975", name: "Bhutan", flag: "🇧🇹" },
  { code: "+976", name: "Mongolia", flag: "🇲🇳" },
  { code: "+977", name: "Nepal", flag: "🇳🇵" },
  { code: "+992", name: "Tajikistan", flag: "🇹🇯" },
  { code: "+993", name: "Turkmenistan", flag: "🇹🇲" },
  { code: "+994", name: "Azerbaijan", flag: "🇦🇿" },
  { code: "+995", name: "Georgia", flag: "🇬🇪" },
  { code: "+996", name: "Kyrgyzstan", flag: "🇰🇬" },
  { code: "+998", name: "Uzbekistan", flag: "🇺🇿" },
];

export default function Myshop() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [subLoading, setSubLoading] = useState(false);
  const [subUsers, setSubUsers] = useState([]);
  const [editingSubUser, setEditingSubUser] = useState(null);
  const [showSubPassword, setShowSubPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [subUserForm, setSubUserForm] = useState({
    subUsername: "",
    email: "",
    password: "",
    phoneNumber: "",
  });
  const [form, setForm] = useState({
    shopName: "",
    address: "",
    phoneNumber: "",
    countryCode: "+91",
    username: "",
    password: "",
    whatsappNumber: "",
    whatsappCode: "+91",
    facebookId: "",
    instagramId: "",
    website: "",
  });
  const toast = useToast();
  const fileRef = useRef(null);

  // Sub-user access check
  const isSubUser = localStorage.getItem("isSubUser") === "true";
  // Fetch sub-users on mount
  useEffect(() => {
    let mounted = true;
    get("/api/user/sub-users")
      .then((data) => {
        if (!mounted) return;
        setSubUsers(data.subUsers || []);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  // Sub-user handlers
  async function handleAddSubUser(e) {
    e.preventDefault && e.preventDefault();
    setSubLoading(true);
    try {
      const body = { ...subUserForm };
      const data = await post("/api/user/sub-users", body);
      toast.addToast(data.message || "Sub-user added", { type: "success" });
      setSubUsers((s) => [...s, data.subUser]);
      setSubUserForm({
        subUsername: "",
        email: "",
        password: "",
        phoneNumber: "",
      });
    } catch (err) {
      toast.addToast(err?.body?.message || "Add failed", { type: "error" });
    } finally {
      setSubLoading(false);
    }
  }

  function handleEditSubUser(subUser) {
    setEditingSubUser(subUser);
    setSubUserForm({
      subUsername: subUser.subUsername || "",
      email: subUser.email || "",
      password: "",
      phoneNumber: subUser.phoneNumber || "",
    });
  }

  async function handleUpdateSubUser(e) {
    e.preventDefault && e.preventDefault();
    if (!editingSubUser) return;
    setSubLoading(true);
    try {
      const body = { ...subUserForm };
      if (!body.password) delete body.password;
      const data = await put(`/api/user/sub-users/${editingSubUser._id}`, body);
      toast.addToast(data.message || "Sub-user updated", { type: "success" });
      setSubUsers((s) =>
        s.map((u) => (u._id === editingSubUser._id ? data.subUser : u))
      );
      setEditingSubUser(null);
      setSubUserForm({
        subUsername: "",
        email: "",
        password: "",
        phoneNumber: "",
      });
    } catch (err) {
      toast.addToast(err?.body?.message || "Update failed", { type: "error" });
    } finally {
      setSubLoading(false);
    }
  }

  async function handleDeleteSubUser(id) {
    if (!window.confirm("Are you sure you want to delete this sub-user?"))
      return;
    try {
      await del(`/api/user/sub-users/${id}`);
      toast.addToast("Sub-user deleted", { type: "success" });
      setSubUsers((s) => s.filter((u) => u._id !== id));
    } catch (err) {
      toast.addToast(err?.body?.message || "Delete failed", { type: "error" });
    }
  }

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    get("/api/user/profile", { cacheKey: "profile" })
      .then((data) => {
        if (!mounted) return;
        const u = data && data.user ? data.user : data;

        // Set uploaded image if exists
        if (u.image) {
          const base = (
            import.meta?.env?.VITE_API_BASE || "https://api.optislip.com"
          ).replace(/\/api\/?$/, "");
          const imgSrc = u.image.startsWith("http")
            ? u.image
            : base + "/" + u.image.replace(/^\//, "");
          setUploadedImage(imgSrc);
        }

        // map backend user fields to form
        setForm((f) => ({
          ...f,
          shopName: u.shopName || u.shopname || "",
          address: u.address || "",
          phoneNumber: u.phoneNumber || u.phone || "",
          countryCode: u.countryCode || "+91",
          username: u.username || u.email || "",
          currency: u.currency || f.currency,
          whatsappNumber: u.whatsappNumber || "",
          whatsappCode: u.whatsappCode || "+91",
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
        countryCode: form.countryCode,
        username: form.username,
        password: form.password || undefined,
        whatsappNumber: form.whatsappNumber,
        whatsappCode: form.whatsappCode,
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
          countryCode: u.countryCode || "+91",
          username: u.username || u.email || "",
          whatsappNumber: u.whatsappNumber || "",
          whatsappCode: u.whatsappCode || "+91",
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

      // Set the uploaded image for preview
      setUploadedImage(URL.createObjectURL(file));

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
      <div className="w-full bg-white min-h-screen pb-20 px-2 sm:px-6 md:px-12 lg:px-32 xl:px-64">
        <div className="relative flex flex-col sm:flex-row items-center justify-center px-4 sm:px-10 pt-6 sm:pt-10 gap-4">
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

        <div className="relative w-full flex flex-col sm:flex-row justify-center my-6 sm:my-10">
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
            className="w-full sm:w-[65%] px-4 sm:px-5 py-4 sm:py-6 border-2 border-black rounded-[25px] text-base font-bold bg-white text-black placeholder:text-gray-400 min-h-[40px] sm:min-h-[60px] transition-all duration-300 focus:border-green-600 focus:shadow-md outline-none"
          />
        </div>

        <div className="relative w-full flex flex-col sm:flex-row justify-center">
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
            className="w-full sm:w-[65%] px-4 sm:px-5 py-4 sm:py-6 rows-3 border-2 border-black rounded-[25px] text-base font-bold bg-white text-black placeholder:text-gray-400 min-h-[40px] sm:min-h-[60px] transition-all duration-300 focus:border-green-600 focus:shadow-md outline-none"
          />
        </div>

        <div className="relative w-full flex flex-col sm:flex-row justify-center my-6 sm:my-10">
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
            className="w-full sm:w-[65%] px-4 sm:px-5 py-4 sm:py-6 border-2 border-black rounded-[25px] text-base font-bold bg-white text-black placeholder:text-gray-400 min-h-[40px] sm:min-h-[60px] transition-all duration-300 focus:border-green-600 focus:shadow-md outline-none"
          />
        </div>

        <div className="relative w-full flex flex-col sm:flex-row justify-center my-6 sm:my-10">
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

          <div className="w-full sm:w-[65%] relative">
            <input
              name="password"
              value={form.password}
              onChange={handleChange}
              type={showPassword ? "text" : "password"}
              placeholder="Enter new password(optional)"
              className="w-full px-4 sm:px-5 py-4 sm:py-6 border-2 border-black rounded-[25px] text-base font-bold bg-white text-gray-400 placeholder:text-gray-400 min-h-[40px] sm:min-h-[60px] transition-all duration-300 focus:border-green-600 focus:shadow-md outline-none pr-12"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-900 focus:outline-none"
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>
        </div>

        <div className="relative w-full flex flex-col sm:flex-row justify-center my-6 sm:my-10">
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

          <div className="flex flex-row items-center w-full sm:w-[65%] gap-0">
            <input
              name="countryCode"
              value={form.countryCode}
              onChange={handleChange}
              type="text"
              placeholder="+91"
              list="country-codes"
              className="px-3 py-4 sm:py-6 border-2 border-black rounded-l-[25px] text-base font-bold bg-white text-black min-h-[40px] sm:min-h-[60px] transition-all duration-300 focus:border-green-600 focus:shadow-md outline-none w-1/3 sm:w-1/4"
            />
            <datalist id="country-codes">
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name} ({country.code})
                </option>
              ))}
            </datalist>

            <input
              name="phoneNumber"
              value={form.phoneNumber}
              onChange={handleChange}
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="Enter phone number"
              className="px-4 sm:px-5 py-4 sm:py-6 border-2 border-l-0 border-black rounded-r-[25px] text-base font-bold bg-white text-black placeholder:text-gray-400 min-h-[40px] sm:min-h-[60px] transition-all duration-300 focus:border-green-600 focus:shadow-md outline-none w-2/3 sm:w-3/4"
            />
          </div>
        </div>

        <div className="relative w-full flex flex-col sm:flex-row justify-center my-6 sm:my-10">
          <label className="absolute -top-0 left-20 sm:left-60 bg-white px-2 text-sm font-bold text-black z-20">
            Upload Logo
          </label>

          <div className="w-full sm:w-[65%] flex flex-col mt-8 sm:mt-0">
            {/* Image Preview */}
            {uploadedImage && (
              <div className="mb-4 flex justify-center">
                <div className="w-32 h-32 rounded-full border-4 border-green-600 overflow-hidden bg-gray-100">
                  <img
                    src={uploadedImage}
                    alt="Shop logo"
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}

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

        <div className="relative w-full flex flex-col sm:flex-row justify-center my-6 sm:my-10">
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

          <div className="flex flex-row items-center w-full sm:w-[65%] gap-0">
            <input
              name="whatsappCode"
              value={form.whatsappCode}
              onChange={handleChange}
              type="text"
              placeholder="+91"
              list="whatsapp-country-codes"
              className="px-3 py-4 sm:py-6 border-2 border-black rounded-l-[25px] text-base font-bold bg-white text-black min-h-[40px] sm:min-h-[60px] transition-all duration-300 focus:border-green-600 focus:shadow-md outline-none w-1/3 sm:w-1/4"
            />
            <datalist id="whatsapp-country-codes">
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name} ({country.code})
                </option>
              ))}
            </datalist>
            <input
              name="whatsappNumber"
              value={form.whatsappNumber}
              onChange={handleChange}
              type="number"
              placeholder="Enter WhatsApp number"
              className="w-2/3 sm:w-3/4 px-4 sm:px-5 py-4 sm:py-6 border-2 border-l-0 border-black rounded-r-[25px] text-base font-bold bg-white text-black placeholder:text-gray-400 min-h-[40px] sm:min-h-[60px] transition-all duration-300 focus:border-green-600 focus:shadow-md outline-none"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-6 sm:mt-20 mt-10">
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

      {/* Sub Users Section */}
      <div className="flex justify-center mt-10 px-4 sm:px-0">
        <div className="w-full max-w-2xl space-y-6">
          <h2 className="text-[20px] font-semibold text-[#007A3F] mb-3">
            {editingSubUser ? "Edit Sub User" : "Add New Sub User"}
          </h2>

          {isSubUser ? (
            <div className="rounded-xl p-5 text-gray-700 bg-gray-50 border">
              Sub-users cannot add or manage other sub-users.
            </div>
          ) : (
            <>
              <div className="border border-[#007A3F] rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Sub User Form fields */}
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Sub User Name
                  </label>
                  <input
                    type="text"
                    placeholder="user_xzy"
                    className="w-full mt-1 border rounded-xl p-3 outline-none"
                    value={subUserForm.subUsername}
                    onChange={(e) =>
                      setSubUserForm((s) => ({
                        ...s,
                        subUsername: e.target.value,
                      }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    placeholder="user@email.com"
                    className="w-full mt-1 border rounded-xl p-3 outline-none"
                    value={subUserForm.email}
                    onChange={(e) =>
                      setSubUserForm((s) => ({ ...s, email: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative mt-1">
                    <input
                      type={showSubPassword ? "text" : "password"}
                      placeholder="********"
                      className="w-full border rounded-xl p-3 pr-12 outline-none"
                      value={subUserForm.password}
                      onChange={(e) =>
                        setSubUserForm((s) => ({
                          ...s,
                          password: e.target.value,
                        }))
                      }
                    />
                    <button
                      type="button"
                      onClick={() => setShowSubPassword(!showSubPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
                    >
                      {showSubPassword ? (
                        <FaEyeSlash size={18} />
                      ) : (
                        <FaEye size={18} />
                      )}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    placeholder="2183103335"
                    className="w-full mt-1 border rounded-xl p-3 outline-none"
                    value={subUserForm.phoneNumber}
                    onChange={(e) =>
                      setSubUserForm((s) => ({
                        ...s,
                        phoneNumber: e.target.value.replace(/\D/g, ""),
                      }))
                    }
                  />
                </div>
              </div>

              <div className="text-center mt-3">
                <button
                  className="bg-[#007A3F] text-white font-medium py-3 px-10 rounded-full hover:bg-green-700 transition disabled:opacity-60"
                  onClick={
                    editingSubUser ? handleUpdateSubUser : handleAddSubUser
                  }
                  disabled={subLoading}
                >
                  {subLoading
                    ? "Saving..."
                    : editingSubUser
                    ? "Update Sub User"
                    : "Add Sub User"}
                </button>
                {editingSubUser && (
                  <button
                    onClick={() => {
                      setEditingSubUser(null);
                      setSubUserForm({
                        subUsername: "",
                        email: "",
                        password: "",
                        phoneNumber: "",
                      });
                    }}
                    className="ml-4 text-red-600 underline"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </>
          )}

          <h2 className="text-[20px] font-semibold text-[#007A3F] mb-4 mt-10">
            Existing Sub Users
          </h2>

          {subUsers.length === 0 ? (
            <p className="text-gray-600">No sub-users yet.</p>
          ) : (
            subUsers.map((s) => (
              <div key={s._id} className="border rounded-xl p-4 mb-4 shadow-sm">
                <div className="flex justify-between items-start">
                  <p className="font-semibold text-gray-900">
                    {s.subUsername || s.email}
                  </p>
                  <div className="flex gap-4">
                    {!isSubUser && (
                      <>
                        <MdEdit
                          onClick={() => handleEditSubUser(s)}
                          className="text-[22px] cursor-pointer text-[#007A3F] hover:text-green-700"
                        />
                        <RiDeleteBinLine
                          onClick={() => handleDeleteSubUser(s._id)}
                          className="text-[22px] cursor-pointer text-red-600 hover:text-red-700"
                        />
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-3">
                  <MdOutlineEmail className="text-[19px] text-[#007A3F]" />
                  <p className="text-gray-600 text-[15px]">{s.email}</p>
                </div>

                <div className="flex items-center gap-3 mt-1">
                  <LuPhone className="text-[19px] text-[#007A3F]" />
                  <p className="text-gray-600 text-[15px]">{s.phoneNumber}</p>
                </div>

                <div className="flex items-center gap-3 mt-1">
                  <CiCalendar className="text-[19px] text-[#007A3F]" />
                  <p className="text-gray-600 text-[15px]">
                    Created: {new Date(s.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
}
