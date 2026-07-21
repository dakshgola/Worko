import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { aiChatSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const user = await currentUser();
    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const ratelimit = await checkRateLimit(user.id, "ai");
    if (!ratelimit.success) {
      return NextResponse.json(
        { error: "Too many requests, please wait a moment" },
        { 
          status: 429,
          headers: {
            "Retry-After": Math.ceil((ratelimit.reset - Date.now()) / 1000).toString()
          }
        }
      );
    }

    const body = await request.json();
    const parsed = aiChatSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input data" },
        { status: 400 }
      );
    }

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
      const simulatedText = `[Simulated Response to: "${prompt}"]\n\nHello! I am Worko's general-purpose productivity assistant. Since the Gemini API key is missing in your configuration, I am responding in demo mode! I can help you brainstorm ideas, draft content, explain concepts, or schedule meetings and events. How can I help you today?`;
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
          systemInstruction: {
            parts: [
              {
                text: "You are a warm, natural, and conversational productivity assistant for Worko. You can engage in open-ended conversations, answer general knowledge questions, brainstorm ideas, draft and refine text, and explain concepts naturally. Keep a friendly, natural tone, avoiding bureaucratic or robotic canned responses. Meeting-scheduling is one capability you can help with when the user explicitly asks for it (e.g. 'schedule a meeting with the team'). You remember user information and context (like the user's name if they mention it) within the current conversation thread, but you do not have persistent memory across different threads. Be honest about this limitation if asked."
              }
            ]
          }
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
        const simulatedText = `[Simulated Response to: "${prompt}"]\n\nHello! I am Worko's general-purpose productivity assistant. Since the Gemini API key is invalid or unauthorized in your configuration, I am responding in demo mode! I can help you brainstorm ideas, draft content, explain concepts, or schedule meetings and events. How can I help you today?`;
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
