import { useState, useEffect } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { Link } from "react-router-dom";
import { CiCalendar } from "react-icons/ci";
import { LuPhone } from "react-icons/lu";
import { MdOutlineEmail } from "react-icons/md";
import { RiDeleteBinLine } from "react-icons/ri";
import { MdEdit } from "react-icons/md";
import { useToast } from "../components/ToastProvider";
import { get, put, post, getAuthHeaders } from "../utils/api";
import { useNavigate } from "react-router-dom";
import CustomDropdown from "../components/CustomDropdown";

export default function Mynewshop() {
  const toast = useToast();

  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [subLoading, setSubLoading] = useState(false);

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

  const [subUsers, setSubUsers] = useState([]);
  const navigate = useNavigate();
  const isSubUser =
    typeof window !== "undefined" &&
    localStorage.getItem("isSubUser") === "true";

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(URL.createObjectURL(file));
      // upload immediately
      uploadImage(file);
    }
  };

  useEffect(() => {
    let mounted = true;
    // load profile (use cached profile when offline)
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
          // image path from backend is like 'uploads/..'
          const base = (
            import.meta.env.VITE_API_BASE || "https://api.optislip.com"
          ).replace(/\/api\/?$/, "");
          setImage(base + "/" + u.image.replace(/^\//, ""));
        }
      })
      .catch((err) => {
        // silently ignore; user may not be logged in
      });

    // load sub-users
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
      if (!res.ok) {
        const text = await res.text();
        throw text;
      }
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
      // after saving, go to homepage so it refreshes profile shown there
      navigate("/home-page");
    } catch (err) {
      const msg = (err && err.body && err.body.message) || "Save failed";
      if (err && err.status === 401) {
        toast.addToast("Please log in before saving your shop", {
          type: "error",
        });
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
      // append to list
      setSubUsers((s) => [...s, data.subUser]);
      setSubUserForm({
        subUsername: "",
        email: "",
        password: "",
        phoneNumber: "",
      });
    } catch (err) {
      const msg = (err && err.body && err.body.message) || "Add failed";
      toast.addToast(msg, { type: "error" });
    } finally {
      setSubLoading(false);
    }
  }

  return (
    <div className="w-full bg-white h-full pb-20">
      <div className="relative flex items-center justify-center px-4 sm:px-10 pt-10">
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

      <div className="flex justify-center mt-4 px-4 sm:px-0">
        <label
          htmlFor={isSubUser ? undefined : "fileInput"}
          className={`w-36 h-36 rounded-full border-[3px] border-green-600 flex justify-center items-center bg-[#2D2D2D] text-white ${
            isSubUser ? "cursor-not-allowed opacity-70" : "cursor-pointer"
          } overflow-hidden`}
          title={
            isSubUser ? "Sub-users cannot change shop image" : "Upload image"
          }
        >
          {image ? (
            <img
              src={image}
              alt="preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-center text-[#FFFFFF] underline ">
              {isSubUser ? (
                "Image (read-only)"
              ) : (
                <>
                  Upload <br /> Image
                </>
              )}
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
            <label className="text-sm font-medium text-gray-700">
              Shop Name
            </label>
            <input
              type="text"
              placeholder="eg. Opti Slip"
              className="w-full mt-1 border rounded-xl p-4 outline-none text-[15px]"
              value={form.shopName}
              onChange={(e) =>
                setForm((s) => ({ ...s, shopName: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Address</label>
            <textarea
              rows={2}
              placeholder="eg. Civic Center, Mountain View, CA, United States, California"
              className="w-full mt-1 border rounded-xl p-4 outline-none text-[15px]"
              value={form.address}
              onChange={(e) =>
                setForm((s) => ({ ...s, address: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <div className="flex mt-1 gap-2 items-center">
              <div className="w-20">
                <CustomDropdown
                  options={["+1", "+92", "+91"]}
                  value={form.countryCode}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, countryCode: e.target.value }))
                  }
                  name="countryCode"
                  placeholder="+1"
                />
              </div>

              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="2183103335"
                className="flex-1 border rounded-xl p-4 outline-none text-[15px]"
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
            <label className="text-sm font-medium text-gray-700">
              Whatsapp Number
            </label>
            <div className="flex mt-1 gap-2 items-center">
              <div className="w-20">
                <CustomDropdown
                  options={["+1", "+92", "+91"]}
                  value={form.whatsappCode}
                  onChange={(e) =>
                    setForm((s) => ({ ...s, whatsappCode: e.target.value }))
                  }
                  name="whatsappCode"
                  placeholder="+1"
                />
              </div>

              <input
                type="tel"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="2183103335"
                className="flex-1 border rounded-xl p-4 outline-none text-[15px]"
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
            <label className="text-sm font-medium text-gray-700">
              User Name
            </label>
            <input
              type="text"
              placeholder="eg. opti_slip"
              className="w-full mt-1 border rounded-xl p-4 outline-none text-[15px]"
              value={form.username}
              onChange={(e) =>
                setForm((s) => ({ ...s, username: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              type="password"
              placeholder="********"
              className="w-full mt-1 border rounded-xl p-4 outline-none text-[15px]"
              value={form.password}
              onChange={(e) =>
                setForm((s) => ({ ...s, password: e.target.value }))
              }
            />
          </div>

          <div className="text-center pt-4">
            <button
              className={`bg-[#007A3F] text-white font-medium py-3 px-12 rounded-full hover:bg-green-700 transition disabled:opacity-60 ${
                isSubUser ? "opacity-70 cursor-not-allowed" : ""
              }`}
              onClick={
                isSubUser
                  ? (e) => {
                      e.preventDefault();
                    }
                  : handleSave
              }
              disabled={loading || isSubUser}
              title={
                isSubUser
                  ? "Sub-users cannot modify shop profile"
                  : "Save Changes"
              }
            >
              {isSubUser ? "View Only" : loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
      <div className="flex justify-center mt-10 px-4 sm:px-0">
        <div className="w-full max-w-2xl space-y-6">
          <h2 className="text-[20px] font-semibold text-[#007A3F] mb-3">
            Add New Sub User
          </h2>
          {isSubUser ? (
            <div className="rounded-xl p-5 text-gray-700 bg-gray-50 border">
              Sub-users cannot add or manage other sub-users.
            </div>
          ) : (
            <>
              <div className="border border-[#007A3F] rounded-xl p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <input
                    type="password"
                    placeholder="********"
                    className="w-full mt-1 border rounded-xl p-3 outline-none"
                    value={subUserForm.password}
                    onChange={(e) =>
                      setSubUserForm((s) => ({
                        ...s,
                        password: e.target.value,
                      }))
                    }
                  />
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
                  className={`bg-[#007A3F] text-white font-medium py-3 px-10 rounded-full hover:bg-green-700 transition disabled:opacity-60`}
                  onClick={handleAddSubUser}
                  disabled={subLoading}
                  title="Add Sub User"
                >
                  {subLoading ? "Adding..." : "Add Sub User"}
                </button>
              </div>
            </>
          )}
          <h2 className="text-[20px] font-semibold text-[#007A3F] mb-4">
            Existing Sub Users
          </h2>

          {subUsers.length === 0 ? (
            <p className="text-gray-600">No sub-users yet.</p>
          ) : (
            subUsers.map((s) => (
              <div key={s._id} className="border rounded-xl p-4 mb-4 shadow-sm">
                <div className="flex justify-between">
                  <p className="font-semibold text-gray-900">
                    {s.subUsername || s.email}
                  </p>
                  <div className="flex gap-4">
                    {!isSubUser && (
                      <>
                        <MdEdit
                          className="text-[22px] cursor-pointer"
                          style={{ color: "#007A3F" }}
                        />
                        <RiDeleteBinLine
                          className="text-[22px] cursor-pointer"
                          style={{ color: "#FF0000" }}
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
                    Created:{" "}
                    {new Date(
                      s.createdAt || s._id.getTimestamp?.()
                    ).toLocaleDateString()}
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
