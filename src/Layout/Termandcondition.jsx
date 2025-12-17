import { FaArrowLeft } from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { FaPhone } from "react-icons/fa6";
import { FaLocationDot } from "react-icons/fa6";
import { FaGlobe } from "react-icons/fa6";
import { Link } from "react-router-dom";

export default function Termandcondition() {
  return (
    <div className="bg-[#169D53] w-full h-fullscreen pt-6">
      <div className="flex items-start pb-10">
        <Link to="/home-page"
          className="
          flex items-center space-x-2
          bg-[#10b981]
          border-2 border-white
          text-white
          px-3 py-2
          ml-7
          rounded-lg
          font-semibold
          transition-transform transition-colors duration-300
          hover:bg-white
          hover:text-[#169D53]
          hover:-translate-y-1
          hover:shadow-lg
        "
        >
          <FaArrowLeft />
          <span>Back</span>
        </Link>

        <h1 className="text-white font-bold text-[25px] pl-5">
          Terms & Conditions
        </h1>
      </div>
      <div className="flex justify-center">
        <div className="bg-white h-fullscreen w-[96%] px-10 rounded-[20px] pt-8 mb-10">
          <div className="flex flex-col items-center mb-[40px] ">
            <h1 className="text-[#169D53] font-extrabold text-[50px]">
              OPTI SLIP
            </h1>
            <p className="text-[#6b7280] text-[16px]">
              Terms and Conditions of Service
            </p>
          </div>
          <div className="leading-[1.8] mb-[20px]">
            <h1 className="text-[#1f2937] font-bold text-[20px] pb-[10px] ">
              1. Acceptance of Terms
            </h1>
            <p className="border-bottom-[2px] bg-[#169D53] h-[2px] w-full mb-[20px] "></p>
            <p className="text-[#374151] text-[16px] ">
              By accessing and using the OPTI SLIP service, you accept and agree
              to be bound by the terms and provision of this agreement. If you
              do not agree to abide by the above, please do not use this
              service.
            </p>
          </div>

          <div className="leading-[1.8] mb-[20px]">
            <h1 className="text-[#1f2937] font-bold text-[20px] pb-[10px] ">
              2. Description of Service
            </h1>
            <p className="border-bottom-[2px] bg-[#169D53] h-[2px] w-full mb-[20px] "></p>
            <p className="text-[#374151] text-[16px] ">
              OPTI SLIP provides an online platform for eye clinic management,
              including but not limited to:
            </p>
            <ul className="list-disc pl-5 text-[#374151] text-[16px] my-[15px]">
              <li className="mb-[8px]">
                Patient order management and tracking
              </li>
              <li className="mb-[8px]">
                Prescription calculation and recording
              </li>
              <li className="mb-[8px]">Sales analytics and reporting</li>
              <li className="mb-[8px]">Shop information management</li>
              <li className="mb-[8px]">Order slip generation and printing</li>
            </ul>
          </div>

          <div className="leading-[1.8] mb-[20px]">
            <h1 className="text-[#1f2937] font-bold text-[20px] pb-[10px] ">
              3. User Responsibilities
            </h1>
            <p className="border-bottom-[2px] bg-[#169D53] h-[2px] w-full mb-[20px] "></p>
            <p className="text-[#374151] text-[16px] ">
              As a user of OPTI SLIP, you agree to:
            </p>
            <ul className="list-disc pl-5 text-[#374151] text-[16px] my-[15px]">
              <li className="mb-[8px]">
                Provide accurate and complete information
              </li>
              <li className="mb-[8px]">
                Maintain the confidentiality of your account credentials
              </li>
              <li className="mb-[8px]">
                Use the service only for lawful purposes
              </li>
              <li className="mb-[8px]">
                Not attempt to gain unauthorized access to the system
              </li>
              <li className="mb-[8px]">
                Respect patient privacy and data protection laws
              </li>
            </ul>
          </div>

          <div className="leading-[1.8] mb-[20px]">
            <h1 className="text-[#1f2937] font-bold text-[20px] pb-[10px] ">
              4. Data Protection and Privacy
            </h1>
            <p className="border-bottom-[2px] bg-[#169D53] h-[2px] w-full mb-[20px] "></p>
            <p className="text-[#374151] text-[16px] ">
              We are committed to protecting your privacy and personal
              information. All data collected is used solely for the purpose of
              providing our services and is not shared with third parties
              without your explicit consent.
            </p>
          </div>

          <div className="bg-[#f0f9ff] my-[30px] p-[20px] rounded-[12px] border-l-[4px] border-l-[#169D53]">
            <p className="text-[#1e40af] font-semibold mb-[15px]">
              <strong>Important : </strong>
              You are responsible for ensuring compliance with local data
              protection laws when handling patient information through our
              platform.{" "}
            </p>
          </div>

          <div className="leading-[1.8] mb-[20px]">
            <h1 className="text-[#1f2937] font-bold text-[20px] pb-[10px] ">
              5. Service Availability
            </h1>
            <p className="border-bottom-[2px] bg-[#169D53] h-[2px] w-full mb-[20px] "></p>
            <p className="text-[#374151] text-[16px] ">
              We strive to maintain high service availability, but we do not
              guarantee uninterrupted access. The service may be temporarily
              unavailable due to maintenance, updates, or technical issues.
            </p>
          </div>

          <div className="leading-[1.8] mb-[20px]">
            <h1 className="text-[#1f2937] font-bold text-[20px] pb-[10px] ">
              6. Limitation of Liability
            </h1>
            <p className="border-bottom-[2px] bg-[#169D53] h-[2px] w-full mb-[20px] "></p>
            <p className="text-[#374151] text-[16px] ">
              OPTI SLIP shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages, including without
              limitation, loss of profits, data, use, goodwill, or other
              intangible losses, resulting from your use of the service.
            </p>
          </div>

           <div className="leading-[1.8] mb-[20px]">
            <h1 className="text-[#1f2937] font-bold text-[20px] pb-[10px] ">
            7. Modifications to Terms
            </h1>
            <p className="border-bottom-[2px] bg-[#169D53] h-[2px] w-full mb-[20px] "></p>
            <p className="text-[#374151] text-[16px] ">
             We reserve the right to modify these terms at any time. Users will be notified of significant changes, and continued use of the service constitutes acceptance of the modified terms.
            </p>
          </div>

           <div className="leading-[1.8] mb-[30px]">
            <h1 className="text-[#1f2937] font-bold text-[20px] pb-[10px] ">
            8. Termination
            </h1>
            <p className="border-bottom-[2px] bg-[#169D53] h-[2px] w-full mb-[20px] "></p>
            <p className="text-[#374151] text-[16px] ">
             Either party may terminate this agreement at any time. Upon termination, your access to the service will be discontinued, and you are responsible for backing up any data you wish to retain.
            </p>
          </div>

<div className="bg-[#f8fafc] sm:p-[30px] p-[20px] rounded-[15px] border-2 border-[#e5e7eb] sm:leading-[2.5] leading-[2] mb-10">
<h3 className="text-[#169D53] font-medium text-[calc(1.3rem+0.6vw)]">Contact Information</h3>

<div className="flex items-center space-x-2.5">
  <MdEmail className="text-[#169D53] text-xl w-[20px] " />
  <span className="text-[#374151]">Email: support@optislip.com</span>
</div>

<div className="flex items-center space-x-2.5">
  <FaPhone className="text-[#169D53] text-xl w-[20px] " />
  <span className="text-[#374151]">
Phone: +12183103335</span>
</div>

<div className="flex items-center space-x-2.5">
  <FaLocationDot className="text-[#169D53] text-xl w-[20px] " />
  <span className="text-[#374151]">Address: 123 Healthcare St, Medical City, MC 12345</span>
</div>

<div className="flex items-center space-x-2.5">
  <FaGlobe className="text-[#169D53] text-xl w-[20px] " />
  <span className="text-[#374151] ">Website: www.optislip.com</span>
</div>


</div>

        </div>
      </div>
    </div>
  );
}
