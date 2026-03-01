import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import mongoose from "mongoose";

// --- Schema for Incoming SMS (Inbox) --- MUST MATCH DASHBOARD
const InboxSchema = new mongoose.Schema({
  sender: { type: String, required: true },
  message: { type: String, required: true },
}, { timestamps: true });

const InboxSms = mongoose.models.InboxSms || mongoose.model("InboxSms", InboxSchema);

// Security Key (Must match Android App)
const API_SECRET = "TanvirRahmanMahin8268@";

// Allow either the Android app (Bearer secret) or logged-in admin (cookie)
const isAuthorized = (req: NextRequest) => {
  const bearer = req.headers.get("authorization");
  const fromApp = bearer === `Bearer ${API_SECRET}`;
  const adminCookie = req.cookies.get("admin_token")?.value;
  const fromDashboard = adminCookie === "authenticated_admin_secret_token";
  return fromApp || fromDashboard;
};

// GET: Dashboard inbox listing (no action needed)
export async function GET(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const messages = await InboxSms.find({}).sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: messages }, { status: 200 });
  } catch (error) {
    console.error("API /admin/inbox GET Error:", error);
    return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const action = url.searchParams.get("action");
    const bearer = req.headers.get("authorization");
    const fromApp = bearer === `Bearer ${API_SECRET}`;
    const adminCookie = req.cookies.get("admin_token")?.value;
    const fromDashboard = adminCookie === "authenticated_admin_secret_token";

    // Authenticate Request
    if (!fromApp && !fromDashboard) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect(); // Ensure MONGODB_URI is correctly configured in .env
    const body = await req.json();

    // Handle Incoming SMS (Inbox)
    if (action === "receive") {
      // Read JSON fields (device is optional and extracted but not strictly needed for DB)
      const { sender, message, device } = body;

      // Validate that sender and message are present
      if (!sender || !message) {
        console.error("Inbox Save Error: Missing sender or message fields", body);
        return NextResponse.json({ success: false, error: "Missing data" }, { status: 400 });
      }

      // Save the SMS to the exact same MongoDB collection used by the dashboard inbox
      try {
        await InboxSms.create({
          sender: sender,
          message: message
        });

        // Keep only latest 15 inbox entries to avoid unlimited growth
        const totalCount = await InboxSms.countDocuments();
        if (totalCount > 15) {
          const overflow = totalCount - 15;
          const oldest = await InboxSms.find({})
            .sort({ createdAt: 1 })
            .limit(overflow)
            .select("_id");
          const idsToRemove = oldest.map((doc) => doc._id);
          if (idsToRemove.length) {
            await InboxSms.deleteMany({ _id: { $in: idsToRemove } });
          }
        }
        console.log(`Incoming SMS saved successfully from: ${sender}`);
        return NextResponse.json({ success: true }, { status: 201 });
      } catch (dbError) {
        console.error("Database write failed for Incoming SMS:", dbError);
        return NextResponse.json({ success: false, error: "Database write failed" }, { status: 500 });
      }
    }

    return NextResponse.json({ success: false, error: "Invalid action parameter" }, { status: 400 });
  } catch (error) {
    console.error("API /admin/inbox POST Error:", error);
    return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ success: false, error: "Inbox ID is required" }, { status: 400 });
    }

    await dbConnect();
    await InboxSms.findByIdAndDelete(id);
    return NextResponse.json({ success: true, message: "Inbox SMS deleted" }, { status: 200 });
  } catch (error) {
    console.error("API /admin/inbox DELETE Error:", error);
    return NextResponse.json({ success: false, error: "Server Error" }, { status: 500 });
  }
}