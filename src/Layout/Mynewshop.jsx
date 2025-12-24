import { useState, useEffect } from "react";
import { FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";
import { CiCalendar } from "react-icons/ci";
import { LuPhone } from "react-icons/lu";
import { MdOutlineEmail } from "react-icons/md";
import { RiDeleteBinLine } from "react-icons/ri";
import { MdEdit } from "react-icons/md";
import { useToast } from "../components/ToastProvider";
import { get, put, post, del, getAuthHeaders } from "../utils/api";
import { useNavigate } from "react-router-dom";
import CustomDropdown from "../components/CustomDropdown";

// Complete list of country codes with flags
const countryCodes = [
  { code: "+1", flag: "🇺🇸", name: "United States" },
  { code: "+7", flag: "🇷🇺", name: "Russia" },
  { code: "+20", flag: "🇪🇬", name: "Egypt" },
  { code: "+27", flag: "🇿🇦", name: "South Africa" },
  { code: "+30", flag: "🇬🇷", name: "Greece" },
  { code: "+31", flag: "🇳🇱", name: "Netherlands" },
  { code: "+32", flag: "🇧🇪", name: "Belgium" },
  { code: "+33", flag: "🇫🇷", name: "France" },
  { code: "+34", flag: "🇪🇸", name: "Spain" },
  { code: "+36", flag: "🇭🇺", name: "Hungary" },
  { code: "+39", flag: "🇮🇹", name: "Italy" },
  { code: "+40", flag: "🇷🇴", name: "Romania" },
  { code: "+41", flag: "🇨🇭", name: "Switzerland" },
  { code: "+43", flag: "🇦🇹", name: "Austria" },
  { code: "+44", flag: "🇬🇧", name: "United Kingdom" },
  { code: "+45", flag: "🇩🇰", name: "Denmark" },
  { code: "+46", flag: "🇸🇪", name: "Sweden" },
  { code: "+47", flag: "🇳🇴", name: "Norway" },
  { code: "+48", flag: "🇵🇱", name: "Poland" },
  { code: "+49", flag: "🇩🇪", name: "Germany" },
  { code: "+51", flag: "🇵🇪", name: "Peru" },
  { code: "+52", flag: "🇲🇽", name: "Mexico" },
  { code: "+53", flag: "🇨🇺", name: "Cuba" },
  { code: "+54", flag: "🇦🇷", name: "Argentina" },
  { code: "+55", flag: "🇧🇷", name: "Brazil" },
  { code: "+60", flag: "🇲🇾", name: "Malaysia" },
  { code: "+61", flag: "🇦🇺", name: "Australia" },
  { code: "+62", flag: "🇮🇩", name: "Indonesia" },
  { code: "+63", flag: "🇵🇭", name: "Philippines" },
  { code: "+64", flag: "🇳🇿", name: "New Zealand" },
  { code: "+65", flag: "🇸🇬", name: "Singapore" },
  { code: "+66", flag: "🇹🇭", name: "Thailand" },
  { code: "+81", flag: "🇯🇵", name: "Japan" },
  { code: "+82", flag: "🇰🇷", name: "South Korea" },
  { code: "+84", flag: "🇻🇳", name: "Vietnam" },
  { code: "+86", flag: "🇨🇳", name: "China" },
  { code: "+90", flag: "🇹🇷", name: "Turkey" },
  { code: "+91", flag: "🇮🇳", name: "India" },
  { code: "+92", flag: "🇵🇰", name: "Pakistan" },
  { code: "+93", flag: "🇦🇫", name: "Afghanistan" },
  { code: "+94", flag: "🇱🇰", name: "Sri Lanka" },
  { code: "+95", flag: "🇲🇲", name: "Myanmar" },
  { code: "+98", flag: "🇮🇷", name: "Iran" },
  { code: "+211", flag: "🇸🇸", name: "South Sudan" },
  { code: "+212", flag: "🇲🇦", name: "Morocco" },
  { code: "+213", flag: "🇩🇿", name: "Algeria" },
  { code: "+216", flag: "🇹🇳", name: "Tunisia" },
  { code: "+218", flag: "🇱🇾", name: "Libya" },
  { code: "+220", flag: "🇬🇲", name: "Gambia" },
  { code: "+221", flag: "🇸🇳", name: "Senegal" },
  { code: "+222", flag: "🇲🇷", name: "Mauritania" },
  { code: "+223", flag: "🇲🇱", name: "Mali" },
  { code: "+224", flag: "🇬🇳", name: "Guinea" },
  { code: "+225", flag: "🇨🇮", name: "Ivory Coast" },
  { code: "+226", flag: "🇧🇫", name: "Burkina Faso" },
  { code: "+227", flag: "🇳🇪", name: "Niger" },
  { code: "+228", flag: "🇹🇬", name: "Togo" },
  { code: "+229", flag: "🇧🇯", name: "Benin" },
  { code: "+230", flag: "🇲🇺", name: "Mauritius" },
  { code: "+231", flag: "🇱🇷", name: "Liberia" },
  { code: "+232", flag: "🇸🇱", name: "Sierra Leone" },
  { code: "+233", flag: "🇬🇭", name: "Ghana" },
  { code: "+234", flag: "🇳🇬", name: "Nigeria" },
  { code: "+235", flag: "🇹🇩", name: "Chad" },
  { code: "+236", flag: "🇨🇫", name: "Central African Republic" },
  { code: "+237", flag: "🇨🇲", name: "Cameroon" },
  { code: "+238", flag: "🇨🇻", name: "Cape Verde" },
  { code: "+239", flag: "🇸🇹", name: "Sao Tome and Principe" },
  { code: "+240", flag: "🇬🇶", name: "Equatorial Guinea" },
  { code: "+241", flag: "🇬🇦", name: "Gabon" },
  { code: "+242", flag: "🇨🇬", name: "Congo" },
  { code: "+243", flag: "🇨🇩", name: "DR Congo" },
  { code: "+244", flag: "🇦🇴", name: "Angola" },
  { code: "+245", flag: "🇬🇼", name: "Guinea-Bissau" },
  { code: "+246", flag: "🇮🇴", name: "British Indian Ocean Territory" },
  { code: "+248", flag: "🇸🇨", name: "Seychelles" },
  { code: "+249", flag: "🇸🇩", name: "Sudan" },
  { code: "+250", flag: "🇷🇼", name: "Rwanda" },
  { code: "+251", flag: "🇪🇹", name: "Ethiopia" },
  { code: "+252", flag: "🇸🇴", name: "Somalia" },
  { code: "+253", flag: "🇩🇯", name: "Djibouti" },
  { code: "+254", flag: "🇰🇪", name: "Kenya" },
  { code: "+255", flag: "🇹🇿", name: "Tanzania" },
  { code: "+256", flag: "🇺🇬", name: "Uganda" },
  { code: "+257", flag: "🇧🇮", name: "Burundi" },
  { code: "+258", flag: "🇲🇿", name: "Mozambique" },
  { code: "+260", flag: "🇿🇲", name: "Zambia" },
  { code: "+261", flag: "🇲🇬", name: "Madagascar" },
  { code: "+262", flag: "🇷🇪", name: "Reunion" },
  { code: "+263", flag: "🇿🇼", name: "Zimbabwe" },
  { code: "+264", flag: "🇳🇦", name: "Namibia" },
  { code: "+265", flag: "🇲🇼", name: "Malawi" },
  { code: "+266", flag: "🇱🇸", name: "Lesotho" },
  { code: "+267", flag: "🇧🇼", name: "Botswana" },
  { code: "+268", flag: "🇸🇿", name: "Eswatini" },
  { code: "+269", flag: "🇰🇲", name: "Comoros" },
  { code: "+290", flag: "🇸🇭", name: "Saint Helena" },
  { code: "+291", flag: "🇪🇷", name: "Eritrea" },
  { code: "+297", flag: "🇦🇼", name: "Aruba" },
  { code: "+298", flag: "🇫🇴", name: "Faroe Islands" },
  { code: "+299", flag: "🇬🇱", name: "Greenland" },
  { code: "+350", flag: "🇬🇮", name: "Gibraltar" },
  { code: "+351", flag: "🇵🇹", name: "Portugal" },
  { code: "+352", flag: "🇱🇺", name: "Luxembourg" },
  { code: "+353", flag: "🇮🇪", name: "Ireland" },
  { code: "+354", flag: "🇮🇸", name: "Iceland" },
  { code: "+355", flag: "🇦🇱", name: "Albania" },
  { code: "+356", flag: "🇲🇹", name: "Malta" },
  { code: "+357", flag: "🇨🇾", name: "Cyprus" },
  { code: "+358", flag: "🇫🇮", name: "Finland" },
  { code: "+359", flag: "🇧🇬", name: "Bulgaria" },
  { code: "+370", flag: "🇱🇹", name: "Lithuania" },
  { code: "+371", flag: "🇱🇻", name: "Latvia" },
  { code: "+372", flag: "🇪🇪", name: "Estonia" },
  { code: "+373", flag: "🇲🇩", name: "Moldova" },
  { code: "+374", flag: "🇦🇲", name: "Armenia" },
  { code: "+375", flag: "🇧🇾", name: "Belarus" },
  { code: "+376", flag: "🇦🇩", name: "Andorra" },
  { code: "+377", flag: "🇲🇨", name: "Monaco" },
  { code: "+378", flag: "🇸🇲", name: "San Marino" },
  { code: "+379", flag: "🇻🇦", name: "Vatican City" },
  { code: "+380", flag: "🇺🇦", name: "Ukraine" },
  { code: "+381", flag: "🇷🇸", name: "Serbia" },
  { code: "+382", flag: "🇲🇪", name: "Montenegro" },
  { code: "+383", flag: "🇽🇰", name: "Kosovo" },
  { code: "+385", flag: "🇭🇷", name: "Croatia" },
  { code: "+386", flag: "🇸🇮", name: "Slovenia" },
  { code: "+387", flag: "🇧🇦", name: "Bosnia and Herzegovina" },
  { code: "+389", flag: "🇲🇰", name: "North Macedonia" },
  { code: "+420", flag: "🇨🇿", name: "Czech Republic" },
  { code: "+421", flag: "🇸🇰", name: "Slovakia" },
  { code: "+423", flag: "🇱🇮", name: "Liechtenstein" },
  { code: "+500", flag: "🇫🇰", name: "Falkland Islands" },
  { code: "+501", flag: "🇧🇿", name: "Belize" },
  { code: "+502", flag: "🇬🇹", name: "Guatemala" },
  { code: "+503", flag: "🇸🇻", name: "El Salvador" },
  { code: "+504", flag: "🇭🇳", name: "Honduras" },
  { code: "+505", flag: "🇳🇮", name: "Nicaragua" },
  { code: "+506", flag: "🇨🇷", name: "Costa Rica" },
  { code: "+507", flag: "🇵🇦", name: "Panama" },
  { code: "+508", flag: "🇵🇲", name: "Saint Pierre and Miquelon" },
  { code: "+509", flag: "🇭🇹", name: "Haiti" },
  { code: "+590", flag: "🇬🇵", name: "Guadeloupe" },
  { code: "+591", flag: "🇧🇴", name: "Bolivia" },
  { code: "+592", flag: "🇬🇾", name: "Guyana" },
  { code: "+593", flag: "🇪🇨", name: "Ecuador" },
  { code: "+594", flag: "🇬🇫", name: "French Guiana" },
  { code: "+595", flag: "🇵🇾", name: "Paraguay" },
  { code: "+596", flag: "🇲🇶", name: "Martinique" },
  { code: "+597", flag: "🇸🇷", name: "Suriname" },
  { code: "+598", flag: "🇺🇾", name: "Uruguay" },
  { code: "+599", flag: "🇨🇼", name: "Curaçao" },
  { code: "+670", flag: "🇹🇱", name: "Timor-Leste" },
  { code: "+672", flag: "🇨🇽", name: "Christmas Island" },
  { code: "+673", flag: "🇧🇳", name: "Brunei" },
  { code: "+674", flag: "🇳🇷", name: "Nauru" },
  { code: "+675", flag: "🇵🇬", name: "Papua New Guinea" },
  { code: "+676", flag: "🇹🇴", name: "Tonga" },
  { code: "+677", flag: "🇸🇧", name: "Solomon Islands" },
  { code: "+678", flag: "🇻🇺", name: "Vanuatu" },
  { code: "+679", flag: "🇫🇯", name: "Fiji" },
  { code: "+680", flag: "🇵🇼", name: "Palau" },
  { code: "+681", flag: "🇼🇫", name: "Wallis and Futuna" },
  { code: "+682", flag: "🇨🇰", name: "Cook Islands" },
  { code: "+683", flag: "🇹🇰", name: "Tokelau" },
  { code: "+685", flag: "🇼🇸", name: "Samoa" },
  { code: "+686", flag: "🇰🇮", name: "Kiribati" },
  { code: "+687", flag: "🇳🇨", name: "New Caledonia" },
  { code: "+688", flag: "🇹🇻", name: "Tuvalu" },
  { code: "+689", flag: "🇵🇫", name: "French Polynesia" },
  { code: "+690", flag: "🇹🇰", name: "Tokelau" },
  { code: "+691", flag: "🇫🇲", name: "Micronesia" },
  { code: "+692", flag: "🇲🇭", name: "Marshall Islands" },
  { code: "+850", flag: "🇰🇵", name: "North Korea" },
  { code: "+852", flag: "🇭🇰", name: "Hong Kong" },
  { code: "+853", flag: "🇲🇴", name: "Macao" },
  { code: "+855", flag: "🇰🇭", name: "Cambodia" },
  { code: "+856", flag: "🇱🇦", name: "Laos" },
  { code: "+960", flag: "🇲🇻", name: "Maldives" },
  { code: "+961", flag: "🇱🇧", name: "Lebanon" },
  { code: "+962", flag: "🇯🇴", name: "Jordan" },
  { code: "+963", flag: "🇸🇾", name: "Syria" },
  { code: "+964", flag: "🇮🇶", name: "Iraq" },
  { code: "+965", flag: "🇰🇼", name: "Kuwait" },
  { code: "+966", flag: "🇸🇦", name: "Saudi Arabia" },
  { code: "+967", flag: "🇾🇪", name: "Yemen" },
  { code: "+968", flag: "🇴🇲", name: "Oman" },
  { code: "+970", flag: "🇵🇸", name: "Palestine" },
  { code: "+971", flag: "🇦🇪", name: "United Arab Emirates" },
  { code: "+972", flag: "🇮🇱", name: "Israel" },
  { code: "+973", flag: "🇧🇭", name: "Bahrain" },
  { code: "+974", flag: "🇶🇦", name: "Qatar" },
  { code: "+975", flag: "🇧🇹", name: "Bhutan" },
  { code: "+976", flag: "🇲🇳", name: "Mongolia" },
  { code: "+977", flag: "🇳🇵", name: "Nepal" },
  { code: "+992", flag: "🇹🇯", name: "Tajikistan" },
  { code: "+993", flag: "🇹🇲", name: "Turkmenistan" },
  { code: "+994", flag: "🇦🇿", name: "Azerbaijan" },
  { code: "+995", flag: "🇬🇪", name: "Georgia" },
  { code: "+996", flag: "🇰🇬", name: "Kyrgyzstan" },
  { code: "+998", flag: "🇺🇿", name: "Uzbekistan" },
  { code: "+1242", flag: "🇧🇸", name: "Bahamas" },
  { code: "+1246", flag: "🇧🇧", name: "Barbados" },
  { code: "+1264", flag: "🇻🇬", name: "British Virgin Islands" },
  { code: "+1268", flag: "🇦🇬", name: "Antigua and Barbuda" },
  { code: "+1284", flag: "🇻🇬", name: "British Virgin Islands" },
  { code: "+1340", flag: "🇻🇮", name: "U.S. Virgin Islands" },
  { code: "+1345", flag: "🇰🇾", name: "Cayman Islands" },
  { code: "+1441", flag: "🇧🇲", name: "Bermuda" },
  { code: "+1473", flag: "🇬🇩", name: "Grenada" },
  { code: "+1649", flag: "🇹🇨", name: "Turks and Caicos Islands" },
  { code: "+1664", flag: "🇲🇸", name: "Montserrat" },
  { code: "+1670", flag: "🇲🇵", name: "Northern Mariana Islands" },
  { code: "+1671", flag: "🇬🇺", name: "Guam" },
  { code: "+1758", flag: "🇱🇨", name: "Saint Lucia" },
  { code: "+1767", flag: "🇩🇲", name: "Dominica" },
  { code: "+1780", flag: "🇨🇦", name: "Canada" },
  { code: "+1784", flag: "🇻🇨", name: "Saint Vincent and the Grenadines" },
  { code: "+1809", flag: "🇩🇴", name: "Dominican Republic" },
  { code: "+1868", flag: "🇹🇹", name: "Trinidad and Tobago" },
  { code: "+1869", flag: "🇰🇳", name: "Saint Kitts and Nevis" },
  { code: "+1876", flag: "🇯🇲", name: "Jamaica" },
  { code: "+1939", flag: "🇵🇷", name: "Puerto Rico" },
  { code: "+1954", flag: "🇺🇸", name: "United States" },
  // Add more if needed...
];

export default function Mynewshop() {
  const toast = useToast();
  const navigate = useNavigate();
  const isSubUser = localStorage.getItem("isSubUser") === "true";

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [subUsers, setSubUsers] = useState([]);
  const [editingSubUser, setEditingSubUser] = useState(null);

  const [showMainPassword, setShowMainPassword] = useState(false);
  const [showSubPassword, setShowSubPassword] = useState(false);

  const [form, setForm] = useState({
    shopName: "",
    address: "",
    countryCode: "+1",
    phoneNumber: "",
    whatsappCode: "+1",
    whatsappNumber: "",
    username: "",
    password: "",
  });

  const [subUserForm, setSubUserForm] = useState({
    subUsername: "",
    email: "",
    password: "",
    phoneNumber: "",
  });

  useEffect(() => {
    let mounted = true;

    get("/api/user/profile", { cacheKey: "profile" })
      .then((data) => {
        if (!mounted) return;
        const u = data?.user || data;
        setForm((f) => ({
          ...f,
          shopName: u.shopName || "",
          address: u.address || "",
          countryCode: u.countryCode || "+1",
          phoneNumber: u.phoneNumber || "",
          whatsappCode: u.whatsappCode || "+1",
          whatsappNumber: u.whatsappNumber || "",
          username: u.username || u.email || "",
        }));
        if (u.image) {
          const base = import.meta.env.VITE_API_BASE?.replace(/\/api\/?$/, "") || "https://api.optislip.com";
          setImage(base + "/" + u.image.replace(/^\//, ""));
        }
      })
      .catch(() => {});

    get("/api/user/sub-users")
      .then((data) => {
        if (!mounted) return;
        setSubUsers(data.subUsers || []);
      })
      .catch(() => {});

    return () => { mounted = false; };
  }, []);

  async function uploadImage(file) {
    try {
      const BASE = import.meta.env.VITE_API_BASE || "https://api.optislip.com";
      const fd = new FormData();
      fd.append("image", file);
      const headers = getAuthHeaders();
      const res = await fetch(BASE + "/api/user/upload-image", {
        method: "POST",
        headers: { ...headers },
        body: fd,
      });
      if (!res.ok) throw await res.text();
      const data = await res.json();
      toast.addToast(data.message || "Image uploaded", { type: "success" });
    } catch (e) {
      toast.addToast("Image upload failed", { type: "error" });
    }
  }

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      uploadImage(file);
    }
  };

  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const body = {
        shopName: form.shopName,
        address: form.address,
        countryCode: form.countryCode,
        phoneNumber: form.phoneNumber,
        whatsappCode: form.whatsappCode,
        whatsappNumber: form.whatsappNumber,
        username: form.username,
      };
      await put("/api/user/profile", body, { cacheKey: "profile" });
      toast.addToast("Profile saved", { type: "success" });
      navigate("/home-page");
    } catch (err) {
      const msg = err?.body?.message || "Save failed";
      if (err?.status === 401) {
        toast.addToast("Please log in before saving", { type: "error" });
        navigate("/login");
      } else {
        toast.addToast(msg, { type: "error" });
      }
    } finally {
      setLoading(false);
    }
  }

  // Sub-user handlers remain the same
  async function handleAddSubUser(e) {
    e.preventDefault();
    setSubLoading(true);
    try {
      const body = { ...subUserForm };
      const data = await post("/api/user/sub-users", body);
      toast.addToast(data.message || "Sub-user added", { type: "success" });
      setSubUsers((s) => [...s, data.subUser]);
      setSubUserForm({ subUsername: "", email: "", password: "", phoneNumber: "" });
    } catch (err) {
      toast.addToast(err?.body?.message || "Add failed", { type: "error" });
    } finally {
      setSubLoading(false);
    }
  }

  async function handleEditSubUser(subUser) {
    setEditingSubUser(subUser);
    setSubUserForm({
      subUsername: subUser.subUsername || "",
      email: subUser.email || "",
      password: "",
      phoneNumber: subUser.phoneNumber || "",
    });
  }

  async function handleUpdateSubUser(e) {
    e.preventDefault();
    if (!editingSubUser) return;
    setSubLoading(true);
    try {
      const body = { ...subUserForm };
      if (!body.password) delete body.password;
      const data = await put(`/api/user/sub-users/${editingSubUser._id}`, body);
      toast.addToast(data.message || "Sub-user updated", { type: "success" });
      setSubUsers((s) => s.map((u) => (u._id === editingSubUser._id ? data.subUser : u)));
      setEditingSubUser(null);
      setSubUserForm({ subUsername: "", email: "", password: "", phoneNumber: "" });
    } catch (err) {
      toast.addToast(err?.body?.message || "Update failed", { type: "error" });
    } finally {
      setSubLoading(false);
    }
  }

  async function handleDeleteSubUser(id) {
    if (!window.confirm("Are you sure you want to delete this sub-user?")) return;
    try {
      await del(`/api/user/sub-users/${id}`);
      toast.addToast("Sub-user deleted", { type: "success" });
      setSubUsers((s) => s.filter((u) => u._id !== id));
    } catch (err) {
      toast.addToast(err?.body?.message || "Delete failed", { type: "error" });
    }
  }

  return (
    <div className="w-full bg-white h-full pb-20">
      {/* Header */}
      <div className="relative flex items-center justify-center px-4 sm:px-10 pt-10">
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

      {/* Profile Image */}
      <div className="flex justify-center mt-4 px-4 sm:px-0">
        <label
          htmlFor={isSubUser ? undefined : "fileInput"}
          className={`w-36 h-36 rounded-full border-[3px] border-green-600 flex justify-center items-center bg-[#2D2D2D] text-white ${
            isSubUser ? "cursor-not-allowed opacity-70" : "cursor-pointer"
          } overflow-hidden`}
          title={isSubUser ? "Sub-users cannot change shop image" : "Upload image"}
        >
          {image ? (
            <img src={image} alt="preview" className="w-full h-full object-cover" />
          ) : (
            <span className="text-center text-[#FFFFFF] underline">
              {isSubUser ? "Image (read-only)" : <>Upload <br /> Image</>}
            </span>
          )}
        </label>
        <input
          type="file"
          id="fileInput"
          className="hidden"
          onChange={handleImage}
          disabled={isSubUser}
        />
      </div>

      {/* Main Form */}
      <div className="flex justify-center mt-10 px-4 sm:px-0">
        <div className="w-full max-w-2xl space-y-6">
          {/* Shop Name */}
          <div>
            <label className="text-sm font-medium text-gray-700">Shop Name</label>
            <input
              type="text"
              placeholder="eg. Opti Slip"
              className="w-full mt-1 border rounded-xl p-4 outline-none text-[15px]"
              value={form.shopName}
              onChange={(e) => setForm((s) => ({ ...s, shopName: e.target.value }))}
            />
          </div>

          {/* Address */}
          <div>
            <label className="text-sm font-medium text-gray-700">Address</label>
            <textarea
              rows={2}
              placeholder="eg. Civic Center, Mountain View, CA, United States, California"
              className="w-full mt-1 border rounded-xl p-4 outline-none text-[15px]"
              value={form.address}
              onChange={(e) => setForm((s) => ({ ...s, address: e.target.value }))}
            />
          </div>

          {/* Phone Number */}
          <div>
            <label className="text-sm font-medium text-gray-700">Phone Number</label>
            <div className="flex mt-1 gap-2 items-center">
              <CustomDropdown
                options={countryCodes.map((c) => `${c.flag} ${c.code} ${c.name}`)}
                value={countryCodes.find((c) => c.code === form.countryCode)?.flag + " " + form.countryCode || "+1"}
                onChange={(e) => {
                  const selected = countryCodes.find((c) => `${c.flag} ${c.code} ${c.name}` === e.target.value);
                  setForm((s) => ({ ...s, countryCode: selected?.code || "+1" }));
                }}
                name="countryCode"
                placeholder="+1"
              />
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="2183103335"
                className="w-full border rounded-xl p-4 outline-none text-[15px]"
                value={form.phoneNumber}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    phoneNumber: e.target.value.replace(/\D/g, ""),
                  }))
                }
              />
            </div>
          </div>

          {/* WhatsApp Number */}
          <div>
            <label className="text-sm font-medium text-gray-700">WhatsApp Number</label>
            <div className="flex mt-1 gap-2 items-center">
              <CustomDropdown
                options={countryCodes.map((c) => `${c.flag} ${c.code} ${c.name}`)}
                value={countryCodes.find((c) => c.code === form.whatsappCode)?.flag + " " + form.whatsappCode || "+1"}
                onChange={(e) => {
                  const selected = countryCodes.find((c) => `${c.flag} ${c.code} ${c.name}` === e.target.value);
                  setForm((s) => ({ ...s, whatsappCode: selected?.code || "+1" }));
                }}
                name="whatsappCode"
                placeholder="+1"
              />
              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="2183103335"
                className="w-full border rounded-xl p-4 outline-none text-[15px]"
                value={form.whatsappNumber}
                onChange={(e) =>
                  setForm((s) => ({
                    ...s,
                    whatsappNumber: e.target.value.replace(/\D/g, ""),
                  }))
                }
              />
            </div>
          </div>

          {/* Username */}
          <div>
            <label className="text-sm font-medium text-gray-700">User Name</label>
            <input
              type="text"
              placeholder="eg. opti_slip"
              className="w-full mt-1 border rounded-xl p-4 outline-none text-[15px]"
              value={form.username}
              onChange={(e) => setForm((s) => ({ ...s, username: e.target.value }))}
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-medium text-gray-700">Password</label>
            <div className="relative mt-1">
              <input
                type={showMainPassword ? "text" : "password"}
                placeholder="********"
                className="w-full border rounded-xl p-4 pr-12 outline-none text-[15px]"
                value={form.password}
                onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
              />
              <button
                type="button"
                onClick={() => setShowMainPassword(!showMainPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
              >
                {showMainPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
              </button>
            </div>
          </div>

          {/* Save Button */}
          <div className="text-center pt-4">
            <button
              className={`bg-[#007A3F] text-white font-medium py-3 px-12 rounded-full hover:bg-green-700 transition disabled:opacity-60 ${
                isSubUser ? "opacity-70 cursor-not-allowed" : ""
              }`}
              onClick={isSubUser ? (e) => e.preventDefault() : handleSave}
              disabled={loading || isSubUser}
              title={isSubUser ? "Sub-users cannot modify shop profile" : "Save Changes"}
            >
              {isSubUser ? "View Only" : loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
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
                  <label className="text-sm font-medium text-gray-700">Sub User Name</label>
                  <input
                    type="text"
                    placeholder="user_xzy"
                    className="w-full mt-1 border rounded-xl p-3 outline-none"
                    value={subUserForm.subUsername}
                    onChange={(e) => setSubUserForm((s) => ({ ...s, subUsername: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    placeholder="user@email.com"
                    className="w-full mt-1 border rounded-xl p-3 outline-none"
                    value={subUserForm.email}
                    onChange={(e) => setSubUserForm((s) => ({ ...s, email: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <div className="relative mt-1">
                    <input
                      type={showSubPassword ? "text" : "password"}
                      placeholder="********"
                      className="w-full border rounded-xl p-3 pr-12 outline-none"
                      value={subUserForm.password}
                      onChange={(e) => setSubUserForm((s) => ({ ...s, password: e.target.value }))}
                    />
                    <button
                      type="button"
                      onClick={() => setShowSubPassword(!showSubPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-800"
                    >
                      {showSubPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Phone Number</label>
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
                  onClick={editingSubUser ? handleUpdateSubUser : handleAddSubUser}
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
                      setSubUserForm({ subUsername: "", email: "", password: "", phoneNumber: "" });
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
    </div>
  );
}