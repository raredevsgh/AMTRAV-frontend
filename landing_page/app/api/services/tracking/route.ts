import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderReference, email } = body;

    if (!orderReference || !email) {
      return NextResponse.json(
        { error: "Please provide both your order reference and email address." },
        { status: 400 }
      );
    }

    const cleanRef = String(orderReference).trim().toUpperCase();

    // Sample trackable order state
    const milestones = [
      { step: "Order Confirmed", date: "Nov 17, 2026 · 14:22", completed: true, detail: "Payment authorized via Stripe." },
      { step: "Artisan Quality Check", date: "Nov 18, 2026 · 09:15", completed: true, detail: "Dual TSA locks & Multiwheel alignment tested." },
      { step: "Dispatched from Cologne Hub", date: "Nov 18, 2026 · 18:40", completed: true, detail: "Carrier: DHL Express Worldwide." },
      { step: "In Transit to Destination", date: "Nov 19, 2026 · 06:10", completed: true, detail: "Customs cleared. Flight dispatched." },
      { step: "Out for Courier Delivery", date: "Expected Today", completed: false, detail: "Delivering to your registered address." },
    ];

    return NextResponse.json({
      success: true,
      orderReference: cleanRef,
      carrier: "DHL Express Luxury Logistics",
      trackingNumber: `DHL-AMT-${cleanRef.replace(/[^A-Z0-9]/g, "")}-NO`,
      status: "IN_TRANSIT",
      estimatedDelivery: "November 21, 2026",
      milestones,
    });
  } catch {
    return NextResponse.json({ error: "Tracking lookup failed" }, { status: 500 });
  }
}
