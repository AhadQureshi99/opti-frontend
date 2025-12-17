import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import CustomDropdown from "../components/CustomDropdown";

// REAL OpticTool-style generator: 0.00 in center
function generateOpticList(maxPlus, maxMinus, step) {
  const arr = [];

  // negative values ↑↑↑ scrolling up
  for (let v = maxMinus; v >= step; v -= step) {
    arr.push("-" + v.toFixed(2));
  }

  // center value
  arr.push("0.00");

  // positive values ↓↓↓ scrolling down
  for (let v = step; v <= maxPlus; v += step) {
    arr.push("+" + v.toFixed(2));
  }

  return arr;
}

// Formatter
function fmt(n) {
  const x = Number(n);
  if (isNaN(x)) return "0.00";
  return (x >= 0 ? "+" : "") + x.toFixed(2);
}

// Transpose (minus <-> plus cylinder)
function transposeRx(sph, cyl, axis) {
  const newSph = Number(sph) + Number(cyl);
  const newCyl = -Number(cyl);
  let newAxis = Number(axis) <= 90 ? Number(axis) + 90 : Number(axis) - 90;
  if (newAxis > 180) newAxis -= 180;
  if (newAxis <= 0) newAxis += 180;
  return { sphere: newSph, cylinder: newCyl, axis: newAxis };
}

// Calculate cross numbers (principal meridians)
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

function formatAxis(axis) {
  if (!axis && axis !== 0) return "";
  return String(axis).padStart(3, "0") + "°";
}

