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

    const webhookResponse = await fetch(webhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ question })
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
      typeof parsed === "object" &&
      "answer" in parsed &&
      typeof (parsed as any).answer === "string"
    ) {
      answer = (parsed as any).answer;
    } else {
      answer = JSON.stringify(parsed, null, 2);
    }

    return NextResponse.json({ answer });
  } catch (error) {
    console.error("Error memanggil webhook n8n:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan internal di server WebApp." },
      { status: 500 }
    );
  }
}


