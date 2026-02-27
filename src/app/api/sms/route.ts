import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import SmsQueue from "@/models/SmsQueue";

// Security Check: Verify the Secret Key from Android App
const authenticate = (req: NextRequest) => {
  const authHeader = req.headers.get("authorization");
  const secret = process.env.API_SECRET;
  
  if (!authHeader || !authHeader.startsWith("Bearer ") || authHeader.split(" ")[1] !== secret) {
    return false;
  }
  return true;
};

// Handle GET requests (App fetching pending SMS)
export async function GET(req: NextRequest) {
  if (!authenticate(req)) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  await dbConnect();

  if (action === "fetch") {
    try {
      // Find the oldest pending SMS
      const pendingSms = await SmsQueue.findOne({ status: "pending" }).sort({ createdAt: 1 });
      
      if (!pendingSms) {
        return NextResponse.json({ data: null }, { status: 200 });
      }

      return NextResponse.json({ data: pendingSms }, { status: 200 });
    } catch (error) {
      return NextResponse.json({ error: "Failed to fetch SMS" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}

// Handle POST requests (App updating SMS status)
export async function POST(req: NextRequest) {
  if (!authenticate(req)) {
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const action = searchParams.get("action");

  await dbConnect();

  if (action === "update") {
    try {
      const body = await req.json();
      const { id, status } = body;

      if (!id || !status) {
        return NextResponse.json({ error: "Missing SMS id or status" }, { status: 400 });
      }

      const updateData: any = { status };
      
      if (status === "sent") {
        updateData.sentAt = new Date();
      }

      const updatedSms = await SmsQueue.findByIdAndUpdate(id, updateData, { new: true });

      if (!updatedSms) {
        return NextResponse.json({ error: "SMS not found in database" }, { status: 404 });
      }

      return NextResponse.json({ success: true, data: updatedSms }, { status: 200 });
    } catch (error) {
      return NextResponse.json({ error: "Failed to update SMS status" }, { status: 500 });
    }
  }

  return NextResponse.json({ error: "Invalid action" }, { status: 400 });
}