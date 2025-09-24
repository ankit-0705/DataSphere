import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase/server";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");

  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Unauthorized: Missing token" }, { status: 401 });
  }

  const idToken = authHeader.split("Bearer ")[1];

  try {
    await adminAuth.verifyIdToken(idToken);

    // Set secure cookie
    const response = NextResponse.json({ success: true });

    response.cookies.set("__session", idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24, // 1 days
    });

    return response;
  } catch (error) {
    console.error("Error verifying token:", error);
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
