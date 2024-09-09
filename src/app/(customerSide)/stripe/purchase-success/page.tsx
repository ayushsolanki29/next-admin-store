import { Button } from "@/components/ui/button";
import { db }  from "@/lib/db";
import { formatCurrency } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import React from "react";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
export default async function SuccessPage({
  searchParams,
}: {
  searchParams: { payment_intent: string };
}) {
  const paymentIntent = await stripe.paymentIntents.retrieve(
    searchParams.payment_intent
  );
  if (paymentIntent.metadata.productId == null) return notFound();
  const product = await db.product.findUnique({
    where: { id: paymentIntent.metadata.productId },
  });
  if (product == null) return notFound();
  const isSuccess = paymentIntent.status === "succeeded";
  return (
    <>
      <div className="max-w-5xl w-full mx-auto space-y-8">
        <h1 className="text-3xl font-bold ">
          {isSuccess ? "Success" : "Error!"}
        </h1>
        <div className="flex gap-8 items-center">
          <div className="aspect-video flex-shrink-0 w-1/3 relative rounded-md">
            <Image
              src={product.imagePath}
              className="rounded-md"
              fill
              alt={product.name}
            />
          </div>
          <div className="p-5 bg-blue-50 rounded-md">
            <div className="text-lg font-bold">
              {formatCurrency(product.priceInCents / 100)}
            </div>
            <div>
              <h1 className="text-2xl uppercase">{product.name}</h1>
              <p className="line-clamp-4 text-muted-foreground">
                {product.description}
              </p>
            </div>
            <Button className="mt-4" size={"lg"} asChild>
              {isSuccess ? (
                <a
                  href={`/products/download/${await createDownloadVerification(
                    product.id
                  )}`}
                >
                  Download Your File
                </a>
              ) : (
                <Link href={`/products/${product.id}`}>
                  Faild To Purchase Try Again!
                </Link>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

async function createDownloadVerification(productId: string) {
  return (
    await db.downloadVerification.create({
      data: {
        productId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    })
  ).id;
}
