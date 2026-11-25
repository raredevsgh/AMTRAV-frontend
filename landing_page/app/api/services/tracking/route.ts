import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { orderReference, email } = body;

    if (!orderReference || !email) {
      return NextResponse.json(
        { error: "Please provide both your reference number and email address." },
        { status: 400 }
      );
    }

    const cleanRef = String(orderReference).trim().toUpperCase();
    const isReservation = cleanRef.startsWith("AMT-RES-");

    // Milestones tailored to either an Atelier Reservation or a Dispatched Shop Order
    const milestones = isReservation
      ? [
          {
            step: "Allocation Confirmed",
            date: "Nov 22, 2026 · 11:30",
            completed: true,
            detail: "Atelier slot secured. Personal and delivery details verified.",
          },
          {
            step: "Munich Atelier Hand-Assembly",
            date: "Nov 23, 2026 · 14:15",
            completed: true,
            detail: "Reinforced aerospace shell, dual TSA biometric locks & custom Italian leather tag fitted.",
          },
          {
            step: "TRACE Smart Core Provisioning",
            date: "Nov 24, 2026 · 09:40",
            completed: true,
            detail: "4G LTE Cat-M1 and multi-constellation GNSS sensor calibration completed.",
          },
          {
            step: "Dispatched via White-Glove Logistics",
            date: "Nov 24, 2026 · 16:00",
            completed: true,
            detail: "Handed over to DHL Express Luxury Priority Dispatch with sealed tamper-evident lock.",
          },
          {
            step: "Courier Delivery to Destination",
            date: "Estimated in 2 business days",
            completed: false,
            detail: "Direct white-glove delivery to your registered destination address.",
          },
        ]
      : [
          {
            step: "Order Confirmed",
            date: "Nov 22, 2026 · 14:22",
            completed: true,
            detail: "Payment authorized via Stripe & security token generated.",
          },
          {
            step: "Artisan Quality Check",
            date: "Nov 23, 2026 · 09:15",
            completed: true,
            detail: "Dual TSA locks & Multiwheel alignment tested on German test rig.",
          },
          {
            step: "Dispatched from Cologne Hub",
            date: "Nov 23, 2026 · 18:40",
            completed: true,
            detail: "Carrier: DHL Express Worldwide.",
          },
          {
            step: "In Transit to Destination",
            date: "Nov 24, 2026 · 06:10",
            completed: true,
            detail: "Customs cleared. Flight air-cargo dispatched.",
          },
          {
            step: "Out for Courier Delivery",
            date: "Expected Today",
            completed: false,
            detail: "Delivering to your registered delivery address.",
          },
        ];

    return NextResponse.json({
      success: true,
      orderReference: cleanRef,
      isReservation,
      carrier: "DHL Express Luxury Logistics",
      trackingNumber: `DHL-AMT-${cleanRef.replace(/[^A-Z0-9]/g, "")}-NO`,
      status: "IN_TRANSIT",
      estimatedDelivery: isReservation ? "November 26, 2026" : "November 24, 2026",
      milestones,
    });
  } catch {
    return NextResponse.json({ error: "Tracking lookup failed" }, { status: 500 });
  }
}
