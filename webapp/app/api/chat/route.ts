import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import {
  getChatSessions,
  getChatMessages,
  createChatSession,
  saveChatMessage,
  updateChatSession,
  deleteChatSession
} from "@/lib/supabase";
import { getSupabaseClient } from "@/lib/supabaseClient";

// GET: Get chat sessions for current user
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (sessionId) {
      // Get messages for specific session
      const messages = await getChatMessages(sessionId);
      return NextResponse.json({ messages });
    } else {
      // Get all sessions for user
      const sessions = await getChatSessions(session.user.id);
      return NextResponse.json({ sessions });
    }
  } catch (error: any) {
    console.error("Get chat error:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}

// POST: Create new chat session or save message
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { action, sessionId, title, role, content, orderIndex } = body;

    if (action === "createSession") {
      const newSession = await createChatSession(session.user.id, title);
      return NextResponse.json({ session: newSession });
    }

    if (action === "saveMessage") {
      if (!sessionId || !role || !content || orderIndex === undefined) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }
      
      // Check if message already exists (to prevent duplicates)
      const supabase = getSupabaseClient();
      const { data: existing } = await supabase
        .from('chat_messages')
        .select('id')
        .eq('session_id', sessionId)
        .eq('order_index', orderIndex)
        .single();
      
      if (existing) {
        // Update existing message
        const { data: updated, error } = await supabase
          .from('chat_messages')
          .update({ content })
          .eq('id', existing.id)
          .select()
          .single();
        
        if (error) throw error;
        return NextResponse.json({ message: updated });
      } else {
        // Create new message
        const message = await saveChatMessage(sessionId, role, content, orderIndex);
        return NextResponse.json({ message });
      }
    }

    if (action === "updateSession") {
      if (!sessionId || !title) {
        return NextResponse.json(
          { error: "Missing required fields" },
          { status: 400 }
        );
      }
      await updateChatSession(sessionId, title);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json(
      { error: "Invalid action" },
      { status: 400 }
    );
  } catch (error: any) {
    console.error("Post chat error:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}

// DELETE: Delete chat session
export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
      return NextResponse.json(
        { error: "sessionId required" },
        { status: 400 }
      );
    }

    await deleteChatSession(sessionId, session.user.id);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Delete chat error:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan" },
      { status: 500 }
    );
  }
}

