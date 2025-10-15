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
    const { session_id, message } = body;

    if (!session_id || !message) {
      return NextResponse.json(
        {
          success: false,
          error: "missing_params",
          message: "Session ID and message are required",
        },
        { status: 400 }
      );
    }

    // TODO: Call backend API
    // For now, return mock response
    // In production, this would call: POST /api/consultation/message
    const backendResponse = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/consultation/message`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.id}`, // Or use proper JWT token
        },
        body: JSON.stringify({
          session_id,
          message,
        }),
      }
    );

    const data = await backendResponse.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      {
        success: false,
        error: "internal_error",
        message: "Failed to send message. Please try again.",
      },
      { status: 500 }
    );
  }
}
