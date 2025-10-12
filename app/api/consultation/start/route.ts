import { createClient } from "@/lib/supabase-server";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Get current user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, error: "unauthorized", message: "Please sign in" },
        { status: 401 }
      );
    }

    // Get request body
    const body = await request.json();
    const { consultation_key } = body;

    if (!consultation_key) {
      return NextResponse.json(
        {
          success: false,
          error: "key_required",
          message: "Consultation key is required",
        },
        { status: 400 }
      );
    }

    // Get client IP and user agent
    const ip_address = request.headers.get("x-forwarded-for") || "unknown";
    const user_agent = request.headers.get("user-agent") || "unknown";

    // TODO: Call backend API
    // For now, return mock response
    // In production, this would call: POST /api/consultation/start
    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/consultation/start`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.id}`, // Or use proper JWT token
        },
        body: JSON.stringify({
          consultation_key,
          ip_address,
          user_agent,
        }),
      }
    );

    const data = await backendResponse.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error starting consultation:", error);
    return NextResponse.json(
      {
        success: false,
        error: "internal_error",
        message: "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}
