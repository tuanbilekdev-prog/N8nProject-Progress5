import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const question = body?.question;

    if (!question || typeof question !== "string") {
      return NextResponse.json(
        { error: "Field 'question' wajib diisi (string)." },
        { status: 400 }
      );
    }

    const webhookUrl = process.env.N8N_WEBHOOK_URL;

    if (!webhookUrl) {
      return NextResponse.json(
        {
          error:
            "Environment variable N8N_WEBHOOK_URL belum diset. Tambahkan di .env.local."
        },
        { status: 500 }
      );
    }

    // n8n webhook expects different formats, try both
    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ 
        question,
        message: question, // Some n8n workflows expect 'message'
        text: question,    // Some expect 'text'
        query: question   // Some expect 'query'
      })
    });

    const text = await webhookResponse.text();
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      parsed = text;
    }

    if (!webhookResponse.ok) {
      return NextResponse.json(
        {
          error: "Webhook n8n mengembalikan error.",
          status: webhookResponse.status,
          body: parsed
        },
        { status: 502 }
      );
    }

    let answer: string;
    if (typeof parsed === "string") {
      answer = parsed;
    } else if (
      parsed &&
      typeof parsed === "object"
    ) {
      // Try different response formats from n8n
      const response = parsed as any;
      
      if (response.output && typeof response.output === "string") {
        answer = response.output;
      } else if (response.answer && typeof response.answer === "string") {
        answer = response.answer;
      } else if (response.text && typeof response.text === "string") {
        answer = response.text;
      } else if (response.message && typeof response.message === "string") {
        answer = response.message;
      } else if (response.data && typeof response.data === "string") {
        answer = response.data;
      } else {
        // If no known format, stringify the whole response
        answer = JSON.stringify(parsed, null, 2);
      }
    } else {
      answer = JSON.stringify(parsed, null, 2);
    }

    // Log for debugging
    console.log("n8n response:", { parsed, answer });

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Error memanggil webhook n8n:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal di server WebApp." },
      { status: 500 }
    );
  }
}


