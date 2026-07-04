import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await request.json();
    let prompt = body.prompt;
    let history = body.history;

    if (body.messages && Array.isArray(body.messages)) {
      const msgs = body.messages;
      if (msgs.length > 0) {
        prompt = prompt || msgs[msgs.length - 1]?.content;
        history = history || msgs.slice(0, -1);
      }
    }

    if (!prompt) {
      return new NextResponse("Missing prompt", { status: 400 });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const isApiKeyPlaceholder = !apiKey || 
      apiKey.trim() === "" ||
      apiKey === "your-api-key" || 
      apiKey === "placeholder" || 
      apiKey === "undefined" || 
      apiKey === "null";

    if (isApiKeyPlaceholder) {
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
              parts: [{ text: msg.content || msg.text || "" }],
            })),
            { role: "user", parts: [{ text: prompt }] },
          ],
        }),
      }
    );

    if (!response.ok) {
      const errText = await response.text();
      console.error(`Gemini API call failed with status ${response.status}:`, errText);

      // If unauthorized, invalid, or bad API key, gracefully fallback to simulated demo mode stream
      if (
        response.status === 400 ||
        response.status === 401 ||
        response.status === 403 ||
        errText.toLowerCase().includes("api key")
      ) {
        console.warn("Invalid or unauthorized API key. Falling back to Demo Mode simulated response.");
        const simulatedText = `[Simulated Response to: "${prompt}"]\n\nI can help you organize tasks, build layout templates, summarize note blocks, or schedule calendar events. Since the Gemini API key is invalid or unauthorized in your config, I am responding in demo mode!`;
        return createSimulatedStream(simulatedText);
      }

      return new NextResponse("Failed to call Gemini API", { status: response.status });
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
