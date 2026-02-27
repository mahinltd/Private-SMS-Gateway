import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json(
    { success: true, message: "Logged out successfully" },
    { status: 200 }
  );

  // Delete the admin_token cookie by setting it with an expired date
  response.cookies.set({
    name: "admin_token",
    value: "",
    httpOnly: true,
    path: "/",
    maxAge: 0, // Expire immediately
    sameSite: "strict",
  });

  return response;
}
