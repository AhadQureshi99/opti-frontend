import { useState, useEffect } from "react";
import { FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import { Link } from "react-router-dom";
import { CiCalendar } from "react-icons/ci";
import { LuPhone } from "react-icons/lu";
import { MdOutlineEmail } from "react-icons/md";
import { RiDeleteBinLine } from "react-icons/ri";
import { MdEdit } from "react-icons/md";
import { useToast } from "../components/ToastProvider";
import { get, put, post, del, getAuthHeaders } from "../utils/api"; // assuming you have a 'del' method
import { useNavigate } from "react-router-dom";
import CustomDropdown from "../components/CustomDropdown";

export default function Mynewshop() {
  const toast = useToast();

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [subLoading, setSubLoading] = useState(false);
  const [subUsers, setSubUsers] = useState([]);
  const [editingSubUser, setEditingSubUser] = useState(null); // for edit mode

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

  const navigate = useNavigate();
  const isSubUser =
    typeof window !== "undefined" &&
    localStorage.getItem("isSubUser") === "true";

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      uploadImage(file);
    }
  };

  useEffect(() => {
    let mounted = true;
    get("/api/user/profile", { cacheKey: "profile" })
      .then((data) => {
        if (!mounted) return;
        const u = data && data.user ? data.user : data;
        setForm((f) => ({
          ...f,
          shopName: u.shopName || "",
          address: u.address || "",
          phoneNumber: u.phoneNumber || "",
          whatsappNumber: u.whatsappNumber || "",
          username: u.username || u.email || "",
        }));
        if (u.image) {
          const base = (
            import.meta.env.VITE_API_BASE || "https://api.optislip.com"
          ).replace(/\/api\/?$/, "");
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

    return () => {
      mounted = false;
    };
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

  async function handleSave(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const body = {
        shopName: form.shopName,
        address: form.address,
        phoneNumber: form.phoneNumber,
        whatsappNumber: form.whatsappNumber,
        username: form.username,
      };
      await put("/api/user/profile", body, { cacheKey: "profile" });
      toast.addToast("Profile saved", { type: "success" });
      navigate("/home-page");
    } catch (err) {
      const msg = (err?.body?.message) || "Save failed";
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
      password: "", // leave blank for security
      phoneNumber: subUser.phoneNumber || "",
    });
  }

  async function handleUpdateSubUser(e) {
    e.preventDefault();
    if (!editingSubUser) return;
    setSubLoading(true);
    try {
      const body = { ...subUserForm };
      if (!body.password) delete body.password; // don't send empty password
      const data = await put(`/api/user/sub-users/${editingSubUser._id}`, body);
      toast.addToast(data.message || "Sub-user updated", { type: "success" });
      setSubUsers((s) =>
        s.map((u) => (u._id === editingSubUser._id ? data.subUser : u))
      );
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

      <div className="flex justify-center mt-10 px-4 sm:px-0">
        <div className="w-full max-w-2xl space-y-6">
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

          <div>
            <label className="text-sm font-medium text-gray-700">Phone Number</label>
            <div className="flex mt-1 gap-2 items-center">
              <CustomDropdown
                options={["+1", "+92", "+91"]}
                value={form.countryCode}
                onChange={(e) => setForm((s) => ({ ...s, countryCode: e.target.value }))}
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

          <div>
            <label className="text-sm font-medium text-gray-700">Whatsapp Number</label>
            <div className="flex mt-1 gap-2 items-center">
              <CustomDropdown
                options={["+1", "+92", "+91"]}
                value={form.whatsappCode}
                onChange={(e) => setForm((s) => ({ ...s, whatsappCode: e.target.value }))}
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
                <div>
                  <label className="text-sm font-medium text-gray-700">Sub User Name</label>
                  <input
                    type="text"
                    placeholder="user_xzy"
                    className="w-full mt-1 border rounded-xl p-3 outline-none"
                    value={subUserForm.subUsername}
                    onChange={(e) =>
                      setSubUserForm((s) => ({ ...s, subUsername: e.target.value }))
                    }
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
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
                  <label className="text-sm font-medium text-gray-700">Password</label>
                  <div className="relative mt-1">
                    <input
                      type={showSubPassword ? "text" : "password"}
                      placeholder="********"
                      className="w-full border rounded-xl p-3 pr-12 outline-none"
                      value={subUserForm.password}
                      onChange={(e) =>
                        setSubUserForm((s) => ({ ...s, password: e.target.value }))
                      }
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