import db from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import nodemailer from "nodemailer";
import {  ReceiptEmailHtml } from "@/emails/PurchaseRecepit";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);
export async function POST(req: NextRequest) {
  const event = stripe.webhooks.constructEvent(
    await req.text(),
    req.headers.get("stripe-signature") as string,
    process.env.STRIPE_WEBHOOK_SECRET!
  );
  if (event.type === "charge.succeeded") {
    const charge = event.data.object;
    const productId = charge.metadata.productId;
    const email = charge.billing_details.email;
    const pricePaidInCents = charge.amount;

    const product = await db.product.findUnique({
      where: { id: productId },
    });
    if (product == null || email == null) {
      return new NextResponse("Bad Request", {
        status: 400,
      });
    }
    const userFields = {
      email,
      orders: {
        create: {
          productId,
          pricePaidInCents,
        },
      },
    };

    const {
      orders: [order],
    } = await db.user.upsert({
      where: { email },
      create: userFields,
      update: userFields,
      select: {
        orders: {
          orderBy: {
            created: "desc",
          },
          take: 1,
        },
      },
    });
    await db.downloadVerification.create({
      data: {
        productId,
        expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      },
    });
    // send receipt
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      secure: true,
      port: 465,
      auth: {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASSWORD!,
      },
    });
    const emailHtmlPromise = ReceiptEmailHtml({
      product,
      email,
      order,
      downloadVerificationId: "new url",
    });
    const emailHtml = emailHtmlPromise;
    try {
      const info = await transporter.sendMail({
        from: `"Store" <${process.env.SMTP_USER!}>`,
        to: email as string,
        subject: "Thanks for your order! This is your receipt.",
        html: await emailHtml,
      });

      console.log("Message sent: %s", info.messageId);
    } catch (error) {
      console.error("Error sending email:", error);
    }
    return new NextResponse("Payment Successful", {
      status: 200,
    });
  }
}
