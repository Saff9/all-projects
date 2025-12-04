import { NextResponse } from "next/server";
import crypto from "crypto";
import { sql } from "../../../lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      userId 
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !userId) {
      return NextResponse.json(
        { error: "Missing required verification fields" },
        { status: 400 }
      );
    }

    // Verify Razorpay payment signature
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const signSource = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(signSource)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      console.error("Razorpay signature verification failed");
      return NextResponse.json(
        { success: false, error: "Signature verification failed" },
        { status: 400 }
      );
    }

    // Update order status in Neon DB using tagged template literals
    await sql`
      UPDATE orders 
      SET payment_id = ${razorpay_payment_id}, signature = ${razorpay_signature}, status = 'paid' 
      WHERE id = ${razorpay_order_id}
    `;

    // Upgrade user's tier to Pro
    await sql`
      UPDATE users 
      SET tier = 'pro' 
      WHERE id = ${userId}
    `;

    return NextResponse.json({ success: true, message: "Payment verified successfully. Account upgraded to Pro! 🔥" });
  } catch (error) {
    console.error("Razorpay signature verification server error:", error);
    return NextResponse.json(
      { error: "Internal server verification error" },
      { status: 500 }
    );
  }
}
