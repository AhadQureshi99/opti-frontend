import { FaArrowLeft } from "react-icons/fa";
import { IoShield } from "react-icons/io5";
import { MdEmail } from "react-icons/md";
import { IoLogoWhatsapp } from "react-icons/io5";
import { FaBuilding } from "react-icons/fa6";
import { FaGlobe } from "react-icons/fa6";
import { RiFacebookCircleFill } from "react-icons/ri";
import { FaInstagram } from "react-icons/fa";
import { Link } from "react-router-dom";


export default function Privacypolicy() {
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
          Privacy Policy
        </h1>
      </div>
      <div className="flex justify-center">
        <div className="bg-white h-fullscreen w-[96%] px-10 rounded-[20px] pt-8 mb-15 pb-10">
          <div className="flex flex-col items-center mb-[40px] ">
            <h1 className="text-[#169D53] font-extrabold text-[50px]">
              OPTI SLIP
            </h1>
            <p className="text-[#6b7280] text-[16px]">
              Your Privacy Matters to Us
            </p>
          </div>

          <div className="bg-[#f0fdf4] my-[30px] p-[20px] rounded-[12px] border-l-[4px] border-l-[#169D53]">
            <p className="text-[#333] font-[15px]">
              <strong className="text-[#169D53] font-semibold">
                Last Updated :
              </strong>{" "}
              October 3, 2025
            </p>
            <p className="text-[#333] font-[15px]">
              <strong className="text-[#169D53] font-semibold">
                Effective Date :
              </strong>{" "}
              October 3, 2025
            </p>
          </div>

          <div className="leading-[1.8] mb-[20px]">
            <h1 className="text-[#169D53] font-bold text-[20px] pb-[10px] ">
              1. Introduction
            </h1>
            <p className="border-bottom-[2px] bg-[#169D53] h-[2px] w-full mb-[20px] "></p>
            <p className="text-[#333] text-[16px]  text-justify mb-4">
              Welcome to OPTI SLIP. We are committed to protecting your personal
              information and your right to privacy. This Privacy Policy
              explains how we collect, use, disclose, and safeguard your
              information when you use our optical shop management system.{" "}
            </p>
            <p className="text-[#333] text-[16px]  text-justify mb-4">
              By accessing or using our services, you agree to the terms of this
              Privacy Policy. If you do not agree with our policies and
              practices, please do not use our services.
            </p>
          </div>

          <div className="leading-[1.8] mb-[20px]">
            <h1 className="text-[#169D53] font-bold text-[20px] pb-[10px] ">
              2. Information We Collect
            </h1>
            <p className="border-bottom-[2px] bg-[#169D53] h-[2px] w-full mb-[20px] "></p>
            <p className="text-[#333] text-[16px] mb-[15px]">
              We collect several types of information from and about users of
              our services:
            </p>
            <p className="mb-[15px] text-justify">
              <strong className="text-[#169D53] font-bold">
                2.1 Personal Information
              </strong>
            </p>
            <ul className="list-disc pl-[30px] text-[#333] text-[16px] my-[15px]">
              <li className="mb-[10px] leading-[1.8] ">
                <strong className="text-[#169D53] font-bold">
                  Account Information :{" "}
                </strong>
                Name, email address, phone number, shop details
              </li>

              <li className="mb-[10px] leading-[1.8] ">
                <strong className="text-[#169D53] font-bold">
                  Patient Records :{" "}
                </strong>
                Patient names, contact information, prescription details, order
                information
              </li>

              <li className="mb-[10px] leading-[1.8] ">
                <strong className="text-[#169D53] font-bold">
                  Business Information :{" "}
                </strong>
                Shop name, address, WhatsApp number, social media handles,
                website
              </li>

              <li className="mb-[10px] leading-[1.8] ">
                <strong className="text-[#169D53] font-bold">
                  Payment Information :{" "}
                </strong>
                Transaction details, order amounts, payment history
              </li>
            </ul>

            <p className="mb-[15px] text-justify">
              <strong className="text-[#169D53] font-bold">
                2.2 Technical Information
              </strong>
            </p>
            <ul className="list-disc pl-[30px] text-[#333] text-[16px] my-[15px]">
              <li className="mb-[10px] leading-[1.8] ">
                IP address and browser type{" "}
              </li>
              <li className="mb-[10px] leading-[1.8] ">Device information</li>
              <li className="mb-[10px] leading-[1.8] ">
                Usage data and analytics{" "}
              </li>
              <li className="mb-[10px] leading-[1.8] ">
                Cookies and tracking technologies
              </li>
            </ul>
          </div>

          <div className="leading-[1.8] mb-[20px]">
            <h1 className="text-[#169D53] font-bold text-[20px] pb-[10px] ">
              3. How We Use Your Information
            </h1>
            <p className="border-bottom-[2px] bg-[#169D53] h-[2px] w-full mb-[20px] "></p>
            <p className="text-[#333] text-[16px] mb-[15px]">
              We use the information we collect for the following purposes:
            </p>
            <ul className="list-disc pl-[30px] text-[#333] text-[16px] my-[15px]">
              <li className="mb-[10px] leading-[1.8] ">
                <strong className="text-[#169D53] font-bold">
                  Service Provision :{" "}
                </strong>
                To provide and maintain our optical management services
              </li>

              <li className="mb-[10px] leading-[1.8] ">
                <strong className="text-[#169D53] font-bold">
                  Order Management :{" "}
                </strong>
                To process and track patient orders and prescriptions
              </li>

              <li className="mb-[10px] leading-[1.8] ">
                <strong className="text-[#169D53] font-bold">
                  Communication :{" "}
                </strong>
                To send you updates, notifications, and service-related
                announcements
              </li>

              <li className="mb-[10px] leading-[1.8] ">
                <strong className="text-[#169D53] font-bold">
                  Analytics :{" "}
                </strong>
                To analyze usage patterns and improve our services
              </li>

              <li className="mb-[10px] leading-[1.8] ">
                <strong className="text-[#169D53] font-bold">
                  Security :{" "}
                </strong>
                To protect against fraud, unauthorized access, and other
                security issues
              </li>

              <li className="mb-[10px] leading-[1.8] ">
                <strong className="text-[#169D53] font-bold">
                  Legal Compliance:{" "}
                </strong>
                To comply with applicable laws and regulations
              </li>
            </ul>
          </div>

          <div className="leading-[1.8] mb-[20px]">
            <h1 className="text-[#169D53] font-bold text-[20px] pb-[10px] ">
              4. Data Sharing and Disclosure
            </h1>
            <p className="border-bottom-[2px] bg-[#169D53] h-[2px] w-full mb-[20px] "></p>
            <p className="text-[#333] text-[16px] mb-[15px]">
              We do not sell your personal information. We may share your
              information only in the following circumstances:
            </p>
            <ul className="list-disc pl-[30px] text-[#333] text-[16px] my-[15px]">
              <li className="mb-[10px] leading-[1.8] ">
                <strong className="text-[#169D53] font-bold">
                  With Your Consent : 
                </strong> When you explicitly authorize us to share information
              </li>

              <li className="mb-[10px] leading-[1.8] ">
                <strong className="text-[#169D53] font-bold"> 
                  Service Providers :  
                </strong> 
                 With trusted third-party service providers who assist us in
                operating our platform
              </li>

              <li className="mb-[10px] leading-[1.8] ">
                <strong className="text-[#169D53] font-bold">
                  Legal Requirements : 
                </strong>
                When required by law, court order, or governmental authority
              </li>

              <li className="mb-[10px] leading-[1.8] ">
                <strong className="text-[#169D53] font-bold">
                  Business Transfers :  
                </strong>
                In connection with any merger, sale, or acquisition of our
                business
              </li>

              <li className="mb-[10px] leading-[1.8] ">
                <strong className="text-[#169D53] font-bold">
                  Protection of Rights : 
                </strong>
                To protect our rights, property, or safety, or that of our users
              </li>
            </ul>
          </div>

          <div className="leading-[1.8] mb-[20px]">
            <h1 className="text-[#169D53] font-bold text-[20px] pb-[10px] ">
              5. Data Security
            </h1>
            <p className="border-bottom-[2px] bg-[#169D53] h-[2px] w-full mb-[20px] "></p>
            <p className="text-[#333] text-[15px] mb-[15px]">
              We implement appropriate technical and organizational security
              measures to protect your personal information against unauthorized
              access,alteration, disclosure,or destruction.These measures
              include:
            </p>
            <ul className="list-disc pl-[30px] text-[#333] text-[16px] my-[15px]">
              <li className="mb-[10px] leading-[1.8] ">
                Encrypted data transmission (SSL/TLS)
              </li>

              <li className="mb-[10px] leading-[1.8] ">
                Secure password storage with encryption
              </li>

              <li className="mb-[10px] leading-[1.8] ">
                Regular security assessments and updates
              </li>

              <li className="mb-[10px] leading-[1.8] ">
                Limited access to personal information on a need-to-know basis
              </li>

              <li className="mb-[10px] leading-[1.8] ">
                Regular backups and disaster recovery procedures
              </li>
            </ul>
          </div>

          <div className="bg-[#f0fdf4] my-[30px] p-[20px] rounded-[12px] border-l-[4px] border-l-[#169D53] flex flex-row relative leading-[1.5]">
            <IoShield className="text-bold text-[16px] absolute bottom-12 " />
            <p className="text-[#333] font-[15px]">
              <strong className="text-[#169D53] font-semibold pl-6">
                Important :{" "}
              </strong>
              While we strive to protect your personal information, no method of
              transmission over the Internet or electronic storage is 100%
              secure. We cannot guarantee absolute security.
            </p>
          </div>

          <div className="leading-[1.8] mb-[20px]">
            <h1 className="text-[#169D53] font-bold text-[20px] pb-[10px] ">
              6. Data Retention
            </h1>
            <p className="border-bottom-[2px] bg-[#169D53] h-[2px] w-full mb-[20px] "></p>
            <p className="text-[#333] text-[15px] mb-4">
              We retain your personal information only for as long as necessary
              to fulfill the purposes outlined in this Privacy Policy, unless a
              longer retention period is required or permitted by law. Patient
              records and order information may be retained for extended periods
              to comply with medical record retention requirements and business
              purposes.
            </p>
          </div>

 <div className="leading-[1.8] mb-[20px]">
            <h1 className="text-[#169D53] font-bold text-[20px] pb-[10px] ">
              7. Your Privacy Rights
            </h1>
            <p className="border-bottom-[2px] bg-[#169D53] h-[2px] w-full mb-[20px] "></p>
            <p className="text-[#333] text-[16px] mb-[15px]">
              Depending on your location, you may have the following rights regarding your personal information:
            </p>
            <ul className="list-disc pl-[30px] text-[#333] text-[16px] my-[15px]">
              <li className="mb-[10px] leading-[1.8] ">
                <strong className="text-[#169D53] font-bold">
                 Access : 
                </strong> Right to request access to your personal information
              </li>

              <li className="mb-[10px] leading-[1.8] ">
                <strong className="text-[#169D53] font-bold">
                  Correction : 
                </strong>
                Right to request correction of inaccurate or incomplete information

              </li>

              <li className="mb-[10px] leading-[1.8] ">
                <strong className="text-[#169D53] font-bold">
                    Deletion : 
                </strong>
              Right to request deletion of your personal information
              </li>

              <li className="mb-[10px] leading-[1.8] ">
                <strong className="text-[#169D53] font-bold">
                  Data Portability : 
                </strong>
                
 Right to receive your data in a structured, commonly used format
              </li>

              <li className="mb-[10px] leading-[1.8] ">
                <strong className="text-[#169D53] font-bold">
                 Opt-Out :  
                </strong>
               Right to opt out of marketing communications
              </li>
              <li className="mb-[10px] leading-[1.8] ">
                <strong className="text-[#169D53] font-bold">
                 Withdraw Consent :   
                </strong>
Right to withdraw consent where processing is based on consent
              </li>
            </ul>
          </div>

 <div className="leading-[1.8] mb-[20px]">
            <h1 className="text-[#169D53] font-bold text-[20px] pb-[10px] ">
8. Cookies and Tracking Technologies
            </h1>
            <p className="border-bottom-[2px] bg-[#169D53] h-[2px] w-full mb-[20px] "></p>
            <p className="text-[#333] text-[15px] mb-4">
             We use cookies and similar tracking technologies to track activity on our service and store certain information. Cookies are files with small amounts of data that are stored on your device. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.
            </p>
          </div>

           <div className="leading-[1.8] mb-[20px]">
            <h1 className="text-[#169D53] font-bold text-[20px] pb-[10px] ">
              9. Third-Party Links
            </h1>
            <p className="border-bottom-[2px] bg-[#169D53] h-[2px] w-full mb-[20px] "></p>
            <p className="text-[#333] text-[15px] mb-4">
             Our service may contain links to third-party websites or services that are not owned or controlled by OPTI SLIP. We have no control over and assume no responsibility for the content, privacy policies, or practices of any third-party sites or services. We encourage you to review the privacy policy of every site you visit.
            </p>
          </div>


           <div className="leading-[1.8] mb-[20px]">
            <h1 className="text-[#169D53] font-bold text-[20px] pb-[10px] ">
              10. Children's Privacy
            </h1>
            <p className="border-bottom-[2px] bg-[#169D53] h-[2px] w-full mb-[20px] "></p>
            <p className="text-[#333] text-[15px] mb-4">
              Our services are not intended for individuals under the age of 18. We do not knowingly collect personal information from children under 18. If you become aware that a child has provided us with personal information, please contact us, and we will take steps to delete such information.
            </p>
          </div>


           <div className="leading-[1.8] mb-[20px]">
            <h1 className="text-[#169D53] font-bold text-[20px] pb-[10px] ">
              11. International Data Transfers
            </h1>
            <p className="border-bottom-[2px] bg-[#169D53] h-[2px] w-full mb-[20px] "></p>
            <p className="text-[#333] text-[15px] mb-4">
             Your information may be transferred to and maintained on computers located outside of your state, province, country, or other governmental jurisdiction where data protection laws may differ from those of your jurisdiction. By using our services, you consent to such transfers.
            </p>
          </div>


           <div className="leading-[1.8] mb-[20px]">
            <h1 className="text-[#169D53] font-bold text-[20px] pb-[10px] ">
              12. Changes to This Privacy Policy
            </h1>
            <p className="border-bottom-[2px] bg-[#169D53] h-[2px] w-full mb-[20px] "></p>
            <p className="text-[#333] text-[15px] mb-4">
             We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they are posted on this page.
            </p>
          </div>

           <div className="leading-[1.8] mb-[20px]">
            <h1 className="text-[#169D53] font-bold text-[20px] pb-[10px] ">
              13. Contact Us
            </h1>
            <p className="border-bottom-[2px] bg-[#169D53] h-[2px] w-full mb-[20px] "></p>
            <p className="text-[#333] text-[15px] mb-4">
              If you have any questions, concerns, or requests regarding this Privacy Policy or our privacy practices, please contact us:
            </p>
          </div>



<div className="bg-[#169D53] p-[25px] width-[full] rounded-[15px] border-2 border-[#e5e7eb] sm:leading-[2.5] leading-[2] mb-10">
    <div className="flex items-center space-x-2.5">
  <MdEmail className="text-white text-2xl w-[25px] " />
  <span className="text-white font-bold text-[18px]">Get in Touch</span>
</div>

<div className="flex items-center space-x-2.5 py-2">
  <FaBuilding className="text-white  w-[20px] " />
  <span className="text-white"></span>
</div>

<div className="flex items-center space-x-2.5">
  <MdEmail className="text-white text-xl w-[20px] " />
  <span className="text-white">Email:  privacy@optislip.com</span>
</div>

<div className="flex items-center space-x-2.5">
  <IoLogoWhatsapp className="text-white text-xl w-[20px] " />
  <span className="text-white">
WhatsApp: +1 218-310-3335</span>
</div>

<div className="flex items-center space-x-2.5">
  <FaGlobe className="text-white text-xl w-[20px] " />
  <span className="text-white">Website: optislip.com</span>
</div>

<div className="flex items-center space-x-2.5">
  <RiFacebookCircleFill className="text-white text-xl w-[20px] " />
  <span className="text-white ">Facebook: @optislip</span>
</div>

<div className="flex items-center space-x-2.5">
  <FaInstagram className="text-white text-xl w-[20px] " />
  <span className="text-white ">Instagram: @opti.slip</span>
</div>
</div>


<div className="bg-[#f0fdf4] my-[30px] p-[20px] rounded-[12px] border-l-[4px] border-l-[#169D53]">
            <p className="text-[#333] font-[15px] tracking-widest sm:tracking-normal">
              <strong className="text-[#169D53] font-semibold">
               Consent :
              </strong>{" "}
               By using OPTI SLIP, you acknowledge that you have read and understood this Privacy Policy and agree to its terms.
            </p>
          </div>


        </div>
      </div>
    </div>
  );
}
