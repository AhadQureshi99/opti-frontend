export default function OrderSlip({ order, shopDetails, viewMode = false }) {
  const format = (val, bold = false) => {
    // If no value was provided, default to 0.00
    if (val === null || val === undefined || val === "") {
      const zero = "0.00";
      return bold ? <span className="font-bold">{zero}</span> : zero;
    }

    const num = parseFloat(val);
    if (isNaN(num)) {
      const zero = "0.00";
      return bold ? <span className="font-bold">{zero}</span> : zero;
    }
    const sign = num > 0 ? "+" : num < 0 ? "-" : "";
    const value = `${sign}${Math.abs(num).toFixed(2)}`;
    return bold ? <span className="font-bold">{value}</span> : value;
  };

  const formatAxis = (val) => {
    if (val === null || val === undefined || val === "") {
      return "0";
    }
    const num = parseFloat(val);
    if (isNaN(num)) return "0";
    return String(Math.round(num));
  };

  const getCurrencySymbol = (currencyString) => {
    if (!currencyString) return "₹";
    const match = currencyString.match(/\((.+)\)$/);
    return match && match[1] ? match[1] : "₹";
  };

  const formatAmount = (amount) => {
    if (!amount && amount !== 0) return "N/A";
    const symbol = getCurrencySymbol(shopDetails?.currency);
    return `${symbol} ${Number(amount).toLocaleString("en-US")}`;
  };

  // Scale factor for view mode
  const scale = viewMode ? 2.2 : 1;
  const baseWidth = 280;
  const containerWidth = viewMode ? baseWidth * scale : baseWidth;

  return (
    <div
      className={
        viewMode ? "text-[13px] leading-relaxed" : "text-[6px] leading-tight"
      }
      style={{
        width: `${containerWidth}px`,
        transform: viewMode ? "scale(1)" : "scale(1)",
      }}
    >
      <div className={viewMode ? "text-center mb-2" : "text-center mb-0.5"}>
        <h1
          className={
            viewMode
              ? "font-bold text-[22px] uppercase leading-snug"
              : "font-bold text-[10px] uppercase leading-tight"
          }
        >
          {shopDetails.shopName || "OPTISLIP"}
        </h1>
        <p
          className={
            viewMode
              ? "text-[11px] leading-relaxed"
              : "text-[5px] leading-tight"
          }
        >
          {shopDetails.address || "N/A"}
        </p>

        {/* Phone with Country Code */}
        <p
          className={
            viewMode
              ? "text-[11px] leading-relaxed"
              : "text-[5px] leading-tight"
          }
        >
          Phone:{" "}
          {shopDetails.countryCode && shopDetails.phoneNumber
            ? `${shopDetails.countryCode} ${shopDetails.phoneNumber}`
            : shopDetails.phoneNumber || "N/A"}
        </p>

        {/* WhatsApp with Country Code */}
        <p
          className={
            viewMode
              ? "text-[11px] font-semibold leading-relaxed"
              : "text-[5px] font-semibold leading-tight"
          }
        >
          WhatsApp:{" "}
          {shopDetails.whatsappCode && shopDetails.whatsappNumber
            ? `${shopDetails.whatsappCode} ${shopDetails.whatsappNumber}`
            : shopDetails.whatsappNumber || "N/A"}
        </p>

        {shopDetails.currency && (
          <p
            className={
              viewMode
                ? "text-[11px] text-gray-700 leading-relaxed"
                : "text-[5px] text-gray-700 leading-tight"
            }
          >
            Currency: {shopDetails.currency}
          </p>
        )}
      </div>

      <hr
        className={
          viewMode
            ? "border-dashed my-2 border-2 border-black"
            : "border-dashed my-0.5 border-2 border-black"
        }
      />

      <Row
        label="Tracking ID"
        value={
          <span className="font-bold">{order?.trackingId || "Not saved"}</span>
        }
        viewMode={viewMode}
      />
      <Row
        label="Patient Name"
        value={<span className="font-bold">{order?.patientName || "N/A"}</span>}
        viewMode={viewMode}
      />
      <Row
        label="WhatsApp"
        value={
          <span className="font-bold">{order?.whatsappNumber || "N/A"}</span>
        }
        viewMode={viewMode}
      />
      <hr
        className={
          viewMode
            ? "border-dashed my-2 border-2 border-black"
            : "border-dashed my-0.5 border-2 border-black"
        }
      />
      <Row
        label="Frame"
        value={
          <span className="font-bold">{order?.frameDetails || "N/A"}</span>
        }
        viewMode={viewMode}
      />
      <Row
        label="Lens"
        value={<span className="font-bold">{order?.lensType || "N/A"}</span>}
        viewMode={viewMode}
      />
      <Row
        label="Total"
        value={
          <span className="font-bold">{formatAmount(order?.totalAmount)}</span>
        }
        viewMode={viewMode}
      />
      <Row
        label="Advance"
        value={
          <span className="font-bold">{formatAmount(order?.advance)}</span>
        }
        viewMode={viewMode}
      />
      <Row
        label="Balance"
        value={
          <span className="font-bold">{formatAmount(order?.balance)}</span>
        }
        viewMode={viewMode}
      />
      <div
        className={
          viewMode
            ? "flex justify-between text-[13px] leading-relaxed"
            : "flex justify-between text-[6px] leading-tight"
        }
      >
        <span>Delivery Date:</span>
        <span className="font-bold">
          {order?.deliveryDate ? order.deliveryDate.split("T")[0] : "N/A"}
        </span>
      </div>
      {order?.specialNote &&
        order.specialNote.trim() !== "" &&
        (order.isDirectRecord ? (
          // For Add Record entries, show a labeled
          // special note just below the delivery date.
          <div
            className={
              viewMode
                ? "flex justify-between text-[13px] leading-relaxed mt-1"
                : "flex justify-between text-[6px] leading-tight mt-0.5"
            }
          >
            <span className="font-semibold">Special Note:</span>
            <span className="font-bold text-right">{order.specialNote}</span>
          </div>
        ) : (
          <>
            <hr
              className={
                viewMode
                  ? "border-dashed my-2 border-2 border-black"
                  : "border-dashed my-0.5 border-2 border-black"
              }
            />
            <p
              className={
                viewMode
                  ? "text-[13px] mb-2 leading-relaxed"
                  : "text-[6px] mb-0.5 leading-tight"
              }
            >
              Special Note
            </p>
            {order.specialNote.split("\n").map((line, index) => {
              const match = line.match(/^(\d+)\.\s*(.*)/);
              if (match) {
                return (
                  <p
                    key={index}
                    className={
                      viewMode
                        ? "text-[11px] leading-relaxed text-left flex"
                        : "text-[5px] leading-tight text-left flex"
                    }
                  >
                    <span className={viewMode ? "mr-1" : "mr-0.5"}>
                      {match[1]}.
                    </span>
                    <span className="flex-1">{match[2]}</span>
                  </p>
                );
              }
              return (
                <p
                  key={index}
                  className={
                    viewMode
                      ? "text-[11px] leading-relaxed text-left"
                      : "text-[5px] leading-tight text-left"
                  }
                >
                  {line}
                </p>
              );
            })}
          </>
        ))}

      <hr
        className={
          viewMode
            ? "border-dashed my-2 border-2 border-black"
            : "border-dashed my-0.5 border-2 border-black"
        }
      />

      <table
        className={
          viewMode
            ? "w-full font-bold text-[13px]"
            : "w-full font-bold text-[6px]"
        }
      >
        <thead>
          <tr>
            <th
              className={
                viewMode
                  ? "text-left leading-relaxed pb-1"
                  : "text-left leading-tight"
              }
            >
              Right Eye
            </th>
            <th
              className={
                viewMode
                  ? "text-right leading-relaxed pb-1"
                  : "text-right leading-tight"
              }
            >
              Left Eye
            </th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td
              className={
                viewMode
                  ? "text-left leading-relaxed py-0.5"
                  : "text-left leading-tight"
              }
            >
              SPH:{" "}
              <span className="font-bold">{format(order?.rightEye?.sph)}</span>
            </td>
            <td
              className={
                viewMode
                  ? "text-right leading-relaxed py-0.5"
                  : "text-right leading-tight"
              }
            >
              SPH:{" "}
              <span className="font-bold">{format(order?.leftEye?.sph)}</span>
            </td>
          </tr>
          <tr>
            <td
              className={
                viewMode
                  ? "text-left leading-relaxed py-0.5"
                  : "text-left leading-tight"
              }
            >
              CYL:{" "}
              <span className="font-bold">{format(order?.rightEye?.cyl)}</span>
            </td>
            <td
              className={
                viewMode
                  ? "text-right leading-relaxed py-0.5"
                  : "text-right leading-tight"
              }
            >
              CYL:{" "}
              <span className="font-bold">{format(order?.leftEye?.cyl)}</span>
            </td>
          </tr>
          <tr>
            <td
              className={
                viewMode
                  ? "text-left leading-relaxed py-0.5"
                  : "text-left leading-tight"
              }
            >
              AXIS:{" "}
              <span className="font-bold">{formatAxis(order?.rightEye?.axis)}</span>
            </td>
            <td
              className={
                viewMode
                  ? "text-right leading-relaxed py-0.5"
                  : "text-right leading-tight"
              }
            >
              AXIS:{" "}
              <span className="font-bold">{formatAxis(order?.leftEye?.axis)}</span>
            </td>
          </tr>
        </tbody>
      </table>

      <div
        className={
          viewMode
            ? "text-center font-bold text-[13px] leading-relaxed mt-2"
            : "text-center font-bold text-[6px] leading-tight"
        }
      >
        <p>ADD</p>
        <p>
          {order?.addInput && order.addInput !== "Select"
            ? order.addInput
            : "-"}
        </p>
      </div>
    </div>
  );
}

function Row({ label, value, viewMode = false }) {
  return (
    <div
      className={
        viewMode
          ? "flex justify-between text-[13px] leading-relaxed"
          : "flex justify-between text-[6px] leading-tight"
      }
    >
      <span>{label}:</span>
      <span className="font-extrabold">{value || "N/A"}</span>
    </div>
  );
}
