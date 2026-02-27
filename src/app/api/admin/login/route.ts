import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, password } = body;

    // Fetch credentials from environment variables
    const validUsername = process.env.ADMIN_USERNAME;
    const validPassword = process.env.ADMIN_PASSWORD;

    // Check if provided credentials match
    if (username === validUsername && password === validPassword) {
      // Create a success response
      const response = NextResponse.json(
        { success: true, message: "Login successful" },
        { status: 200 }
      );

      // Set a secure HTTP-only cookie (Valid for 7 days)
      response.cookies.set({
        name: "admin_token",
        value: "authenticated_admin_secret_token",
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7, // 7 Days in seconds
        sameSite: "strict",
      });

      return response;
    } else {
      return NextResponse.json(
        { success: false, error: "Invalid username or password" },
        { status: 401 }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}