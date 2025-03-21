import React from "react";
import ShopComp from "./shop";
import { api } from "~/trpc/react";

export default async function ShopSlug({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <ShopComp shopid={slug}/>;
}
