import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import SmsQueue from "@/models/SmsQueue";

const isAuthenticated = (req: NextRequest) => {
  const token = req.cookies.get("admin_token")?.value;
  return token === "authenticated_admin_secret_token";
};

// GET: Fetch all SMS
export async function GET(req: NextRequest) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await dbConnect();
    const smsList = await SmsQueue.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: smsList }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch SMS list" }, { status: 500 });
  }
}

// POST: Add new SMS
export async function POST(req: NextRequest) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await dbConnect();
    const body = await req.json();
    const { mobileNumber, message } = body;
    if (!mobileNumber || !message) return NextResponse.json({ error: "Missing fields" }, { status: 400 });

    const newSms = new SmsQueue({
      mobileNumber: mobileNumber.trim(),
      message: message.trim(),
      status: "pending",
    });
    await newSms.save();
    return NextResponse.json({ success: true, data: newSms }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to queue SMS" }, { status: 500 });
  }
}

// DELETE: Remove an SMS from history
export async function DELETE(req: NextRequest) {
  if (!isAuthenticated(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    
    if (!id) return NextResponse.json({ error: "SMS ID is required" }, { status: 400 });
    
    await SmsQueue.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "SMS deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete SMS" }, { status: 500 });
  }
}