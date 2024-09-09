import { db }  from "@/lib/db";
import { notFound } from "next/navigation";
import React from "react";
import Stripe from "stripe";
import CheckoutForm from "./_components/CheckoutForm";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export default async function PurchasePage({
  params: { id },
}: {
  params: { id: string };
}) {
  const product = await db.product.findUnique({
    where: { id },
  });
  if (product == null) return notFound();
  const paymentIntents = await stripe.paymentIntents.create({
    amount: product.priceInCents,
    currency: "INR",
    description: `Purchase of ${product.name}`,
    metadata: {
      productId: product.id,
    },
  });
  if (paymentIntents.client_secret == null) {
    throw Error("Payment secret is required");
  }
  return (
    <CheckoutForm
      product={product}
      clientSecret={paymentIntents.client_secret}
    />
  );
}
