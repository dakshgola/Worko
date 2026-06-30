import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const { prompt, history } = await request.json();
    if (!prompt) {
      return new NextResponse("Missing prompt", { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      const simulatedText = `[Simulated Response to: "${prompt}"]\n\nI can help you organize tasks, build layout templates, summarize note blocks, or schedule calendar events. Since the Gemini API key is missing in your config, I am responding in demo mode!`;
      return createSimulatedStream(simulatedText);
    }

    // Call Gemini API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            ...(history || []).map((msg: any) => ({
              role: msg.role === "user" ? "user" : "model",
              parts: [{ text: msg.content }],
            })),
            { role: "user", parts: [{ text: prompt }] },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error("Gemini API call failed:", errText);
      return new NextResponse("Failed to call Gemini API", { status: 500 });
    }

    const resData = await response.json();
    const resultText = resData.candidates?.[0]?.content?.parts?.[0]?.text || "I apologize, but I could not formulate a response.";

    return createSimulatedStream(resultText);
  } catch (error) {
    console.error("Gemini chat route error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

function createSimulatedStream(text: string) {
  const encoder = new TextEncoder();
  const customStream = new ReadableStream({
    async start(controller) {
      // Split by words/chars to yield a smooth typing sensation
      const words = text.split(" ");
      for (let i = 0; i < words.length; i++) {
        controller.enqueue(encoder.encode(words[i] + (i === words.length - 1 ? "" : " ")));
        await new Promise((r) => setTimeout(r, 15));
      }
      controller.close();
    },
  });

  return new NextResponse(customStream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
}
