import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import { RiArrowDropDownLine } from "react-icons/ri";

// Generate optic options: HIGHEST positive at top → down to 0.00 → negatives at bottom
function generateOpticList(maxPlus, maxMinus, step) {
  const arr = [];

  // Positive values: from +maxPlus down to +0.25 (highest at top)
  for (let v = maxPlus; v >= step; v -= step) {
    arr.push("+" + v.toFixed(2));
  }

  // Center: 0.00
  arr.push("0.00");

  // Negative values: from -0.25 down to -maxMinus
  for (let v = step; v <= maxMinus; v += step) {
    arr.push("-" + v.toFixed(2));
  }

  return arr;
}

// Instant-open Custom Dropdown
function CustomDropdown({ options, value, onChange, placeholder = "Select" }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const listRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // On open: center on "0.00", then scroll up slightly so low positives (+0.25 etc.) are visible above
  useEffect(() => {
    if (isOpen && listRef.current) {
      const zeroItem = listRef.current.querySelector('[data-value="0.00"]');
      if (zeroItem) {
        zeroItem.scrollIntoView({ block: "center" });

        // Adjust upward to show a few low positive values above 0.00
        setTimeout(() => {
          if (listRef.current) {
            const itemHeight = zeroItem.offsetHeight || 56; // approximate item height
            listRef.current.scrollTop -= itemHeight * 1.5; // tweak as needed
          }
        }, 0);
      }
    }
  }, [isOpen]);

  return (
    <div ref={dropdownRef} className="relative w-full mt-2">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full border border-gray-300 hover:border-green-600 rounded-lg px-5 py-4 text-base font-medium focus:outline-none focus:ring-2 focus:ring-green-600 transition-all text-left flex justify-between items-center bg-white"
      >
        <span className="text-black">{value || placeholder}</span>
        <RiArrowDropDownLine
          size={24}
          className={`text-gray-600 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          ref={listRef}
          className="absolute left-0 right-0 top-full mt-2 max-h-96 overflow-y-auto border border-gray-300 bg-white rounded-lg shadow-2xl z-50"
        >
          {options.map((option) => (
            <button
              key={option}
              type="button"
              data-value={option}
              onClick={() => {
                onChange({ target: { value: option } });
                setIsOpen(false);
              }}
              className={`w-full text-left px-6 py-3 text-base transition-colors ${
                value === option
                  ? "bg-green-600 text-white font-semibold"
                  : "hover:bg-green-50"
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

// Helper functions
function fmt(n) {
  const x = Number(n);
  if (isNaN(x)) return "0.00";
  return (x >= 0 ? "+" : "") + x.toFixed(2);
}

function transposeRx(sph, cyl, axis) {
  const newSph = Number(sph) + Number(cyl);
  const newCyl = -Number(cyl);
  let newAxis = Number(axis) <= 90 ? Number(axis) + 90 : Number(axis) - 90;
  if (newAxis > 180) newAxis -= 180;
  if (newAxis <= 0) newAxis += 180;
  return { sphere: newSph, cylinder: newCyl, axis: newAxis };
}

function calculateCrossNumbers(sph, cyl, axis) {
  const s = Number(sph) || 0;
  const c = Number(cyl) || 0;
  const a = Number(axis) || 0;
  const power1 = s;
  const power2 = s + c;
  let axis2 = (a + 90) % 180;
  if (axis2 === 0) axis2 = 180;
  return { power1, power2, axis1: a, axis2 };
}

function formatOpticalNumber(num) {
  const n = Number(num) || 0;
  if (Math.abs(n) < 1e-9) return "0.00";
  const formatted = Math.abs(n).toFixed(2);
  return n > 0 ? `+${formatted}` : `-${formatted}`;
}

export default function OpticCalculator() {
  const navigate = useNavigate();

  // Options - highest positive at top now
  const sphOptions = generateOpticList(24, 24, 0.25);
  const cylOptions = generateOpticList(6, 6, 0.25);
  const addOptions = [
    "Select",
    ...Array.from({ length: 12 }, (_, i) => "+" + ((i + 1) * 0.25).toFixed(2)),
  ];

  // State
  const [rs, setRs] = useState("0.00");
  const [rc, setRc] = useState("0.00");
  const [ra, setRa] = useState("");

  const [ls, setLs] = useState("0.00");
  const [lc, setLc] = useState("0.00");
  const [la, setLa] = useState("");

  const [add, setAdd] = useState("Select");

  const [rResults, setRResults] = useState(null);
  const [lResults, setLResults] = useState(null);

  const parseVal = (v) => {
    if (v === "Select" || !v) return 0;
    return Number(v);
  };

  const calculate = () => {
    const rS = parseVal(rs);
    const rC = parseVal(rc);
    const rA = ra ? Number(ra) : 0;

    const lS = parseVal(ls);
    const lC = parseVal(lc);
    const lA = la ? Number(la) : 0;

    const addPower = add === "Select" ? 0 : parseVal(add);

    // Right Eye
    const right = {
      distance: {
        sph: rS,
        cyl: rC,
        axis: rA,
        display: `Sph: ${formatOpticalNumber(rS)}  Cyl: ${formatOpticalNumber(rC)}  Axis: ${rA || "-"}°`,
      },
      cross: calculateCrossNumbers(rS, rC, rA),
    };

    if (rC !== 0) {
      const t = transposeRx(rS, rC, rA);
      right.transposed = {
        sphere: t.sphere,
        cylinder: t.cylinder,
        axis: t.axis,
        display: `Sph: ${formatOpticalNumber(t.sphere)}  Cyl: ${formatOpticalNumber(t.cylinder)}  Axis: ${t.axis}°`,
      };
    }

    if (addPower !== 0) {
      const nearSph = rS + addPower;
      right.near = {
        sph: nearSph,
        cyl: rC,
        axis: rA,
        display: `Sph: ${formatOpticalNumber(nearSph)}  Cyl: ${formatOpticalNumber(rC)}  Axis: ${rA || "-"}°`,
      };
      if (rC !== 0) {
        const tn = transposeRx(nearSph, rC, rA);
        right.nearTransposed = {
          sphere: tn.sphere,
          cylinder: tn.cylinder,
          axis: tn.axis,
          display: `Sph: ${formatOpticalNumber(tn.sphere)}  Cyl: ${formatOpticalNumber(tn.cylinder)}  Axis: ${tn.axis}°`,
        };
      }
    }

    // Left Eye
    const left = {
      distance: {
        sph: lS,
        cyl: lC,
        axis: lA,
        display: `Sph: ${formatOpticalNumber(lS)}  Cyl: ${formatOpticalNumber(lC)}  Axis: ${lA || "-"}°`,
      },
      cross: calculateCrossNumbers(lS, lC, lA),
    };

    if (lC !== 0) {
      const t = transposeRx(lS, lC, lA);
      left.transposed = {
        sphere: t.sphere,
        cylinder: t.cylinder,
        axis: t.axis,
        display: `Sph: ${formatOpticalNumber(t.sphere)}  Cyl: ${formatOpticalNumber(t.cylinder)}  Axis: ${t.axis}°`,
      };
    }

    if (addPower !== 0) {
      const nearSphL = lS + addPower;
      left.near = {
        sph: nearSphL,
        cyl: lC,
        axis: lA,
        display: `Sph: ${formatOpticalNumber(nearSphL)}  Cyl: ${formatOpticalNumber(lC)}  Axis: ${lA || "-"}°`,
      };
      if (lC !== 0) {
        const tn = transposeRx(nearSphL, lC, lA);
        left.nearTransposed = {
          sphere: tn.sphere,
          cylinder: tn.cylinder,
          axis: tn.axis,
          display: `Sph: ${formatOpticalNumber(tn.sphere)}  Cyl: ${formatOpticalNumber(tn.cylinder)}  Axis: ${tn.axis}°`,
        };
      }
    }

    setRResults(right);
    setLResults(left);
  };

  const reset = () => {
    setRs("0.00");
    setRc("0.00");
    setRa("");
    setLs("0.00");
    setLc("0.00");
    setLa("");
    setAdd("Select");
    setRResults(null);
    setLResults(null);
  };

  return (
    <div className="w-full min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-2xl p-8 md:p-12">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-3 text-green-700 hover:text-green-800 font-medium mb-6 transition-colors"
        >
          <FaArrowLeft className="text-xl" />
          Back
        </button>

        <h1 className="text-4xl font-bold text-center text-green-700 mb-4">
          Optical Distance & Near Calculator
        </h1>
        <p className="text-center text-gray-600 text-lg mb-12">
          Quick and accurate prescription transposition for Distance and Near Vision
        </p>

        {/* Input Section */}
        <div className="grid md:grid-cols-2 gap-12 mb-12">
          {/* Right Eye */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-center text-white bg-green-700 py-4 rounded-2xl">
              Right Eye (OD)
            </h2>

            <div>
              <label className="block text-lg font-semibold mb-2">Sph</label>
              <CustomDropdown
                options={sphOptions}
                value={rs}
                onChange={(e) => setRs(e.target.value)}
                placeholder="Select Sph"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold mb-2">Cyl</label>
              <CustomDropdown
                options={cylOptions}
                value={rc}
                onChange={(e) => setRc(e.target.value)}
                placeholder="Select Cyl"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold mb-2">Axis</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={ra}
                onChange={(e) => setRa(e.target.value.replace(/\D/g, "").slice(0, 3))}
                placeholder="1 - 180"
                className="w-full border-2 border-gray-300 rounded-xl px-6 py-4 text-base focus:border-green-600 focus:outline-none transition-all"
              />
            </div>
          </div>

          {/* Left Eye */}
          <div className="space-y-8">
            <h2 className="text-2xl font-bold text-center text-white bg-green-700 py-4 rounded-2xl">
              Left Eye (OS)
            </h2>

            <div>
              <label className="block text-lg font-semibold mb-2">Sph</label>
              <CustomDropdown
                options={sphOptions}
                value={ls}
                onChange={(e) => setLs(e.target.value)}
                placeholder="Select Sph"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold mb-2">Cyl</label>
              <CustomDropdown
                options={cylOptions}
                value={lc}
                onChange={(e) => setLc(e.target.value)}
                placeholder="Select Cyl"
              />
            </div>

            <div>
              <label className="block text-lg font-semibold mb-2">Axis</label>
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                value={la}
                onChange={(e) => setLa(e.target.value.replace(/\D/g, "").slice(0, 3))}
                placeholder="1 - 180"
                className="w-full border-2 border-gray-300 rounded-xl px-6 py-4 text-base focus:border-green-600 focus:outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* ADD */}
        <div className="max-w-md mx-auto mb-12">
          <h2 className="text-2xl font-bold text-center mb-4">Addition (ADD)</h2>
          <CustomDropdown
            options={addOptions}
            value={add}
            onChange={(e) => setAdd(e.target.value)}
            placeholder="Select ADD"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center gap-8 mb-16">
          <button
            onClick={calculate}
            className="bg-green-700 hover:bg-green-800 text-white font-bold text-xl px-16 py-5 rounded-2xl shadow-lg transition-all"
          >
            Transpose
          </button>
          <button
            onClick={reset}
            className="bg-gray-700 hover:bg-gray-800 text-white font-bold text-xl px-16 py-5 rounded-2xl shadow-lg transition-all"
          >
            Reset
          </button>
        </div>

        {/* Results */}
        {(rResults || lResults) && (
          <div className="grid md:grid-cols-2 gap-12">
            {/* Right Eye Results */}
            <div className="bg-green-50 rounded-2xl p-8 border border-green-200">
              <h3 className="text-2xl font-bold text-green-800 mb-6 text-center">
                Right Eye Results
              </h3>
              <div className="space-y-4 text-lg">
                <p><strong>Distance:</strong> {rResults.distance.display}</p>
                {rResults.transposed && (
                  <p className="text-blue-700 font-medium">
                    <strong>Transposed:</strong> {rResults.transposed.display}
                  </p>
                )}
                <div className="mt-4 bg-white rounded-xl p-4 font-mono text-base">
                  <small className="block text-gray-600 mb-1">Cross Cylinder:</small>
                  {formatOpticalNumber(rResults.cross.power1)} @ {rResults.cross.axis1}°<br/>
                  {formatOpticalNumber(rResults.cross.power2)} @ {rResults.cross.axis2}°
                </div>
                {rResults.near && (
                  <>
                    <p className="mt-4"><strong>Near:</strong> {rResults.near.display}</p>
                    {rResults.nearTransposed && (
                      <p className="text-blue-700 font-medium">
                        <strong>Near Transposed:</strong> {rResults.nearTransposed.display}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Left Eye Results */}
            <div className="bg-green-50 rounded-2xl p-8 border border-green-200">
              <h3 className="text-2xl font-bold text-green-800 mb-6 text-center">
                Left Eye Results
              </h3>
              <div className="space-y-4 text-lg">
                <p><strong>Distance:</strong> {lResults.distance.display}</p>
                {lResults.transposed && (
                  <p className="text-blue-700 font-medium">
                    <strong>Transposed:</strong> {lResults.transposed.display}
                  </p>
                )}
                <div className="mt-4 bg-white rounded-xl p-4 font-mono text-base">
                  <small className="block text-gray-600 mb-1">Cross Cylinder:</small>
                  {formatOpticalNumber(lResults.cross.power1)} @ {lResults.cross.axis1}°<br/>
                  {formatOpticalNumber(lResults.cross.power2)} @ {lResults.cross.axis2}°
                </div>
                {lResults.near && (
                  <>
                    <p className="mt-4"><strong>Near:</strong> {lResults.near.display}</p>
                    {lResults.nearTransposed && (
                      <p className="text-blue-700 font-medium">
                        <strong>Near Transposed:</strong> {lResults.nearTransposed.display}
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {!rResults && !lResults && (
          <p className="text-center text-gray-500 text-lg mt-10">
            Enter prescription values and click "Transpose" to see results.
          </p>
        )}
      </div>
    </div>
  );
}