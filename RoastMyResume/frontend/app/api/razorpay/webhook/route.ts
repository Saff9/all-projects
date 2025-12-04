import { NextResponse } from "next/server";
import crypto from "crypto";
import { sql } from "../../../lib/db";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.warn("Razorpay Webhook secret is not configured");
      return NextResponse.json({ error: "Webhook secret missing" }, { status: 500 });
    }

    if (!signature) {
      return NextResponse.json({ error: "Missing signature header" }, { status: 400 });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (expectedSignature !== signature) {
      console.error("Razorpay webhook signature verification failed");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    
    console.log(`Received Razorpay webhook event: ${event}`);

    // Handle payment.captured or order.paid
    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = payload.payload.payment.entity;
      const orderId = paymentEntity.order_id;
      const paymentId = paymentEntity.id;
      
      // Extract userId from payment notes or order notes
      const userId = paymentEntity.notes?.userId || paymentEntity.notes?.user_id;

      if (userId && orderId) {
        console.log(`Processing successful payment for user ${userId}, order ${orderId}`);

        // Update order status to paid using tagged template literals
        await sql`
          UPDATE orders 
          SET payment_id = ${paymentId}, status = 'paid' 
          WHERE id = ${orderId}
        `;

        // Upgrade user's tier to Pro
        await sql`
          UPDATE users 
          SET tier = 'pro' 
          WHERE id = ${userId}
        `;
      }
    }

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Razorpay webhook server error:", error);
    return NextResponse.json(
      { error: "Webhook internal processing error" },
      { status: 500 }
    );
  }
}
