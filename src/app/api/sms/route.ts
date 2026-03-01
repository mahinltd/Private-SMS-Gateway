import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import mongoose from "mongoose";

// --- Outgoing SMS Schema (MUST MATCH DASHBOARD: SmsQueue) ---
const SmsSchema = new mongoose.Schema({
  mobileNumber: String,
  message: String,
  status: { type: String, default: "pending" },
}, { timestamps: true });

const SmsQueue = mongoose.models.SmsQueue || mongoose.model("SmsQueue", SmsSchema);

// --- Incoming SMS Schema (Inbox) ---
const InboxSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  message: { type: String, required: true },
}, { timestamps: true });

const InboxSms = mongoose.models.InboxSms || mongoose.model("InboxSms", InboxSchema);

const API_SECRET = "TanvirRahmanMahin8268@";

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");
    const authHeader = req.headers.get("Authorization");

    if (authHeader !== `Bearer ${API_SECRET}`) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect(); 

    if (action === "fetch") {
      const pendingSms = await SmsQueue.findOne({ status: "pending" }).sort({ createdAt: 1 });
      return NextResponse.json({ success: true, data: pendingSms || null }, { status: 200 });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");
    const authHeader = req.headers.get("Authorization");

    if (authHeader !== `Bearer ${API_SECRET}`) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect(); 
    const body = await req.json().catch(() => ({})); // Safe JSON parsing

    // 1. Handle Status Update
    if (action === "update") {
      const { id, status } = body;
      if (!id || !status) return NextResponse.json({ success: false, error: "Missing data" }, { status: 400 });
      await SmsQueue.findByIdAndUpdate(id, { status });
      return NextResponse.json({ success: true });
    }

    // 2. Handle Incoming SMS (Inbox)
    if (action === "receive") {
      const senderNumber = body.sender || body.mobileNumber;
      const smsText = body.message || body.text;

      if (!senderNumber || !smsText) {
        console.error("❌ Inbox Error - Missing fields:", body);
        return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
      }

      await InboxSms.create({ sender: senderNumber, message: smsText });
      console.log(`✅ Magic! Incoming SMS saved from: ${senderNumber}`);
      return NextResponse.json({ success: true }, { status: 201 });
    }

    return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("API POST Error:", error);
    return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
  }
}