"use client";

import { api } from "~/trpc/react";
import Image from "next/image";

export default function InvoiceComp({
  shopid,
  invoiceId,
}: {
  shopid: string;
  invoiceId: string;
}) {
  const {
    data: invoiceData,
    isLoading,
    error,
  } = api.billing.getBillById.useQuery(invoiceId ?? "");
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.businessName}>{invoiceData?.shop.name}</h2>
          <p>{invoiceData?.shop.address}</p>
          <p>
            {invoiceData?.shop.email} | Phone: {invoiceData?.shop.phone}
          </p>
        </div>
        <div>
          {invoiceData?.shop.shopImage && (
            <Image
              src={invoiceData?.shop.shopImage}
              alt="Shop Logo"
              style={{ borderRadius: "4px", border: "1px solid gray" }}
              width={60}
              height={60}
            />
          )}
        </div>
        <div style={styles.invoiceInfo}>
          <p>Invoice No: {invoiceId}</p>
          <p>Shop ID: {invoiceData?.shop.shopId}</p>
          <p>Date: {invoiceData?.createdAt.toLocaleDateString() + "," + invoiceData?.createdAt.toLocaleTimeString()}</p>
        </div>
      </div>

      {invoiceData?.customerName && (
        <div style={styles.section}>
          <h3>Bill To:</h3>
          <p>Customer Name</p>
          <p>Address: 456 Market St, City</p>
          <p>Email: customer@email.com</p>
        </div>
      )}

      {/* Items Table */}
      <table style={styles.table}>
        <thead>
          <tr>
            <th style={styles.th}>Item ID</th>
            <th style={styles.th}>Item</th>
            <th style={styles.th}>Quantity</th>
            <th style={styles.th}>Price</th>
            <th style={styles.th}>Total</th>
          </tr>
        </thead>
        <tbody id="itemsContainer">
          {invoiceData?.items.map((item) => (
            <tr key={item.id}>
              <td style={styles.td}>{item.product?.productCode ?? ""}</td>
              <td className="itemClass" style={styles.td}>
                {item.name}
              </td>
              <td style={styles.td}>{item.quantity}</td>
              <td style={styles.td}> ₹ {item.price}</td>
              <td style={styles.td}> ₹ {item.price * item.quantity}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Summary */}
      <div>
        <h3>Payment Method: {invoiceData?.paymentMethod}</h3>
      </div>
      <div style={styles.summary}>
        <p>
          Subtotal: ₹{" "}
          {invoiceData?.items.reduce(
            (total, item) => total + item.quantity * item.price,
            0,
          )}
        </p>
        {(invoiceData?.discount ?? 0) > 0 && (
          <p>Discount: {invoiceData?.discount} %</p>
        )}
        <h3>Total: ₹ {invoiceData?.total}</h3>
      </div>
    </div>
  );
}

// Inline styles for Puppeteer rendering
const styles: Record<string, React.CSSProperties> = {
  container: {
    width: "100%",
    minHeight: "100vh",
    color: "black",
    maxWidth: "800px",
    margin: "0 auto",
    padding: "20px",
    backgroundColor: "white",
    fontFamily: "Arial, sans-serif",
    fontSize: "14px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    marginBottom: "20px",
    borderBottom: "2px solid black",
    paddingBottom: "10px",
  },
  businessName: { fontSize: "20px", marginBottom: "5px" },
  invoiceInfo: { textAlign: "right" },
  section: { marginBottom: "20px" },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    marginBottom: "20px",
  },
  th: {
    border: "1px solid black",
    padding: "10px",
    textAlign: "left",
    backgroundColor: "#f2f2f2",
  },
  td: {
    border: "1px solid black",
    padding: "10px",
  },
  summary: {
    textAlign: "right",
    fontSize: "16px",
    fontWeight: "bold",
  },
  footer: {
    textAlign: "center",
    marginTop: "20px",
    fontSize: "12px",
    borderTop: "1px solid black",
    paddingTop: "10px",
  },
};
