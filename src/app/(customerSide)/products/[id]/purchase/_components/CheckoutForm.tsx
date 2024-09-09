"use client";
import { userOrderExists } from "@/app/_actions/orders";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import {
  AddressElement,
  Elements,
  LinkAuthenticationElement,
  PaymentElement,
  useElements,
  useStripe,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { error } from "console";
import Image from "next/image";
import React, { FormEvent, useState } from "react";

type CheckoutFormProps = {
  product: {
    imagePath: string;
    name: string;
    priceInCents: number;
    description: string;
    id: string;
  };
  clientSecret: string;
};
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY as string
);
export default function CheckoutForm({
  product,
  clientSecret,
}: CheckoutFormProps) {
  return (
    <>
      <div className="max-w-5xl w-full mx-auto space-y-8">
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
          </div>
        </div>
        <Elements options={{ clientSecret }} stripe={stripePromise}>
          <Form priceInCents={product.priceInCents} productId={product.id} />
        </Elements>
      </div>
    </>
  );
}
function Form({
  priceInCents,
  productId,
}: {
  priceInCents: number;
  productId: string;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [email, setEmail] = useState("");
  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (stripe == null || elements == null || email == null) return;
    setIsLoading(true);

    const orderExist = await userOrderExists(email, productId);
    if (orderExist) {
      setErrorMessage(
        "You Have already Purchase this Product. Try again Downaloading it from the My Orders Page"
      );
      setIsLoading(false);
      return;
    }
    stripe
      .confirmPayment({
        elements,
        confirmParams: {
          return_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/stripe/purchase-success`,
        },
      })
      .then(({ error }) => {
        if (error.type === "card_error" || error.type === "validation_error") {
          setErrorMessage(error.message as string);
        } else {
          setErrorMessage("An error occurred error");
          console.log(error.message);
        }
      })
      .finally(() => setIsLoading(false));
  }
  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Checkout</CardTitle>
          {errorMessage && (
            <p className="text-sm text-red-500 font-semibold">{errorMessage}</p>
          )}
        </CardHeader>
        <CardContent>
          <PaymentElement />
          <AddressElement options={{ mode: "billing" }} />
          <div className="mt-4">
            <LinkAuthenticationElement
              onChange={(e) => setEmail(e.value.email)}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            size={"lg"}
            disabled={stripe == null || elements == null}
            className="w-full"
          >
            {isLoading
              ? "Purchasing..."
              : `Purchase - ${formatCurrency(priceInCents / 100)}`}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
