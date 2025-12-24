import { useState, useRef, useEffect } from "react";
import { RiArrowDropDownLine } from "react-icons/ri";

export default function CustomDropdown({
  options = [],
  value = "",
  onChange = () => {},
  name = "",
  placeholder = "Select",
  isScrollable = false,
  className = "",
}) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll to selected value when dropdown opens
  useEffect(() => {
    if (isOpen && isScrollable && scrollContainerRef.current) {
      setTimeout(() => {
        const selectedElement = scrollContainerRef.current?.querySelector(
          "[data-selected='true']"
        );
        if (selectedElement) {
          selectedElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 0);
    }
  }, [isOpen, isScrollable]);

  const handleSelect = (option) => {
    onChange({ target: { name, value: option } });
    setIsOpen(false);
  };

  const handleScroll = (e) => {
    if (!isScrollable) return;

    const container = scrollContainerRef.current;
    if (!container) return;

    // Get all value buttons
    const buttons = Array.from(container.querySelectorAll("[data-value]"));
    if (buttons.length === 0) return;

    const scrollTop = container.scrollTop;
    const containerHeight = container.clientHeight;
    const centerY = scrollTop + containerHeight / 2;

    let closestButton = buttons[0];
    let closestDistance = Math.abs(
      closestButton.offsetTop + closestButton.offsetHeight / 2 - centerY
    );

    for (let btn of buttons) {
      const distance = Math.abs(btn.offsetTop + btn.offsetHeight / 2 - centerY);
      if (distance < closestDistance) {
        closestDistance = distance;
        closestButton = btn;
      }
    }

    const option = closestButton.getAttribute("data-value");
    if (option && option !== value) {
      onChange({ target: { name, value: option } });
    }
  };

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full border-2 border-gray-400 rounded-[25px] text-black py-4 sm:py-5 px-4 sm:px-5 text-base bg-white cursor-pointer flex items-center justify-between transition-all duration-300 hover:border-green-600 focus:border-green-600 focus:shadow-md ${className}`}
      >
        <span className="flex-1 text-left">{value || placeholder}</span>
        <RiArrowDropDownLine
          size={24}
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className={`absolute top-full mt-1 w-1/2 bg-white border-2 border-gray-400 rounded-[15px] shadow-lg z-50 ${
            isScrollable
              ? "max-h-60 overflow-y-scroll snap-y snap-mandatory"
              : "max-h-60 overflow-y-auto"
          }`}
        >
          {options.map((option, idx) => (
            <button
              key={idx}
              type="button"
              data-value={option}
              data-selected={value === option}
              onClick={() => handleSelect(option)}
              className={`w-full px-4 py-3 text-left text-base transition-all snap-center ${
                value === option
                  ? "bg-[#007A3F] text-white font-bold"
                  : "hover:bg-gray-100 text-black"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
