import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { sql } from "../../../lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, email } = body;

    if (!userId || !email) {
      return NextResponse.json(
        { error: "Missing userId or email" },
        { status: 400 }
      );
    }

    // Initialize Razorpay client inside the handler to prevent compile-time crashes
    const key_id = process.env.RAZORPAY_KEY_ID || "rzp_test_mockkeyid";
    const key_secret = process.env.RAZORPAY_KEY_SECRET || "mockkeysecret";
    
    if (!process.env.RAZORPAY_KEY_ID) {
      console.warn("WARNING: RAZORPAY_KEY_ID is not configured. Using mock details.");
    }

    const razorpay = new Razorpay({
      key_id,
      key_secret,
    });

    // Default amount: 999 INR (represented in paise = 99900)
    // Can be configured via environment variables
    const rawAmount = process.env.RAZORPAY_AMOUNT ? parseInt(process.env.RAZORPAY_AMOUNT) : 999;
    const currency = process.env.RAZORPAY_CURRENCY || "INR";
    const amount = rawAmount * 100; // Razorpay expects amount in smallest currency unit (paise/cents)

    // Create a new Razorpay Order
    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt: `receipt_${userId.substring(0, 10)}_${Date.now().toString().substring(5)}`,
      notes: {
        userId,
        email,
      },
    });

    // Save order in Neon DB using tagged template literals
    const orderId = order.id;
    await sql`
      INSERT INTO orders (id, user_id, amount, currency, status) 
      VALUES (${orderId}, ${userId}, ${amount}, ${currency}, 'created')
    `;

    return NextResponse.json({
      id: order.id,
      amount: order.amount,
      currency: order.currency,
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || key_id,
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error);
    return NextResponse.json(
      { error: "Failed to create checkout order" },
      { status: 500 }
    );
  }
}
