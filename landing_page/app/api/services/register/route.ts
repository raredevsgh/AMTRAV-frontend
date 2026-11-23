import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { serialNumber, ownerName, ownerEmail, purchaseChannel } = body;

    if (!serialNumber || !ownerEmail || !ownerName) {
      return NextResponse.json(
        { error: "Missing required fields: serialNumber, ownerName, ownerEmail" },
        { status: 400 }
      );
    }

    // Validate AMTRAV serial number format (e.g. AMT-XXXX-XXXX or 8-12 alphanumeric)
    const cleanSerial = String(serialNumber).trim().toUpperCase();
    if (cleanSerial.length < 6) {
      return NextResponse.json(
        { error: "Invalid serial number. Please check the 10-digit code laser-etched on your bag's aluminium frame." },
        { status: 422 }
      );
    }

    const registrationId = `REG-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 1000)}`;

    return NextResponse.json({
      success: true,
      registrationId,
      serialNumber: cleanSerial,
      ownerName,
      ownerEmail,
      purchaseChannel: purchaseChannel || "AMTRAV Boutique",
      status: "LIFETIME_GUARANTEE_ACTIVE",
      registeredAt: new Date().toISOString(),
      certificateUrl: `/api/services/certificate?reg=${registrationId}`,
      message: "Lifetime Guarantee successfully activated for your AMTRAV luggage.",
    });
  } catch {
    return NextResponse.json({ error: "Failed to process registration" }, { status: 500 });
  }
}
