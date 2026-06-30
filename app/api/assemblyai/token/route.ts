import { NextResponse } from "next/server";

export async function POST() {
  try {
    const apiKey = process.env.ASSEMBLYAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "AssemblyAI API key is missing" }, { status: 500 });
    }

    const response = await fetch("https://api.assemblyai.com/v2/realtime/token", {
      method: "POST",
      headers: {
        "Authorization": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ expires_in: 3600 }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("AssemblyAI token retrieval failed:", errText);
      return NextResponse.json({ error: "Failed to generate token" }, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("AssemblyAI token route error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
