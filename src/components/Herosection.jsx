import React from "react";
import { FaWhatsapp, FaFacebookF, FaInstagram, FaGlobe } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";

export default function Herosection({ profile }) {
  const p = profile || {};
  const base = (
    import.meta.env.VITE_API_BASE || "https://api.optislip.com"
  ).replace(/\/api\/?$/, "");

  const imageSrc = p.image
    ? p.image.startsWith("http")
      ? p.image
      : base + "/" + p.image.replace(/^\//, "")
    : "/Optislipimage.png";

  const displayName = p.shopName || p.username || p.email || "OPTI SLIP";
  const displayAddress =
    p.address || "Civic Center, Mountain View, CA, United States, California";

  return (
    <div className="pt-10 mx-3">
      {/* -------------------- MOBILE VIEW (NEW UI) -------------------- */}
      <div className="sm:hidden">
        {/* GREEN BACKGROUND CARD */}
        <div className="bg-[#169D53] rounded-[20px] p-5 pb-8">
          {/* TOP SECTION */}
          <div className="flex items-start gap-4">
            <div className="bg-white rounded-[15px] w-[70px] h-[70px] overflow-hidden flex items-center justify-center flex-shrink-0">
              <img
                src={imageSrc}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="text-white">
              <h2 className="font-bold text-[20px]">{displayName}</h2>

              <div className="flex items-start mt-1 text-[14px] leading-tight">
                <FaLocationDot className="mt-0.5 mr-2 text-white text-[20px] flex-shrink-0" />
                <span>{displayAddress}</span>
              </div>
            </div>
          </div>

          {/* WHITE CONTACT BOX */}
          <div className="bg-white rounded-[20px] mt-6 p-4 grid grid-cols-2 gap-3">
            {/* WhatsApp */}
            <div className="flex items-center gap-2 min-w-0">
              <FaWhatsapp className="text-[#25D366] text-[20px] flex-shrink-0" />
              <span className="font-semibold text-[12px] sm:text-[14px] truncate">
                {p.whatsappNumber || p.phoneNumber || "+1234567890"}
              </span>
            </div>

            {/* Facebook */}
            <div className="flex items-center gap-2 min-w-0">
              <FaFacebookF className="text-[#1877F2] text-[18px] flex-shrink-0" />
              <span className="font-semibold text-[12px] sm:text-[14px] truncate">
                {p.facebookId || "optislip"}
              </span>
            </div>

            {/* Instagram */}
            <div className="flex items-center gap-2 min-w-0">
              <FaInstagram className="text-[#E4405F] text-[20px] flex-shrink-0" />
              <span className="font-semibold text-[12px] sm:text-[14px] truncate">
                {p.instagramId || "opti.slip"}
              </span>
            </div>

            {/* Website */}
            <div className="flex items-center gap-2 min-w-0">
              <FaGlobe className="text-[#6c757d] text-[18px] flex-shrink-0" />
              <span className="font-semibold text-[12px] sm:text-[14px] truncate">
                {p.website || "optislip.com"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* -------------------- DESKTOP VIEW (ORIGINAL UI) -------------------- */}
      <div className="hidden sm:block">
        <div className="p-[30px] border-4 border-[#169D53] rounded-[15px] bg-white">
          {/* Top Profile Section */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-[20px] mb-[20px]">
            <div className="flex-shrink-0 bg-[#169D53] rounded-full w-[120px] h-[120px] flex items-center justify-center overflow-hidden">
              <img
                src={imageSrc}
                alt={displayName}
                className="w-28 h-28 object-cover"
              />
            </div>

            <div className="flex-grow">
              <h2 className="font-bold text-[22px] mt-6 mb-1 text-[#333]">
                {displayName}
              </h2>

              <div className="flex items-center text-[#666] text-[15px]">
                <FaLocationDot className="h-4 w-4 mr-1 text-[#169D53]" />
                {`Address: ${displayAddress}`}
              </div>
            </div>
          </div>

          {/* Social Media Grid (Desktop Original) */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-[20px] mt-[30px] mb-[10px]">
            {/* WhatsApp */}
            <div className="flex flex-col items-center lg:flex-row lg:items-center lg:space-x-3 px-3 py-1">
              <div className="bg-[#25D366] rounded-full p-3 text-white mb-2 lg:mb-0">
                <FaWhatsapp size={22} />
              </div>
              <span className="font-semibold text-[#333] text-[16px] md:text-[17px] text-center lg:text-left leading-snug">
                {p.whatsappNumber || p.phoneNumber || "+92 300 1234567"}
              </span>
            </div>

            {/* Facebook */}
            <div className="flex flex-col items-center lg:flex-row lg:items-center lg:space-x-3 px-5 py-1">
              <div className="bg-[#1877f2] rounded-full p-3 text-white mb-2 lg:mb-0">
                <FaFacebookF size={22} />
              </div>
              <span className="font-semibold text-[#333] text-[16px] md:text-[17px] text-center lg:text-left leading-snug">
                {p.facebookId || "your shop"}
              </span>
            </div>

            {/* Instagram */}
            <div className="flex flex-col items-center lg:flex-row lg:items-center lg:space-x-3 px-3 py-1">
              <div className="bg-[#E4405F] rounded-full p-3 text-white mb-2 lg:mb-0">
                <FaInstagram size={22} />
              </div>
              <span className="font-semibold text-[#333] text-[16px] md:text-[17px] text-center lg:text-left leading-snug">
                {p.instagramId || "your shop"}
              </span>
            </div>

            {/* Website */}
            <div className="flex flex-col items-center lg:flex-row lg:items-center lg:space-x-3 px-3 py-1">
              <div className="bg-[#6c757d] rounded-full p-3 text-white mb-2 lg:mb-0">
                <FaGlobe size={22} />
              </div>
              <span className="font-semibold text-[#333] text-[16px] md:text-[17px] text-center lg:text-left leading-snug break-all">
                {p.website || "https://yourshop.com"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
