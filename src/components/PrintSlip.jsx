import React from "react";

export default function PrintSlip({ order }) {
  return (
    <div className="print-slip" aria-hidden={!order}>
      <style>{`
        .print-slip { display: none; }
        @media print {
          body * { visibility: hidden; }
          .print-slip, .print-slip * { visibility: visible; }
          .print-slip { display: block; width: 280px; margin: auto; font-family: Arial, sans-serif; font-size: 12px; color: #000; }
          .title { text-align: center; font-size: 18px; font-weight: bold; }
          .center { text-align: center; }
          .small { font-size: 11px; }
          .bold { font-weight: bold; }
          hr { border: none; border-top: 1px dashed #000; margin: 8px 0; }
          .row { display: flex; justify-content: space-between; margin: 4px 0; }
          .eyes { display: flex; justify-content: space-between; margin-top: 6px; }
          .eyes p { margin: 2px 0; }
          .add { text-align: center; margin-top: 10px; font-size: 14px; }
        }
      `}</style>

      <h1 className="title">OPTI SLIP</h1>

      <p className="center small">
        Civic Center, Mountain View, CA, United States, California
      </p>

      <p className="center small">Contact # +92123-1234567</p>

      <p className="center small bold">Whatsapp # +92123-12345678</p>

      <hr />

      <div className="row">
        <span>Tracking ID:</span>
        <span>{order?.trackingId || order?._id}</span>
      </div>

      <div className="row">
        <span>Patient Name:</span>
        <span>{order?.patientName || "Mr. Ali"}</span>
      </div>

      <div className="row">
        <span>WhatsApp:</span>
        <span>{order?.whatsappNumber || "+123-1234567"}</span>
      </div>

      <div className="row">
        <span>Order Details:</span>
        <span>
          {(order?.frameDetails || "TR90") + " + " + (order?.lensType || "HC")}
        </span>
      </div>

      <div className="row">
        <span>Total Amount:</span>
        <span>{order?.totalAmount ?? "0.00"}</span>
      </div>

      <div className="row">
        <span>Advance:</span>
        <span>{order?.advance ?? "0.00"}</span>
      </div>

      <div className="row">
        <span>Delivery Date:</span>
        <span>
          {order?.deliveryDate
            ? new Date(order.deliveryDate).toLocaleDateString()
            : "01-05-2025"}
        </span>
      </div>

      <div className="row">
        <span>Balance:</span>
        <span>{order?.balance ?? "0.00"}</span>
      </div>

      <hr />

      <div className="eyes">
        <div>
          <strong>Right Eye:</strong>
          <p>SPH: {order?.rightEye?.sph ?? "N/A"}</p>
          <p>CYL: {order?.rightEye?.cyl ?? "N/A"}</p>
          <p>AXIS: {order?.rightEye?.axis ?? "N/A"}</p>
        </div>

        <div>
          <strong>Left Eye:</strong>
          <p>SPH: {order?.leftEye?.sph ?? "N/A"}</p>
          <p>CYL: {order?.leftEye?.cyl ?? "N/A"}</p>
          <p>AXIS: {order?.leftEye?.axis ?? "N/A"}</p>
        </div>
      </div>

      <div className="add">
        <strong>ADD</strong>
        <p>{order?.addInput || "+2.50"}</p>
      </div>
    </div>
  );
}
