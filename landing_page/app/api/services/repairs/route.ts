import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { serialNumber, damageCategory, description, customerEmail, customerName, dropoffType } = body;

    if (!serialNumber || !damageCategory || !customerEmail) {
      return NextResponse.json(
        { error: "Missing required fields: serialNumber, damageCategory, customerEmail" },
        { status: 400 }
      );
    }

    const claimId = `RPR-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;

    return NextResponse.json({
      success: true,
      claimId,
      serialNumber,
      damageCategory,
      description: description || "Routine Service",
      customerName,
      customerEmail,
      dropoffType: dropoffType || "COURIER_PICKUP",
      status: "CLAIM_APPROVED",
      prepaidLabelUrl: `/labels/${claimId}.pdf`,
      estimatedTurnaround: "3–5 Business Days",
      message: "Your repair claim has been registered under the AMTRAV Lifetime Guarantee. A prepaid insured shipping label has been dispatched to your email.",
    });
  } catch {
    return NextResponse.json({ error: "Failed to process repair request" }, { status: 500 });
  }
}
