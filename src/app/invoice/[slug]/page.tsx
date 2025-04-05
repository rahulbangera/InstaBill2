import React from "react";
import InvoiceComp from "./invoiceComp";

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const slugParts = slug.split("-");
 
  return (
    <InvoiceComp shopid={slugParts[0] ?? ""} invoiceId={slugParts[1] ?? ""} />
  )
}