export default function OpticCalculator() {
  const navigate = useNavigate();

  // Options
  const sphOptions = ["Select", ...generateOpticList(24, 24, 0.25)];
  const cylOptions = ["Select", ...generateOpticList(6, 6, 0.25)];
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

  // Results (store objects for richer displays)
  const [rResults, setRResults] = useState(null);
  const [lResults, setLResults] = useState(null);

  const parseVal = (v) => {
    if (v === "Select" || v === "") return 0;
    return Number(v);
  };

  const calculate = () => {
    const rS = parseVal(rs);
    const rC = parseVal(rc);
    const rA = ra ? Number(ra) : "";

    const lS = parseVal(ls);
    const lC = parseVal(lc);
    const lA = la ? Number(la) : "";

    const addPower = add === "Select" ? 0 : Number(add);
    // Build Right eye results
    const right = {};
    right.distance = {
      sph: rS,
      cyl: rC,
      axis: rA || 0,
      display: `Sph: ${formatOpticalNumber(rS)}, Cyl: ${formatOpticalNumber(
        rC
      )}, Axis: ${rA || ""}`,
    };

    if (rC !== 0) {
      const t = transposeRx(rS, rC, rA);
      right.transposed = {
        sphere: t.sphere,
        cylinder: t.cylinder,
        axis: t.axis,
        display: `Sph: ${formatOpticalNumber(
          t.sphere
        )}, Cyl: ${formatOpticalNumber(t.cylinder)}, Axis: ${t.axis}`,
      };
    }

    if (addPower !== 0) {
      const nearSph = rS + addPower;
      right.near = {
        sph: nearSph,
        cyl: rC,
        axis: rA || 0,
        display: `Sph: ${formatOpticalNumber(
          nearSph
        )}, Cyl: ${formatOpticalNumber(rC)}, Axis: ${rA || ""}`,
      };

      if (rC !== 0) {
        const tn = transposeRx(nearSph, rC, rA);
        right.nearTransposed = {
          sphere: tn.sphere,
          cylinder: tn.cylinder,
          axis: tn.axis,
          display: `Sph: ${formatOpticalNumber(
            tn.sphere
          )}, Cyl: ${formatOpticalNumber(tn.cylinder)}, Axis: ${tn.axis}`,
        };
      }
    }

    right.cross = calculateCrossNumbers(rS, rC, rA);

    // Build Left eye results
    const left = {};
    left.distance = {
      sph: lS,
      cyl: lC,
      axis: lA || 0,
      display: `Sph: ${formatOpticalNumber(lS)}, Cyl: ${formatOpticalNumber(
        lC
      )}, Axis: ${lA || ""}`,
    };

    if (lC !== 0) {
      const t = transposeRx(lS, lC, lA);
      left.transposed = {
        sphere: t.sphere,
        cylinder: t.cylinder,
        axis: t.axis,
        display: `Sph: ${formatOpticalNumber(
          t.sphere
        )}, Cyl: ${formatOpticalNumber(t.cylinder)}, Axis: ${t.axis}`,
      };
    }

    if (addPower !== 0) {
      const nearSphL = lS + addPower;
      left.near = {
        sph: nearSphL,
        cyl: lC,
        axis: lA || 0,
        display: `Sph: ${formatOpticalNumber(
          nearSphL
        )}, Cyl: ${formatOpticalNumber(lC)}, Axis: ${lA || ""}`,
      };

      if (lC !== 0) {
        const tn = transposeRx(nearSphL, lC, lA);
        left.nearTransposed = {
          sphere: tn.sphere,
          cylinder: tn.cylinder,
          axis: tn.axis,
          display: `Sph: ${formatOpticalNumber(
            tn.sphere
          )}, Cyl: ${formatOpticalNumber(tn.cylinder)}, Axis: ${tn.axis}`,
        };
      }
    }

    left.cross = calculateCrossNumbers(lS, lC, lA);

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
    <div className="w-full flex justify-center py-10 bg-gray-100">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-4xl">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-4 text-[#169D53] hover:text-[#0f7a42] transition-colors"
        >
          <FaArrowLeft className="text-lg" />
          Back
        </button>
        <h1 className="text-3xl font-bold text-center text-[#169D53] mb-6">
          Optical Distance & Near Calculator
        </h1>

        <p className="text-center text-gray-600 mb-10">
          Quick, Accurate prescription transposition for Distance and Near
          Vision.
        </p>

        {/* Inputs */}
        <div className="grid md:grid-cols-2 gap-10">
          {/* Right Eye */}
          <div>
            <h2 className="bg-[#169D53] text-white text-center py-2 rounded-lg mb-4">
              Right Eye (OD)
            </h2>

            <label>Sph</label>
            <CustomDropdown
              value={rs}
              onChange={(e) => setRs(e.target.value)}
              options={sphOptions}
              isScrollable={true}
            />

            <label className="mt-4 block">Cyl</label>
            <CustomDropdown
              value={rc}
              onChange={(e) => setRc(e.target.value)}
              options={cylOptions}
              isScrollable={true}
            />

            <label className="mt-4 block">Axis</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={ra}
              placeholder="1 to 180"
              onChange={(e) => setRa(e.target.value)}
              className="w-full border p-2 rounded-lg"
            />
          </div>

          {/* Left Eye */}
          <div>
            <h2 className="bg-[#169D53] text-white text-center py-2 rounded-lg mb-4">
              Left Eye (OS)
            </h2>

            <label>Sph</label>
            <CustomDropdown
              value={ls}
              onChange={(e) => setLs(e.target.value)}
              options={sphOptions}
              isScrollable={true}
            />

            <label className="mt-4 block">Cyl</label>
            <CustomDropdown
              value={lc}
              onChange={(e) => setLc(e.target.value)}
              options={cylOptions}
              isScrollable={true}
            />

            <label className="mt-4 block">Axis</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={la}
              placeholder="1 to 180"
              onChange={(e) => setLa(e.target.value)}
              className="w-full border p-2 rounded-lg"
            />
          </div>
        </div>

        {/* Addition */}
        <div className="mt-10">
          <h2 className="text-center font-bold mb-3 text-xl">Addition (ADD)</h2>
          <CustomDropdown
            value={add}
            onChange={(e) => setAdd(e.target.value)}
            options={addOptions}
            isScrollable={true}
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-center gap-6 mt-10">
          <button
            onClick={calculate}
            className="bg-[#169D53] text-white px-10 py-3 rounded-xl font-bold text-lg hover:opacity-90"
          >
            Transpose
          </button>

          <button
            onClick={reset}
            className="bg-gray-600 text-white px-10 py-3 rounded-xl font-bold text-lg hover:opacity-90"
          >
            Reset
          </button>
        </div>

        {/* Results */}
        <div className="mt-12 grid md:grid-cols-2 gap-10">
          <div>
            <h3 className="text-xl font-bold text-[#169D53] mb-3">
              Right Eye Results
            </h3>
            {rResults ? (
              <div>
                <p>
                  <b>Dist :</b> {rResults.distance.display}
                </p>
                {rResults.transposed && (
                  <p className="mt-2 text-blue-700">
                    <b>Transposed :</b> {rResults.transposed.display}
                  </p>
                )}

                <div className="cross-numbers mt-3">
                  <small>
                    <b>Cross Numbers:</b>
                  </small>
                  <div className="mt-1 font-mono">
                    {formatOpticalNumber(rResults.cross.power1)} @{" "}
                    {rResults.cross.axis1}°
                  </div>
                  <div className="font-mono">
                    {formatOpticalNumber(rResults.cross.power2)} @{" "}
                    {rResults.cross.axis2}°
                  </div>
                </div>

                {rResults.near && (
                  <>
                    <p className="mt-3">
                      <b>Near :</b> {rResults.near.display}
                    </p>
                    {rResults.nearTransposed && (
                      <p className="mt-2 text-blue-700">
                        <b>Near Transposed :</b>{" "}
                        {rResults.nearTransposed.display}
                      </p>
                    )}
                  </>
                )}
              </div>
            ) : (
              <p className="text-gray-500">
                No results yet. Enter values and tap Transpose.
              </p>
            )}
          </div>

          <div>
            <h3 className="text-xl font-bold text-[#169D53] mb-3">
              Left Eye Results
            </h3>
            {lResults ? (
              <div>
                <p>
                  <b>Dist :</b> {lResults.distance.display}
                </p>
                {lResults.transposed && (
                  <p className="mt-2 text-blue-700">
                    <b>Transposed :</b> {lResults.transposed.display}
                  </p>
                )}

                <div className="cross-numbers mt-3">
                  <small>
                    <b>Cross Numbers:</b>
                  </small>
                  <div className="mt-1 font-mono">
                    {formatOpticalNumber(lResults.cross.power1)} @{" "}
                    {lResults.cross.axis1}°
                  </div>
                  <div className="font-mono">
                    {formatOpticalNumber(lResults.cross.power2)} @{" "}
                    {lResults.cross.axis2}°
                  </div>
                </div>

                {lResults.near && (
                  <>
                    <p className="mt-3">
                      <b>Near :</b> {lResults.near.display}
                    </p>
                    {lResults.nearTransposed && (
                      <p className="mt-2 text-blue-700">
                        <b>Near Transposed :</b>{" "}
                        {lResults.nearTransposed.display}
                      </p>
                    )}
                  </>
                )}
              </div>
            ) : (
              <p className="text-gray-500">
                No results yet. Enter values and tap Transpose.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
